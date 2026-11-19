import React from 'react';
import { DEVICE_CATALOG } from '../config/mqttTopics';
import SystemOverview from '../components/SystemOverview';
import DeviceCard from '../components/DeviceCard';
import { formatTimeOnly } from '../utils/timeFormatter';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OverviewPage({
  devices,
  topics,
  connectionStatus,
  esp32Status,
  systemSummary,
  activityLogs,
  onCommand,
  onNavigate,
}) {
  const isConnected = connectionStatus === 'CONNECTED';
  const recentLogs = activityLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* System Overview KPI Cards */}
      <SystemOverview
        summary={systemSummary}
        connectionStatus={connectionStatus}
        esp32Status={esp32Status}
      />

      {/* Five Device Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Perangkat Smart Home</h2>
            <p className="text-xs text-slate-400">
              Status realtime tersinkronisasi dua arah dengan ESP32 dan Xiaozhi Voice Assistant
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />5 Unit Terdaftar
          </span>
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
            />
          ))}
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Aktivitas Terbaru</h3>
            <p className="text-xs text-slate-400">
              Catatan perintah yang terverifikasi dari Website maupun Xiaozhi
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-medium text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Belum ada riwayat aktivitas dalam sesi ini. Kirim perintah atau gunakan suara Xiaozhi.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{formatTimeOnly(log.timestamp)}</span>
                  <span className="font-semibold text-slate-100">{log.deviceName}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">
                    {log.action}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                      log.source === 'Xiaozhi'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-400/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-400/30'
                    }`}
                  >
                    {log.source}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : log.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {log.status === 'SUCCESS'
                      ? 'Berhasil'
                      : log.status === 'PENDING'
                        ? 'Menunggu'
                        : 'Gagal/Timeout'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
