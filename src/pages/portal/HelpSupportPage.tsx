import { useState } from 'react';
import { LifeBuoy, Plus, Send, MessageSquare, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useSupportTickets } from '../../lib/portal-hooks';
import { useCmsSettings } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState, PortalInput, PortalTextarea, PortalSelect } from '../../components/portal-ui';

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to the Settings page and click "Change Password", or use the Forgot Password link on the login page.' },
  { q: 'How do I enroll in a course?', a: 'Navigate to My Courses, click "Enroll", select a course from the available list, and confirm your enrollment.' },
  { q: 'When are fees due?', a: 'Fee due dates are listed on each fee challan in the Fee Challan page. You can also enable fee due notifications in Settings.' },
  { q: 'How do I upload documents?', a: 'Go to Document Upload, select the document type, and drag-and-drop or browse for your file. Files are automatically stored securely.' },
  { q: 'What is OCR Verification?', a: 'OCR Verification uses AI to scan and extract information from your uploaded documents, verifying their authenticity.' },
  { q: 'How is my attendance calculated?', a: 'Attendance is calculated as the percentage of classes marked "present" out of total classes held, viewable on the Attendance page.' },
];

const categories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'fees', label: 'Fees & Payments' },
  { value: 'academic', label: 'Academic' },
  { value: 'account', label: 'Account Issues' },
];

export default function HelpSupportPage() {
  const { user } = useAuth();
  const { data: settings } = useCmsSettings();
  const { data: tickets, loading } = useSupportTickets(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', category: 'general', priority: 'medium' });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async () => {
    if (!user || !form.subject || !form.message) return;
    setSubmitting(true);
    await supabase.from('support_tickets').insert({
      student_id: user.id,
      subject: form.subject,
      message: form.message,
      category: form.category,
      priority: form.priority,
      status: 'open',
    });
    setSubmitting(false);
    setShowForm(false);
    setForm({ subject: '', message: '', category: 'general', priority: 'medium' });
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Help & Support"
        subtitle="Get help with your portal or contact our support team"
        icon={LifeBuoy}
        action={
          <PortalButton variant="primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> New Ticket
          </PortalButton>
        }
      />

      {/* Contact options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <PortalCard className="p-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <MessageSquare className="text-blue-600" size={24} />
          </div>
          <h3 className="font-bold text-ink-900">Live Chat</h3>
          <p className="text-sm text-ink-500 mt-1">Chat with our AI assistant for instant help.</p>
          <button onClick={() => window.location.hash = '/portal/chatbot'} className="text-sm font-medium text-ink-900 hover:text-gold-600 mt-3 link-underline">
            Start chatting
          </button>
        </PortalCard>
        <PortalCard className="p-6">
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center mb-4">
            <Mail className="text-gold-600" size={24} />
          </div>
          <h3 className="font-bold text-ink-900">Email Support</h3>
          <p className="text-sm text-ink-500 mt-1">{settings.email || 'support@example.edu'}</p>
          <p className="text-xs text-ink-400 mt-1 flex items-center gap-1"><Clock size={12} /> Response within 24h</p>
        </PortalCard>
        <PortalCard className="p-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
            <Phone className="text-teal-600" size={24} />
          </div>
          <h3 className="font-bold text-ink-900">Phone Support</h3>
          <p className="text-sm text-ink-500 mt-1">{settings.phone || '(000) 000-0000'}</p>
          <p className="text-xs text-ink-400 mt-1 flex items-center gap-1"><Clock size={12} /> Mon-Fri, 9am-5pm</p>
        </PortalCard>
      </div>

      {/* New ticket form */}
      {showForm && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Create Support Ticket</h3>
          <div className="space-y-4">
            <PortalInput label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required placeholder="Describe your issue briefly" />
            <div className="grid sm:grid-cols-2 gap-4">
              <PortalSelect label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categories} />
              <PortalSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]} />
            </div>
            <PortalTextarea label="Message" value={form.message} onChange={(v) => setForm({ ...form, message: v })} required rows={5} placeholder="Describe your issue in detail..." />
            <div className="flex gap-2">
              <PortalButton variant="secondary" onClick={() => setShowForm(false)}>Cancel</PortalButton>
              <PortalButton variant="gold" onClick={handleSubmit} disabled={submitting || !form.subject || !form.message}>
                <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Ticket'}
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <div>
          <h3 className="text-lg font-bold text-ink-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <PortalCard key={i} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-ink-50 transition-colors"
                >
                  <span className="text-sm font-medium text-ink-900">{faq.q}</span>
                  <ChevronDown size={18} className={`text-ink-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-ink-600">{faq.a}</div>
                )}
              </PortalCard>
            ))}
          </div>
        </div>

        {/* My tickets */}
        <div>
          <h3 className="text-lg font-bold text-ink-900 mb-4">My Support Tickets</h3>
          {tickets.length === 0 ? (
            <PortalCard className="p-6">
              <EmptyState icon={LifeBuoy} title="No tickets" message="You haven't submitted any support tickets yet." />
            </PortalCard>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <PortalCard key={t.id} className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-ink-900">{t.subject}</h4>
                    <Badge variant={t.status === 'open' ? 'warning' : t.status === 'resolved' ? 'success' : 'info'}>
                      {t.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-600 line-clamp-2">{t.message}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-ink-400">
                    <span>{t.category}</span>
                    <span>·</span>
                    <Badge variant={t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'default'}>
                      {t.priority}
                    </Badge>
                    <span>·</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </PortalCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
