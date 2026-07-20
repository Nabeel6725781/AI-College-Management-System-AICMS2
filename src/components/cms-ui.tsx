import { type ReactNode, useState, useCallback } from 'react';
import { Save, Plus, Trash2, Check, AlertCircle, Loader2, GripVertical } from 'lucide-react';

export function CmsPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
      <p className="text-sm text-ink-500 mt-1">{description}</p>
    </div>
  );
}

export function CmsCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 lg:p-8 mb-6">
      {title && <h2 className="text-lg font-bold text-ink-900 mb-6">{title}</h2>}
      {children}
    </div>
  );
}

export function CmsField({
  label, value, onChange, type = 'text', placeholder, textarea, rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
        />
      )}
    </div>
  );
}

export function CmsSaveBar({
  saving, success, error, onSave,
}: {
  saving: boolean;
  success: boolean;
  error: string | null;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center gap-4 mt-6">
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-white font-medium rounded-lg hover:bg-ink-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium animate-fade-in">
          <Check size={16} /> Saved successfully
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
}

export function CmsListEditor<T extends { id?: string }>({
  items, onChange, renderItem, newItem, addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  newItem: () => T;
  addLabel: string;
}) {
  const update = (index: number, patch: Partial<T>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  const add = () => {
    onChange([...items, newItem()]);
  };
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.id ?? i} className="bg-ink-50 rounded-xl border border-ink-100 p-4">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex flex-col gap-0.5 pt-1">
              <button onClick={() => move(i, -1)} className="text-ink-400 hover:text-ink-700" title="Move up">
                <GripVertical size={14} className="rotate-180" />
              </button>
              <button onClick={() => move(i, 1)} className="text-ink-400 hover:text-ink-700" title="Move down">
                <GripVertical size={14} />
              </button>
            </div>
            <div className="flex-1">
              {renderItem(item, (patch) => update(i, patch), i)}
            </div>
            <button
              onClick={() => remove(i)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-100 text-ink-700 text-sm font-medium rounded-lg hover:bg-ink-200 transition-colors"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

export function useCmsForm<T extends Record<string, unknown>>(initial: T) {
  const [data, setData] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);

  const update = useCallback((patch: Partial<T>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const reset = useCallback((val: T) => {
    setData(val);
    setDirty(false);
  }, []);

  return { data, update, reset, dirty };
}
