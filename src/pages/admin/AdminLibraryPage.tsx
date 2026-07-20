import { useState } from 'react';
import { Library, Plus, Pencil, Trash2, Search, BookCopy, BookCheck, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useLibraryBooks } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

export default function AdminLibraryPage() {
  const { user } = useAuth();
  const { data: books, loading } = useLibraryBooks();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    total_copies: '',
    available_copies: '',
    shelf: '',
    status: 'available',
  });

  if (!user) {
    navigateTo('/admin/login');
    return <PortalLoading />;
  }

  if (loading) return (
    <div className="animate-fade-in">
      <PortalPageHeader title="Library Management" subtitle="Manage the library catalog" icon={Library} />
      <PortalLoading />
    </div>
  );

  const available = books.filter((b) => (b.available_copies || 0) > 0).length;
  const borrowed = books.reduce((sum, b) => sum + ((b.total_copies || 0) - (b.available_copies || 0)), 0);

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    return !q || b.title.toLowerCase().includes(q) || (b.category || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q);
  });

  const resetForm = () => {
    setForm({ title: '', author: '', isbn: '', category: '', total_copies: '', available_copies: '', shelf: '', status: 'available' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      category: form.category,
      total_copies: parseInt(form.total_copies) || 0,
      available_copies: parseInt(form.available_copies) || 0,
      shelf: form.shelf,
      status: form.status,
    };
    if (editingId) {
      await supabase.from('library_books').update(payload).eq('id', editingId);
    } else {
      await supabase.from('library_books').insert(payload);
    }
    window.location.reload();
  };

  const handleEdit = (b: typeof books[0]) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      total_copies: String(b.total_copies),
      available_copies: String(b.available_copies),
      shelf: b.shelf,
      status: b.status,
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    await supabase.from('library_books').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Library Management"
        subtitle="Manage book catalog, copies, and availability"
        icon={Library}
        action={
          <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
            {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Book</>}
          </PortalButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatTile label="Total Books" value={books.length} icon={Library} color="ink" />
        <StatTile label="Available" value={available} icon={BookCheck} color="green" />
        <StatTile label="Borrowed Copies" value={borrowed} icon={BookCopy} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-8">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PortalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <PortalInput label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} required />
            <PortalInput label="ISBN" value={form.isbn} onChange={(v) => setForm({ ...form, isbn: v })} placeholder="978-..." />
            <PortalInput label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="e.g. Science" />
            <PortalInput label="Shelf" value={form.shelf} onChange={(v) => setForm({ ...form, shelf: v })} placeholder="e.g. A-12" />
            <PortalSelect
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'unavailable', label: 'Unavailable' },
                { value: 'reserved', label: 'Reserved' },
              ]}
            />
            <PortalInput label="Total Copies" type="number" value={form.total_copies} onChange={(v) => setForm({ ...form, total_copies: v })} />
            <PortalInput label="Available Copies" type="number" value={form.available_copies} onChange={(v) => setForm({ ...form, available_copies: v })} />
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <PortalButton type="submit" variant="primary">{editingId ? 'Update' : 'Create'} Book</PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
          </form>
        </PortalCard>
      )}

      <PortalCard className="p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent"
          />
        </div>
      </PortalCard>

      {filtered.length === 0 ? (
        <PortalCard className="p-6">
          <EmptyState icon={Library} title="No Books Found" message={search ? 'Try a different search term.' : 'Add your first book to the catalog.'} />
        </PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Title</th>
                  <th className="text-left px-6 py-3 font-medium">Author</th>
                  <th className="text-left px-6 py-3 font-medium">Category</th>
                  <th className="text-left px-6 py-3 font-medium">ISBN</th>
                  <th className="text-left px-6 py-3 font-medium">Copies</th>
                  <th className="text-left px-6 py-3 font-medium">Shelf</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((b) => {
                  const avail = b.available_copies || 0;
                  return (
                    <tr key={b.id} className="hover:bg-ink-50">
                      <td className="px-6 py-4 font-medium text-ink-900">{b.title}</td>
                      <td className="px-6 py-4 text-ink-700">{b.author}</td>
                      <td className="px-6 py-4"><Badge variant="info">{b.category || '—'}</Badge></td>
                      <td className="px-6 py-4 text-ink-500 font-mono text-xs">{b.isbn || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={avail > 0 ? 'success' : 'error'}>
                          {avail}/{b.total_copies || 0}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-ink-600">{b.shelf || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(b)} title="Edit" className="p-2 rounded-lg hover:bg-ink-100 text-ink-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(b.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}
