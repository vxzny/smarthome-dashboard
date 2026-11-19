import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  isPlaceholderBroker,
  loadMqttConfig,
  resetMqttConfig,
  saveMqttConfig,
} from '../config/mqttConfig';
import {
  DEVICE_CATALOG,
  loadMqttTopics,
  resetMqttTopics,
  saveMqttTopics,
} from '../config/mqttTopics';
import { mqttService } from '../services/mqttService';
import {
  buildCommandPayload,
  normalizeSystemStatus,
  parseDeviceStatePayload,
} from '../utils/payloadValidator';

function createInitialDeviceStates() {
  const initial = {};
  DEVICE_CATALOG.forEach((dev) => {
    initial[dev.id] = {
      id: dev.id,
      state: 'UNKNOWN',
      source: null,
      lastUpdate: null,
      isPending: false,
      pendingAction: null,
      pendingRequestId: null,
      rawPayload: null,
      isRetained: false,
    };
  });
  return initial;
}

export function useSmartHomeMqtt() {
  const [config, setConfig] = useState(() => loadMqttConfig());
  const [topics, setTopics] = useState(() => loadMqttTopics());
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [connectionDetail, setConnectionDetail] = useState('Menunggu konfigurasi broker WSS');
  const [esp32Status, setEsp32Status] = useState('UNKNOWN'); // ONLINE | OFFLINE | UNKNOWN
  const [xiaozhiStatus, setXiaozhiStatus] = useState('UNKNOWN'); // ONLINE | OFFLINE | UNKNOWN
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [devices, setDevices] = useState(() => createInitialDeviceStates());
  const [activityLogs, setActivityLogs] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Ref untuk melacak pending command aktif & timer timeout per perangkat
  const pendingRef = useRef({});
  const topicsRef = useRef(topics);
  const configRef = useRef(config);

  useEffect(() => {
    topicsRef.current = topics;
  }, [topics]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const addToast = useCallback((type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [{ id, type, title, message }, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearPendingForDevice = useCallback((deviceId) => {
    const entry = pendingRef.current[deviceId];
    if (entry?.timerId) {
      clearTimeout(entry.timerId);
    }
    delete pendingRef.current[deviceId];

    setDevices((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        isPending: false,
        pendingAction: null,
        pendingRequestId: null,
      },
    }));
  }, []);

  // Bersihkan semua pending command apabila koneksi terputus
  const clearAllPendingOnDisconnect = useCallback(() => {
    Object.keys(pendingRef.current).forEach((deviceId) => {
      const entry = pendingRef.current[deviceId];
      if (entry?.timerId) clearTimeout(entry.timerId);

      setActivityLogs((prev) =>
        prev.map((log) =>
          log.requestId === entry.requestId && log.status === 'PENDING'
            ? { ...log, status: 'FAILED', note: 'Koneksi MQTT terputus sebelum konfirmasi' }
            : log
        )
      );
      delete pendingRef.current[deviceId];
    });

    setDevices((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = {
          ...next[id],
          isPending: false,
          pendingAction: null,
          pendingRequestId: null,
        };
      });
      return next;
    });
  }, []);

  // Handler pesan masuk dari MQTT Broker
  useEffect(() => {
    const unsubStatus = mqttService.onStatusChange((status, detail) => {
      setConnectionStatus(status);
      setConnectionDetail(detail);
      if (status === 'DISCONNECTED') {
        clearAllPendingOnDisconnect();
      }
    });

    const unsubError = mqttService.onError((errMsg) => {
      setConnectionDetail(errMsg);
    });

    const unsubMessage = mqttService.onMessage(({ topic, payload, retain, receivedAt }) => {
      setLastMessageAt(receivedAt);
      const currentTopics = topicsRef.current;

      // 1. Cek System Topic: ESP32 LWT / Status
      if (topic === currentTopics.system.esp32Status) {
        const sysState = normalizeSystemStatus(payload);
        setEsp32Status(sysState);
        if (sysState === 'OFFLINE') {
          addToast(
            'error',
            'ESP32 Offline (LWT)',
            'Perangkat ESP32 terputus dari MQTT Broker. Periksa daya atau Wi-Fi ESP32.'
          );
        }
        return;
      }

      // 2. Cek System Topic: Xiaozhi Status (bila tersedia)
      if (topic === currentTopics.system.xiaozhiStatus) {
        const xzState = normalizeSystemStatus(payload);
        setXiaozhiStatus(xzState);
        return;
      }

      // 3. Cocokkan topic state perangkat
      const matchedDevice = DEVICE_CATALOG.find(
        (dev) => currentTopics.devices[dev.id]?.state === topic
      );
      if (!matchedDevice) return;

      const parsed = parseDeviceStatePayload(matchedDevice.id, payload);
      if (!parsed.valid) {
        console.warn(`[MQTT Invalid Payload] Topic ${topic}:`, parsed.error);
        return;
      }

      // Jika ESP32 mengirim state perangkat aktif secara live, berarti ESP32 sedang online
      if (!retain) {
        setEsp32Status((prev) => (prev === 'UNKNOWN' || prev === 'OFFLINE' ? 'ONLINE' : prev));
      }

      const pendingEntry = pendingRef.current[matchedDevice.id];
      let resolvedSource = parsed.source;

      if (pendingEntry) {
        // Konfirmasi diterima dari ESP32 untuk perintah web yang sedang pending!
        clearTimeout(pendingEntry.timerId);
        delete pendingRef.current[matchedDevice.id];
        resolvedSource = parsed.source || 'web';

        setActivityLogs((prev) =>
          prev.map((log) =>
            log.requestId === pendingEntry.requestId
              ? {
                  ...log,
                  status: 'SUCCESS',
                  action: parsed.state,
                  source: resolvedSource === 'xiaozhi' ? 'Xiaozhi' : 'Website',
                  confirmedAt: receivedAt,
                }
              : log
          )
        );

        addToast(
          'success',
          `${matchedDevice.shortName} Diperbarui`,
          `Status dikonfirmasi oleh ESP32: ${matchedDevice.stateLabels[parsed.state] || parsed.state}`
        );
      } else {
        // Pembaruan state tanpa pending command di web (mis. dari Xiaozhi voice assistant atau retained state)
        if (!resolvedSource) {
          resolvedSource = retain ? 'retained' : 'xiaozhi';
        }

        // Catat ke riwayat aktivitas jika bukan sekadar sinkronisasi awal retained message
        if (!retain) {
          const sourceLabel =
            resolvedSource === 'xiaozhi'
              ? 'Xiaozhi'
              : resolvedSource === 'web'
                ? 'Website'
                : 'Xiaozhi / ESP32';

          setActivityLogs((prev) => [
            {
              id: `evt-${receivedAt}-${Math.random().toString(36).slice(2, 6)}`,
              requestId: parsed.requestId || null,
              timestamp: receivedAt,
              deviceId: matchedDevice.id,
              deviceName: matchedDevice.shortName,
              action: parsed.state,
              source: sourceLabel,
              status: 'SUCCESS',
            },
            ...prev.slice(0, 199),
          ]);
        }
      }

      setDevices((prev) => ({
        ...prev,
        [matchedDevice.id]: {
          ...prev[matchedDevice.id],
          state: parsed.state,
          source: resolvedSource,
          lastUpdate: parsed.timestamp || receivedAt,
          isPending: false,
          pendingAction: null,
          pendingRequestId: null,
          rawPayload: parsed.raw,
          isRetained: retain,
        },
      }));
    });

    return () => {
      unsubStatus();
      unsubError();
      unsubMessage();
    };
  }, [addToast, clearAllPendingOnDisconnect]);

  // Auto-connect saat aplikasi dimuat jika broker bukan placeholder
  useEffect(() => {
    if (!isPlaceholderBroker(config.MQTT_BROKER)) {
      mqttService.connect(config, topics);
    } else {
      setConnectionStatus('DISCONNECTED');
      setConnectionDetail('Broker WSS belum dikonfigurasi (masih placeholder)');
    }

    return () => {
      mqttService.disconnect(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mengirim perintah kontrol manual dari Website ke ESP32 melalui MQTT.
   * Tidak mengubah status ON/OFF perangkat secara sepihak sebelum konfirmasi ESP32.
   */
  const sendDeviceCommand = useCallback(
    async (deviceId, action) => {
      if (connectionStatus !== 'CONNECTED') {
        addToast(
          'error',
          'MQTT Tidak Terhubung',
          'Kontrol dinonaktifkan sampai koneksi ke MQTT Broker WSS kembali aktif.'
        );
        return false;
      }

      const deviceMeta = DEVICE_CATALOG.find((d) => d.id === deviceId);
      const commandTopic = topics.devices[deviceId]?.command;
      if (!deviceMeta || !commandTopic) return false;

      // Cegah pengiriman ganda saat perintah sebelumnya masih menunggu respons ESP32
      if (pendingRef.current[deviceId]) {
        addToast(
          'warning',
          'Perintah Sedang Diproses',
          `Menunggu respons ESP32 untuk ${deviceMeta.shortName}...`
        );
        return false;
      }

      const requestId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const sentAt = Date.now();
      const timeoutMs = Number(config.commandTimeoutMs) || 8000;
      const payloadString = buildCommandPayload(action, requestId);

      // Set timer timeout jika ESP32 tidak memberikan konfirmasi
      const timerId = setTimeout(() => {
        if (pendingRef.current[deviceId]?.requestId === requestId) {
          clearPendingForDevice(deviceId);
          setActivityLogs((prev) =>
            prev.map((log) =>
              log.requestId === requestId
                ? {
                    ...log,
                    status: 'TIMEOUT',
                    note: `Timeout (${timeoutMs / 1000}s) - Tidak ada konfirmasi ESP32`,
                  }
                : log
            )
          );
          addToast(
            'error',
            `Timeout: ${deviceMeta.shortName}`,
            `ESP32 tidak merespons perintah "${action}" dalam ${timeoutMs / 1000} detik.`
          );
        }
      }, timeoutMs);

      pendingRef.current[deviceId] = {
        requestId,
        action,
        sentAt,
        timerId,
      };

      // Aktifkan pending state pada UI kartu perangkat
      setDevices((prev) => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          isPending: true,
          pendingAction: action,
          pendingRequestId: requestId,
        },
      }));

      // Catat di Activity History dengan status PENDING (belum dianggap berhasil!)
      setActivityLogs((prev) => [
        {
          id: requestId,
          requestId,
          timestamp: sentAt,
          deviceId,
          deviceName: deviceMeta.shortName,
          action,
          source: 'Website',
          status: 'PENDING',
        },
        ...prev.slice(0, 199),
      ]);

      const result = await mqttService.publishCommand(
        commandTopic,
        payloadString,
        Number(config.qosCommand) || 1
      );

      if (!result.ok) {
        clearPendingForDevice(deviceId);
        setActivityLogs((prev) =>
          prev.map((log) =>
            log.requestId === requestId
              ? { ...log, status: 'FAILED', note: result.error }
              : log
          )
        );
        addToast('error', 'Gagal Mengirim Perintah', result.error);
        return false;
      }

      return true;
    },
    [addToast, clearPendingForDevice, config, connectionStatus, topics]
  );

  const updateSettings = useCallback(
    (newConfig, newTopics) => {
      saveMqttConfig(newConfig);
      saveMqttTopics(newTopics);
      setConfig(newConfig);
      setTopics(newTopics);

      // Reset state perangkat ke UNKNOWN saat ganti broker/topic agar tidak menampilkan data lama
      setDevices(createInitialDeviceStates());
      setEsp32Status('UNKNOWN');
      setXiaozhiStatus('UNKNOWN');

      if (!isPlaceholderBroker(newConfig.MQTT_BROKER)) {
        mqttService.connect(newConfig, newTopics);
        addToast('info', 'Konfigurasi Disimpan', 'Menghubungkan ulang ke MQTT Broker WSS...');
      } else {
        mqttService.disconnect();
        addToast(
          'warning',
          'Konfigurasi Disimpan',
          'Isi alamat broker WSS yang valid untuk mulai terhubung.'
        );
      }
    },
    [addToast]
  );

  const handleResetSettings = useCallback(() => {
    mqttService.disconnect();
    const defCfg = resetMqttConfig();
    const defTop = resetMqttTopics();
    setConfig(defCfg);
    setTopics(defTop);
    setDevices(createInitialDeviceStates());
    setEsp32Status('UNKNOWN');
    setXiaozhiStatus('UNKNOWN');
    setConnectionDetail('Konfigurasi dikembalikan ke placeholder default');
    addToast('info', 'Reset Berhasil', 'Konfigurasi MQTT dan topic dikembalikan ke default.');
  }, [addToast]);

  const reconnectNow = useCallback(() => {
    if (isPlaceholderBroker(config.MQTT_BROKER)) {
      addToast(
        'warning',
        'Broker Belum Dikonfigurasi',
        'Silakan atur Broker URL WSS terlebih dahulu di halaman Settings.'
      );
      return;
    }
    mqttService.connect(config, topics);
  }, [addToast, config, topics]);

  const disconnectNow = useCallback(() => {
    mqttService.disconnect();
  }, []);

  const clearActivityLogs = useCallback(() => {
    setActivityLogs([]);
  }, []);

  // Ringkasan statistik sistem untuk System Overview
  const systemSummary = useMemo(() => {
    let activeCount = 0;
    let inactiveCount = 0;
    let unknownCount = 0;

    DEVICE_CATALOG.forEach((meta) => {
      const dev = devices[meta.id];
      if (!dev || dev.state === 'UNKNOWN') {
        unknownCount += 1;
      } else if (meta.activeStates.includes(dev.state)) {
        activeCount += 1;
      } else {
        inactiveCount += 1;
      }
    });

    return {
      totalDevices: DEVICE_CATALOG.length,
      activeCount,
      inactiveCount,
      unknownCount,
      lastMessageAt,
    };
  }, [devices, lastMessageAt]);

  return {
    config,
    topics,
    connectionStatus,
    connectionDetail,
    esp32Status,
    xiaozhiStatus,
    lastMessageAt,
    devices,
    activityLogs,
    toasts,
    systemSummary,
    sendDeviceCommand,
    updateSettings,
    handleResetSettings,
    reconnectNow,
    disconnectNow,
    clearActivityLogs,
    dismissToast,
  };
}
