# Panduan Penyesuaian Topic & Sinkronisasi ESP32 + Xiaozhi

## 1. Prinsip Integrasi Tanpa Merusak Xiaozhi
Website ini dirancang sebagai **pendamping kontrol & monitoring**, bukan pengganti logika Xiaozhi di ESP32:
- **Alur Perintah Web**: Website mengirim JSON ke `smarthome/<perangkat>/command` → ESP32 mengeksekusi aktuator → ESP32 memublikasikan status aktual ke `smarthome/<perangkat>/state`.
- **Alur Perintah Suara Xiaozhi**: Pengguna berbicara ke Xiaozhi → ESP32 mengeksekusi aktuator → ESP32 memublikasikan status aktual ke `smarthome/<perangkat>/state` dengan `"source":"xiaozhi"` → Dashboard otomatis memperbarui tampilan dan mencatat di *Activity History*.

## 2. Daftar Topic Standar
Jika firmware ESP32 Anda sudah memiliki topic sendiri, Anda bisa langsung menyesuaikannya di file `src/config/mqttTopics.js` atau melalui halaman **Settings** tanpa mengubah firmware. Jika belum, gunakan standar berikut:

| Perangkat | Command Topic (Web → ESP32) | State Topic (ESP32 → Web) | Nilai State Valid |
| :--- | :--- | :--- | :--- |
| **Jemuran Otomatis** | `smarthome/jemuran/command` | `smarthome/jemuran/state` | `OUT`, `IN`, `MOVING`, `ERROR` |
| **Kipas Angin** | `smarthome/kipas/command` | `smarthome/kipas/state` | `ON`, `OFF`, `ERROR` |
| **Lampu 1** | `smarthome/lampu1/command` | `smarthome/lampu1/state` | `ON`, `OFF`, `ERROR` |
| **Lampu 2** | `smarthome/lampu2/command` | `smarthome/lampu2/state` | `ON`, `OFF`, `ERROR` |
| **Pintu Otomatis** | `smarthome/pintu/command` | `smarthome/pintu/state` | `CLOSED`, `OPEN`, `MOVING`, `ERROR` |

### System Topics
- `smarthome/esp32/status` → Payload `{"status":"ONLINE"}` saat terhubung, dan LWT broker `{"status":"OFFLINE"}` (retained) jika ESP32 terputus.
- `smarthome/xiaozhi/status` → Opsional, payload `{"status":"ONLINE"}` / `{"status":"OFFLINE"}`.

## 3. Format Payload JSON
**Command dari Website (`QoS 1`):**
```json
{
  "action": "ON",
  "source": "web",
  "requestId": "web-1732026000-a1b2"
}
```

**State dari ESP32 (`Retained = true` disarankan):**
```json
{
  "state": "ON",
  "source": "xiaozhi",
  "timestamp": 1732026015
}
```
*(Lihat file `esp32_reference/mqtt_sync_addon.ino` untuk contoh implementasi fungsi publish state di C++/Arduino).*
