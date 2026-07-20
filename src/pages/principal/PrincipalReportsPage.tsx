import { useState } from 'react';
import {
  FileBarChart, Users, DollarSign, GraduationCap, CalendarCheck, Building2,
  FileText, Download, Clock, Calendar, FileSpreadsheet, FileType, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import {
  useAllStudentProfiles, useAllFaculty, useFeeRecords,
} from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, StatTile, Badge, PortalButton, PortalSelect, PortalLoading, EmptyState,
} from '../../components/portal-ui';

type ReportCategory = {
  id: string;
  title: string;
  description: string;
  icon: typeof Users;
  lastGenerated: string;
  count: number;
};

type RecentReport = {
  name: string;
  type: string;
  date: string;
  status: 'Ready' | 'Generating' | 'Failed';
};

// Simulated recent reports
const recentReports: RecentReport[] = [
  { name: 'Monthly Enrollment Summary', type: 'Enrollment', date: '2026-07-10', status: 'Ready' },
  { name: 'Q2 Financial Statement', type: 'Financial', date: '2026-07-08', status: 'Ready' },
  { name: 'Faculty Workload Report', type: 'Faculty', date: '2026-07-05', status: 'Ready' },
  { name: 'Annual Academic Performance', type: 'Academic', date: '2026-07-01', status: 'Generating' },
  { name: 'Infrastructure Audit', type: 'Infrastructure', date: '2026-06-28', status: 'Ready' },
  { name: 'Weekly Attendance Report', type: 'Attendance', date: '2026-06-25', status: 'Failed' },
];

function statusVariant(status: RecentReport['status']) {
  if (status === 'Ready') return 'success' as const;
  if (status === 'Generating') return 'info' as const;
  return 'error' as const;
}

