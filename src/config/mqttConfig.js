const STORAGE_KEY_CONFIG = 'smarthome_mqtt_config_v1';

/**
 * Konfigurasi default MQTT over WSS.
 * Ganti placeholder berikut melalui halaman Settings di dashboard
 * atau melalui variabel environment saat build.
 */
export const DEFAULT_MQTT_CONFIG = {
  MQTT_BROKER: import.meta.env.VITE_MQTT_BROKER || 'wss://YOUR_BROKER_HOST:YOUR_WSS_PORT/YOUR_PATH',
  MQTT_USERNAME: import.meta.env.VITE_MQTT_USERNAME || 'YOUR_USERNAME',
  MQTT_PASSWORD: import.meta.env.VITE_MQTT_PASSWORD || 'YOUR_PASSWORD',
  clientId: '',
  commandTimeoutMs: 8000,
  reconnectPeriodMs: 3000,
  connectTimeoutMs: 10000,
  keepaliveSec: 30,
  qosCommand: 1,
  qosSubscribe: 1,
  enableXiaozhiStatus: true,
};

/**
 * Mengecek apakah broker masih menggunakan nilai placeholder.
 */
export function isPlaceholderBroker(brokerUrl) {
  if (!brokerUrl || typeof brokerUrl !== 'string') return true;
  return (
    brokerUrl.includes('YOUR_BROKER_HOST') ||
    brokerUrl.includes('YOUR_WSS_PORT') ||
    brokerUrl.trim() === ''
  );
}

/**
 * Memecah URL WSS menjadi komponen host, port, dan path untuk form Settings.
 */
export function parseWssUrl(wssUrl) {
  try {
    const cleaned = (wssUrl || '').trim();
    const match = cleaned.match(/^(wss?:)\/\/([^:/]+)(?::([^/]+))?(\/.*)?$/i);
    if (!match) {
      return {
        protocol: 'wss:',
        host: 'YOUR_BROKER_HOST',
        port: 'YOUR_WSS_PORT',
        path: '/YOUR_PATH',
      };
    }
    return {
      protocol: match[1].toLowerCase(),
      host: match[2] || '',
      port: match[3] || '8084',
      path: match[4] || '/mqtt',
    };
  } catch {
    return {
      protocol: 'wss:',
      host: 'YOUR_BROKER_HOST',
      port: 'YOUR_WSS_PORT',
      path: '/YOUR_PATH',
    };
  }
}

/**
 * Menyusun kembali komponen host, port, dan path menjadi URL WSS lengkap.
 */
export function buildWssUrl({ host, port, path }) {
  const cleanHost = (host || '').trim();
  const cleanPort = String(port || '').trim();
  let cleanPath = (path || '').trim();
  if (cleanPath && !cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  const portSegment = cleanPort ? `:${cleanPort}` : '';
  return `wss://${cleanHost}${portSegment}${cleanPath}`;
}

/**
 * Memuat konfigurasi MQTT dari localStorage (jika tersedia) atau default.
 * Juga mendukung injeksi token sementara runtime (window.__SMARTHOME_AUTH__)
 * bila pengguna menggunakan serverless token generator.
 */
export function loadMqttConfig() {
  let saved = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      saved = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[MQTT Config] Gagal membaca konfigurasi tersimpan:', err);
  }

  const runtimeAuth =
    typeof window !== 'undefined' && window.__SMARTHOME_AUTH__
      ? window.__SMARTHOME_AUTH__
      : {};

  return {
    ...DEFAULT_MQTT_CONFIG,
    ...saved,
    ...runtimeAuth,
  };
}

/**
 * Menyimpan konfigurasi MQTT ke localStorage browser.
 */
export function saveMqttConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('[MQTT Config] Gagal menyimpan konfigurasi:', err);
    return false;
  }
}

/**
 * Menghapus konfigurasi tersimpan dan mengembalikan ke default placeholder.
 */
export function resetMqttConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  } catch {
    // ignore
  }
  return { ...DEFAULT_MQTT_CONFIG };
}

/**
 * Membuat Client ID unik untuk sesi browser agar tidak bentrok antar tab/device.
 */
export function resolveClientId(customClientId) {
  if (customClientId && customClientId.trim().length > 0) {
    return customClientId.trim();
  }
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `smarthome-web-${randomSuffix}`;
}
