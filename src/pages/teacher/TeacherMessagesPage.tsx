import { useState } from 'react';
import { MessageSquare, Send, Plus, X, Inbox, Mail } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useMessages } from '../../lib/teacher-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState, PortalInput, PortalTextarea } from '../../components/portal-ui';

export default function TeacherMessagesPage() {
  const { user } = useAuth();
  const { data: messages, loading } = useMessages(user?.id);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ recipientName: '', subject: '', body: '' });

  const handleSend = async () => {
    if (!user || !form.recipientName || !form.body) return;
    setSending(true);
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: null,
      recipient_name: form.recipientName,
      sender_name: 'You',
      subject: form.subject || '(No subject)',
      body: form.body,
      is_read: false,
    });
    setSending(false);
    setShowCompose(false);
    setForm({ recipientName: '', subject: '', body: '' });
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  const sent = messages.filter((m) => m.sender_id === user?.id);
  const received = messages.filter((m) => m.recipient_id === user?.id);

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Messages"
        subtitle={`${sent.length} sent · ${received.length} received`}
        icon={MessageSquare}
        action={
          <PortalButton variant="primary" onClick={() => setShowCompose(!showCompose)}>
            <Plus size={16} /> Compose
          </PortalButton>
        }
      />

      {showCompose && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">New Message</h3>
            <button onClick={() => setShowCompose(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <PortalInput label="To (Student Name)" value={form.recipientName} onChange={(v) => setForm({ ...form, recipientName: v })} required placeholder="Emma Johnson" />
            <PortalInput label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} placeholder="Regarding your assignment" />
            <PortalTextarea label="Message" value={form.body} onChange={(v) => setForm({ ...form, body: v })} required rows={5} />
            <div className="flex gap-2">
              <PortalButton variant="secondary" onClick={() => setShowCompose(false)}>Cancel</PortalButton>
              <PortalButton variant="gold" onClick={handleSend} disabled={sending || !form.recipientName || !form.body}>
                <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      )}

      {messages.length === 0 ? (
        <EmptyState icon={Inbox} title="No messages" message="Compose a message to communicate with your students." />
      ) : (
        <div className="space-y-6">
          {sent.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Mail size={16} /> Sent
              </h3>
              <div className="space-y-3">
                {sent.map((m) => (
                  <PortalCard key={m.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gold-400">{m.recipient_name?.charAt(0) || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-ink-900">To: {m.recipient_name}</span>
                            {!m.is_read && <Badge variant="info">Unread</Badge>}
                          </div>
                          <div className="text-sm text-ink-700 mt-0.5">{m.subject}</div>
                          <p className="text-xs text-ink-500 mt-1 line-clamp-2">{m.body}</p>
                        </div>
                      </div>
                      <span className="text-xs text-ink-400 flex-shrink-0">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </PortalCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
