import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsSaveBar, useCmsForm } from '../../components/cms-ui';
import { useCmsSettings } from '../../lib/cms-hooks';
import { supabase } from '../../lib/supabase';
import {
  Building2, UserCircle, ClipboardList, Landmark, Palette,
} from 'lucide-react';

type Tab = 'college' | 'principal' | 'registrar' | 'bank' | 'theme';

export default function AdminCmsSettingsPage() {
  const { data: settings, loading, refresh } = useCmsSettings();
  const { data, update, reset, dirty } = useCmsForm(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<Tab>('college');

  useEffect(() => { if (!loading) reset(settings); }, [loading, settings?.id, reset]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const { id, updated_at, ...payload } = data;
    const { error } = id
      ? await supabase.from('cms_settings').update(payload).eq('id', id)
      : await supabase.from('cms_settings').insert(payload);
    if (error) setError(error.message); else { setSuccess(true); refresh(); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'college', label: 'College Information', icon: Building2 },
    { id: 'principal', label: 'Principal Information', icon: UserCircle },
    { id: 'registrar', label: 'Registrar Information', icon: ClipboardList },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'theme', label: 'Theme Settings', icon: Palette },
  ];

  return (
    <div>
      <CmsPageHeader
        title="Website Settings"
        description="Manage college identity, leadership, bank details, and theme. Changes apply across the entire website and portal."
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-400'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── College Information ── */}
      {tab === 'college' && (
        <>
          <CmsCard title="College Identity">
            <div className="grid sm:grid-cols-2 gap-5">
              <CmsField label="College Name" value={data.college_name} onChange={(v) => update({ college_name: v })} />
              <CmsField label="Tagline" value={data.tagline} onChange={(v) => update({ tagline: v })} />
              <CmsField label="Logo URL" value={data.college_logo_url ?? ''} onChange={(v) => update({ college_logo_url: v })} placeholder="https://..." />
              <CmsField label="Favicon URL" value={data.favicon_url ?? ''} onChange={(v) => update({ favicon_url: v })} placeholder="https://... (16x16 or 32x32)" />
              <CmsField label="Website URL" value={data.website_url ?? ''} onChange={(v) => update({ website_url: v })} placeholder="https://meridian.edu" />
            </div>
            {data.college_logo_url && (
              <div className="mt-4 flex items-center gap-4">
                <span className="text-sm text-ink-500">Logo preview:</span>
                <div className="w-12 h-12 rounded-lg bg-ink-900 flex items-center justify-center overflow-hidden">
                  <img src={data.college_logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {data.favicon_url && (
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-ink-500">Favicon preview:</span>
                <img src={data.favicon_url} alt="Favicon" className="w-6 h-6 rounded" />
              </div>
            )}
          </CmsCard>

          <CmsCard title="Contact Information">
            <div className="grid sm:grid-cols-2 gap-5">
              <CmsField label="Address" value={data.address} onChange={(v) => update({ address: v })} textarea rows={2} />
              <CmsField label="Phone" value={data.phone} onChange={(v) => update({ phone: v })} />
              <CmsField label="Email" value={data.email} onChange={(v) => update({ email: v })} type="email" />
            </div>
          </CmsCard>

          <CmsCard title="Social Media">
            <div className="grid sm:grid-cols-2 gap-5">
              <CmsField label="Facebook URL" value={data.facebook_url ?? ''} onChange={(v) => update({ facebook_url: v })} placeholder="https://facebook.com/..." />
              <CmsField label="Twitter URL" value={data.twitter_url ?? ''} onChange={(v) => update({ twitter_url: v })} placeholder="https://twitter.com/..." />
              <CmsField label="Instagram URL" value={data.instagram_url ?? ''} onChange={(v) => update({ instagram_url: v })} placeholder="https://instagram.com/..." />
              <CmsField label="LinkedIn URL" value={data.linkedin_url ?? ''} onChange={(v) => update({ linkedin_url: v })} placeholder="https://linkedin.com/..." />
              <CmsField label="YouTube URL" value={data.youtube_url ?? ''} onChange={(v) => update({ youtube_url: v })} placeholder="https://youtube.com/..." />
            </div>
          </CmsCard>

          <CmsCard title="Footer">
            <CmsField label="Footer Text" value={data.footer_text} onChange={(v) => update({ footer_text: v })} textarea rows={3} />
          </CmsCard>
        </>
      )}

      {/* ── Principal Information ── */}
      {tab === 'principal' && (
        <CmsCard title="Principal Information">
          <div className="grid sm:grid-cols-2 gap-5">
            <CmsField label="Principal Name" value={data.principal_name ?? ''} onChange={(v) => update({ principal_name: v })} placeholder="Dr. Jane Doe" />
            <CmsField label="Email" value={data.principal_email ?? ''} onChange={(v) => update({ principal_email: v })} type="email" placeholder="principal@meridian.edu" />
            <CmsField label="Phone" value={data.principal_phone ?? ''} onChange={(v) => update({ principal_phone: v })} placeholder="(555) 123-4567" />
          </div>
          <div className="mt-5">
            <CmsField label="Principal's Message" value={data.principal_message ?? ''} onChange={(v) => update({ principal_message: v })} textarea rows={5} placeholder="A welcome message from the principal..." />
          </div>
        </CmsCard>
      )}

      {/* ── Registrar Information ── */}
      {tab === 'registrar' && (
        <CmsCard title="Registrar Information">
          <div className="grid sm:grid-cols-2 gap-5">
            <CmsField label="Registrar Name" value={data.registrar_name ?? ''} onChange={(v) => update({ registrar_name: v })} placeholder="John Smith" />
            <CmsField label="Email" value={data.registrar_email ?? ''} onChange={(v) => update({ registrar_email: v })} type="email" placeholder="registrar@meridian.edu" />
            <CmsField label="Phone" value={data.registrar_phone ?? ''} onChange={(v) => update({ registrar_phone: v })} placeholder="(555) 987-6543" />
            <CmsField label="Office Location / Hours" value={data.registrar_office ?? ''} onChange={(v) => update({ registrar_office: v })} placeholder="Admin Building, Room 101 · Mon-Fri 9am-5pm" />
          </div>
        </CmsCard>
      )}

      {/* ── Bank Details ── */}
      {tab === 'bank' && (
        <CmsCard title="Bank Details">
          <p className="text-sm text-ink-500 mb-5">These details appear on fee challans and payment-related documents.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <CmsField label="Account Name" value={data.bank_account_name ?? ''} onChange={(v) => update({ bank_account_name: v })} placeholder="Meridian University" />
            <CmsField label="Account Number" value={data.bank_account_number ?? ''} onChange={(v) => update({ bank_account_number: v })} placeholder="0000 0000 0000" />
            <CmsField label="Bank Name" value={data.bank_name ?? ''} onChange={(v) => update({ bank_name: v })} placeholder="First National Bank" />
            <CmsField label="Branch" value={data.bank_branch ?? ''} onChange={(v) => update({ bank_branch: v })} placeholder="Main Campus Branch" />
            <CmsField label="IFSC / SWIFT / IBAN Code" value={data.bank_ifsc ?? ''} onChange={(v) => update({ bank_ifsc: v })} placeholder="FNMA0001234" />
          </div>
        </CmsCard>
      )}

      {/* ── Theme Settings ── */}
      {tab === 'theme' && (
        <CmsCard title="Theme Settings">
          <p className="text-sm text-ink-500 mb-5">
            Customize the primary and accent colors used across the entire website. Enter hex color codes (e.g. #0f1118). Changes apply to the navbar, footer, buttons, and portal interfaces after saving.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.theme_primary ?? '#0f1118'}
                  onChange={(e) => update({ theme_primary: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-ink-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.theme_primary ?? ''}
                  onChange={(e) => update({ theme_primary: e.target.value })}
                  placeholder="#0f1118"
                  className="flex-1 px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.theme_accent ?? '#c69035'}
                  onChange={(e) => update({ theme_accent: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-ink-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.theme_accent ?? ''}
                  onChange={(e) => update({ theme_accent: e.target.value })}
                  placeholder="#c69035"
                  className="flex-1 px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-6 p-6 rounded-xl border border-ink-100 bg-ink-50">
            <h3 className="text-sm font-semibold text-ink-700 mb-4">Live Preview</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all"
                style={{ backgroundColor: data.theme_primary ?? '#0f1118' }}
              >
                Primary Button
              </button>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all"
                style={{ backgroundColor: data.theme_accent ?? '#c69035' }}
              >
                Accent Button
              </button>
              <span
                className="text-xs font-sans font-semibold uppercase tracking-[0.2em]"
                style={{ color: data.theme_accent ?? '#c69035' }}
              >
                Section Eyebrow Text
              </span>
            </div>
            <div
              className="mt-4 h-3 rounded-full"
              style={{ background: `linear-gradient(90deg, ${data.theme_primary ?? '#0f1118'}, ${data.theme_accent ?? '#c69035'})` }}
            />
          </div>
        </CmsCard>
      )}

      <CmsSaveBar saving={saving} success={success} error={error} onSave={handleSave} />
      {dirty && !saving && <p className="text-xs text-amber-600 mt-2">Unsaved changes</p>}
    </div>
  );
}
