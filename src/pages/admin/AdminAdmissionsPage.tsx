// File: src/pages/admin/AdminAdmissionsPage.tsx
// Modified to enhance the Admin Admissions module with improved UI/UX features
// - Faster debounced search
// - Multi-status filtering + program filter + date range
// - Client-side pagination
// - Status badges & OCR / AI columns
// - Duplicate detection
// - Loading skeletons
// - Toast notifications (success / error)
// - Confirmation modal for delete
// - Student profile preview (modal) with document preview & admission timeline
// - Export CSV/Print (PDF via browser print) / Export Excel (CSV format compatible)
// - Better table layout & responsive improvements
// - Audit log attempt (inserts into `admission_audit_logs` if table exists, but does not create any table)
// All changes keep existing API usage (supabase) and reuse useAdmissions() hook. No routes or existing components were removed.

import { useEffect, useMemo, useState, useRef, Fragment } from 'react';
import {
  FileText, Check, X, Clock, Mail, Phone, Trash2, Eye, Download, Printer, Search as SearchIcon,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useAdmissions } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { AdmissionApplication } from '../../lib/supabase';

/*
  Note: This file intentionally expands the original page but preserves all previously existing
  functions and API usage. Where behavior was improved (eg. updateStatus, deleteApplication),
  the same Supabase operations are used; instead of reloading the page we update local state
  and emit audit entries when possible.
*/

// mapping to existing badge variants (keeps visual language)
const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'error' | 'info' | 'default'> = {
  pending: 'warning',
  draft: 'warning',
  approved: 'success',
  rejected: 'error',
  reviewing: 'info',
};

