import React, { useMemo, useState } from 'react';
import { useSmartHomeMqtt } from './hooks/useSmartHomeMqtt';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import ConnectionBanner from './components/ConnectionBanner';
import ToastNotification from './components/ToastNotification';
import OverviewPage from './pages/OverviewPage';
import MonitoringPage from './pages/MonitoringPage';
import ManualControlPage from './pages/ManualControlPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    config,
    topics,
    connectionStatus,
    connectionDetail,
    esp32Status,
    xiaozhiStatus,
    devices,
    activityLogs,
    toasts,
    systemSummary,
    sendDeviceCommand,
    updateSettings,
    handleResetSettings,
    reconnectNow,
    disconnectNow,
    clearActivityLogs,
    dismissToast,
  } = useSmartHomeMqtt();

  const pendingCount = useMemo(
    () => Object.values(devices).filter((d) => d.isPending).length,
    [devices]
  );

  return (
    <div className="min-h-screen flex bg-[#050811] text-slate-100 cyber-grid">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        connectionStatus={connectionStatus}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          connectionStatus={connectionStatus}
          esp32Status={esp32Status}
          xiaozhiStatus={xiaozhiStatus}
          enableXiaozhiStatus={config.enableXiaozhiStatus !== false}
          onReconnect={reconnectNow}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Global MQTT Disconnected / Onboarding Banner */}
          <ConnectionBanner
            connectionStatus={connectionStatus}
            connectionDetail={connectionDetail}
            brokerUrl={config.MQTT_BROKER}
            onOpenSettings={() => setActivePage('settings')}
            onReconnect={reconnectNow}
          />

          {activePage === 'overview' && (
            <OverviewPage
              devices={devices}
              topics={topics}
              connectionStatus={connectionStatus}
              esp32Status={esp32Status}
              systemSummary={systemSummary}
              activityLogs={activityLogs}
              onCommand={sendDeviceCommand}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'monitoring' && (
            <MonitoringPage
              devices={devices}
              topics={topics}
              connectionStatus={connectionStatus}
              esp32Status={esp32Status}
              xiaozhiStatus={xiaozhiStatus}
            />
          )}

          {activePage === 'control' && (
            <ManualControlPage
              devices={devices}
              topics={topics}
              connectionStatus={connectionStatus}
              config={config}
              onCommand={sendDeviceCommand}
            />
          )}

          {activePage === 'history' && (
            <ActivityHistoryPage
              activityLogs={activityLogs}
              onClearLogs={clearActivityLogs}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              config={config}
              topics={topics}
              connectionStatus={connectionStatus}
              connectionDetail={connectionDetail}
              onSaveSettings={updateSettings}
              onResetSettings={handleResetSettings}
              onReconnect={reconnectNow}
              onDisconnect={disconnectNow}
            />
          )}
        </main>
      </div>

      {/* Realtime Toast Alerts (Timeout, Konfirmasi ESP32, LWT Offline) */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
