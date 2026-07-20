import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsSaveBar, CmsListEditor, useCmsForm } from '../../components/cms-ui';
import { useCmsAdmissions, useCmsAdmissionsSteps, useCmsAdmissionsRequirements, useCmsAdmissionsDeadlines, useCmsAdmissionsAid } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';
import type { CmsAdmissionsStep, CmsAdmissionsRequirement, CmsAdmissionsDeadline, CmsAdmissionsAid } from '../../lib/cms-hooks';

export default function AdminCmsAdmissionsPage() {
  const { data: admissions, loading } = useCmsAdmissions();
  const { data: steps } = useCmsAdmissionsSteps();
  const { data: reqs } = useCmsAdmissionsRequirements();
  const { data: deadlines } = useCmsAdmissionsDeadlines();
  const { data: aid } = useCmsAdmissionsAid();
  const { data, update, reset, dirty } = useCmsForm(admissions);
  const [stepList, setStepList] = useState<CmsAdmissionsStep[]>([]);
  const [reqList, setReqList] = useState<CmsAdmissionsRequirement[]>([]);
  const [deadlineList, setDeadlineList] = useState<CmsAdmissionsDeadline[]>([]);
  const [aidList, setAidList] = useState<CmsAdmissionsAid[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!loading) reset(admissions); }, [loading, admissions, reset]);
  useEffect(() => { if (steps.length) setStepList(steps); }, [steps]);
  useEffect(() => { if (reqs.length) setReqList(reqs); }, [reqs]);
  useEffect(() => { if (deadlines.length) setDeadlineList(deadlines); }, [deadlines]);
  useEffect(() => { if (aid.length) setAidList(aid); }, [aid]);

  const syncList = async (table: string, items: Record<string, unknown>[]) => {
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from(table).update(payload).eq('id', id);
      else await supabase.from(table).insert(payload);
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const { id, updated_at, ...payload } = data;
    if (id) { const { error: e } = await supabase.from('cms_admissions').update(payload).eq('id', id); if (e) setError(e.message); }
    else { const { error: e } = await supabase.from('cms_admissions').insert(payload); if (e) setError(e.message); }
    await syncList('cms_admissions_steps', stepList);
    await syncList('cms_admissions_requirements', reqList);
    await syncList('cms_admissions_deadlines', deadlineList);
    await syncList('cms_admissions_aid', aidList);
    if (!error) setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Admissions Page Content" description="Manage admissions hero, stats, process steps, requirements, deadlines, and financial aid." />
      <CmsCard title="Hero Section">
        <div className="grid gap-5">
          <CmsField label="Hero Title" value={data.hero_title} onChange={(v) => update({ hero_title: v })} />
          <CmsField label="Hero Subtitle" value={data.hero_subtitle} onChange={(v) => update({ hero_subtitle: v })} textarea />
        </div>
      </CmsCard>

      <CmsCard title="Admissions Stats">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CmsField label="Acceptance Rate" value={data.stat_acceptance} onChange={(v) => update({ stat_acceptance: v })} />
          <CmsField label="Applications" value={data.stat_applications} onChange={(v) => update({ stat_applications: v })} />
          <CmsField label="Class Size" value={data.stat_class} onChange={(v) => update({ stat_class: v })} />
          <CmsField label="Receive Aid" value={data.stat_aid} onChange={(v) => update({ stat_aid: v })} />
        </div>
      </CmsCard>

      <CmsCard title="Application Process Steps">
        <CmsListEditor
          items={stepList}
          onChange={setStepList}
          addLabel="Add Step"
          newItem={() => ({ id: '', icon: 'FileText', title: '', description: '', deadline: '', sort_order: stepList.length })}
          renderItem={(item, updateItem) => (
            <div className="grid sm:grid-cols-2 gap-3">
              <CmsField label="Icon" value={item.icon} onChange={(v) => updateItem({ icon: v })} />
              <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
              <CmsField label="Description" value={item.description ?? ''} onChange={(v) => updateItem({ description: v })} textarea />
              <CmsField label="Deadline" value={item.deadline ?? ''} onChange={(v) => updateItem({ deadline: v })} />
            </div>
          )}
        />
      </CmsCard>

      <CmsCard title="Requirements">
        <CmsListEditor
          items={reqList}
          onChange={setReqList}
          addLabel="Add Requirement"
          newItem={() => ({ id: '', requirement: '', sort_order: reqList.length })}
          renderItem={(item, updateItem) => (
            <CmsField label="Requirement" value={item.requirement} onChange={(v) => updateItem({ requirement: v })} />
          )}
        />
      </CmsCard>

      <CmsCard title="Key Deadlines">
        <CmsListEditor
          items={deadlineList}
          onChange={setDeadlineList}
          addLabel="Add Deadline"
          newItem={() => ({ id: '', type: '', date: '', description: '', sort_order: deadlineList.length })}
          renderItem={(item, updateItem) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <CmsField label="Type" value={item.type} onChange={(v) => updateItem({ type: v })} />
              <CmsField label="Date" value={item.date} onChange={(v) => updateItem({ date: v })} />
              <CmsField label="Description" value={item.description ?? ''} onChange={(v) => updateItem({ description: v })} textarea />
            </div>
          )}
        />
      </CmsCard>

      <CmsCard title="Financial Aid Section">
        <div className="grid gap-5 mb-6">
          <CmsField label="Aid Section Title" value={data.aid_title} onChange={(v) => update({ aid_title: v })} />
          <CmsField label="Aid Section Description" value={data.aid_description} onChange={(v) => update({ aid_description: v })} textarea />
        </div>
        <CmsListEditor
          items={aidList}
          onChange={setAidList}
          addLabel="Add Aid Option"
          newItem={() => ({ id: '', title: '', description: '', amount: '', sort_order: aidList.length })}
          renderItem={(item, updateItem) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
              <CmsField label="Amount" value={item.amount ?? ''} onChange={(v) => updateItem({ amount: v })} />
              <CmsField label="Description" value={item.description ?? ''} onChange={(v) => updateItem({ description: v })} textarea />
            </div>
          )}
        />
      </CmsCard>

      <CmsCard title="Cost of Attendance">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CmsField label="Tuition" value={data.tuition} onChange={(v) => update({ tuition: v })} />
          <CmsField label="Room & Board" value={data.room_board} onChange={(v) => update({ room_board: v })} />
          <CmsField label="Fees" value={data.fees} onChange={(v) => update({ fees: v })} />
          <CmsField label="Total" value={data.total} onChange={(v) => update({ total: v })} />
        </div>
      </CmsCard>

      <CmsSaveBar saving={saving} success={success} error={error} onSave={handleSave} />
      {dirty && !saving && <p className="text-xs text-amber-600 mt-2">Unsaved changes</p>}
    </div>
  );
}
