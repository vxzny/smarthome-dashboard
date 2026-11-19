# Troubleshooting Koneksi MQTT over WSS

## 1. Status Terus Berada di `CONNECTING` atau `DISCONNECTED`
- **Cek Protokol WSS**: Pastikan URL diawali `wss://`, bukan `ws://` atau `mqtt://`.
- **Cek Port WSS Broker**: Port `1883` (TCP) dan `8083` (WS biasa) **tidak akan berhasil** dari GitHub Pages. Gunakan port WSS yang aktif di broker Anda (misalnya `8084` pada EMQX/Mosquitto atau `8884` pada HiveMQ Cloud).
- **Cek WebSocket Path**: Banyak broker mewajibkan path `/mqtt` di akhir URL (contoh: `wss://broker.contoh.com:8084/mqtt`), sementara beberapa broker cloud menggunakan `/` atau tanpa path.
- **Sertifikat SSL/TLS Self-Signed**: Browser akan menolak koneksi WSS jika broker lokal memakai sertifikat SSL self-signed yang tidak dipercaya browser. Gunakan sertifikat valid (seperti Let's Encrypt) atau managed cloud MQTT broker dengan TLS valid.

## 2. Perintah Dikirim dari Web, Tetapi Muncul Notifikasi `Timeout`
- **Topic Tidak Cocok**: Pastikan topic di menu **Settings** sama persis (case-sensitive) dengan topic yang di-subscribe oleh firmware ESP32.
- **ESP32 Belum Mengirim Balasan State**: Website tidak mengubah tombol secara sepihak; website menunggu ESP32 memublikasikan state terbaru ke `smarthome/<perangkat>/state`. Pastikan firmware ESP32 memanggil fungsi publish state setelah mengeksekusi perintah.
- **ESP32 Offline**: Periksa indikator `ESP32: ONLINE/OFFLINE` di bar navigasi atas.

## 3. Perintah Suara Xiaozhi Berjalan, Tetapi Dashboard Tidak Berubah
- Pastikan bagian kode handler Xiaozhi pada ESP32 juga memanggil fungsi publish ke `smarthome/<perangkat>/state` setelah perangkat berubah status (lihat contoh pada `esp32_reference/mqtt_sync_addon.ino`).
