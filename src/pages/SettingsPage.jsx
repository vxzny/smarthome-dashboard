import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  ShieldCheck,
  Wifi,
  Eye,
  EyeOff,
  Sliders,
  Unplug,
  RefreshCw,
} from 'lucide-react';
import {
  buildWssUrl,
  parseWssUrl,
  resolveClientId,
} from '../config/mqttConfig';
import { DEVICE_CATALOG } from '../config/mqttTopics';
import { validateBrokerSecurity } from '../utils/payloadValidator';

export default function SettingsPage({
  config,
  topics,
  connectionStatus,
  connectionDetail,
  onSaveSettings,
  onResetSettings,
  onReconnect,
  onDisconnect,
}) {
  const initialParsed = parseWssUrl(config.MQTT_BROKER);

  const [host, setHost] = useState(initialParsed.host);
  const [port, setPort] = useState(initialParsed.port);
  const [path, setPath] = useState(initialParsed.path);
  const [username, setUsername] = useState(config.MQTT_USERNAME || 'YOUR_USERNAME');
  const [password, setPassword] = useState(config.MQTT_PASSWORD || 'YOUR_PASSWORD');
  const [clientId, setClientId] = useState(config.clientId || '');
  const [commandTimeoutMs, setCommandTimeoutMs] = useState(config.commandTimeoutMs || 8000);
  const [enableXiaozhiStatus, setEnableXiaozhiStatus] = useState(
    config.enableXiaozhiStatus !== false
  );
  const [showPassword, setShowPassword] = useState(false);

  const [topicForm, setTopicForm] = useState(() => structuredClone(topics));
  const [validationError, setValidationError] = useState('');

  const previewUrl = buildWssUrl({ host, port, path });

  const handleTopicChange = (deviceId, field, value) => {
    setTopicForm((prev) => ({
      ...prev,
      devices: {
        ...prev.devices,
        [deviceId]: {
          ...prev.devices[deviceId],
          [field]: value,
        },
      },
    }));
  };

  const handleSystemTopicChange = (field, value) => {
    setTopicForm((prev) => ({
      ...prev,
      system: {
        ...prev.system,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const constructedBroker = buildWssUrl({ host, port, path });
    const check = validateBrokerSecurity(constructedBroker);
    if (!check.valid) {
      setValidationError(check.reason);
      return;
    }

    setValidationError('');
    onSaveSettings(
      {
        ...config,
        MQTT_BROKER: constructedBroker,
        MQTT_USERNAME: username.trim(),
        MQTT_PASSWORD: password,
        clientId: clientId.trim(),
        commandTimeoutMs: Math.max(2000, Number(commandTimeoutMs) || 8000),
        enableXiaozhiStatus,
      },
      topicForm
    );
  };

  const handleReset = () => {
    setValidationError('');
    onResetSettings();
    setHost('YOUR_BROKER_HOST');
    setPort('YOUR_WSS_PORT');
    setPath('/YOUR_PATH');
    setUsername('YOUR_USERNAME');
    setPassword('YOUR_PASSWORD');
    setClientId('');
    setCommandTimeoutMs(8000);
    setEnableXiaozhiStatus(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Connection Status Card */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 mt-0.5">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white">Konfigurasi MQTT Broker (WSS)</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                  connectionStatus === 'CONNECTED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : connectionStatus === 'CONNECTING'
                      ? 'bg-amber-500/20 text-amber-300'
                      : connectionStatus === 'RECONNECTING'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {connectionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{connectionDetail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {connectionStatus === 'CONNECTED' ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Unplug className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onReconnect}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* Broker Connection Fields */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white">Parameter Koneksi WebSocket Secure</h3>
          <span className="text-[11px] font-mono text-cyan-300">WSS / TLS Wajib</span>
        </div>

        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Broker Host (WSS)
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="YOUR_BROKER_HOST"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              WSS Port
            </label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="YOUR_WSS_PORT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              WebSocket Path
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/YOUR_PATH"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
            />
          </div>
        </div>

        {/* Live Preview URL */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-400">Preview URI WSS:</span>
          <span className="text-cyan-300 break-all">{previewUrl}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              MQTT Username (Restricted Web User)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="YOUR_USERNAME"
              autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              MQTT Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="YOUR_PASSWORD"
                autoComplete="new-password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Tampilkan atau sembunyikan password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Client ID (Kosongkan = Auto)
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder={resolveClientId('')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Batas Timeout Konfirmasi ESP32 (ms)
            </label>
            <input
              type="number"
              min="2000"
              max="30000"
              step="500"
              value={commandTimeoutMs}
              onChange={(e) => setCommandTimeoutMs(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Monitor Topic Status Xiaozhi</div>
              <div className="text-[11px] text-slate-400">
                Aktifkan jika ESP32 memublikasikan status online/offline Xiaozhi
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableXiaozhiStatus}
              onChange={(e) => setEnableXiaozhiStatus(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 rounded"
            />
          </div>
        </div>
      </div>

      {/* Topic Mapping Configuration */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            Penyesuaian Topic MQTT (Sesuaikan dengan Firmware ESP32)
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {DEVICE_CATALOG.map((meta) => (
            <div
              key={meta.id}
              className="p-3.5 rounded-xl bg-slate-950/65 border border-slate-800/90 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              <div className="md:col-span-3 text-xs font-semibold text-slate-200">
                {meta.name}
              </div>
              <div className="md:col-span-4">
                <label className="block text-[10px] font-mono text-cyan-400 mb-1">
                  COMMAND TOPIC (Web → ESP32)
                </label>
                <input
                  type="text"
                  value={topicForm.devices[meta.id]?.command || ''}
                  onChange={(e) => handleTopicChange(meta.id, 'command', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-[10px] font-mono text-purple-400 mb-1">
                  STATE TOPIC (ESP32 → Web)
                </label>
                <input
                  type="text"
                  value={topicForm.devices[meta.id]?.state || ''}
                  onChange={(e) => handleTopicChange(meta.id, 'state', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          ))}

          {/* System Topics */}
          <div className="p-3.5 rounded-xl bg-slate-950/65 border border-slate-800/90 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-blue-400 mb-1">
                ESP32 LWT / STATUS TOPIC
              </label>
              <input
                type="text"
                value={topicForm.system.esp32Status}
                onChange={(e) => handleSystemTopicChange('esp32Status', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-purple-400 mb-1">
                XIAOZHI STATUS TOPIC (Opsional)
              </label>
              <input
                type="text"
                value={topicForm.system.xiaozhiStatus}
                onChange={(e) => handleSystemTopicChange('xiaozhiStatus', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Reminder */}
      <div className="rounded-2xl bg-emerald-950/25 border border-emerald-500/30 p-4 flex items-start gap-3 text-xs text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold">Praktik Keamanan Production GitHub Pages</div>
          <p className="opacity-85">
            Gunakan akun user MQTT khusus dashboard dengan ACL terbatas hanya pada topic{' '}
            <code className="font-mono bg-black/30 px-1 rounded">smarthome/#</code>. Jangan gunakan kredensial administrator broker dan jangan commit file{' '}
            <code className="font-mono bg-black/30 px-1 rounded">.env</code> ke repository GitHub publik.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Default</span>
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan & Hubungkan</span>
        </button>
      </div>
    </form>
  );
}
