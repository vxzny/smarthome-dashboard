import mqtt from 'mqtt';
import { resolveClientId } from '../config/mqttConfig';
import { getAllowedPublishTopics, getAllowedSubscribeTopics } from '../config/mqttTopics';
import { validateBrokerSecurity } from '../utils/payloadValidator';

/**
 * Service terisolasi untuk mengelola koneksi MQTT over WSS menggunakan MQTT.js.
 * Terpisah sepenuhnya dari komponen UI agar stabil, mudah diuji, dan aman.
 */
class SmartHomeMqttService {
  constructor() {
    this.client = null;
    this.status = 'DISCONNECTED'; // CONNECTED | CONNECTING | DISCONNECTED | RECONNECTING
    this.activeTopics = new Set();
    this.allowedPublishTopics = new Set();
    this.listeners = {
      status: new Set(),
      message: new Set(),
      error: new Set(),
    };
  }

  onStatusChange(cb) {
    this.listeners.status.add(cb);
    return () => this.listeners.status.delete(cb);
  }

  onMessage(cb) {
    this.listeners.message.add(cb);
    return () => this.listeners.message.delete(cb);
  }

  onError(cb) {
    this.listeners.error.add(cb);
    return () => this.listeners.error.delete(cb);
  }

  emitStatus(newStatus, detail = '') {
    this.status = newStatus;
    this.listeners.status.forEach((cb) => cb(newStatus, detail));
  }

  emitError(message) {
    this.listeners.error.forEach((cb) => cb(message));
  }

  isConnected() {
    return Boolean(this.client && this.client.connected && this.status === 'CONNECTED');
  }

  /**
   * Membuka koneksi baru ke MQTT Broker melalui WSS.
   */
  connect(config, topicsConfig) {
    this.disconnect(true);

    const securityCheck = validateBrokerSecurity(config.MQTT_BROKER);
    if (!securityCheck.valid) {
      this.emitStatus('DISCONNECTED', securityCheck.reason);
      this.emitError(securityCheck.reason);
      return false;
    }

    const clientId = resolveClientId(config.clientId);
    const subscribeList = getAllowedSubscribeTopics(
      topicsConfig,
      config.enableXiaozhiStatus !== false
    );
    this.allowedPublishTopics = getAllowedPublishTopics(topicsConfig);

    this.emitStatus('CONNECTING', `Menghubungkan ke ${config.MQTT_BROKER}...`);

    const connectFn = mqtt.connect || mqtt.default?.connect;
    if (typeof connectFn !== 'function') {
      const msg = 'Library MQTT.js gagal dimuat dengan benar.';
      this.emitStatus('DISCONNECTED', msg);
      this.emitError(msg);
      return false;
    }

    const options = {
      clientId,
      clean: true,
      connectTimeout: Number(config.connectTimeoutMs) || 10000,
      reconnectPeriod: Number(config.reconnectPeriodMs) || 3000,
      keepalive: Number(config.keepaliveSec) || 30,
      protocolVersion: 4, // MQTT 3.1.1 standar luas untuk ESP32 & cloud brokers
    };

    if (config.MQTT_USERNAME && config.MQTT_USERNAME !== 'YOUR_USERNAME') {
      options.username = config.MQTT_USERNAME;
    }
    if (config.MQTT_PASSWORD && config.MQTT_PASSWORD !== 'YOUR_PASSWORD') {
      options.password = config.MQTT_PASSWORD;
    }

    try {
      const client = connectFn(config.MQTT_BROKER.trim(), options);
      this.client = client;

      client.on('connect', () => {
        if (this.client !== client) return;
        this.emitStatus('CONNECTED', `Terhubung (${clientId})`);
        this.subscribeTopics(subscribeList, Number(config.qosSubscribe) || 1);
      });

      client.on('reconnect', () => {
        if (this.client !== client) return;
        this.emitStatus('RECONNECTING', 'Mencoba menyambung ulang ke broker...');
      });

      client.on('close', () => {
        if (this.client !== client) return;
        if (this.status !== 'RECONNECTING') {
          this.emitStatus('DISCONNECTED', 'Koneksi ke MQTT Broker terputus.');
        }
      });

      client.on('offline', () => {
        if (this.client !== client) return;
        this.emitStatus('DISCONNECTED', 'Client MQTT offline.');
      });

      client.on('error', (err) => {
        if (this.client !== client) return;
        const errMsg = err?.message || 'Terjadi kesalahan koneksi MQTT WSS.';
        this.emitError(errMsg);
      });

      client.on('message', (topic, payloadBuffer, packet) => {
        if (this.client !== client) return;
        // Filter keamanan: hanya proses topic yang terdaftar dalam daftar subscribe resmi
        if (!this.activeTopics.has(topic)) {
          return;
        }
        const payloadStr = payloadBuffer ? payloadBuffer.toString('utf-8') : '';
        this.listeners.message.forEach((cb) =>
          cb({
            topic,
            payload: payloadStr,
            retain: Boolean(packet?.retain),
            qos: packet?.qos ?? 0,
            receivedAt: Date.now(),
          })
        );
      });

      return true;
    } catch (err) {
      const msg = err?.message || 'Gagal menginisialisasi koneksi WSS.';
      this.emitStatus('DISCONNECTED', msg);
      this.emitError(msg);
      return false;
    }
  }

  /**
   * Subscribe ke daftar topic secara bersih tanpa duplikasi.
   */
  subscribeTopics(topicList, qos = 1) {
    if (!this.client || !this.client.connected) return;

    // Unsubscribe topic lama jika ada perubahan konfigurasi
    if (this.activeTopics.size > 0) {
      const oldTopics = Array.from(this.activeTopics);
      this.client.unsubscribe(oldTopics);
      this.activeTopics.clear();
    }

    const uniqueTopics = Array.from(new Set(topicList.filter(Boolean)));
    if (uniqueTopics.length === 0) return;

    this.client.subscribe(uniqueTopics, { qos }, (err, granted) => {
      if (err) {
        this.emitError(`Gagal subscribe topic: ${err.message}`);
        return;
      }
      if (Array.isArray(granted)) {
        granted.forEach((item) => this.activeTopics.add(item.topic));
      } else {
        uniqueTopics.forEach((t) => this.activeTopics.add(t));
      }
    });
  }

  /**
   * Mengirim perintah MQTT dengan validasi status koneksi dan whitelist topic.
   */
  publishCommand(topic, payloadString, qos = 1) {
    if (!this.isConnected()) {
      return {
        ok: false,
        error: 'Tidak dapat mengirim perintah: Koneksi MQTT belum terhubung.',
      };
    }

    if (!this.allowedPublishTopics.has(topic)) {
      return {
        ok: false,
        error: `Akses ditolak: Topic "${topic}" tidak termasuk dalam daftar perintah Smart Home.`,
      };
    }

    return new Promise((resolve) => {
      this.client.publish(topic, payloadString, { qos, retain: false }, (err) => {
        if (err) {
          resolve({ ok: false, error: err.message || 'Gagal publish pesan MQTT.' });
        } else {
          resolve({ ok: true });
        }
      });
    });
  }

  /**
   * Memutuskan koneksi dengan bersih.
   */
  disconnect(silent = false) {
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.end(true);
      } catch {
        // ignore cleanup error
      }
      this.client = null;
    }
    this.activeTopics.clear();
    if (!silent) {
      this.emitStatus('DISCONNECTED', 'Koneksi diputus secara manual.');
    }
  }
}

export const mqttService = new SmartHomeMqttService();
