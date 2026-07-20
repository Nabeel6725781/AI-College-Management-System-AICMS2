import {
  Target, Users, GraduationCap, DollarSign, TrendingUp, TrendingDown,
  Award, Library, CheckCircle, Smile, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  useAllStudentProfiles, useAllFaculty, useFeeRecords,
  useScholarships, useLibraryBooks,
} from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalLoading, Badge,
} from '../../components/portal-ui';

type Kpi = {
  name: string;
  current: number;
  target: number;
  unit: string;
  displayValue: string;
  icon: typeof Users;
  trend: number;
  trendUp: boolean;
};

export default function PrincipalKpisPage() {
  const { data: students, loading: studentsLoading } = useAllStudentProfiles();
  const { data: faculty, loading: facultyLoading } = useAllFaculty();
  const { data: fees, loading: feesLoading } = useFeeRecords();
  const { data: scholarships, loading: scholarshipsLoading } = useScholarships();
  const { data: books, loading: booksLoading } = useLibraryBooks();

  const loading =
    studentsLoading || facultyLoading || feesLoading || scholarshipsLoading || booksLoading;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalLoading />
      </div>
    );
  }

  const totalRevenue = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const totalBookCopies = books.reduce((sum, b) => sum + (b.total_copies || 0), 0);
  const availableCopies = books.reduce((sum, b) => sum + (b.available_copies || 0), 0);
  const libraryUtilization =
    totalBookCopies > 0
      ? ((totalBookCopies - availableCopies) / totalBookCopies) * 100
      : 0;

  const kpis: Kpi[] = [
    {
      name: 'Student Enrollment',
      current: students.length,
      target: 5000,
      unit: '',
      displayValue: students.length.toLocaleString(),
      icon: Users,
      trend: 8.2,
      trendUp: true,
    },
    {
      name: 'Faculty Count',
      current: faculty.length,
      target: 100,
      unit: '',
      displayValue: faculty.length.toString(),
      icon: GraduationCap,
      trend: 3.5,
      trendUp: true,
    },
    {
      name: 'Revenue Collection',
      current: totalRevenue,
      target: 500000,
      unit: '$',
      displayValue: `$${(totalRevenue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      trend: 12.4,
      trendUp: true,
    },
    {
      name: 'Attendance Rate',
      current: 94.2,
      target: 95,
      unit: '%',
      displayValue: '94.2%',
      icon: CheckCircle,
      trend: 1.3,
      trendUp: true,
    },
    {
      name: 'Pass Rate',
      current: 87.5,
      target: 90,
      unit: '%',
      displayValue: '87.5%',
      icon: TrendingUp,
      trend: 2.1,
      trendUp: true,
    },
    {
      name: 'Scholarship Awards',
      current: scholarships.length,
      target: 50,
      unit: '',
      displayValue: scholarships.length.toString(),
      icon: Award,
      trend: 5.0,
      trendUp: true,
    },
    {
      name: 'Library Utilization',
      current: libraryUtilization,
      target: 80,
      unit: '%',
      displayValue: `${libraryUtilization.toFixed(1)}%`,
      icon: Library,
      trend: 3.8,
      trendUp: true,
    },
    {
      name: 'Student Satisfaction',
      current: 4.2,
      target: 4.5,
      unit: '/5',
      displayValue: '4.2/5',
      icon: Smile,
      trend: 1.2,
      trendUp: false,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Key Performance Indicators"
        subtitle="Strategic targets and institutional performance metrics"
        icon={Target}
      />

      {/* Summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
          <div className="text-xs text-amber-700 font-medium uppercase tracking-wide">On Target</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {kpis.filter((k) => (k.current / k.target) * 100 >= 100).length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
          <div className="text-xs text-teal-700 font-medium uppercase tracking-wide">Above 80%</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">
            {kpis.filter((k) => (k.current / k.target) * 100 >= 80).length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
          <div className="text-xs text-ink-700 font-medium uppercase tracking-wide">Needs Attention</div>
          <div className="text-2xl font-bold text-ink-700 mt-1">
            {kpis.filter((k) => (k.current / k.target) * 100 < 80).length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-100">
          <div className="text-xs text-green-700 font-medium uppercase tracking-wide">Trending Up</div>
          <div className="text-2xl font-bold text-green-700 mt-1">
            {kpis.filter((k) => k.trendUp).length}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const percentage = Math.min((kpi.current / kpi.target) * 100, 100);
          const actualPct = (kpi.current / kpi.target) * 100;
          const isOnTarget = actualPct >= 100;
          const isAbove80 = actualPct >= 80;

          return (
            <PortalCard key={kpi.name} className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center">
                  <kpi.icon className="text-amber-400" size={20} />
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    kpi.trendUp
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {kpi.trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {kpi.trend}%
                </div>
              </div>

              {/* Value */}
              <div className="text-3xl font-bold text-ink-900">{kpi.displayValue}</div>
              <div className="text-sm text-ink-500 mt-1">{kpi.name}</div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-ink-500">Progress</span>
                  <span className="text-xs font-medium text-ink-700">
                    {actualPct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Target */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-500">
                  Target: {kpi.unit === '$' ? '$' : ''}
                  {kpi.target.toLocaleString()}
                  {kpi.unit && kpi.unit !== '$' ? kpi.unit : ''}
                </span>
                <Badge variant={isOnTarget ? 'success' : isAbove80 ? 'warning' : 'error'}>
                  {isOnTarget ? 'On Target' : isAbove80 ? 'Near Target' : 'Below'}
                </Badge>
              </div>
            </PortalCard>
          );
        })}
      </div>

      {/* Trend legend */}
      <div className="mt-8 flex items-center gap-6 text-sm text-ink-500">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-500" />
          <span>Trending up from last period</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-red-500" />
          <span>Trending down from last period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Progress toward target</span>
        </div>
      </div>
    </div>
  );
}