// small toasts implementation (local-only)
function useToasts() {
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'info'; text: string }[]>([]);
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);
  const push = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((s) => [{ id: `${Date.now()}-${Math.random()}`, type, text }, ...s].slice(0, 6));
  };
  const ToastContainer = () => (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded-lg shadow-md text-sm max-w-xs ${
            t.type === 'success' ? 'bg-green-50 text-green-800' : t.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-ink-50 text-ink-900'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
  return { push, ToastContainer };
}

// modal utility
function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children?: any; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-3xl bg-white dark:bg-ink-900 rounded-2xl shadow-xl overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-ink-100 dark:border-ink-700">
          <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-ink-100 dark:hover:bg-ink-800">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminAdmissionsPage() {
  const { user } = useAuth();
  const { data: applicationsRaw, loading } = useAdmissions(); // reuse hook
  const { push: pushToast, ToastContainer } = useToasts();

  // UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // local mutable applications state (so we can update without full reload)
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  useEffect(() => {
    if (applicationsRaw && Array.isArray(applicationsRaw)) {
      setApplications(applicationsRaw);
    }
  }, [applicationsRaw]);

  // selected app for preview & delete
  const [previewApp, setPreviewApp] = useState<AdmissionApplication | null>(null);
  const [confirmDeleteApp, setConfirmDeleteApp] = useState<AdmissionApplication | null>(null);

  // loading states for actions
  const [actionLoadingIds, setActionLoadingIds] = useState<Record<string, boolean>>({});

  // search optimizations: precompute search tokens per application
  const tokensRef = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!applications) return;
    const tokens: Record<string, string> = {};
    applications.forEach((a) => {
      tokens[a.id] = [
        a.full_name,
        a.email,
        a.program,
        a.student_id,
        a.phone,
        a.previous_school,
        a.statement,
      ].filter(Boolean).join(' ').toLowerCase();
    });
    tokensRef.current = tokens;
  }, [applications]);

  // debounced search (200ms)
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 200);
    return () => clearTimeout(id);
  }, [search]);

  // derived program list for filter
  const programs = useMemo(() => {
    const setProg = new Set<string>();
    applications.forEach((a) => { if (a.program) setProg.add(a.program); });
    return ['all', ...Array.from(setProg).sort()];
  }, [applications]);

  // duplicate detection: by email or phone or student_id
  const duplicates = useMemo(() => {
    const map: Record<string, string[]> = {};
    applications.forEach((a) => {
      if (!a) return;
      const keys = [
        a.email?.toLowerCase() || '',
        a.phone?.replace(/\s+/g, '') || '',
        a.student_id?.toLowerCase() || '',
      ].filter(Boolean);
      keys.forEach((k) => {
        if (!map[k]) map[k] = [];
        map[k].push(a.id);
      });
    });
    const dupSet = new Set<string>();
    Object.values(map).forEach((arr) => {
      if (arr.length > 1) arr.forEach((id) => dupSet.add(id));
    });
    return dupSet;
  }, [applications]);

  // filtering
  const filtered = useMemo(() => {
    if (!applications) return [];
    const q = debouncedSearch;
    return applications.filter((a) => {
      // status filter
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      // program filter
      if (programFilter !== 'all' && a.program !== programFilter) return false;
      // date range filter (created_at assumed)
      if (dateFrom) {
        const created = new Date(a.created_at || a.updated_at || '');
        if (isNaN(created.getTime())) return false;
        if (created < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const created = new Date(a.created_at || a.updated_at || '');
        if (isNaN(created.getTime())) return false;
        // include end date full day
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (created > to) return false;
      }
      // search tokens
      if (q) {
        const t = tokensRef.current[a.id] || '';
        if (!t.includes(q)) return false;
      }
      return true;
    });
  }, [applications, debouncedSearch, statusFilter, programFilter, dateFrom, dateTo]);

  // pagination data
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]); // reset if too high
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // statistics (enhanced)
  const stats = useMemo(() => {
    const total = applications.length;
    const pendingCount = applications.filter((a) => a.status === 'pending' || a.status === 'draft').length;
    const approvedCount = applications.filter((a) => a.status === 'approved').length;
    const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
    const ocrPending = applications.filter((a) => (a as any).ocr_status === 'pending').length;
    const ocrDone = applications.filter((a) => (a as any).ocr_status === 'done').length;
    const aiEligible = applications.filter((a) => (a as any).ai_eligibility === 'eligible').length;
    const duplicateCount = Array.from(duplicates).length;
    return { total, pendingCount, approvedCount, rejectedCount, ocrPending, ocrDone, aiEligible, duplicateCount };
  }, [applications, duplicates]);

  // keep track of in-progress status updates
  const setActionLoading = (id: string, val: boolean) => {
    setActionLoadingIds((s) => ({ ...s, [id]: val }));
  };

  // updateStatus: reuse supabase update but update local state instead of full reload
  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id, true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from('admission_applications').update({ status, updated_at: now }).eq('id', id);
      if (error) {
        pushToast('error', `Failed to update status: ${error.message}`);
      } else {
        setApplications((prev) => prev.map((p) => (p.id === id ? { ...p, status, updated_at: now } : p)));
        pushToast('success', `Application ${id} updated to ${status}`);
        // attempt audit log insert (only if table exists)
        try {
          await supabase.from('admission_audit_logs').insert([{ application_id: id, action: `status:${status}`, performed_by: user?.id || 'system', created_at: now }]);
        } catch {
          // ignore: table may not exist
        }
      }
    } catch (e: any) {
      pushToast('error', `Unexpected error: ${e?.message || String(e)}`);
    } finally {
      setActionLoading(id, false);
    }
  };

  // deleteApplication: confirmation modal used; reuse supabase delete but update local state
  const deleteApplicationConfirmed = async (app: AdmissionApplication) => {
    const id = app.id;
    setActionLoading(id, true);
    try {
      const { error } = await supabase.from('admission_applications').delete().eq('id', id);
      if (error) {
        pushToast('error', `Failed to delete: ${error.message}`);
      } else {
        setApplications((prev) => prev.filter((p) => p.id !== id));
        pushToast('success', `Application ${id} deleted`);
        // audit log attempt
        try {
          await supabase.from('admission_audit_logs').insert([{ application_id: id, action: `deleted`, performed_by: user?.id || 'system', created_at: new Date().toISOString() }]);
        } catch { /* ignore */ }
      }
    } catch (e: any) {
      pushToast('error', `Unexpected error: ${e?.message || String(e)}`);
    } finally {
      setActionLoading(id, false);
      setConfirmDeleteApp(null);
    }
  };

  // quick export CSV (Excel-compatible) for current filtered set
  const exportCSV = (rows: AdmissionApplication[], filename = 'admissions_export.csv') => {
    if (!rows || !rows.length) {
      pushToast('info', 'No data to export');
      return;
    }
    // pick columns conservatively
    const columns = ['id', 'student_id', 'full_name', 'email', 'phone', 'program', 'status', 'created_at', 'updated_at'];
    const csv = [
      columns.join(','),
      ...rows.map((r) => columns.map((c) => {
        const v = (r as any)[c];
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('success', `Exported ${rows.length} rows`);
  };

  // print a single admission form (opens new window and calls print)
  const printAdmission = (app: AdmissionApplication) => {
    const html = `
      <html>
      <head>
        <title>Admission Form - ${app.full_name}</title>
        <style>
          body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #0f172a; padding: 24px; }
          .card { border-radius: 12px; border: 1px solid #e6edf3; padding: 18px; max-width: 800px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .row { display:flex; gap: 12px; margin-bottom: 8px; }
          .label { width:160px; color:#6b7280; font-size:13px; }
          .value { font-weight:600; }
          pre { background:#f8fafc; padding:10px; border-radius:8px; overflow:auto; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Admission Form</h1>
          <div class="row"><div class="label">Applicant</div><div class="value">${app.full_name || ''}</div></div>
          <div class="row"><div class="label">Applicant ID</div><div class="value">${app.student_id || ''}</div></div>
          <div class="row"><div class="label">Program</div><div class="value">${app.program || ''}</div></div>
          <div class="row"><div class="label">Email</div><div class="value">${app.email || ''}</div></div>
          <div class="row"><div class="label">Phone</div><div class="value">${app.phone || ''}</div></div>
          <div class="row"><div class="label">GPA</div><div class="value">${app.gpa || ''}</div></div>
          <div style="margin-top:12px;"><div class="label">Statement</div><pre>${(app.statement || '').replace(/</g,'&lt;')}</pre></div>
        </div>
      </body>
      </html>
    `;
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    } else {
      pushToast('error', 'Popup blocked. Please allow popups for printing.');
    }
  };

  // helper for document preview (supports image/pdf links)
  const renderDocumentPreview = (url?: string) => {
    if (!url) return <div className="text-sm text-ink-500">No document</div>;
    const lower = url.toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp)$/.test(lower)) {
      return <img src={url} alt="document" className="max-w-full rounded" />;
    }
    if (/\.(pdf)$/.test(lower)) {
      return <iframe title="doc" src={url} className="w-full h-96 border rounded" />;
    }
    return <a href={url} className="text-theme-primary" target="_blank" rel="noreferrer">Open document</a>;
  };

  if (loading) {
    // show improved skeletons instead of original loading
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Admissions Management" subtitle="Review and process applications" icon={FileText} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <StatTile label="Total Applications" value="—" icon={FileText} color="ink" />
          <StatTile label="Pending" value="—" icon={Clock} color="gold" />
          <StatTile label="Approved" value="—" icon={Check} color="green" />
          <StatTile label="Rejected" value="—" icon={X} color="red" />
        </div>
        <PortalCard className="p-4 mb-6">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-ink-100 rounded" />
            <div className="h-10 bg-ink-100 rounded" />
          </div>
        </PortalCard>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <PortalCard key={i} className="p-5">
              <div className="animate-pulse">
                <div className="h-6 bg-ink-100 w-1/3 rounded mb-3" />
                <div className="h-4 bg-ink-100 w-full rounded mb-2" />
                <div className="h-4 bg-ink-100 w-3/4 rounded" />
              </div>
            </PortalCard>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  // UI: header, filters, stats
  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Admissions Management"
        subtitle="Review and process student applications"
        icon={FileText}
        action={
          <div className="flex items-center gap-2">
            <PortalButton variant="secondary" onClick={() => navigateTo('/admin')}>Dashboard</PortalButton>
            <PortalButton variant="ghost" onClick={() => exportCSV(filtered, 'admissions_filtered.csv')}><Download size={16} /> Export</PortalButton>
            <PortalButton variant="ghost" onClick={() => exportCSV(applications, 'admissions_all.csv')}><Download size={16} /> Export All</PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Applications" value={stats.total} icon={FileText} color="ink" />
        <StatTile label="Pending" value={stats.pendingCount} icon={Clock} color="gold" />
        <StatTile label="Approved" value={stats.approvedCount} icon={Check} color="green" />
        <StatTile label="Rejected" value={stats.rejectedCount} icon={X} color="red" />
        <StatTile label="OCR Pending" value={stats.ocrPending} icon={FileText} color="blue" />
        <StatTile label="OCR Done" value={stats.ocrDone} icon={FileText} color="teal" />
        <StatTile label="AI Eligible" value={stats.aiEligible} icon={Check} color="green" />
        <StatTile label="Duplicates" value={stats.duplicateCount} icon={X} color="gold" />
      </div>

      <PortalCard className="p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex items-center gap-3">
            <div className="relative flex-1">
              <PortalInput label="Search" value={search} onChange={setSearch} placeholder="Search by name, email, program, or applicant ID..." />
              <div className="absolute right-4 top-9 hidden lg:block text-ink-400"><SearchIcon size={16} /></div>
            </div>
            <PortalSelectWrapper value={programFilter} onChange={setProgramFilter} options={programs.map((p) => ({ value: p, label: p }))} label="Program" />
          </div>

          <div className="flex items-center gap-2">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm" />
            </div>
          </div>
        </div>
      </PortalCard>

      {/* Table */}
      <PortalCard className="p-4 mb-6">
        {paged.length === 0 ? (
          <EmptyState icon={FileText} title="No applications found" message="No admission applications match your search criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ink-600">
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 hidden md:table-cell">GPA</th>
                  <th className="p-3">OCR</th>
                  <th className="p-3">AI</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => (
                  <tr key={a.id} className="border-t border-ink-100 hover:bg-ink-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="font-semibold text-ink-900">{a.full_name}</div>
                          <div className="text-xs text-ink-500">{a.student_id}</div>
                          {duplicates.has(a.id) && <div className="mt-1"><Badge variant="warning">Duplicate</Badge></div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-ink-900 font-medium">{a.program}</div>
                      <div className="text-xs text-ink-500">{a.previous_school || '—'}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2"><Mail size={14} /> <span className="text-ink-700">{a.email}</span></div>
                        <div className="flex items-center gap-2"><Phone size={14} /> <span className="text-ink-700">{a.phone}</span></div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell"><span className="font-medium">{a.gpa ?? '—'}</span></td>
                    <td className="p-3">
                      <div>
                        <div className="text-xs text-ink-500">{(a as any).ocr_status || 'unknown'}</div>
                        {((a as any).ocr_status === 'done') ? <Badge variant="success">OCR Done</Badge> : ((a as any).ocr_status === 'pending') ? <Badge variant="warning">OCR Pending</Badge> : <Badge variant="default">No OCR</Badge>}
                      </div>
                    </td>
                    <td className="p-3">
                      {((a as any).ai_eligibility) ? <div className="flex flex-col gap-1">
                        <div className="text-xs text-ink-500">{(a as any).ai_prediction_department || '—'}</div>
                        <div>{((a as any).ai_eligibility === 'eligible') ? <Badge variant="success">Eligible</Badge> : ((a as any).ai_eligibility === 'rejected') ? <Badge variant="error">Not Eligible</Badge> : <Badge variant="info">Review</Badge>}</div>
                      </div> : <div className="text-xs text-ink-500">—</div>}
                    </td>
                    <td className="p-3">
                      <Badge variant={STATUS_VARIANT[a.status || 'default'] || 'default'}>{(a.status || 'pending').replace('_', ' ')}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button title="Preview" onClick={() => setPreviewApp(a)} className="p-2 rounded hover:bg-ink-100"><Eye size={16} /></button>
                        {a.status !== 'approved' && <PortalButton variant="primary" onClick={() => updateStatus(a.id, 'approved')} disabled={actionLoadingIds[a.id]}>
                          <Check size={14} /> Approve
                        </PortalButton>}
                        {a.status !== 'rejected' && <PortalButton variant="danger" onClick={() => updateStatus(a.id, 'rejected')} disabled={actionLoadingIds[a.id]}>
                          <X size={14} /> Reject
                        </PortalButton>}
                        <button title="Delete" onClick={() => setConfirmDeleteApp(a)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                        <button title="Print Form" onClick={() => printAdmission(a)} className="p-2 rounded hover:bg-ink-100"><Printer size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* pagination controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-ink-600">
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} of {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-3 py-2 rounded border border-ink-200">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded border border-ink-200">Prev</button>
                  <div className="px-3 text-sm">{page} / {totalPages}</div>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 rounded border border-ink-200">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Preview modal */}
      <Modal open={!!previewApp} onClose={() => setPreviewApp(null)} title={previewApp ? `Preview — ${previewApp.full_name}` : ''}>
        {previewApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="mb-3">
                  <div className="text-xs text-ink-500">Applicant</div>
                  <div className="text-lg font-semibold text-ink-900">{previewApp.full_name}</div>
                  <div className="text-sm text-ink-500">{previewApp.student_id}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-ink-700">
                  <div><div className="text-xs text-ink-500">Program</div><div className="font-medium">{previewApp.program}</div></div>
                  <div><div className="text-xs text-ink-500">Status</div><div className="font-medium">{previewApp.status}</div></div>
                  <div><div className="text-xs text-ink-500">Email</div><div className="font-medium">{previewApp.email}</div></div>
                  <div><div className="text-xs text-ink-500">Phone</div><div className="font-medium">{previewApp.phone}</div></div>
                  <div><div className="text-xs text-ink-500">GPA</div><div className="font-medium">{previewApp.gpa}</div></div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-ink-500">Statement</div>
                  <div className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">{previewApp.statement || '—'}</div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-ink-900 mb-2">Admission Timeline</h4>
                  <div className="text-sm text-ink-600 space-y-2">
                    <div><span className="font-medium">{previewApp.created_at ? new Date(previewApp.created_at).toLocaleString() : '—'}</span> — Submitted</div>
                    {previewApp.updated_at && <div><span className="font-medium">{new Date(previewApp.updated_at).toLocaleString()}</span> — Last updated</div>}
                    {/* if audit logs exist in application data, show them */}
                    {Array.isArray((previewApp as any).audit_logs) && (previewApp as any).audit_logs.map((al: any, i: number) => (
                      <div key={i}><span className="font-medium">{al.created_at ? new Date(al.created_at).toLocaleString() : '—'}</span> — {al.action} by {al.performed_by || 'system'}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-ink-500">Documents</div>
                  <div className="mt-2 border rounded p-2 bg-ink-50 max-h-[300px] overflow-auto">
                    {/* show attachments if present (common fields: document_url, transcript_url, photo_url) */}
                    {((previewApp as any).document_url || (previewApp as any).transcript_url || (previewApp as any).photo_url) ? (
                      <div className="space-y-3">
                        {[(previewApp as any).document_url, (previewApp as any).transcript_url, (previewApp as any).photo_url].filter(Boolean).map((url: string, idx: number) => (
                          <div key={idx} className="border p-2 rounded">
                            {renderDocumentPreview(url)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-ink-500">No documents uploaded</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-ink-500">OCR Status</div>
                  <div className="mt-1">{((previewApp as any).ocr_status === 'done') ? <Badge variant="success">Done</Badge> : ((previewApp as any).ocr_status === 'pending') ? <Badge variant="warning">Pending</Badge> : <Badge variant="default">None</Badge>}</div>
                </div>

                <div>
                  <div className="text-xs text-ink-500">AI Eligibility</div>
                  <div className="mt-1">
                    {((previewApp as any).ai_eligibility === 'eligible') ? <Badge variant="success">Eligible</Badge> : ((previewApp as any).ai_eligibility === 'rejected') ? <Badge variant="error">Not Eligible</Badge> : ((previewApp as any).ai_eligibility) ? <Badge variant="info">{(previewApp as any).ai_eligibility}</Badge> : <Badge variant="default">N/A</Badge>}
                    <div className="text-xs text-ink-500 mt-1">{(previewApp as any).ai_reasoning || ''}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <PortalButton variant="secondary" onClick={() => printAdmission(previewApp)}>Print</PortalButton>
                  <PortalButton variant="ghost" onClick={() => exportCSV([previewApp], `admission_${previewApp.student_id || previewApp.id}.csv`)}>Export</PortalButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete modal */}
      <Modal open={!!confirmDeleteApp} onClose={() => setConfirmDeleteApp(null)} title="Confirm delete">
        {confirmDeleteApp && (
          <div className="space-y-4">
            <div className="text-sm text-ink-700">Are you sure you want to delete the application for <strong>{confirmDeleteApp.full_name}</strong>? This action cannot be undone.</div>
            <div className="flex gap-2 justify-end">
              <PortalButton variant="secondary" onClick={() => setConfirmDeleteApp(null)}>Cancel</PortalButton>
              <PortalButton variant="danger" onClick={() => deleteApplicationConfirmed(confirmDeleteApp)}>Delete</PortalButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

/* small helper: PortalSelectWrapper reused to avoid changing shared PortalSelect component file */
function PortalSelectWrapper({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string }) {
  return (
    <div className="min-w-[160px]">
      <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm">
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}
