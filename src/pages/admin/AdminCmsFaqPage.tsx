import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { supabase } from '../../lib/supabase';
import type { Faq } from '../../lib/supabase';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminCmsFaqPage() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
      setItems((data as Faq[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('faqs').update(payload).eq('id', id);
      else await supabase.from('faqs').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="FAQ Management" description="Manage frequently asked questions displayed on the public FAQ page." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add FAQ"
          newItem={() => ({ id: '', question: '', answer: '', category: 'General', sort_order: items.length })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <CmsField label="Question" value={item.question} onChange={(v) => updateItem({ question: v })} />
              <CmsField label="Answer" value={item.answer} onChange={(v) => updateItem({ answer: v })} textarea rows={3} />
              <CmsField label="Category" value={item.category} onChange={(v) => updateItem({ category: v })} />
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
