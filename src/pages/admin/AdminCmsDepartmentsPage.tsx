import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { supabase } from '../../lib/supabase';
import type { Department } from '../../lib/supabase';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminCmsDepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('departments').select('*').order('sort_order', { ascending: true });
      setItems((data as Department[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('departments').update(payload).eq('id', id);
      else await supabase.from('departments').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Departments Management" description="Manage academic departments displayed on the public Departments page." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add Department"
          newItem={() => ({ id: '', name: '', description: '', icon: 'BookOpen', image_url: '', established_year: null, sort_order: items.length })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Name" value={item.name} onChange={(v) => updateItem({ name: v })} />
                <CmsField label="Icon" value={item.icon} onChange={(v) => updateItem({ icon: v })} placeholder="Cpu, Dna, Briefcase..." />
              </div>
              <CmsField label="Description" value={item.description} onChange={(v) => updateItem({ description: v })} textarea rows={3} />
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Image URL" value={item.image_url ?? ''} onChange={(v) => updateItem({ image_url: v })} />
                <CmsField label="Established Year" value={String(item.established_year ?? '')} onChange={(v) => updateItem({ established_year: v ? parseInt(v) : null })} type="number" />
              </div>
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
