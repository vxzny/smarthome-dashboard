import React from 'react';
import { ShieldCheck, Radio, Clock, Loader2 } from 'lucide-react';
import DeviceVisualIndicator from './DeviceVisualIndicator';
import { formatTimeOnly } from '../utils/timeFormatter';

function getStateBadgeStyle(deviceId, state) {
  if (state === 'UNKNOWN') {
    return 'bg-slate-800/90 text-slate-400 border-slate-700';
  }
  if (state === 'ERROR') {
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }
  if (state === 'MOVING') {
    return 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse';
  }
  if (deviceId === 'pintu') {
    return state === 'OPEN'
      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35';
  }
  const isActive = state === 'ON' || state === 'OUT';
  return isActive
    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
    : 'bg-slate-800/80 text-slate-300 border-slate-700';
}

export default function DeviceCard({
  meta,
  deviceState,
  topics,
  isConnected,
  onCommand,
  showTopicDetails = false,
}) {
  const {
    state,
    source,
    lastUpdate,
    isPending,
    pendingAction,
    isRetained,
  } = deviceState;

  const humanState = meta.stateLabels[state] || state;
  const badgeStyle = getStateBadgeStyle(meta.id, state);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden">
      {/* Subtle Top Glow Line when Active */}
      {(state === 'ON' || state === 'OUT' || state === 'OPEN') && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      )}

      {/* Header: Icon + Name + Realtime Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <DeviceVisualIndicator
            deviceId={meta.id}
            state={state}
            isPending={isPending}
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white truncate">{meta.name}</h3>
            <p className="text-xs text-slate-400 truncate">{meta.category}</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold shrink-0 ${badgeStyle}`}
        >
          {state}
        </span>
      </div>

      {/* Status Detail Box */}
      <div className="rounded-xl bg-slate-950/65 border border-slate-800/90 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Kondisi Aktual</span>
          <span className="font-medium text-slate-100">{humanState}</span>
        </div>

        {/* Visual Progress Bar khusus Jemuran */}
        {meta.id === 'jemuran' && (
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                state === 'OUT'
                  ? 'w-full bg-cyan-400'
                  : state === 'MOVING'
                    ? 'w-1/2 bg-amber-400 animate-pulse'
                    : state === 'ERROR'
                      ? 'w-full bg-rose-500'
                      : state === 'IN'
                        ? 'w-[12%] bg-blue-500'
                        : 'w-0'
              }`}
            />
          </div>
        )}

        {/* Indikator Sensor Aktual khusus Pintu Otomatis */}
        {meta.sensorVerified && (
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/90 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Status murni dari sensor pintu ESP32</span>
          </div>
        )}

        {/* Pending Indicator */}
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/25 rounded-lg px-2.5 py-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>
              Mengirim perintah <strong>{pendingAction}</strong> • Menunggu ESP32...
            </span>
          </div>
        )}

        {/* Metadata: Last Update & Trigger Source */}
        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            {formatTimeOnly(lastUpdate)}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Radio className="w-3 h-3 text-slate-500" />
            {source === 'xiaozhi'
              ? 'Xiaozhi Voice'
              : source === 'web'
                ? 'Web Dashboard'
                : isRetained
                  ? 'Retained State'
                  : 'Menunggu Data'}
          </span>
        </div>

        {showTopicDetails && topics && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
            <div className="truncate">
              <span className="text-cyan-400">CMD:</span> {topics.command}
            </div>
            <div className="truncate">
              <span className="text-purple-400">STA:</span> {topics.state}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {meta.controls.map((ctrl) => {
          const isCurrentTarget =
            (ctrl.action === 'ON' && state === 'ON') ||
            (ctrl.action === 'OFF' && state === 'OFF') ||
            (ctrl.action === 'OUT' && state === 'OUT') ||
            (ctrl.action === 'IN' && state === 'IN') ||
            (ctrl.action === 'OPEN' && state === 'OPEN') ||
            (ctrl.action === 'CLOSE' && state === 'CLOSED');

          const disabled = !isConnected || isPending;

          const variantClass =
            ctrl.variant === 'primary'
              ? isCurrentTarget
                ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-400/30 text-white shadow-[0_4px_15px_rgba(6,182,212,0.25)]'
              : ctrl.variant === 'danger'
                ? isCurrentTarget
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                  : 'bg-slate-800/90 hover:bg-rose-600/25 hover:border-rose-500/50 hover:text-rose-200 border-slate-700 text-slate-200'
                : isCurrentTarget
                  ? 'bg-blue-500/25 border-blue-400/50 text-blue-200'
                  : 'bg-slate-800/90 hover:bg-blue-600/25 hover:border-blue-400/50 hover:text-blue-200 border-slate-700 text-slate-200';

          return (
            <button
              key={ctrl.action}
              type="button"
              disabled={disabled}
              onClick={() => onCommand(meta.id, ctrl.action)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${variantClass} disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {isPending && pendingAction === ctrl.action && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>{ctrl.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
