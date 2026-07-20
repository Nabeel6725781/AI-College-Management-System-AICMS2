import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, type ContactSubmission } from '../lib/supabase';
import { Section } from '../components/ui';
import { useCmsContact, useCmsContactDepartments, useCmsSettings } from '../lib/cms-hooks';

export default function ContactPage() {
  const { data: cms } = useCmsContact();
  const { data: departments } = useCmsContactDepartments();
  const { data: settings } = useCmsSettings();
  const contactInfo = [
    { icon: MapPin, label: 'Address', value: cms.address },
    { icon: Phone, label: 'Phone', value: cms.phone },
    { icon: Mail, label: 'Email', value: cms.email },
    { icon: Clock, label: 'Office Hours', value: cms.office_hours },
  ];
  const [form, setForm] = useState<ContactSubmission>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('submitting');
    setErrorMsg('');

    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      subject: form.subject || null,
      message: form.message,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Contact us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Get In Touch</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            {cms.hero_title}
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            {cms.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Contact info + form */}
      <Section className="bg-white">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-ink-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center flex-shrink-0">
                    <info.icon className="text-gold-400" size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink-900 mb-1">{info.label}</div>
                    <div className="text-sm text-ink-600 whitespace-pre-line">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="text-lg font-bold text-ink-900 mb-4">Department Contacts</h3>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.name} className="p-4 rounded-xl bg-ink-50 border border-ink-100">
                    <div className="font-medium text-ink-900 text-sm">{dept.name}</div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-1 text-xs text-ink-500">
                      <a href={`mailto:${dept.email}`} className="hover:text-gold-600 transition-colors">
                        {dept.email}
                      </a>
                      <span>·</span>
                      <span>{dept.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3">
            <div className="card p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-ink-900 mb-2">Send us a message</h2>
              <p className="text-sm text-ink-500 mb-8">
                Fill out the form below and we'll get back to you within 2 business days.
              </p>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-2">Message sent!</h3>
                  <p className="text-ink-600 mb-8">
                    Thank you for reaching out. We'll respond to your message within 2 business days.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-secondary"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status === 'error' && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle size={20} />
                      <span className="text-sm">{errorMsg || 'Something went wrong. Please try again.'}</span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={form.subject ?? ''}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Map placeholder */}
      <section className="bg-ink-50 py-16">
        <div className="container-wide">
          <div className="rounded-2xl overflow-hidden shadow-lg h-96 relative">
            <img
              src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Campus map"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-ink-950/40 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm text-center">
                <MapPin className="text-gold-600 mx-auto mb-3" size={32} />
                <h3 className="font-bold text-ink-900 mb-1">{settings.college_name || 'Our Campus'}</h3>
                <p className="text-sm text-ink-600">{settings.address || cms.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.address || cms.address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
