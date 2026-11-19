import React, { useState } from 'react';
import { Trash2, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatTimeOnly } from '../utils/timeFormatter';

export default function ActivityHistoryPage({ activityLogs, onClearLogs }) {
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [deviceFilter, setDeviceFilter] = useState('ALL');

  const filteredLogs = activityLogs.filter((item) => {
    if (sourceFilter !== 'ALL' && item.source.toLowerCase() !== sourceFilter.toLowerCase()) {
      return false;
    }
    if (deviceFilter !== 'ALL' && item.deviceId !== deviceFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Activity History (Log Eksekusi)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Riwayat perintah dari Website maupun Xiaozhi Voice Assistant beserta status verifikasi dari ESP32.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">Semua Sumber</option>
              <option value="Website" className="bg-slate-900">Website</option>
              <option value="Xiaozhi" className="bg-slate-900">Xiaozhi</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">Semua Perangkat</option>
              <option value="jemuran" className="bg-slate-900">Jemuran</option>
              <option value="kipas" className="bg-slate-900">Kipas</option>
              <option value="lampu1" className="bg-slate-900">Lampu 1</option>
              <option value="lampu2" className="bg-slate-900">Lampu 2</option>
              <option value="pintu" className="bg-slate-900">Pintu</option>
            </select>
          </div>

          {activityLogs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Tidak ada catatan aktivitas yang sesuai dengan filter saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Perangkat</th>
                  <th className="py-3.5 px-4">Aktivitas</th>
                  <th className="py-3.5 px-4">Sumber</th>
                  <th className="py-3.5 px-4">Status Verifikasi</th>
                  <th className="py-3.5 px-4">Keterangan / Request ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {formatTimeOnly(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {log.deviceName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono ${
                          log.source === 'Xiaozhi'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-400/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-400/30'
                        }`}
                      >
                        {log.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
                        </span>
                      ) : log.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> Menunggu ESP32
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-300 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> {log.status === 'TIMEOUT' ? 'Timeout' : 'Gagal'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.note || log.requestId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
