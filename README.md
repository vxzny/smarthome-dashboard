# Smart Home Monitoring & Control Dashboard (ESP32 + Xiaozhi + MQTT WSS)

Dashboard web modern, futuristik, dan responsif berbasis **React + Vite + Tailwind CSS + MQTT.js** untuk memonitoring dan mengontrol 5 perangkat Smart Home secara realtime melalui **MQTT over WebSocket Secure (WSS)**, dirancang untuk berjalan langsung di **GitHub Pages** tanpa server backend lokal.

## Perangkat yang Didukung
1. **Jemuran Otomatis** (`OUT` / `IN` / `MOVING` / `ERROR`)
2. **Kipas Angin** (`ON` / `OFF` dengan animasi putaran baling-baling realtime)
3. **Lampu 1** (`ON` / `OFF` independen)
4. **Lampu 2** (`ON` / `OFF` independen)
5. **Pintu Otomatis** (`CLOSED` / `OPEN` / `MOVING` / `ERROR` murni berbasis pembacaan sensor aktual ESP32)

## Fitur Utama
- **100% Static Frontend (GitHub Pages Ready)**: Berkomunikasi langsung dari browser ke MQTT Broker menggunakan protokol `wss://`.
- **Sinkronisasi Dua Arah dengan Xiaozhi Voice Assistant**: Perubahan yang dipicu melalui suara di Xiaozhi maupun tombol di website saling memperbarui secara otomatis tanpa konflik.
- **Pending State & Verifikasi Konfirmasi ESP32**: Tombol tidak mengubah status perangkat secara sepihak sebelum ESP32 membalas status aktual; dilengkapi deteksi *timeout* jika ESP32 tidak merespons.
- **Monitoring Sensor Pintu Aktual**: Status pintu hanya diperbarui berdasarkan data sensor aktual yang dikirim oleh ESP32.
- **Manajemen Koneksi MQTT Tangguh**: Automatic reconnect, re-subscribe bersih tanpa duplikasi, deteksi ESP32 offline via *Last Will and Testament (LWT)*, serta blokir kontrol saat terputus.
- **Activity History Terverifikasi**: Mencatat waktu, perangkat, aksi, sumber perintah (`Website` atau `Xiaozhi`), serta status verifikasi (`Berhasil` / `Menunggu` / `Timeout`).

## Struktur Project
```text
smarthome-dashboard/
├── .github/workflows/deploy.yml   # Otomatisasi deploy ke GitHub Pages
├── docs/                          # Panduan lengkap MQTT, ESP32, Deploy & Troubleshooting
├── esp32_reference/               # Referensi fungsi sinkronisasi MQTT untuk ESP32
├── public/favicon.svg             # Ikon aplikasi
├── src/
│   ├── components/                # Sidebar, TopNavbar, SystemOverview, DeviceCard, Visuals
│   ├── config/                    # Konfigurasi Broker WSS & Topic MQTT terpusat
│   ├── hooks/                     # State management realtime, pending/timeout & logging
│   ├── pages/                     # Overview, Monitoring, Manual Control, History, Settings
│   ├── services/                  # Isolasi koneksi MQTT.js over WSS
│   ├── styles/                    # Konfigurasi Tailwind & tema dark glassmorphism
│   └── utils/                     # Validasi payload JSON, keamanan WSS & format waktu
├── .env.example                   # Contoh variabel environment (tanpa kredensial asli)
├── package.json
└── vite.config.js
```

## Menjalankan Secara Lokal (Pengembangan)
```bash
npm install
npm run dev
```

## Dokumentasi Lengkap
- [Panduan Konfigurasi MQTT WSS](docs/MQTT_CONFIGURATION.md)
- [Panduan Penyesuaian Topic & Sinkronisasi ESP32 + Xiaozhi](docs/ESP32_INTEGRATION.md)
- [Panduan Deployment GitHub Pages](docs/GITHUB_PAGES_DEPLOYMENT.md)
- [Panduan Troubleshooting Koneksi MQTT WSS](docs/TROUBLESHOOTING_WSS.md)
