import { useState, useEffect } from 'react';
import { User, Save, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useStudentProfile } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalInput, PortalTextarea, PortalButton, PortalLoading, Badge } from '../../components/portal-ui';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, loading, setProfile } = useStudentProfile(user?.id);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    student_id: '',
    phone: '',
    address: '',
    bio: '',
    program: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        student_id: profile.student_id || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        program: profile.program || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { data } = await supabase
      .from('student_profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
        program: form.program,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .maybeSingle();
    if (data) setProfile(data as typeof profile);
    setSaving(false);
    setEditing(false);
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="My Profile"
        subtitle="View and update your personal information"
        icon={User}
        action={
          editing ? (
            <div className="flex gap-2">
              <PortalButton variant="secondary" onClick={() => setEditing(false)}>Cancel</PortalButton>
              <PortalButton variant="gold" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save'}
              </PortalButton>
            </div>
          ) : (
            <PortalButton variant="primary" onClick={() => setEditing(true)}>Edit Profile</PortalButton>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <PortalCard className="p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-ink-900 flex items-center justify-center mx-auto mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-serif font-bold text-gold-400">
                {(profile?.full_name || 'S').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-ink-900">{profile?.full_name || 'Student'}</h3>
          <p className="text-sm text-ink-500 mt-1">{profile?.student_id || '—'}</p>
          <div className="mt-3">
            <Badge variant={profile?.status === 'active' ? 'success' : 'default'}>
              {profile?.status || 'active'}
            </Badge>
          </div>
          <div className="mt-6 pt-6 border-t border-ink-100 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-ink-600">
              <Mail size={16} className="text-ink-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3 text-sm text-ink-600">
                <Phone size={16} className="text-ink-400" />
                {profile.phone}
              </div>
            )}
            {profile?.address && (
              <div className="flex items-start gap-3 text-sm text-ink-600">
                <MapPin size={16} className="text-ink-400 mt-0.5" />
                {profile.address}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-ink-600">
              <Calendar size={16} className="text-ink-400" />
              Enrolled {profile?.enrollment_date ? new Date(profile.enrollment_date).toLocaleDateString() : '—'}
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-600">
              <Award size={16} className="text-ink-400" />
              Year {profile?.year || 1}
            </div>
          </div>
        </PortalCard>

        {/* Editable details */}
        <PortalCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-ink-900 mb-6">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <PortalInput
              label="Full Name"
              value={editing ? form.full_name : (profile?.full_name || '')}
              onChange={(v) => setForm({ ...form, full_name: v })}
            />
            <PortalInput
              label="Student ID"
              value={editing ? form.student_id : (profile?.student_id || '')}
              onChange={(v) => setForm({ ...form, student_id: v })}
            />
            <PortalInput
              label="Phone Number"
              value={editing ? form.phone : (profile?.phone || '')}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+1 (555) 000-0000"
            />
            <PortalInput
              label="Program"
              value={editing ? form.program : (profile?.program || '')}
              onChange={(v) => setForm({ ...form, program: v })}
            />
          </div>
          <div className="mt-5">
            <PortalInput
              label="Address"
              value={editing ? form.address : (profile?.address || '')}
              onChange={(v) => setForm({ ...form, address: v })}
              placeholder="123 University Ave, Meridian, CA"
            />
          </div>
          <div className="mt-5">
            <PortalTextarea
              label="Bio"
              value={editing ? form.bio : (profile?.bio || '')}
              onChange={(v) => setForm({ ...form, bio: v })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
