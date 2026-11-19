# Panduan Konfigurasi MQTT over WSS

Website dashboard ini di-hosting secara statis di **GitHub Pages (HTTPS)**. Karena browser modern memblokir koneksi tidak terenkripsi (`ws://`) di dalam halaman `https://`, komunikasi antara browser dan MQTT Broker **wajib menggunakan WebSocket Secure (`wss://`)**.

## 1. Perbedaan Port ESP32 vs Website
- **ESP32**: Tetap menggunakan koneksi MQTT TCP (`1883`) atau MQTT TLS (`8883`) yang sudah berjalan saat ini. Tidak perlu diubah ke WebSocket.
- **Website Dashboard**: Menghubungi broker yang sama melalui port **WSS** (umumnya port `8084`, `8884`, atau `443` tergantung broker seperti EMQX, HiveMQ Cloud, atau Mosquitto dengan TLS).

## 2. Placeholder Konfigurasi
Pada `src/config/mqttConfig.js` dan `.env.example`, tersedia placeholder standar:

```js
MQTT_BROKER = "wss://YOUR_BROKER_HOST:YOUR_WSS_PORT/YOUR_PATH"
MQTT_USERNAME = "YOUR_USERNAME"
MQTT_PASSWORD = "YOUR_PASSWORD"
```

### Contoh Pengisian pada Halaman Settings Website:
1. Buka dashboard dan pilih menu **Settings** di sidebar.
2. Masukkan detail broker Anda:
   - **Broker Host**: misal `broker-anda.emqxsl.com` atau `mqtt.domain-anda.com`
   - **WSS Port**: misal `8084`
   - **WebSocket Path**: misal `/mqtt` (atau `/ws` sesuai konfigurasi broker Anda)
   - **MQTT Username**: akun khusus website (bukan akun admin broker)
   - **MQTT Password**: password akun website
3. Klik **Simpan & Hubungkan**. Konfigurasi disimpan secara aman di `localStorage` browser Anda.

## 3. Rekomendasi ACL (Access Control List) Broker
Untuk menjaga keamanan sistem Smart Home, buat kredensial khusus untuk website dengan pembatasan hak akses (ACL) pada broker:
- **Izinkan Publish hanya ke**: `smarthome/+/command`
- **Izinkan Subscribe hanya ke**: `smarthome/+/state`, `smarthome/esp32/status`, `smarthome/xiaozhi/status`
- **Tolak akses** ke topic sistem broker (`$SYS/#`) atau topic di luar prefix `smarthome/`.
