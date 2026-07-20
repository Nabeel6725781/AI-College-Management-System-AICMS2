import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsSaveBar, useCmsForm } from '../../components/cms-ui';
import { useCmsHomepage } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';

export default function AdminCmsHomepagePage() {
  const { data: homepage, loading } = useCmsHomepage();
  const { data, update, reset, dirty } = useCmsForm(homepage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!loading) reset(homepage); }, [loading, homepage, reset]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const { id, updated_at, ...payload } = data;
    const { error } = id
      ? await supabase.from('cms_homepage').update(payload).eq('id', id)
      : await supabase.from('cms_homepage').insert(payload);
    if (error) setError(error.message); else setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Homepage Content" description="Manage the hero section, stats, welcome message, testimonial, and CTA on the homepage." />
      <CmsCard title="Hero Section">
        <div className="grid gap-5">
          <CmsField label="Hero Eyebrow" value={data.hero_eyebrow} onChange={(v) => update({ hero_eyebrow: v })} />
          <CmsField label="Hero Title" value={data.hero_title} onChange={(v) => update({ hero_title: v })} />
          <CmsField label="Hero Subtitle" value={data.hero_subtitle} onChange={(v) => update({ hero_subtitle: v })} textarea />
          <CmsField label="Hero Image URL" value={data.hero_image_url} onChange={(v) => update({ hero_image_url: v })} />
          <div className="grid sm:grid-cols-2 gap-5">
            <CmsField label="Primary CTA Text" value={data.hero_cta_primary} onChange={(v) => update({ hero_cta_primary: v })} />
            <CmsField label="Secondary CTA Text" value={data.hero_cta_secondary} onChange={(v) => update({ hero_cta_secondary: v })} />
          </div>
        </div>
      </CmsCard>

      <CmsCard title="Statistics Bar">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CmsField label="Years of Excellence" value={data.stat_years} onChange={(v) => update({ stat_years: v })} />
          <CmsField label="Students Enrolled" value={data.stat_students} onChange={(v) => update({ stat_students: v })} />
          <CmsField label="Faculty Members" value={data.stat_faculty} onChange={(v) => update({ stat_faculty: v })} />
          <CmsField label="Academic Programs" value={data.stat_programs} onChange={(v) => update({ stat_programs: v })} />
        </div>
      </CmsCard>

      <CmsCard title="Welcome Section">
        <CmsField label="Welcome Title" value={data.welcome_title} onChange={(v) => update({ welcome_title: v })} />
        <CmsField label="Welcome Body" value={data.welcome_body} onChange={(v) => update({ welcome_body: v })} textarea rows={4} />
      </CmsCard>

      <CmsCard title="Testimonial">
        <CmsField label="Quote" value={data.testimonial_quote} onChange={(v) => update({ testimonial_quote: v })} textarea rows={3} />
        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          <CmsField label="Author" value={data.testimonial_author} onChange={(v) => update({ testimonial_author: v })} />
          <CmsField label="Role" value={data.testimonial_role} onChange={(v) => update({ testimonial_role: v })} />
        </div>
      </CmsCard>

      <CmsCard title="Call to Action">
        <CmsField label="CTA Title" value={data.cta_title} onChange={(v) => update({ cta_title: v })} />
        <CmsField label="CTA Subtitle" value={data.cta_subtitle} onChange={(v) => update({ cta_subtitle: v })} textarea />
      </CmsCard>

      <CmsSaveBar saving={saving} success={success} error={error} onSave={handleSave} />
      {dirty && !saving && <p className="text-xs text-amber-600 mt-2">Unsaved changes</p>}
    </div>
  );
}
