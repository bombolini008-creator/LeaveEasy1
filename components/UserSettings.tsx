
import React, { useState } from 'react';
import { NotificationSettings } from '../types';

interface UserSettingsProps {
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({ ...settings });

  const toggleSetting = (key: keyof NotificationSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500">Manage your profile preferences and notification triggers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Notification Preferences</h2>
              <p className="text-sm text-slate-500">Control how and when you receive updates within the application.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Leave Reminders</h3>
                  <p className="text-xs text-slate-500 mt-1">Receive alerts 3 days before your scheduled time off starts.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('reminders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${localSettings.reminders ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.reminders ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Status Updates</h3>
                  <p className="text-xs text-slate-500 mt-1">Get notified immediately when your requests are approved or rejected.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('statusUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${localSettings.statusUpdates ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.statusUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Policy & System Alerts</h3>
                  <p className="text-xs text-slate-500 mt-1">Receive information about holiday calendar changes and policy updates.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('policyUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${localSettings.policyUpdates ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.policyUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => onSave(localSettings)}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                Save Preferences
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <h3 className="font-black text-lg mb-2 relative z-10">Email Sync</h3>
            <p className="text-xs text-indigo-100 leading-relaxed mb-4 relative z-10">
              Note: Email notifications are managed by the system administrator and currently mirror all major events for audit purposes.
            </p>
            <div className="relative z-10 flex items-center text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-lg border border-white/10">
              Active Sync
            </div>
            <svg className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
