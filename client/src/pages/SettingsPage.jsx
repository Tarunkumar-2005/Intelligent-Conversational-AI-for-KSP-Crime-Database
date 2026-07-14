import React, { useState } from 'react';
import { PageContainer, PageHeader, DashboardCard } from '../components/LayoutComponents.jsx';
import { Button, Input } from '../components/UIPrimitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, addNotification } = useUI();
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState('8h');

  const handleSave = (e) => {
    e.preventDefault();
    addNotification('success', 'User preference settings saved successfully.');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Portal Configuration Settings"
        description="Configure localized view preferences, secure session limits, and active investigator information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Dossier context */}
        {user && (
          <DashboardCard title="Active Officer Dossier Info">
            <div className="space-y-4">
              <Input label="Officer Full Name" value={user.name} disabled />
              <Input label="Registered Police Email" value={user.email} disabled />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Clearance Role" value={user.role} disabled />
                <Input label="Badge Number" value={user.badgeNumber} disabled />
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Portal UI Configuration */}
        <DashboardCard title="Portal Preferences">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Theme setting */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded text-xs font-semibold">
              <div className="space-y-0.5">
                <p className="text-slate-700 dark:text-slate-200">Portal Visual Theme</p>
                <p className="text-[10px] text-slate-400 font-normal">Toggle dark mode / light mode colors.</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </Button>
            </div>

            {/* Audio notifications */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded text-xs font-semibold">
              <div className="space-y-0.5">
                <p className="text-slate-700 dark:text-slate-200">Critical Audio Alerts</p>
                <p className="text-[10px] text-slate-400 font-normal">Play notification sound for critical crime spikes.</p>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Session lockout */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Session Token Expiration
              </label>
              <select
                value={sessionExpiry}
                onChange={(e) => setSessionExpiry(e.target.value)}
                className="w-full bg-white text-slate-800 border-slate-300 dark:bg-[#08101f] dark:text-slate-200 dark:border-slate-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="4h">4 Hours</option>
                <option value="8h">8 Hours (Standard Shift)</option>
                <option value="12h">12 Hours</option>
              </select>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full text-center">
                Save Preferences
              </Button>
            </div>
          </form>
        </DashboardCard>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
