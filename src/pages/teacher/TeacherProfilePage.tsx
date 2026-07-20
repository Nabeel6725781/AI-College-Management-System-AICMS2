import { useState, useEffect } from 'react';
import { User, Save, Mail, Phone, MapPin, Building2, Clock } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTeacherProfile } from '../../lib/teacher-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalInput, PortalTextarea, PortalButton, Badge } from '../../components/portal-ui';

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { data: profile, loading, setProfile } = useTeacherProfile(user?.id);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', department: '', title: '', bio: '', office_hours: '', office_location: '' });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        title: profile.title || '',
        bio: profile.bio || '',
        office_hours: profile.office_hours || '',
        office_location: profile.office_location || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { data } = await supabase
      .from('teacher_profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        department: form.department,
        title: form.title,
        bio: form.bio,
        office_hours: form.office_hours,
        office_location: form.office_location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .maybeSingle();
    if (data) setProfile(data as typeof profile);
    setSaving(false);
    setEditing(false);
  };

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="My Profile"
        subtitle="View and update your faculty information"
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
        <PortalCard className="p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-ink-900 flex items-center justify-center mx-auto mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-serif font-bold text-teal-400">
                {(profile?.full_name || 'T').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-ink-900">{profile?.full_name || 'Teacher'}</h3>
          <p className="text-sm text-ink-500 mt-1">{profile?.teacher_id || '—'}</p>
          <div className="mt-3">
            <Badge variant={profile?.status === 'active' ? 'success' : 'default'}>{profile?.status || 'active'}</Badge>
          </div>
          <div className="mt-6 pt-6 border-t border-ink-100 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-ink-600">
              <Mail size={16} className="text-ink-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3 text-sm text-ink-600">
                <Phone size={16} className="text-ink-400" /> {profile.phone}
              </div>
            )}
            {profile?.office_location && (
              <div className="flex items-start gap-3 text-sm text-ink-600">
                <MapPin size={16} className="text-ink-400 mt-0.5" /> {profile.office_location}
              </div>
            )}
            {profile?.office_hours && (
              <div className="flex items-start gap-3 text-sm text-ink-600">
                <Clock size={16} className="text-ink-400 mt-0.5" /> {profile.office_hours}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-ink-600">
              <Building2 size={16} className="text-ink-400" /> {profile?.department || '—'}
            </div>
          </div>
        </PortalCard>

        <PortalCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-ink-900 mb-6">Faculty Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <PortalInput label="Full Name" value={editing ? form.full_name : (profile?.full_name || '')} onChange={(v) => setForm({ ...form, full_name: v })} />
            <PortalInput label="Title" value={editing ? form.title : (profile?.title || '')} onChange={(v) => setForm({ ...form, title: v })} />
            <PortalInput label="Phone" value={editing ? form.phone : (profile?.phone || '')} onChange={(v) => setForm({ ...form, phone: v })} />
            <PortalInput label="Department" value={editing ? form.department : (profile?.department || '')} onChange={(v) => setForm({ ...form, department: v })} />
            <PortalInput label="Office Hours" value={editing ? form.office_hours : (profile?.office_hours || '')} onChange={(v) => setForm({ ...form, office_hours: v })} />
            <PortalInput label="Office Location" value={editing ? form.office_location : (profile?.office_location || '')} onChange={(v) => setForm({ ...form, office_location: v })} />
          </div>
          <div className="mt-5">
            <PortalTextarea label="Bio" value={editing ? form.bio : (profile?.bio || '')} onChange={(v) => setForm({ ...form, bio: v })} rows={4} />
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
