import {
  CalendarCheck, Users, UserCheck, UserX, Clock, TrendingDown, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { useAllStudentProfiles, useAllDepartments } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, StatTile, Badge, PortalLoading, EmptyState,
} from '../../components/portal-ui';

// Simulated attendance trend over the last 7 days
const trend7Days = [
  { day: 'Mon', rate: 95.8 },
  { day: 'Tue', rate: 93.1 },
  { day: 'Wed', rate: 94.5 },
  { day: 'Thu', rate: 92.3 },
  { day: 'Fri', rate: 96.2 },
  { day: 'Sat', rate: 91.4 },
  { day: 'Sun', rate: 89.8 },
];

// Simulated department-wise attendance comparison
const deptAttendance = [
  { name: 'Computer Science', rate: 96.4 },
  { name: 'Electrical Eng.', rate: 93.7 },
  { name: 'Mechanical Eng.', rate: 91.2 },
  { name: 'Civil Eng.', rate: 94.8 },
  { name: 'Mathematics', rate: 95.1 },
  { name: 'Physics', rate: 92.6 },
];

// Simulated attendance by day of week (Mon-Fri)
const dayOfWeekAttendance = [
  { day: 'Mon', rate: 95.2 },
  { day: 'Tue', rate: 93.8 },
  { day: 'Wed', rate: 94.6 },
  { day: 'Thu', rate: 92.1 },
  { day: 'Fri', rate: 90.4 },
];

// Simulated students with low attendance (<75%)
const lowAttendanceStudents = [
  { name: 'Aarav Sharma', id: 'STU-1024', rate: 68.4, department: 'Mechanical Eng.' },
  { name: 'Priya Patel', id: 'STU-1187', rate: 71.2, department: 'Electrical Eng.' },
  { name: 'Rohan Gupta', id: 'STU-1342', rate: 64.8, department: 'Civil Eng.' },
  { name: 'Sneha Reddy', id: 'STU-1456', rate: 73.6, department: 'Physics' },
  { name: 'Karan Mehta', id: 'STU-1589', rate: 69.1, department: 'Mathematics' },
  { name: 'Ananya Iyer', id: 'STU-1673', rate: 66.3, department: 'Computer Science' },
];

// Simulated class-wise attendance heatmap (rows = classes, cols = periods 1-6)
const heatmapClasses = ['CSE-3A', 'CSE-3B', 'ECE-2A', 'ME-2B', 'CE-4A', 'MTH-1A'];
const heatmapPeriods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
// Pre-generated simulated attendance percentages per cell
const heatmapData: number[][] = [
  [96, 92, 88, 94, 90, 85],
  [91, 87, 93, 89, 95, 82],
  [88, 94, 90, 86, 92, 79],
  [93, 89, 85, 91, 87, 94],
  [90, 86, 92, 88, 84, 90],
  [95, 91, 87, 93, 89, 86],
];

function heatColor(rate: number): string {
  if (rate >= 95) return 'bg-green-500 text-white';
  if (rate >= 90) return 'bg-teal-500 text-white';
  if (rate >= 85) return 'bg-amber-500 text-white';
  if (rate >= 80) return 'bg-amber-600 text-white';
  return 'bg-red-500 text-white';
}

