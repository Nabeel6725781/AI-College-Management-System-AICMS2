import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { supabase } from '../../lib/supabase';
import type { FacultyMember, Department } from '../../lib/supabase';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminCmsFacultyPage() {
  const [items, setItems] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: fac }, { data: depts }] = await Promise.all([
        supabase.from('faculty').select('*').order('sort_order', { ascending: true }),
        supabase.from('departments').select('*').order('sort_order', { ascending: true }),
      ]);
      setItems((fac as FacultyMember[]) ?? []);
      setDepartments((depts as Department[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('faculty').update(payload).eq('id', id);
      else await supabase.from('faculty').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Faculty Management" description="Manage faculty members displayed on the public Faculty page." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add Faculty Member"
          newItem={() => ({ id: '', name: '', title: '', department_id: null, bio: '', image_url: '', email: '', research_areas: [], sort_order: items.length })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Name" value={item.name} onChange={(v) => updateItem({ name: v })} />
                <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Department</label>
                <select
                  value={item.department_id ?? ''}
                  onChange={(e) => updateItem({ department_id: e.target.value || null })}
                  className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                >
                  <option value="">No department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <CmsField label="Bio" value={item.bio} onChange={(v) => updateItem({ bio: v })} textarea rows={3} />
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Image URL" value={item.image_url ?? ''} onChange={(v) => updateItem({ image_url: v })} />
                <CmsField label="Email" value={item.email ?? ''} onChange={(v) => updateItem({ email: v })} type="email" />
              </div>
              <CmsField label="Research Areas (comma-separated)" value={(item.research_areas ?? []).join(', ')} onChange={(v) => updateItem({ research_areas: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </div>
          )}
        />
      </CmsCard>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-white font-medium rounded-lg hover:bg-ink-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save All'}
        </button>
        {success && <div className="flex items-center gap-2 text-sm text-green-600 font-medium"><Check size={16} /> Saved</div>}
        {error && <div className="flex items-center gap-2 text-sm text-red-600 font-medium"><AlertCircle size={16} /> {error}</div>}
      </div>
    </div>
  );
}
