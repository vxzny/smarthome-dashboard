const STORAGE_KEY_TOPICS = 'smarthome_mqtt_topics_v1';

/**
 * KONFIGURASI TOPIC MQTT TERPUSAT
 * Sesuaikan nilai di file ini (atau melalui menu Settings) jika firmware ESP32
 * Anda sudah menggunakan nama topic yang berbeda.
 */
export const DEFAULT_MQTT_TOPICS = {
  devices: {
    jemuran: {
      command: 'smarthome/jemuran/command',
      state: 'smarthome/jemuran/state',
    },
    kipas: {
      command: 'smarthome/kipas/command',
      state: 'smarthome/kipas/state',
    },
    lampu1: {
      command: 'smarthome/lampu1/command',
      state: 'smarthome/lampu1/state',
    },
    lampu2: {
      command: 'smarthome/lampu2/command',
      state: 'smarthome/lampu2/state',
    },
    pintu: {
      command: 'smarthome/pintu/command',
      state: 'smarthome/pintu/state',
    },
  },
  system: {
    esp32Status: 'smarthome/esp32/status',
    xiaozhiStatus: 'smarthome/xiaozhi/status',
  },
};

/**
 * Metadata dan spesifikasi kontrol untuk kelima perangkat Smart Home.
 */
export const DEVICE_CATALOG = [
  {
    id: 'jemuran',
    name: 'Jemuran Otomatis',
    shortName: 'Jemuran',
    category: 'Aktuator & Sensor Cuaca/Limit',
    description: 'Kontrol rel jemuran otomatis keluar/masuk dengan deteksi pergerakan & error.',
    activeStates: ['OUT'],
    controls: [
      {
        action: 'OUT',
        label: 'Keluarkan Jemuran',
        variant: 'primary',
      },
      {
        action: 'IN',
        label: 'Masukkan Jemuran',
        variant: 'secondary',
      },
    ],
    stateLabels: {
      OUT: 'Jemuran Keluar',
      IN: 'Jemuran Masuk',
      MOVING: 'Sedang Bergerak',
      ERROR: 'Error Aktuator / Sensor',
      UNKNOWN: 'Tidak Diketahui',
    },
  },
  {
    id: 'kipas',
    name: 'Kipas Angin',
    shortName: 'Kipas',
    category: 'Relay / Ventilasi',
    description: 'Kontrol sirkulasi udara ruangan dengan indikator putaran baling-baling realtime.',
    activeStates: ['ON'],
    controls: [
      {
        action: 'ON',
        label: 'ON',
        variant: 'primary',
      },
      {
        action: 'OFF',
        label: 'OFF',
        variant: 'danger',
      },
    ],
    stateLabels: {
      ON: 'ON (Menyala)',
      OFF: 'OFF (Mati)',
      ERROR: 'Error Perangkat',
      UNKNOWN: 'Tidak Diketahui',
    },
  },
  {
    id: 'lampu1',
    name: 'Lampu 1',
    shortName: 'Lampu 1',
    category: 'Pencahayaan Zona 1',
    description: 'Kontrol independen untuk titik pencahayaan utama (Lampu 1).',
    activeStates: ['ON'],
    controls: [
      {
        action: 'ON',
        label: 'ON',
        variant: 'primary',
      },
      {
        action: 'OFF',
        label: 'OFF',
        variant: 'danger',
      },
    ],
    stateLabels: {
      ON: 'ON (Menyala)',
      OFF: 'OFF (Mati)',
      ERROR: 'Error Perangkat',
      UNKNOWN: 'Tidak Diketahui',
    },
  },
  {
    id: 'lampu2',
    name: 'Lampu 2',
    shortName: 'Lampu 2',
    category: 'Pencahayaan Zona 2',
    description: 'Kontrol independen untuk titik pencahayaan sekunder (Lampu 2).',
    activeStates: ['ON'],
    controls: [
      {
        action: 'ON',
        label: 'ON',
        variant: 'primary',
      },
      {
        action: 'OFF',
        label: 'OFF',
        variant: 'danger',
      },
    ],
    stateLabels: {
      ON: 'ON (Menyala)',
      OFF: 'OFF (Mati)',
      ERROR: 'Error Perangkat',
      UNKNOWN: 'Tidak Diketahui',
    },
  },
  {
    id: 'pintu',
    name: 'Pintu Otomatis',
    shortName: 'Pintu',
    category: 'Akses & Sensor Pintu Aktual',
    description: 'Monitoring posisi pintu berbasis pembacaan sensor aktual pada ESP32.',
    activeStates: ['OPEN'],
    sensorVerified: true,
    controls: [
      {
        action: 'OPEN',
        label: 'Buka Pintu',
        variant: 'primary',
      },
      {
        action: 'CLOSE',
        label: 'Tutup Pintu',
        variant: 'secondary',
      },
    ],
    stateLabels: {
      CLOSED: 'CLOSED (Pintu Tertutup)',
      OPEN: 'OPEN (Pintu Terbuka)',
      MOVING: 'MOVING (Sedang Bergerak)',
      ERROR: 'ERROR (Sensor / Kunci)',
      UNKNOWN: 'UNKNOWN (Tidak Diketahui)',
    },
  },
];

export function loadMqttTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOPICS);
    if (!raw) return structuredClone(DEFAULT_MQTT_TOPICS);
    const parsed = JSON.parse(raw);
    return {
      devices: {
        jemuran: { ...DEFAULT_MQTT_TOPICS.devices.jemuran, ...(parsed.devices?.jemuran || {}) },
        kipas: { ...DEFAULT_MQTT_TOPICS.devices.kipas, ...(parsed.devices?.kipas || {}) },
        lampu1: { ...DEFAULT_MQTT_TOPICS.devices.lampu1, ...(parsed.devices?.lampu1 || {}) },
        lampu2: { ...DEFAULT_MQTT_TOPICS.devices.lampu2, ...(parsed.devices?.lampu2 || {}) },
        pintu: { ...DEFAULT_MQTT_TOPICS.devices.pintu, ...(parsed.devices?.pintu || {}) },
      },
      system: {
        ...DEFAULT_MQTT_TOPICS.system,
        ...(parsed.system || {}),
      },
    };
  } catch {
    return structuredClone(DEFAULT_MQTT_TOPICS);
  }
}

export function saveMqttTopics(topics) {
  try {
    localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics));
    return true;
  } catch {
    return false;
  }
}

export function resetMqttTopics() {
  try {
    localStorage.removeItem(STORAGE_KEY_TOPICS);
  } catch {
    // ignore
  }
  return structuredClone(DEFAULT_MQTT_TOPICS);
}

/**
 * Mengembalikan daftar unik topic yang boleh di-subscribe oleh website.
 */
export function getAllowedSubscribeTopics(topics, enableXiaozhiStatus = true) {
  const set = new Set();
  Object.values(topics.devices).forEach((dev) => {
    if (dev.state) set.add(dev.state.trim());
  });
  if (topics.system?.esp32Status) {
    set.add(topics.system.esp32Status.trim());
  }
  if (enableXiaozhiStatus && topics.system?.xiaozhiStatus) {
    set.add(topics.system.xiaozhiStatus.trim());
  }
  return Array.from(set);
}

/**
 * Mengembalikan daftar unik topic command yang diizinkan untuk publish.
 */
export function getAllowedPublishTopics(topics) {
  const set = new Set();
  Object.values(topics.devices).forEach((dev) => {
    if (dev.command) set.add(dev.command.trim());
  });
  return set;
}
