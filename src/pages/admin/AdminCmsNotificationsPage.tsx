import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { supabase } from '../../lib/supabase';
import type { CmsSiteNotification } from '../../lib/cms-hooks';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminCmsNotificationsPage() {
  const [items, setItems] = useState<CmsSiteNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_site_notifications').select('*').order('created_at', { ascending: false });
      setItems((data as CmsSiteNotification[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('cms_site_notifications').update(payload).eq('id', id);
      else await supabase.from('cms_site_notifications').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Site Notifications" description="Manage banner notifications that appear at the top of the public website." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add Notification"
          newItem={() => ({ id: '', title: '', message: '', type: 'info', link_text: '', link_url: '', is_active: true, starts_at: null, ends_at: null })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Title" value={item.title} onChange={(v) => updateItem({ title: v })} />
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">Type</label>
                  <select
                    value={item.type ?? 'info'}
                    onChange={(e) => updateItem({ type: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>
              <CmsField label="Message" value={item.message} onChange={(v) => updateItem({ message: v })} textarea />
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Link Text" value={item.link_text ?? ''} onChange={(v) => updateItem({ link_text: v })} />
                <CmsField label="Link URL" value={item.link_url ?? ''} onChange={(v) => updateItem({ link_url: v })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => updateItem({ is_active: e.target.checked })}
                  className="rounded border-ink-300"
                />
                Active
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
          {saving ? 'Saving...' : 'Save Notifications'}
        </button>
        {success && <div className="flex items-center gap-2 text-sm text-green-600 font-medium"><Check size={16} /> Saved</div>}
        {error && <div className="flex items-center gap-2 text-sm text-red-600 font-medium"><AlertCircle size={16} /> {error}</div>}
      </div>
    </div>
  );
}