export default function PrincipalAttendancePage() {
  const { user } = useAuth();
  const { data: students, loading: lStudents } = useAllStudentProfiles();
  const { data: departments, loading: lDepts } = useAllDepartments();

  if (!user) {
    navigateTo('/principal/login');
    return <PortalLoading />;
  }

  if (lStudents || lDepts) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Attendance Overview" subtitle="Institution-wide attendance analytics" icon={CalendarCheck} />
        <PortalLoading />
      </div>
    );
  }

  const totalStudents = students.length || 248;
  // Simulated headline stats
  const overallRate = 94.2;
  const presentToday = Math.round(totalStudents * 0.942);
  const absentToday = totalStudents - presentToday;
  const lateArrivals = Math.round(totalStudents * 0.038);

  const maxTrend = 100;
  const maxDept = Math.max(...deptAttendance.map((d) => d.rate), 1);
  const maxDow = Math.max(...dayOfWeekAttendance.map((d) => d.rate), 1);

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Attendance Overview"
        subtitle="Institution-wide attendance analytics and insights"
        icon={CalendarCheck}
        action={<Badge variant="warning"><CalendarCheck size={12} className="mr-1" /> Live</Badge>}
      />

      {/* Headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Overall Attendance Rate" value={`${overallRate}%`} icon={CalendarCheck} color="gold" />
        <StatTile label="Present Today" value={presentToday} icon={UserCheck} color="green" />
        <StatTile label="Absent Today" value={absentToday} icon={UserX} color="red" />
        <StatTile label="Late Arrivals" value={lateArrivals} icon={Clock} color="blue" />
      </div>

      {/* Trend + Day-of-week */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* 7-day trend */}
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-1">Attendance Trend</h3>
          <p className="text-sm text-ink-500 mb-6">Daily attendance rate over the last 7 days</p>
          <div className="flex items-end justify-between gap-3 h-48">
            {trend7Days.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500 hover:from-amber-700 hover:to-amber-500"
                    style={{ height: `${(d.rate / maxTrend) * 100}%` }}
                    title={`${d.rate}%`}
                  />
                </div>
                <span className="text-xs text-ink-500 font-medium">{d.day}</span>
                <span className="text-xs font-bold text-ink-900">{d.rate}%</span>
              </div>
            ))}
          </div>
        </PortalCard>

        {/* Day of week */}
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-1">Attendance by Day of Week</h3>
          <p className="text-sm text-ink-500 mb-6">Average attendance rate, Monday through Friday</p>
          <div className="flex items-end justify-between gap-4 h-48">
            {dayOfWeekAttendance.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400 transition-all duration-500 hover:from-teal-700 hover:to-teal-500"
                    style={{ height: `${(d.rate / maxDow) * 100}%` }}
                    title={`${d.rate}%`}
                  />
                </div>
                <span className="text-xs text-ink-500 font-medium">{d.day}</span>
                <span className="text-xs font-bold text-ink-900">{d.rate}%</span>
              </div>
            ))}
          </div>
        </PortalCard>
      </div>

      {/* Department-wise comparison */}
      <PortalCard className="p-6 mb-6">
        <h3 className="text-lg font-bold text-ink-900 mb-1">Department-wise Attendance</h3>
        <p className="text-sm text-ink-500 mb-6">Average attendance rate comparison across departments</p>
        {departments.length === 0 && deptAttendance.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No data available" message="Department attendance data will appear here once available." />
        ) : (
          <div className="space-y-4">
            {deptAttendance.map((d) => (
              <div key={d.name} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4 text-sm font-medium text-ink-900 truncate">{d.name}</div>
                <div className="col-span-6">
                  <div className="w-full h-6 rounded-lg bg-ink-100 overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-amber-600 to-amber-400 flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(d.rate / maxDept) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{d.rate}%</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  {d.rate >= 95 ? (
                    <Badge variant="success">Excellent</Badge>
                  ) : d.rate >= 92 ? (
                    <Badge variant="info">Good</Badge>
                  ) : (
                    <Badge variant="warning">Watch</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Low attendance students + Heatmap */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Low attendance students */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-lg font-bold text-ink-900">Students with Low Attendance</h3>
          </div>
          <p className="text-sm text-ink-500 mb-6">Students below the 75% attendance threshold</p>
          {lowAttendanceStudents.length === 0 ? (
            <EmptyState icon={Users} title="All clear" message="No students are currently below the attendance threshold." />
          ) : (
            <div className="space-y-3">
              {lowAttendanceStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <TrendingDown size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{s.name}</div>
                      <div className="text-xs text-ink-500">{s.id} · {s.department}</div>
                    </div>
                  </div>
                  <Badge variant={s.rate < 65 ? 'error' : 'warning'}>{s.rate}%</Badge>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* Class-wise heatmap */}
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-1">Class-wise Attendance Heatmap</h3>
          <p className="text-sm text-ink-500 mb-6">Attendance rate by class and period (today)</p>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-xs text-ink-500 font-medium text-left pb-2 pr-2">Class</th>
                  {heatmapPeriods.map((p) => (
                    <th key={p} className="text-xs text-ink-500 font-medium pb-2 text-center">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapClasses.map((cls, rIdx) => (
                  <tr key={cls}>
                    <td className="text-xs font-semibold text-ink-700 pr-2 py-1 whitespace-nowrap">{cls}</td>
                    {heatmapPeriods.map((_, cIdx) => {
                      const rate = heatmapData[rIdx][cIdx];
                      return (
                        <td key={cIdx} className="text-center">
                          <div
                            className={`w-full h-9 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${heatColor(rate)}`}
                            title={`${cls} · ${heatmapPeriods[cIdx]}: ${rate}%`}
                          >
                            {rate}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /><span className="text-xs text-ink-500">≥95%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500" /><span className="text-xs text-ink-500">90-94%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" /><span className="text-xs text-ink-500">85-89%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-600" /><span className="text-xs text-ink-500">80-84%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-ink-500">&lt;80%</span></div>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
