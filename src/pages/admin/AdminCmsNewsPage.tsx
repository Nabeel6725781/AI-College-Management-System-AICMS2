import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { supabase } from '../../lib/supabase';
import type { NewsArticle } from '../../lib/supabase';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminCmsNewsPage() {
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
      setItems((data as NewsArticle[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('news').update(payload).eq('id', id);
      else await supabase.from('news').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="News & Events" description="Manage news articles displayed on the public News page." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add Article"
          newItem={() => ({ id: '', title: '', excerpt: '', content: '', image_url: '', category: 'Campus', author: '', published_at: new Date().toISOString(), is_featured: false, sort_order: items.length })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
              <CmsField label="Excerpt" value={item.excerpt} onChange={(v) => updateItem({ excerpt: v })} textarea />
              <CmsField label="Content" value={item.content} onChange={(v) => updateItem({ content: v })} textarea rows={5} />
              <div className="grid sm:grid-cols-3 gap-3">
                <CmsField label="Category" value={item.category} onChange={(v) => updateItem({ category: v })} />
                <CmsField label="Author" value={item.author} onChange={(v) => updateItem({ author: v })} />
                <CmsField label="Image URL" value={item.image_url ?? ''} onChange={(v) => updateItem({ image_url: v })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={item.is_featured} onChange={(e) => updateItem({ is_featured: e.target.checked })} className="rounded border-ink-300" />
                Featured article
              </label>
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
