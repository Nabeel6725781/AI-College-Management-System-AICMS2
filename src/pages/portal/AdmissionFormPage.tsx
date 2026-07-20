import { useState, useEffect } from 'react';
import { FileText, Save, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAdmissionApplications } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalInput, PortalTextarea, PortalSelect, PortalButton, PortalLoading, Badge } from '../../components/portal-ui';

const programs = [
  { value: 'B.S. in Computer Science', label: 'B.S. in Computer Science' },
  { value: 'B.S. in Biology', label: 'B.S. in Biology' },
  { value: 'B.A. in English Literature', label: 'B.A. in English Literature' },
  { value: 'B.S. in Physics', label: 'B.S. in Physics' },
  { value: 'B.S. in Mathematics', label: 'B.S. in Mathematics' },
  { value: 'B.A. in History', label: 'B.A. in History' },
  { value: 'B.F.A. in Visual Arts', label: 'B.F.A. in Visual Arts' },
  { value: 'B.S. in Engineering', label: 'B.S. in Engineering' },
];

export default function AdmissionFormPage() {
  const { user } = useAuth();
  const { data: applications, loading } = useAdmissionApplications(user?.id);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    program: '',
    previous_school: '',
    gpa: '',
    statement: '',
  });

  const existingApp = applications[0];

  useEffect(() => {
    if (existingApp) {
      setForm({
        full_name: existingApp.full_name || '',
        email: existingApp.email || '',
        phone: existingApp.phone || '',
        date_of_birth: existingApp.date_of_birth || '',
        gender: existingApp.gender || '',
        address: existingApp.address || '',
        program: existingApp.program || '',
        previous_school: existingApp.previous_school || '',
        gpa: existingApp.gpa?.toString() || '',
        statement: existingApp.statement || '',
      });
      if (existingApp.status === 'submitted') setSubmitted(true);
    } else if (user) {
      setForm((f) => ({ ...f, email: user.email || '' }));
    }
  }, [existingApp, user]);

  const handleSave = async (submit: boolean) => {
    if (!user) return;
    setSaving(true);
    const payload = {
      student_id: user.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender,
      address: form.address,
      program: form.program,
      previous_school: form.previous_school,
      gpa: parseFloat(form.gpa) || 0,
      statement: form.statement,
      status: submit ? 'submitted' : 'draft',
      submitted_at: submit ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existingApp) {
      await supabase.from('admission_applications').update(payload).eq('id', existingApp.id);
    } else {
      await supabase.from('admission_applications').insert(payload);
    }

    setSaving(false);
    if (submit) setSubmitted(true);
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Admission Form"
        subtitle="Complete your application for admission to Meridian University"
        icon={FileText}
        action={
          submitted ? (
            <Badge variant="success"><CheckCircle size={14} /> Submitted</Badge>
          ) : existingApp ? (
            <Badge variant="warning">Draft</Badge>
          ) : undefined
        }
      />

      {submitted && (
        <PortalCard className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-ink-900">Application Submitted!</h3>
              <p className="text-sm text-ink-600">Your application has been received. We'll review it and get back to you within 5-7 business days.</p>
            </div>
          </div>
        </PortalCard>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-6">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <PortalInput label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required placeholder="Jane Doe" />
            <PortalInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <PortalInput label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+1 (555) 000-0000" />
            <PortalInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
            <PortalSelect
              label="Gender"
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v })}
              options={[
                { value: '', label: 'Prefer not to say' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <PortalInput label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="123 University Ave, City, State" />
          </div>
        </PortalCard>

        {/* Academic Information */}
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-6">Academic Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <PortalSelect label="Program of Interest" value={form.program} onChange={(v) => setForm({ ...form, program: v })} options={[{ value: '', label: 'Select a program' }, ...programs]} />
            <PortalInput label="Previous School" value={form.previous_school} onChange={(v) => setForm({ ...form, previous_school: v })} placeholder="Lincoln High School" />
            <PortalInput label="GPA (out of 4.0)" type="number" value={form.gpa} onChange={(v) => setForm({ ...form, gpa: v })} placeholder="3.75" />
          </div>
          <div className="mt-5">
            <PortalTextarea
              label="Personal Statement"
              value={form.statement}
              onChange={(v) => setForm({ ...form, statement: v })}
              placeholder="Tell us why you want to join Meridian University..."
              rows={6}
            />
          </div>
        </PortalCard>

        {/* Actions */}
        {!submitted && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <PortalButton variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
              <Save size={16} /> Save Draft
            </PortalButton>
            <PortalButton variant="gold" onClick={() => handleSave(true)} disabled={saving || !form.full_name || !form.email || !form.program}>
              <Send size={16} /> {saving ? 'Submitting...' : 'Submit Application'}
            </PortalButton>
          </div>
        )}
      </div>
    </div>
  );
}
