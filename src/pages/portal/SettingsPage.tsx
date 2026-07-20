import { useState } from 'react';
import { Settings, Bell, Lock, Globe, Moon, Mail, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { PortalCard, PortalPageHeader, PortalButton, Badge } from '../../components/portal-ui';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    assignmentReminders: true,
    feeDueDates: true,
    resultPublished: true,
    attendanceWarnings: false,
  });
  const [preferences, setPreferences] = useState({
    language: 'English',
    theme: 'Light',
    timezone: 'America/Los_Angeles',
  });

  const handleSignOut = async () => {
    await signOut();
    navigateTo('/');
  };

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description: string }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-ink-900">{label}</div>
        <div className="text-xs text-ink-500 mt-0.5">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-ink-900' : 'bg-ink-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Settings"
        subtitle="Manage your account preferences and configuration"
        icon={Settings}
      />

      <div className="space-y-6 max-w-3xl">
        {/* Account info */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
              <UserIcon className="text-ink-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Account Information</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-ink-400" />
                <span className="text-sm text-ink-700">{user?.email}</span>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserIcon size={18} className="text-ink-400" />
                <span className="text-sm text-ink-700">User ID: {user?.id?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-ink-100">
            <button
              onClick={() => navigateTo('/portal/profile')}
              className="text-sm font-medium text-ink-900 hover:text-gold-600 link-underline"
            >
              Edit profile details
            </button>
          </div>
        </PortalCard>

        {/* Notification preferences */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
              <Bell className="text-ink-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Notification Preferences</h3>
          </div>
          <div className="divide-y divide-ink-100">
            <Toggle
              checked={notifications.emailAlerts}
              onChange={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
              label="Email Alerts"
              description="Receive notifications via email"
            />
            <Toggle
              checked={notifications.assignmentReminders}
              onChange={() => setNotifications({ ...notifications, assignmentReminders: !notifications.assignmentReminders })}
              label="Assignment Reminders"
              description="Get reminded about upcoming assignment deadlines"
            />
            <Toggle
              checked={notifications.feeDueDates}
              onChange={() => setNotifications({ ...notifications, feeDueDates: !notifications.feeDueDates })}
              label="Fee Due Dates"
              description="Notifications for upcoming fee payments"
            />
            <Toggle
              checked={notifications.resultPublished}
              onChange={() => setNotifications({ ...notifications, resultPublished: !notifications.resultPublished })}
              label="Result Published"
              description="Get notified when new results are published"
            />
            <Toggle
              checked={notifications.attendanceWarnings}
              onChange={() => setNotifications({ ...notifications, attendanceWarnings: !notifications.attendanceWarnings })}
              label="Attendance Warnings"
              description="Alert when attendance drops below 75%"
            />
          </div>
        </PortalCard>

        {/* Preferences */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
              <Globe className="text-ink-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-ink-400" />
                <span className="text-sm text-ink-700">Language</span>
              </div>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-ink-400" />
                <span className="text-sm text-ink-700">Theme</span>
              </div>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-ink-400" />
                <span className="text-sm text-ink-700">Timezone</span>
              </div>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option>America/Los_Angeles</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </PortalCard>

        {/* Security */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
              <Lock className="text-ink-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Security</h3>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigateTo('/forgot-password')} className="w-full text-left p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors">
              <div className="text-sm font-medium text-ink-900">Change Password</div>
              <div className="text-xs text-ink-500 mt-0.5">Reset your account password</div>
            </button>
          </div>
        </PortalCard>

        {/* Danger zone */}
        <PortalCard className="p-6 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <LogOut className="text-red-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Session</h3>
          </div>
          <PortalButton variant="danger" onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </PortalButton>
        </PortalCard>
      </div>
    </div>
  );
}
