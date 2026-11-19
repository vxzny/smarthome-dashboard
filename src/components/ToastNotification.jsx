import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const STYLE_MAP = {
  success: {
    icon: CheckCircle2,
    box: 'bg-[#0B1221]/95 border-emerald-400/45 text-emerald-200',
    iconColor: 'text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    box: 'bg-[#0B1221]/95 border-amber-400/45 text-amber-200',
    iconColor: 'text-amber-400',
  },
  error: {
    icon: XCircle,
    box: 'bg-[#0B1221]/95 border-rose-500/50 text-rose-200',
    iconColor: 'text-rose-400',
  },
  info: {
    icon: Info,
    box: 'bg-[#0B1221]/95 border-cyan-400/45 text-cyan-200',
    iconColor: 'text-cyan-400',
  },
};

export default function ToastNotification({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
      {toasts.map((toast) => {
        const cfg = STYLE_MAP[toast.type] || STYLE_MAP.info;
        const Icon = cfg.icon;
        return (
          <div
            key={toast.id}
            className={`rounded-2xl border p-3.5 backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all ${cfg.box}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">{toast.title}</div>
              <div className="text-[11px] opacity-85 mt-0.5 leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
