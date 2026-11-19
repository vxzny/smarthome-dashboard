import React from 'react';
import {
  Fan,
  Lightbulb,
  DoorOpen,
  DoorClosed,
  Shirt,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from 'lucide-react';

/**
 * Indikator visual dinamis untuk masing-masing dari 5 perangkat Smart Home:
 * - Kipas berputar halus saat ON
 * - Lampu bersinar neon saat ON
 * - Jemuran menampilkan animasi keluar / masuk / bergerak / error
 * - Pintu menampilkan kondisi sensor aktual OPEN / CLOSED / MOVING / UNKNOWN
 */
export default function DeviceVisualIndicator({ deviceId, state, isPending }) {
  if (isPending) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (state === 'ERROR') {
    return (
      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.25)]">
        <AlertTriangle className="w-6 h-6" />
      </div>
    );
  }

  if (state === 'UNKNOWN') {
    return (
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400">
        <HelpCircle className="w-6 h-6" />
      </div>
    );
  }

  // 1. Jemuran Otomatis
  if (deviceId === 'jemuran') {
    const isOut = state === 'OUT';
    const isMoving = state === 'MOVING';
    return (
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
          isOut
            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.28)]'
            : isMoving
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}
      >
        <Shirt className={`w-6 h-6 transition-transform duration-500 ${isOut ? 'scale-110' : 'scale-95 opacity-80'}`} />
      </div>
    );
  }

  // 2. Kipas Angin (berputar ketika ON)
  if (deviceId === 'kipas') {
    const isOn = state === 'ON';
    return (
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
          isOn
            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.3)]'
            : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`}
      >
        <Fan className={`w-6 h-6 ${isOn ? 'animate-spin-slow text-cyan-300' : ''}`} />
      </div>
    );
  }

  // 3 & 4. Lampu 1 & Lampu 2
  if (deviceId === 'lampu1' || deviceId === 'lampu2') {
    const isOn = state === 'ON';
    const isLampu2 = deviceId === 'lampu2';
    return (
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
          isOn
            ? isLampu2
              ? 'bg-purple-500/25 border-purple-400/60 text-purple-200 shadow-[0_0_28px_rgba(168,85,247,0.4)]'
              : 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.4)]'
            : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`}
      >
        <Lightbulb className={`w-6 h-6 ${isOn ? 'fill-current' : ''}`} />
      </div>
    );
  }

  // 5. Pintu Otomatis (berdasarkan sensor aktual)
  if (deviceId === 'pintu') {
    const isOpen = state === 'OPEN';
    const isMoving = state === 'MOVING';
    return (
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.28)]'
            : isMoving
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 animate-pulse'
              : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
        }`}
      >
        {isOpen ? <DoorOpen className="w-6 h-6" /> : <DoorClosed className="w-6 h-6" />}
      </div>
    );
  }

  return null;
}
