/**
 * Validasi URL Broker harus menggunakan WebSocket Secure (WSS)
 * agar kompatibel dengan HTTPS GitHub Pages dan terenkripsi TLS.
 */
export function validateBrokerSecurity(brokerUrl) {
  if (!brokerUrl || typeof brokerUrl !== 'string') {
    return { valid: false, reason: 'URL Broker MQTT wajib diisi.' };
  }
  const trimmed = brokerUrl.trim();
  if (trimmed.startsWith('ws://')) {
    return {
      valid: false,
      reason:
        'Protokol ws:// tidak aman dan akan diblokir browser pada website HTTPS (GitHub Pages). Gunakan wss://.',
    };
  }
  if (!trimmed.startsWith('wss://')) {
    return {
      valid: false,
      reason: 'URL Broker harus diawali dengan protokol wss:// (MQTT over WebSocket Secure).',
    };
  }
  if (trimmed.includes('YOUR_BROKER_HOST') || trimmed.includes('YOUR_WSS_PORT')) {
    return {
      valid: false,
      reason: 'URL Broker masih menggunakan placeholder. Masukkan host dan port broker WSS yang valid.',
    };
  }
  return { valid: true, reason: '' };
}

/**
 * Normalisasi nilai state mentah dari ESP32 menjadi state standar dashboard.
 */
export function normalizeDeviceState(deviceId, rawState) {
  if (rawState === null || rawState === undefined) return 'UNKNOWN';
  const val = String(rawState).trim().toUpperCase();

  if (val === 'ERROR' || val === 'FAULT' || val === 'ERR') return 'ERROR';
  if (val === 'UNKNOWN' || val === '') return 'UNKNOWN';

  if (deviceId === 'jemuran') {
    if (['OUT', 'EXTENDED', 'OPEN', 'KELUAR', '1', 'TRUE'].includes(val)) return 'OUT';
    if (['IN', 'RETRACTED', 'CLOSED', 'MASUK', '0', 'FALSE'].includes(val)) return 'IN';
    if (['MOVING', 'MOVING_OUT', 'MOVING_IN', 'BERGERAK', 'BUSY'].includes(val)) return 'MOVING';
    return 'UNKNOWN';
  }

  if (deviceId === 'pintu') {
    if (['OPEN', 'OPENED', 'TERBUKA', '1', 'TRUE'].includes(val)) return 'OPEN';
    if (['CLOSED', 'CLOSE', 'TERTUTUP', '0', 'FALSE'].includes(val)) return 'CLOSED';
    if (['MOVING', 'OPENING', 'CLOSING', 'BERGERAK', 'BUSY'].includes(val)) return 'MOVING';
    return 'UNKNOWN';
  }

  // Kipas, Lampu 1, Lampu 2
  if (['ON', '1', 'TRUE', 'ACTIVE', 'MENYALA', 'NYALA'].includes(val)) return 'ON';
  if (['OFF', '0', 'FALSE', 'INACTIVE', 'MATI'].includes(val)) return 'OFF';

  return 'UNKNOWN';
}

/**
 * Normalisasi status sistem ESP32 atau Xiaozhi dari topic status / LWT.
 */
export function normalizeSystemStatus(rawPayload) {
  if (!rawPayload) return 'UNKNOWN';
  const str = String(rawPayload).trim();
  if (str.length > 512) return 'UNKNOWN';

  try {
    const parsed = JSON.parse(str);
    const candidate = parsed.status ?? parsed.state ?? parsed.online;
    if (candidate === true || String(candidate).toUpperCase() === 'ONLINE' || String(candidate).toUpperCase() === 'CONNECTED') {
      return 'ONLINE';
    }
    if (candidate === false || String(candidate).toUpperCase() === 'OFFLINE' || String(candidate).toUpperCase() === 'DISCONNECTED') {
      return 'OFFLINE';
    }
  } catch {
    const upper = str.toUpperCase();
    if (['ONLINE', 'CONNECTED', 'READY', '1', 'TRUE'].includes(upper)) return 'ONLINE';
    if (['OFFLINE', 'DISCONNECTED', 'DEAD', '0', 'FALSE'].includes(upper)) return 'OFFLINE';
  }
  return 'UNKNOWN';
}

/**
 * Parsing dan validasi payload state perangkat yang dikirim ESP32.
 * Mendukung format JSON standar:
 * {"state":"ON","source":"xiaozhi","timestamp":123456789}
 * serta fallback string sederhana bila firmware lama mengirim teks biasa.
 */
export function parseDeviceStatePayload(deviceId, rawMessage) {
  if (rawMessage === null || rawMessage === undefined) {
    return { valid: false, error: 'Payload kosong' };
  }

  const text = String(rawMessage).trim();
  if (!text || text.length > 1024) {
    return { valid: false, error: 'Ukuran payload tidak valid' };
  }

  // Coba parse JSON terlebih dahulu
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const obj = JSON.parse(text);
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return { valid: false, error: 'Struktur JSON bukan objek' };
      }

      const rawState = obj.state ?? obj.status ?? obj.value ?? obj.action;
      if (rawState === undefined || rawState === null) {
        return { valid: false, error: 'Field state tidak ditemukan dalam JSON' };
      }

      const normalizedState = normalizeDeviceState(deviceId, rawState);
      if (normalizedState === 'UNKNOWN' && String(rawState).toUpperCase() !== 'UNKNOWN') {
        return { valid: false, error: `Nilai state tidak dikenali: ${rawState}` };
      }

      const sourceRaw = obj.source ? String(obj.source).trim().toLowerCase() : null;
      let source = null;
      if (sourceRaw) {
        if (sourceRaw.includes('xiaozhi') || sourceRaw.includes('voice')) {
          source = 'xiaozhi';
        } else if (sourceRaw.includes('web') || sourceRaw.includes('dashboard')) {
          source = 'web';
        } else {
          source = sourceRaw;
        }
      }

      return {
        valid: true,
        state: normalizedState,
        source,
        requestId: obj.requestId ? String(obj.requestId) : null,
        timestamp: obj.timestamp || Date.now(),
        raw: text,
      };
    } catch (err) {
      return { valid: false, error: `JSON tidak valid: ${err.message}` };
    }
  }

  // Fallback untuk firmware yang mengirim string state langsung (mis. "ON", "OPEN", "CLOSED")
  const normalizedState = normalizeDeviceState(deviceId, text);
  if (normalizedState === 'UNKNOWN' && text.toUpperCase() !== 'UNKNOWN') {
    return { valid: false, error: `Payload teks tidak dikenali: ${text}` };
  }

  return {
    valid: true,
    state: normalizedState,
    source: null,
    requestId: null,
    timestamp: Date.now(),
    raw: text,
  };
}

/**
 * Membangun payload JSON perintah standar dari Website ke ESP32.
 */
export function buildCommandPayload(action, requestId) {
  return JSON.stringify({
    action: String(action).toUpperCase(),
    source: 'web',
    requestId: String(requestId),
  });
}
