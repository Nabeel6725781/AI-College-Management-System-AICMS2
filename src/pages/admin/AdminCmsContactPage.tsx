import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsSaveBar, CmsListEditor, useCmsForm } from '../../components/cms-ui';
import { useCmsContact, useCmsContactDepartments } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';
import type { CmsContactDepartment } from '../../lib/cms-hooks';

export default function AdminCmsContactPage() {
  const { data: contact, loading } = useCmsContact();
  const { data: depts } = useCmsContactDepartments();
  const { data, update, reset, dirty } = useCmsForm(contact);
  const [deptList, setDeptList] = useState<CmsContactDepartment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!loading) reset(contact); }, [loading, contact, reset]);
  useEffect(() => { if (depts.length) setDeptList(depts); }, [depts]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const { id, updated_at, ...payload } = data;
    if (id) { const { error: e } = await supabase.from('cms_contact').update(payload).eq('id', id); if (e) setError(e.message); }
    else { const { error: e } = await supabase.from('cms_contact').insert(payload); if (e) setError(e.message); }
    for (const d of deptList) {
      const { id: did, ...dp } = d;
      if (did) await supabase.from('cms_contact_departments').update(dp).eq('id', did);
      else await supabase.from('cms_contact_departments').insert(dp);
    }
    if (!error) setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Contact Page Content" description="Manage contact page hero, contact info, and department contacts." />
      <CmsCard title="Hero Section">
        <div className="grid gap-5">
          <CmsField label="Hero Title" value={data.hero_title} onChange={(v) => update({ hero_title: v })} />
          <CmsField label="Hero Subtitle" value={data.hero_subtitle} onChange={(v) => update({ hero_subtitle: v })} textarea />
        </div>
      </CmsCard>

      <CmsCard title="Contact Information">
        <div className="grid sm:grid-cols-2 gap-5">
          <CmsField label="Address" value={data.address} onChange={(v) => update({ address: v })} textarea rows={2} />
          <CmsField label="Phone" value={data.phone} onChange={(v) => update({ phone: v })} />
          <CmsField label="Email" value={data.email} onChange={(v) => update({ email: v })} type="email" />
          <CmsField label="Office Hours" value={data.office_hours} onChange={(v) => update({ office_hours: v })} />
        </div>
      </CmsCard>

      <CmsCard title="Department Contacts">
        <CmsListEditor
          items={deptList}
          onChange={setDeptList}
          addLabel="Add Department"
          newItem={() => ({ id: '', name: '', email: '', phone: '', sort_order: deptList.length })}
          renderItem={(item, updateItem) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <CmsField label="Name" value={item.name} onChange={(v) => updateItem({ name: v })} />
              <CmsField label="Email" value={item.email ?? ''} onChange={(v) => updateItem({ email: v })} />
              <CmsField label="Phone" value={item.phone ?? ''} onChange={(v) => updateItem({ phone: v })} />
            </div>
          )}
        />
      </CmsCard>

      <CmsSaveBar saving={saving} success={success} error={error} onSave={handleSave} />
      {dirty && !saving && <p className="text-xs text-amber-600 mt-2">Unsaved changes</p>}
    </div>
  );
}
