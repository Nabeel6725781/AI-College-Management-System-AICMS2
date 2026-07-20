import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsSaveBar, CmsListEditor, useCmsForm } from '../../components/cms-ui';
import { useCmsAbout, useCmsAboutMilestones, useCmsAboutValues } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';
import type { CmsAboutMilestone, CmsAboutValue } from '../../lib/cms-hooks';

export default function AdminCmsAboutPage() {
  const { data: about, loading } = useCmsAbout();
  const { data: milestones } = useCmsAboutMilestones();
  const { data: values } = useCmsAboutValues();
  const { data, update, reset, dirty } = useCmsForm(about);
  const [milestoneList, setMilestoneList] = useState<CmsAboutMilestone[]>([]);
  const [valueList, setValueList] = useState<CmsAboutValue[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!loading) reset(about); }, [loading, about, reset]);
  useEffect(() => { if (milestones.length) setMilestoneList(milestones); }, [milestones]);
  useEffect(() => { if (values.length) setValueList(values); }, [values]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const { id, updated_at, ...payload } = data;
    if (id) { const { error } = await supabase.from('cms_about').update(payload).eq('id', id); if (error) setError(error.message); }
    else { const { error } = await supabase.from('cms_about').insert(payload); if (error) setError(error.message); }

    // Save milestones
    await supabase.from('cms_about_milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    for (const m of milestoneList) {
      const { id: mid, ...mp } = m;
      if (mid) await supabase.from('cms_about_milestones').update(mp).eq('id', mid);
      else await supabase.from('cms_about_milestones').insert(mp);
    }

    // Save values
    await supabase.from('cms_about_values').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    for (const v of valueList) {
      const { id: vid, ...vp } = v;
      if (vid) await supabase.from('cms_about_values').update(vp).eq('id', vid);
      else await supabase.from('cms_about_values').insert(vp);
    }

    if (!error) setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="About Page Content" description="Manage the About page hero, story, mission, vision, values, milestones, and campus section." />
      <CmsCard title="Hero Section">
        <div className="grid gap-5">
          <CmsField label="Hero Title" value={data.hero_title} onChange={(v) => update({ hero_title: v })} />
          <CmsField label="Hero Subtitle" value={data.hero_subtitle} onChange={(v) => update({ hero_subtitle: v })} textarea />
        </div>
      </CmsCard>

      <CmsCard title="Our Story">
        <div className="grid gap-5">
          <CmsField label="Story Title" value={data.story_title} onChange={(v) => update({ story_title: v })} />
          <CmsField label="Story Paragraph 1" value={data.story_body1} onChange={(v) => update({ story_body1: v })} textarea rows={3} />
          <CmsField label="Story Paragraph 2" value={data.story_body2} onChange={(v) => update({ story_body2: v })} textarea rows={3} />
          <CmsField label="Story Paragraph 3" value={data.story_body3} onChange={(v) => update({ story_body3: v })} textarea rows={3} />
        </div>
      </CmsCard>

      <CmsCard title="Mission & Vision">
        <div className="grid gap-5">
          <CmsField label="Mission Text" value={data.mission_text} onChange={(v) => update({ mission_text: v })} textarea rows={4} />
          <CmsField label="Vision Text" value={data.vision_text} onChange={(v) => update({ vision_text: v })} textarea rows={4} />
        </div>
      </CmsCard>

      <CmsCard title="Statistics">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CmsField label="Alumni" value={data.stat_alumni} onChange={(v) => update({ stat_alumni: v })} />
          <CmsField label="Research Funding" value={data.stat_research} onChange={(v) => update({ stat_research: v })} />
          <CmsField label="Student-Faculty Ratio" value={data.stat_ratio} onChange={(v) => update({ stat_ratio: v })} />
          <CmsField label="Career Placement" value={data.stat_placement} onChange={(v) => update({ stat_placement: v })} />
        </div>
      </CmsCard>

      <CmsCard title="Core Values">
        <CmsListEditor
          items={valueList}
          onChange={setValueList}
          addLabel="Add Value"
          newItem={() => ({ id: '', icon: 'Target', title: '', description: '', sort_order: valueList.length })}
          renderItem={(item, updateItem) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <CmsField label="Icon" value={item.icon} onChange={(v) => updateItem({ icon: v })} placeholder="Target" />
              <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
              <CmsField label="Description" value={item.description ?? ''} onChange={(v) => updateItem({ description: v })} textarea />
            </div>
          )}
        />
      </CmsCard>

      <CmsCard title="Timeline Milestones">
        <CmsListEditor
          items={milestoneList}
          onChange={setMilestoneList}
          addLabel="Add Milestone"
          newItem={() => ({ id: '', year: '', title: '', description: '', sort_order: milestoneList.length })}
          renderItem={(item, updateItem) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <CmsField label="Year" value={item.year} onChange={(v) => updateItem({ year: v })} />
              <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
              <CmsField label="Description" value={item.description ?? ''} onChange={(v) => updateItem({ description: v })} textarea />
            </div>
          )}
        />
      </CmsCard>

      <CmsCard title="Campus Section">
        <div className="grid gap-5">
          <CmsField label="Campus Title" value={data.campus_title} onChange={(v) => update({ campus_title: v })} />
          <CmsField label="Campus Body" value={data.campus_body} onChange={(v) => update({ campus_body: v })} textarea rows={3} />
        </div>
      </CmsCard>

      <CmsSaveBar saving={saving} success={success} error={error} onSave={handleSave} />
      {dirty && !saving && <p className="text-xs text-amber-600 mt-2">Unsaved changes</p>}
    </div>
  );
}
