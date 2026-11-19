import React from 'react';
import { WifiOff, Settings, RefreshCw } from 'lucide-react';
import { isPlaceholderBroker } from '../config/mqttConfig';

export default function ConnectionBanner({
  connectionStatus,
  connectionDetail,
  brokerUrl,
  onOpenSettings,
  onReconnect,
}) {
  if (connectionStatus === 'CONNECTED') return null;

  const isPlaceholder = isPlaceholderBroker(brokerUrl);

  return (
    <div
      className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING'
          ? 'bg-amber-500/10 border-amber-400/35 text-amber-200'
          : 'bg-rose-500/10 border-rose-500/35 text-rose-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-black/30 shrink-0 mt-0.5">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">
            {isPlaceholder
              ? 'Konfigurasi Broker MQTT WSS Belum Diatur'
              : connectionStatus === 'RECONNECTING'
                ? 'Menyambung Ulang ke MQTT Broker...'
                : connectionStatus === 'CONNECTING'
                  ? 'Menghubungkan ke MQTT Broker WSS...'
                  : 'Koneksi MQTT Terputus — Kontrol Manual Dinonaktifkan'}
          </h2>
          <p className="text-xs opacity-85 mt-0.5">
            {isPlaceholder
              ? 'Website tidak menggunakan data simulasi. Silakan masukkan URL Broker WSS, Port, Path, dan Kredensial Anda di halaman Settings.'
              : connectionDetail ||
                'Pastikan broker MQTT mendukung WebSocket Secure (WSS) dan ESP32 terhubung ke broker yang sama.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isPlaceholder && (
          <button
            onClick={onReconnect}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reconnect</span>
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan MQTT</span>
        </button>
      </div>
    </div>
  );
}
