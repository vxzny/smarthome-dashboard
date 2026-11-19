import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Sliders,
  History,
  Settings,
  Cpu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Ringkasan & Kontrol Cepat' },
  { id: 'monitoring', label: 'Device Monitoring', icon: Activity, desc: 'Telemetri & Sensor Aktual' },
  { id: 'control', label: 'Manual Control', icon: Sliders, desc: 'Panel Eksekusi Perangkat' },
  { id: 'history', label: 'Activity History', icon: History, desc: 'Log Web & Xiaozhi' },
  { id: 'settings', label: 'Settings', icon: Settings, desc: 'Broker WSS & Topic MQTT' },
];

export default function Sidebar({
  activePage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
  connectionStatus,
  pendingCount,
}) {
  return (
    <>
      {/* Backdrop untuk tampilan mobile/tablet */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-cyan-500/15 flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Cpu className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="font-bold tracking-wide text-slate-100 text-sm">
                NEXUS<span className="text-cyan-400">HOME</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">ESP32 • XIAOZHI • WSS</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Navigasi Utama
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent border border-cyan-400/35 text-white shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-900/80 text-slate-400 group-hover:text-cyan-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.id === 'control' && pendingCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Architecture Info */}
        <div className="p-4 m-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Protokol</span>
            <span className="font-mono text-cyan-300">MQTT over WSS</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Sinkronisasi</span>
            <span className="font-mono text-purple-300">Web ↔ Xiaozhi</span>
          </div>
          <div className="pt-1 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'CONNECTING'
                    ? 'bg-amber-400 animate-pulse'
                    : connectionStatus === 'RECONNECTING'
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-rose-500'
              }`}
            />
            <span className="truncate">
              {connectionStatus === 'CONNECTED'
                ? 'Sinkronisasi Realtime Aktif'
                : 'Menunggu Koneksi Broker'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
