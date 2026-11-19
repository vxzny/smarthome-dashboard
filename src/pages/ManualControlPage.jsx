import React from 'react';
import { DEVICE_CATALOG } from '../config/mqttTopics';
import DeviceCard from '../components/DeviceCard';
import { ShieldAlert, Info } from 'lucide-react';

export default function ManualControlPage({
  devices,
  topics,
  connectionStatus,
  config,
  onCommand,
}) {
  const isConnected = connectionStatus === 'CONNECTED';

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Panel Kontrol Manual Realtime</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Perintah dikirim via MQTT QoS {config.qosCommand} dan menunggu konfirmasi aktual dari ESP32 (batas waktu {config.commandTimeoutMs / 1000} detik).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3.5 py-2 rounded-xl">
          <Info className="w-4 h-4 shrink-0" />
          <span>Indikator hanya berubah setelah ESP32 membalas state terbaru</span>
        </div>
      </div>

      {/* Peringatan Keamanan Khusus Pintu Otomatis */}
      <div className="rounded-2xl bg-blue-950/35 border border-blue-500/30 p-4 flex items-start gap-3 text-xs text-blue-200">
        <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Verifikasi Sensor Pintu Otomatis:</span> Menekan tombol{' '}
          <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">Tutup Pintu</code> atau{' '}
          <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">Buka Pintu</code> hanya mengirim instruksi ke ESP32. Status{' '}
          <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">CLOSED</code> /{' '}
          <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">OPEN</code> hanya ditampilkan setelah sensor fisik pintu pada ESP32 mengirim laporan.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DEVICE_CATALOG.map((meta) => (
          <DeviceCard
            key={meta.id}
            meta={meta}
            deviceState={devices[meta.id]}
            topics={topics.devices[meta.id]}
            isConnected={isConnected}
            onCommand={onCommand}
            showTopicDetails={true}
          />
        ))}
      </div>
    </div>
  );
}
