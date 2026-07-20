import { Bell, CheckCheck, Trash2, Info, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTeacherNotifications } from '../../lib/teacher-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState } from '../../components/portal-ui';

const typeConfig: Record<string, { icon: typeof Info; color: string; bg: string; variant: 'info' | 'error' | 'success' | 'gold' }> = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', variant: 'info' },
  alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', variant: 'error' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', variant: 'success' },
  academic: { icon: Users, color: 'text-teal-600', bg: 'bg-teal-100', variant: 'gold' },
};

export default function TeacherNotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, loading } = useTeacherNotifications(user?.id);

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) {
      await supabase.from('teacher_notifications').update({ is_read: true }).eq('id', n.id);
    }
    window.location.reload();
  };

  const markRead = async (id: string) => {
    await supabase.from('teacher_notifications').update({ is_read: true }).eq('id', id);
    window.location.reload();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('teacher_notifications').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread · ${notifications.length} total`}
        icon={Bell}
        action={unreadCount > 0 ? <PortalButton variant="secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark all read</PortalButton> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up! New notifications will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const config = typeConfig[n.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <PortalCard key={n.id} className={`p-5 ${!n.is_read ? 'border-l-4 border-l-teal-500' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon className={config.color} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-ink-900">{n.title}</h4>
                          {!n.is_read && <Badge variant={config.variant}>New</Badge>}
                        </div>
                        <p className="text-sm text-ink-600 mt-1">{n.message}</p>
                        <p className="text-xs text-ink-400 mt-2">{new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.is_read && <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition-colors" title="Mark as read"><CheckCheck size={16} /></button>}
                        <button onClick={() => deleteNotification(n.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
