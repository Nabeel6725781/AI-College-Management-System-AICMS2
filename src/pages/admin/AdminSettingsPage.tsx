import { useState } from 'react';
import {
  Settings, Plus, X, Save, Bell, DollarSign, BookOpen, Server,
  Sliders, Check,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useSystemSettings } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput,
  PortalLoading, StatTile, EmptyState, Badge,
} from '../../components/portal-ui';
import type { SystemSetting } from '../../lib/supabase';

const CATEGORIES = [
  { key: 'general', label: 'General', icon: Sliders, color: 'text-ink-700', bg: 'bg-ink-100' },
  { key: 'notifications', label: 'Notifications', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'system', label: 'System', icon: Server, color: 'text-teal-600', bg: 'bg-teal-100' },
  { key: 'finance', label: 'Finance', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'academic', label: 'Academic', icon: BookOpen, color: 'text-gold-600', bg: 'bg-gold-100' },
];

function isBooleanValue(v: string): boolean {
  return v === 'true' || v === 'false';
}

export default function AdminSettingsPage() {
  useAuth();
  const { data: settings, loading } = useSystemSettings();
  const [showAdd, setShowAdd] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [form, setForm] = useState({ key: '', value: '', category: 'general', description: '' });

  const settingsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: settings.filter((s) => s.category === cat.key),
  }));

  async function handleSave(s: SystemSetting) {
    const newValue = editValues[s.id];
    if (newValue === undefined) return;
    setSavingId(s.id);
    await supabase.from('system_settings').update({ value: newValue }).eq('id', s.id);
    window.location.reload();
  }

  async function handleToggle(s: SystemSetting) {
    const newValue = s.value === 'true' ? 'false' : 'true';
    setSavingId(s.id);
    await supabase.from('system_settings').update({ value: newValue }).eq('id', s.id);
    window.location.reload();
  }

  async function handleAdd() {
    if (!form.key.trim() || !form.value.trim()) return;
    setSavingId('new');
    await supabase.from('system_settings').insert({
      key: form.key,
      value: form.value,
      category: form.category,
      description: form.description,
    });
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="System Settings" subtitle="Configure application settings" icon={Settings} />
        <PortalLoading />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="System Settings"
        subtitle="Configure application settings grouped by category"
        icon={Settings}
        action={
          <PortalButton variant="primary" onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? <X size={16} /> : <Plus size={16} />} {showAdd ? 'Cancel' : 'Add Setting'}
          </PortalButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Settings" value={settings.length} icon={Settings} color="ink" />
        <StatTile label="Categories" value={CATEGORIES.length} icon={Sliders} color="teal" />
        <StatTile label="Boolean Toggles" value={settings.filter((s) => isBooleanValue(s.value)).length} icon={Check} color="green" />
        <StatTile label="General" value={settings.filter((s) => s.category === 'general').length} icon={Server} color="gold" />
      </div>

      {/* Inline add form */}
      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Add New Setting</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <PortalInput
              label="Key"
              value={form.key}
              onChange={(v) => setForm({ ...form, key: v })}
              placeholder="setting_key"
              required
            />
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <PortalInput
              label="Value"
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
              placeholder="setting value"
              required
            />
            <PortalInput
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="What this setting controls"
            />
          </div>
          <div className="flex justify-end gap-2">
            <PortalButton variant="ghost" onClick={() => setShowAdd(false)}>Cancel</PortalButton>
            <PortalButton variant="primary" onClick={handleAdd} disabled={savingId === 'new'}>
              <Plus size={16} /> Add Setting
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {/* Settings by category */}
      {settings.length === 0 ? (
        <PortalCard className="p-6">
          <EmptyState icon={Settings} title="No settings" message="No system settings have been configured yet." />
        </PortalCard>
      ) : (
        <div className="space-y-6">
          {settingsByCategory.map((cat) => {
            if (cat.items.length === 0) return null;
            const Icon = cat.icon;
            return (
              <PortalCard key={cat.key} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.bg}`}>
                    <Icon className={cat.color} size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-ink-900">{cat.label}</h3>
                  <Badge variant="default">{cat.items.length}</Badge>
                </div>
                <div className="space-y-3">
                  {cat.items.map((s) => {
                    const isBool = isBooleanValue(s.value);
                    const editVal = editValues[s.id] !== undefined ? editValues[s.id] : s.value;
                    const isSaving = savingId === s.id;
                    return (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-ink-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-ink-900">{s.key}</span>
                            {isBool && (
                              <Badge variant={s.value === 'true' ? 'success' : 'error'}>
                                {s.value === 'true' ? 'ON' : 'OFF'}
                              </Badge>
                            )}
                          </div>
                          {s.description && (
                            <p className="text-xs text-ink-500 mt-0.5">{s.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isBool ? (
                            <button
                              onClick={() => handleToggle(s)}
                              disabled={isSaving}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
                                s.value === 'true' ? 'bg-rose-600' : 'bg-ink-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                  s.value === 'true' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          ) : (
                            <>
                              <input
                                value={editVal}
                                onChange={(e) =>
                                  setEditValues({ ...editValues, [s.id]: e.target.value })
                                }
                                className="px-3 py-1.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all min-w-[160px]"
                              />
                              <button
                                onClick={() => handleSave(s)}
                                disabled={isSaving || editValues[s.id] === undefined || editValues[s.id] === s.value}
                                title="Save"
                                className="p-2 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Save size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
