import React, { useEffect, useState } from 'react';
import { Menu, Wifi, Cpu, Mic, Clock, RefreshCw } from 'lucide-react';

const MQTT_BADGE_MAP = {
  CONNECTED: {
    label: 'CONNECTED',
    dot: 'bg-emerald-400',
    style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
  },
  CONNECTING: {
    label: 'CONNECTING',
    dot: 'bg-amber-400 animate-ping',
    style: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
  },
  DISCONNECTED: {
    label: 'DISCONNECTED',
    dot: 'bg-rose-500',
    style: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
  },
  RECONNECTING: {
    label: 'RECONNECTING',
    dot: 'bg-blue-400 animate-ping',
    style: 'bg-blue-500/15 text-blue-300 border-blue-500/35',
  },
};

export default function TopNavbar({
  onOpenMobileMenu,
  connectionStatus,
  esp32Status,
  xiaozhiStatus,
  enableXiaozhiStatus,
  onReconnect,
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mqttBadge = MQTT_BADGE_MAP[connectionStatus] || MQTT_BADGE_MAP.DISCONNECTED;

  const formattedTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = now.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-cyan-500/15 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mobile Trigger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300"
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Smart Home Dashboard
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono uppercase rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                Live Telemetry
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Pusat Monitoring & Kontrol Perangkat Berbasis ESP32 + Xiaozhi
            </p>
          </div>
        </div>

        {/* Right: Status Indicators & Clock */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* MQTT Connection Status */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${mqttBadge.style}`}
            title="Status koneksi MQTT over WSS"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="relative flex h-2 w-2">
              <span className={`inline-flex rounded-full h-2 w-2 ${mqttBadge.dot}`} />
            </span>
            <span className="font-semibold">{mqttBadge.label}</span>
            {connectionStatus === 'DISCONNECTED' && (
              <button
                onClick={onReconnect}
                className="ml-1 p-0.5 rounded hover:bg-white/10 transition-colors"
                title="Coba hubungkan ulang"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* ESP32 Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${
              esp32Status === 'ONLINE'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : esp32Status === 'OFFLINE'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-slate-800/70 text-slate-400 border-slate-700/80'
            }`}
            title="Status perangkat ESP32 (via LWT & Telemetry)"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ESP32: {esp32Status}</span>
          </div>

          {/* Xiaozhi Status (jika diaktifkan/tersedia) */}
          {enableXiaozhiStatus && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                xiaozhiStatus === 'ONLINE'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : xiaozhiStatus === 'OFFLINE'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800/70 text-slate-400 border-slate-700/80'
              }`}
              title="Status integrasi Xiaozhi Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Xiaozhi: {xiaozhiStatus}</span>
            </div>
          )}

          {/* Current Time */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <div className="leading-tight">
              <div className="font-mono font-semibold text-slate-100">{formattedTime}</div>
              <div className="text-[10px] text-slate-400 hidden sm:block">{formattedDate}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