export default function PrincipalReportsPage() {
  const { user } = useAuth();
  const { data: students, loading: lStudents } = useAllStudentProfiles();
  const { data: faculty, loading: lFaculty } = useAllFaculty();
  const { data: fees, loading: lFees } = useFeeRecords();

  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [scheduleReport, setScheduleReport] = useState('enrollment');
  const [frequency, setFrequency] = useState('weekly');

  if (!user) {
    navigateTo('/principal/login');
    return <PortalLoading />;
  }

  if (lStudents || lFaculty || lFees) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Reports Hub" subtitle="Generate and manage institutional reports" icon={FileBarChart} />
        <PortalLoading />
      </div>
    );
  }

  const totalCollected = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

  const categories: ReportCategory[] = [
    {
      id: 'enrollment',
      title: 'Enrollment',
      description: 'Student admissions, enrollment trends, and demographic breakdowns.',
      icon: Users,
      lastGenerated: '2026-07-10',
      count: students.length,
    },
    {
      id: 'financial',
      title: 'Financial',
      description: 'Fee collection, revenue, outstanding dues, and budget utilization.',
      icon: DollarSign,
      lastGenerated: '2026-07-08',
      count: fees.length,
    },
    {
      id: 'academic',
      title: 'Academic',
      description: 'Grades, performance distribution, and course completion rates.',
      icon: GraduationCap,
      lastGenerated: '2026-07-01',
      count: students.length,
    },
    {
      id: 'faculty',
      title: 'Faculty',
      description: 'Faculty workload, performance reviews, and departmental assignments.',
      icon: Users,
      lastGenerated: '2026-07-05',
      count: faculty.length,
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Daily, weekly, and monthly attendance trends across departments.',
      icon: CalendarCheck,
      lastGenerated: '2026-06-25',
      count: students.length,
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      description: 'Facility utilization, maintenance status, and asset inventory.',
      icon: Building2,
      lastGenerated: '2026-06-28',
      count: 42,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Reports Hub"
        subtitle="Generate, schedule, and export institutional reports"
        icon={FileBarChart}
        action={<Badge variant="warning"><FileBarChart size={12} className="mr-1" /> Reports</Badge>}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Students" value={students.length} icon={Users} color="blue" />
        <StatTile label="Faculty Members" value={faculty.length} icon={GraduationCap} color="teal" />
        <StatTile label="Fee Records" value={fees.length} icon={DollarSign} color="green" />
        <StatTile label="Revenue Collected" value={`$${totalCollected.toLocaleString()}`} icon={FileBarChart} color="gold" />
      </div>

      {/* Report categories grid */}
      <h2 className="text-lg font-bold text-ink-900 mb-4">Report Categories</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {categories.map((cat) => (
          <PortalCard key={cat.id} className="p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <cat.icon size={22} className="text-amber-600" />
              </div>
              <Badge variant="default">{cat.count} records</Badge>
            </div>
            <h3 className="text-base font-bold text-ink-900 mb-1">{cat.title}</h3>
            <p className="text-sm text-ink-500 mb-4 flex-1">{cat.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-ink-100">
              <div className="flex items-center gap-1.5 text-xs text-ink-500">
                <Clock size={12} />
                <span>Last: {cat.lastGenerated}</span>
              </div>
              <PortalButton variant="secondary" className="!px-3 !py-1.5 !text-xs">
                <FileText size={12} /> Generate
              </PortalButton>
            </div>
          </PortalCard>
        ))}
      </div>

      {/* Recent reports + Scheduler */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent reports */}
        <PortalCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-ink-900">Recent Reports</h3>
            <Badge variant="default">{recentReports.length} total</Badge>
          </div>
          <p className="text-sm text-ink-500 mb-6">Recently generated and scheduled reports</p>
          {recentReports.length === 0 ? (
            <EmptyState icon={FileText} title="No reports yet" message="Generated reports will appear here for download." />
          ) : (
            <div className="space-y-3">
              {recentReports.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-900 truncate">{r.name}</div>
                      <div className="text-xs text-ink-500">{r.type} · {r.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    <button
                      type="button"
                      disabled={r.status !== 'Ready'}
                      className="p-2 rounded-lg text-ink-500 hover:bg-amber-100 hover:text-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Download report"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* Report scheduler */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="text-amber-600" />
            <h3 className="text-lg font-bold text-ink-900">Report Scheduler</h3>
          </div>
          <p className="text-sm text-ink-500 mb-6">Automate recurring report generation</p>
          <div className="space-y-4">
            <PortalSelect
              label="Report Type"
              value={scheduleReport}
              onChange={setScheduleReport}
              options={[
                { value: 'enrollment', label: 'Enrollment Report' },
                { value: 'financial', label: 'Financial Report' },
                { value: 'academic', label: 'Academic Report' },
                { value: 'attendance', label: 'Attendance Report' },
                { value: 'faculty', label: 'Faculty Report' },
              ]}
            />
            <PortalSelect
              label="Frequency"
              value={frequency}
              onChange={setFrequency}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
              ]}
            />
            <PortalButton variant="primary" className="w-full">
              <Calendar size={14} /> Schedule Report
            </PortalButton>
          </div>
          {/* Scheduled list (simulated) */}
          <div className="mt-6 pt-4 border-t border-ink-100">
            <div className="text-xs font-semibold text-ink-700 mb-3">Active Schedules</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-600">Weekly Attendance</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-600">Monthly Financial</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-600">Quarterly Academic</span>
                <Badge variant="info">Paused</Badge>
              </div>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Export format options */}
      <PortalCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Download size={18} className="text-amber-600" />
          <h3 className="text-lg font-bold text-ink-900">Export Format</h3>
        </div>
        <p className="text-sm text-ink-500 mb-6">Choose the default format for generated reports</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { id: 'pdf', label: 'PDF Document', icon: FileType, desc: 'Portable, print-ready format' },
            { id: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, desc: 'Editable with formulas' },
            { id: 'csv', label: 'CSV Data', icon: FileText, desc: 'Raw data for import' },
          ].map((fmt) => {
            const active = exportFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setExportFormat(fmt.id as typeof exportFormat)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  active
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-ink-100 bg-white hover:border-ink-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-amber-500' : 'bg-ink-100'}`}>
                    <fmt.icon size={18} className={active ? 'text-white' : 'text-ink-500'} />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-amber-500 bg-amber-500' : 'border-ink-200'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="text-sm font-bold text-ink-900 mb-1">{fmt.label}</div>
                <div className="text-xs text-ink-500">{fmt.desc}</div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end mt-6 pt-4 border-t border-ink-100">
          <PortalButton variant="gold">
            <Download size={14} /> Export Selected Format
            <ChevronRight size={14} />
          </PortalButton>
        </div>
      </PortalCard>
    </div>
  );
}
