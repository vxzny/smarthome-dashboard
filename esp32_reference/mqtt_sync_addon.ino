/*
 * ============================================================================
 * REFERENSI SINKRONISASI MQTT UNTUK FIRMWARE ESP32 + XIAOZHI (NON-INVASIVE)
 * ============================================================================
 * Catatan Penting:
 * - File ini BUKAN pengganti firmware Xiaozhi Anda.
 * - Gunakan pola fungsi di bawah ini hanya apabila firmware ESP32 Anda
 *   belum memublikasikan state JSON setelah Xiaozhi mengeksekusi perintah suara,
 *   atau belum mengirim laporan sensor pintu aktual ke broker MQTT.
 * - ESP32 tetap terhubung ke MQTT Broker melalui TCP/TLS standar (mis. port 1883/8883),
 *   sementara Website GitHub Pages terhubung ke broker yang sama melalui WSS.
 */

#include <Arduino.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

extern PubSubClient mqttClient;

// Topic standar (sesuaikan jika firmware Anda sudah memakai nama topic lain)
const char* TOPIC_ESP32_LWT     = "smarthome/esp32/status";
const char* TOPIC_JEMURAN_STATE = "smarthome/jemuran/state";
const char* TOPIC_KIPAS_STATE   = "smarthome/kipas/state";
const char* TOPIC_LAMPU1_STATE  = "smarthome/lampu1/state";
const char* TOPIC_LAMPU2_STATE  = "smarthome/lampu2/state";
const char* TOPIC_PINTU_STATE   = "smarthome/pintu/state";

/**
 * 1. Panggil fungsi ini saat ESP32 berhasil konek ke MQTT Broker
 *    dengan Last Will and Testament (LWT) aktif.
 */
bool connectMqttWithLwt(const char* clientId, const char* user, const char* pass) {
  // LWT: Broker otomatis mengirim {"status":"OFFLINE"} (retained) jika ESP32 putus mendadak
  bool connected = mqttClient.connect(
    clientId,
    user,
    pass,
    TOPIC_ESP32_LWT,
    1,
    true,
    "{"status":"OFFLINE"}"
  );

  if (connected) {
    // Publikasikan status ONLINE dengan retained = true
    mqttClient.publish(TOPIC_ESP32_LWT, "{"status":"ONLINE"}", true);

    // Subscribe command topics dari Website Dashboard (QoS 1)
    mqttClient.subscribe("smarthome/jemuran/command", 1);
    mqttClient.subscribe("smarthome/kipas/command", 1);
    mqttClient.subscribe("smarthome/lampu1/command", 1);
    mqttClient.subscribe("smarthome/lampu2/command", 1);
    mqttClient.subscribe("smarthome/pintu/command", 1);
  }
  return connected;
}

/**
 * 2. Panggil fungsi ini SETELAH aktuator/perangkat dijalankan
 *    baik oleh perintah dari "web" maupun perintah suara "xiaozhi".
 *    Menggunakan retained = true agar dashboard selalu mendapat kondisi terakhir.
 */
void publishDeviceState(const char* stateTopic, const char* actualState, const char* source, const char* requestId = "") {
  StaticJsonDocument<192> doc;
  doc["state"] = actualState;       // Contoh: "ON", "OFF", "OPEN", "CLOSED", "MOVING", "OUT", "IN", "ERROR"
  doc["source"] = source;           // "web" atau "xiaozhi"
  doc["timestamp"] = millis() / 1000;
  if (strlen(requestId) > 0) {
    doc["requestId"] = requestId;
  }

  char buffer[192];
  serializeJson(doc, buffer);
  mqttClient.publish(stateTopic, buffer, true);
}

/**
 * 3. Contoh pembacaan sensor fisik pintu (Reed Switch / Limit Switch).
 *    Jangan langsung publish "CLOSED" saat motor mulai bergerak—tunggu sensor fisik!
 */
void onDoorSensorChanged(bool isDoorClosedSensorActive, bool isMotorMoving, const char* triggerSource) {
  if (isMotorMoving) {
    publishDeviceState(TOPIC_PINTU_STATE, "MOVING", triggerSource);
  } else if (isDoorClosedSensorActive) {
    publishDeviceState(TOPIC_PINTU_STATE, "CLOSED", triggerSource);
  } else {
    publishDeviceState(TOPIC_PINTU_STATE, "OPEN", triggerSource);
  }
}
