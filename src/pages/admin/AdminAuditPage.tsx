import { useState } from 'react';
import {
  ScrollText, Search, Download, Activity, FileText, Calendar,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAuditLogs } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalSelect,
  PortalLoading, StatTile, EmptyState, Badge,
} from '../../components/portal-ui';
import type { AuditLog } from '../../lib/supabase';

const ACTION_META: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  CREATE: { variant: 'success' },
  UPDATE: { variant: 'warning' },
  DELETE: { variant: 'error' },
  LOGIN: { variant: 'info' },
};

export default function AdminAuditPage() {
  useAuth();
  const { data: logs, loading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const today = new Date().toDateString();
  const todayCount = logs.filter((l) => new Date(l.created_at).toDateString() === today).length;

  const filtered = logs.filter((l) => {
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.details.toLowerCase().includes(q) ||
      l.user_email.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      l.ip_address.toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Audit Logs" subtitle="System activity tracking" icon={ScrollText} />
        <PortalLoading />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Audit Logs"
        subtitle="Track all system activity and changes"
        icon={ScrollText}
        action={
          <PortalButton variant="secondary" onClick={() => { /* UI only */ }}>
            <Download size={16} /> Export
          </PortalButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Logs" value={logs.length} icon={ScrollText} color="ink" />
        <StatTile label="Today's Logs" value={todayCount} icon={Calendar} color="teal" />
        <StatTile label="Create Actions" value={logs.filter((l) => l.action === 'CREATE').length} icon={FileText} color="green" />
        <StatTile label="Delete Actions" value={logs.filter((l) => l.action === 'DELETE').length} icon={Activity} color="red" />
      </div>

      {/* Filters */}
      <PortalCard className="p-4 mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search details, user, entity, IP..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <PortalSelect
            label="Filter by Action"
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: 'all', label: 'All Actions' },
              { value: 'CREATE', label: 'Create' },
              { value: 'UPDATE', label: 'Update' },
              { value: 'DELETE', label: 'Delete' },
              { value: 'LOGIN', label: 'Login' },
            ]}
          />
        </div>
      </PortalCard>

      {/* Audit log table */}
      <PortalCard className="p-6">
        <h3 className="text-lg font-bold text-ink-900 mb-4">
          Audit Entries <span className="text-sm font-normal text-ink-500">({filtered.length})</span>
        </h3>
        {filtered.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit logs" message="No log entries match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 pr-4 font-medium">Entity</th>
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Details</th>
                  <th className="py-2 pr-4 font-medium">IP Address</th>
                  <th className="py-2 pr-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log: AuditLog) => {
                  const meta = ACTION_META[log.action] || { variant: 'default' as const };
                  return (
                    <tr key={log.id} className="border-b border-ink-50 hover:bg-ink-50 transition-colors">
                      <td className="py-2 pr-4">
                        <Badge variant={meta.variant}>{log.action}</Badge>
                      </td>
                      <td className="py-2 pr-4 font-medium text-ink-900">{log.entity || '—'}</td>
                      <td className="py-2 pr-4 text-ink-700">{log.user_email || '—'}</td>
                      <td className="py-2 pr-4 text-ink-600 max-w-xs truncate" title={log.details}>
                        {log.details || '—'}
                      </td>
                      <td className="py-2 pr-4 text-ink-500 font-mono text-xs">{log.ip_address || '—'}</td>
                      <td className="py-2 pr-4 text-ink-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
