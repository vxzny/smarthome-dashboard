import React from 'react';
import { DEVICE_CATALOG } from '../config/mqttTopics';
import DeviceVisualIndicator from '../components/DeviceVisualIndicator';
import { formatDateTime } from '../utils/timeFormatter';
import { ShieldCheck, Terminal, Radio } from 'lucide-react';

export default function MonitoringPage({
  devices,
  topics,
  connectionStatus,
  esp32Status,
  xiaozhiStatus,
}) {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Device Monitoring & Telemetri Sensor</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspeksi kondisi aktual perangkat, topic MQTT, sumber pemicu (Web / Xiaozhi), dan raw payload terakhir.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            MQTT: <strong className="text-cyan-300">{connectionStatus}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            ESP32: <strong className="text-blue-300">{esp32Status}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Xiaozhi: <strong className="text-purple-300">{xiaozhiStatus}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {DEVICE_CATALOG.map((meta) => {
          const dev = devices[meta.id];
          const devTopics = topics.devices[meta.id];
          const humanState = meta.stateLabels[dev.state] || dev.state;

          return (
            <div
              key={meta.id}
              className="glass-card rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center"
            >
              {/* Device Identity */}
              <div className="lg:col-span-4 flex items-center gap-4">
                <DeviceVisualIndicator
                  deviceId={meta.id}
                  state={dev.state}
                  isPending={dev.isPending}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{meta.name}</h3>
                    {meta.sensorVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                        <ShieldCheck className="w-3 h-3" /> Sensor Aktual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                </div>
              </div>

              {/* Realtime State & Source */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/90">
                <div>
                  <div className="text-[11px] text-slate-500">Status Aktual</div>
                  <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
                    {dev.state}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{humanState}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Sumber & Waktu</div>
                  <div className="text-xs font-mono text-purple-300 mt-0.5 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    {dev.source ? dev.source.toUpperCase() : 'BELUM ADA'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formatDateTime(dev.lastUpdate)}
                  </div>
                </div>
              </div>

              {/* MQTT Topics & Last Raw Payload */}
              <div className="lg:col-span-4 space-y-1.5 text-xs font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/90">
                <div className="truncate text-slate-300">
                  <span className="text-cyan-400">STATE TOPIC:</span> {devTopics?.state}
                </div>
                <div className="truncate text-slate-300">
                  <span className="text-blue-400">CMD TOPIC:</span> {devTopics?.command}
                </div>
                <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                  <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">
                    {dev.rawPayload ? dev.rawPayload : 'Belum ada payload diterima'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
