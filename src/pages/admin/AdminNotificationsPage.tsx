import { useState } from 'react';
import {
  Bell, Plus, Check, CheckCheck, Trash2, AlertCircle, Info,
  CheckCircle, AlertTriangle, X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useAdminNotifications } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput,
  PortalTextarea, PortalSelect, PortalLoading, StatTile,
  EmptyState, Badge,
} from '../../components/portal-ui';
import type { AdminNotification } from '../../lib/supabase';

const TYPE_META: Record<string, { icon: typeof Bell; color: string; bg: string; badge: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  alert: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100', badge: 'error' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', badge: 'info' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', badge: 'success' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', badge: 'warning' },
  general: { icon: Bell, color: 'text-ink-600', bg: 'bg-ink-100', badge: 'default' },
};

export default function AdminNotificationsPage() {
  useAuth();
  const { data: notifications, loading } = useAdminNotifications();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });
  const [saving, setSaving] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleAdd() {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    await supabase.from('admin_notifications').insert({
      title: form.title,
      message: form.message,
      type: form.type,
      is_read: false,
    });
    window.location.reload();
  }

  async function handleMarkRead(n: AdminNotification) {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', n.id);
    window.location.reload();
  }

  async function handleMarkAllRead() {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
    window.location.reload();
  }

  async function handleDelete(n: AdminNotification) {
    await supabase.from('admin_notifications').delete().eq('id', n.id);
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Notifications" subtitle="System alerts and announcements" icon={Bell} />
        <PortalLoading />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Notifications"
        subtitle="System alerts and announcements"
        icon={Bell}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <CheckCheck size={16} /> Mark all read
            </PortalButton>
            <PortalButton variant="primary" onClick={() => setShowAdd((s) => !s)}>
              {showAdd ? <X size={16} /> : <Plus size={16} />} {showAdd ? 'Cancel' : 'New Notification'}
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Notifications" value={notifications.length} icon={Bell} color="ink" />
        <StatTile label="Unread" value={unreadCount} icon={AlertCircle} color="red" />
        <StatTile label="Alerts" value={notifications.filter((n) => n.type === 'alert').length} icon={AlertTriangle} color="gold" />
        <StatTile label="Info" value={notifications.filter((n) => n.type === 'info').length} icon={Info} color="blue" />
      </div>

      {/* Inline add form */}
      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">New Notification</h3>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <PortalInput
                label="Title"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Notification title"
                required
              />
              <PortalSelect
                label="Type"
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={[
                  { value: 'info', label: 'Info' },
                  { value: 'alert', label: 'Alert' },
                  { value: 'success', label: 'Success' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'general', label: 'General' },
                ]}
              />
            </div>
            <PortalTextarea
              label="Message"
              value={form.message}
              onChange={(v) => setForm({ ...form, message: v })}
              placeholder="Notification message"
              required
            />
            <div className="flex justify-end gap-2">
              <PortalButton variant="ghost" onClick={() => setShowAdd(false)}>Cancel</PortalButton>
              <PortalButton variant="primary" onClick={handleAdd} disabled={saving}>
                <Plus size={16} /> Add Notification
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      )}

      {/* Notifications list */}
      <PortalCard className="p-6">
        <h3 className="text-lg font-bold text-ink-900 mb-4">All Notifications</h3>
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" message="There are no notifications yet." />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.general;
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    n.is_read ? 'bg-white border-ink-100' : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                    <Icon className={meta.color} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ink-900">{n.title}</span>
                      <Badge variant={meta.badge}>{n.type}</Badge>
                      {!n.is_read && <Badge variant="error">Unread</Badge>}
                    </div>
                    <p className="text-sm text-ink-600 mt-1">{n.message}</p>
                    <p className="text-xs text-ink-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n)}
                        title="Mark as read"
                        className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n)}
                      title="Delete"
                      className="p-2 rounded-lg text-ink-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PortalCard>
    </div>
  );
}
