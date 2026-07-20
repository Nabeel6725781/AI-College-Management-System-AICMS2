import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { useCmsGallery } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';
import type { CmsGalleryItem } from '../../lib/cms-hooks';
import { Save, Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminCmsGalleryPage() {
  const { data: gallery, loading } = useCmsGallery();
  const [items, setItems] = useState<CmsGalleryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setItems(gallery); }, [gallery]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('cms_gallery').update(payload).eq('id', id);
      else await supabase.from('cms_gallery').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Gallery Management" description="Manage campus gallery images displayed on the public Gallery page." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add Image"
          newItem={() => ({ id: '', title: '', image_url: '', category: '', sort_order: items.length, is_active: true })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Title" value={item.title ?? ''} onChange={(v) => updateItem({ title: v })} />
                <CmsField label="Category" value={item.category ?? ''} onChange={(v) => updateItem({ category: v })} />
              </div>
              <CmsField label="Image URL" value={item.image_url} onChange={(v) => updateItem({ image_url: v })} />
              {item.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-ink-100 max-w-xs">
                  <img src={item.image_url} alt={item.title ?? 'Preview'} className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => updateItem({ is_active: e.target.checked })}
                  className="rounded border-ink-300"
                />
                {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                Visible on public site
              </label>
            </div>
          )}
        />
      </CmsCard>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-white font-medium rounded-lg hover:bg-ink-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Gallery'}
        </button>
        {success && <div className="flex items-center gap-2 text-sm text-green-600 font-medium"><Check size={16} /> Saved</div>}
        {error && <div className="flex items-center gap-2 text-sm text-red-600 font-medium"><AlertCircle size={16} /> {error}</div>}
      </div>
    </div>
  );
}
