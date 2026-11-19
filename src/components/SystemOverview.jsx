import React from 'react';
import { Power, PowerOff, Wifi, Cpu, Clock } from 'lucide-react';
import { formatTimeOnly } from '../utils/timeFormatter';

export default function SystemOverview({
  summary,
  connectionStatus,
  esp32Status,
}) {
  const cards = [
    {
      label: 'Perangkat Aktif',
      value: `${summary.activeCount} / ${summary.totalDevices}`,
      sub: 'ON / Terbuka / Keluar',
      icon: Power,
      accent: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
    },
    {
      label: 'Perangkat Tidak Aktif',
      value: `${summary.inactiveCount} / ${summary.totalDevices}`,
      sub: summary.unknownCount > 0 ? `${summary.unknownCount} berstatus UNKNOWN` : 'OFF / Tertutup / Masuk',
      icon: PowerOff,
      accent: 'text-slate-300 bg-slate-800/80 border-slate-700',
    },
    {
      label: 'Status Koneksi MQTT',
      value: connectionStatus,
      sub: 'Protokol WSS (TLS)',
      icon: Wifi,
      accent:
        connectionStatus === 'CONNECTED'
          ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
          : connectionStatus === 'CONNECTING'
            ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
            : connectionStatus === 'RECONNECTING'
              ? 'text-blue-300 bg-blue-500/15 border-blue-500/30'
              : 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    },
    {
      label: 'Status Koneksi ESP32',
      value: esp32Status,
      sub: 'Deteksi LWT & Heartbeat',
      icon: Cpu,
      accent:
        esp32Status === 'ONLINE'
          ? 'text-blue-300 bg-blue-500/15 border-blue-500/30'
          : esp32Status === 'OFFLINE'
            ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
            : 'text-slate-300 bg-slate-800/80 border-slate-700',
    },
    {
      label: 'Waktu Update Terakhir',
      value: formatTimeOnly(summary.lastMessageAt),
      sub: summary.lastMessageAt ? 'Pesan broker diterima' : 'Menunggu paket MQTT',
      icon: Clock,
      accent: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
    },
  ];

  return (
    <section aria-label="System Overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="glass-card rounded-2xl p-4 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-400 truncate">{card.label}</div>
              <div className="mt-1.5 text-lg font-bold font-mono text-white truncate">
                {card.value}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 truncate">{card.sub}</div>
            </div>
            <div className={`p-2.5 rounded-xl border shrink-0 ${card.accent}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
