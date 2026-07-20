import { useState } from 'react';
import {
  ScanLine,
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Cpu,
  Copy,
  TrendingUp,
  ArrowRight,
  Camera,
  Award,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import {
  PortalCard,
  PortalPageHeader,
  PortalButton,
  Badge,
  StatTile,
  EmptyState,
  PortalLoading,
} from '../../components/portal-ui';

type ScanStatus = 'verified' | 'pending' | 'failed';
type DocType = 'transcript' | 'certificate' | 'id-card' | 'receipt';

type RecentScan = {
  id: string;
  name: string;
  type: DocType;
  accuracy: number;
  status: ScanStatus;
  timestamp: string;
};

type PipelineStage = {
  label: string;
  icon: LucideIcon;
  status: 'complete' | 'active' | 'pending';
};

type TrendPoint = {
  day: string;
  value: number;
};

type TypeCount = {
  type: DocType;
  label: string;
  count: number;
  color: string;
};

export default function AiDashboardPage() {
  const { user } = useAuth();
  const [loading] = useState(false);

  const [stats] = useState({
    scanned: 1247,
    accuracy: 96.8,
    pending: 23,
    verifiedToday: 89,
  });

  const [pipeline] = useState<PipelineStage[]>([
    { label: 'Upload', icon: Upload, status: 'complete' },
    { label: 'Preprocess', icon: Cpu, status: 'complete' },
    { label: 'Extract', icon: ScanLine, status: 'active' },
    { label: 'Verify', icon: ShieldCheck, status: 'pending' },
    { label: 'Complete', icon: CheckCircle, status: 'pending' },
  ]);

  const [recentScans] = useState<RecentScan[]>([
    { id: '1', name: 'Transcript_JSmith_2024.pdf', type: 'transcript', accuracy: 98.2, status: 'verified', timestamp: '2 min ago' },
    { id: '2', name: 'Certificate_MathOlympiad.jpg', type: 'certificate', accuracy: 94.5, status: 'pending', timestamp: '8 min ago' },
    { id: '3', name: 'StudentID_202400123.png', type: 'id-card', accuracy: 99.1, status: 'verified', timestamp: '15 min ago' },
    { id: '4', name: 'Receipt_Tuition_Fall.pdf', type: 'receipt', accuracy: 87.3, status: 'failed', timestamp: '22 min ago' },
    { id: '5', name: 'Transcript_AGarcia.pdf', type: 'transcript', accuracy: 96.7, status: 'verified', timestamp: '35 min ago' },
    { id: '6', name: 'Certificate_Graduation_HSU.jpg', type: 'certificate', accuracy: 95.8, status: 'pending', timestamp: '48 min ago' },
    { id: '7', name: 'StudentID_202400456.png', type: 'id-card', accuracy: 97.4, status: 'verified', timestamp: '1 hr ago' },
    { id: '8', name: 'Receipt_LibraryFine.pdf', type: 'receipt', accuracy: 92.1, status: 'verified', timestamp: '1 hr ago' },
  ]);

  const [trends] = useState<TrendPoint[]>([
    { day: 'Mon', value: 94 },
    { day: 'Tue', value: 96 },
    { day: 'Wed', value: 93 },
    { day: 'Thu', value: 97 },
    { day: 'Fri', value: 98 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 97 },
  ]);

  const [typeDistribution] = useState<TypeCount[]>([
    { type: 'transcript', label: 'Transcripts', count: 542, color: 'bg-teal-500' },
    { type: 'certificate', label: 'Certificates', count: 318, color: 'bg-cyan-500' },
    { type: 'id-card', label: 'ID Cards', count: 247, color: 'bg-teal-400' },
    { type: 'receipt', label: 'Receipts', count: 140, color: 'bg-cyan-400' },
  ]);

  const statusVariant = (s: ScanStatus) =>
    s === 'verified' ? 'success' : s === 'pending' ? 'warning' : 'error';

  const statusIcon = (s: ScanStatus): LucideIcon =>
    s === 'verified' ? CheckCircle : s === 'pending' ? Clock : XCircle;

  const docTypeBadge = (t: DocType) => {
    const labels: Record<DocType, string> = {
      transcript: 'Transcript',
      certificate: 'Certificate',
      'id-card': 'ID Card',
      receipt: 'Receipt',
    };
    return labels[t];
  };

  const maxTrend = Math.max(...trends.map((t) => t.value));
  const minTrend = Math.min(...trends.map((t) => t.value));
  const maxCount = Math.max(...typeDistribution.map((t) => t.count));

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="OCR Dashboard"
        subtitle="AI-powered document scanning, extraction, and verification overview"
        icon={ScanLine}
        action={
          <PortalButton onClick={() => navigateTo('/ai/scanner')}>
            <ScanLine size={16} /> New Scan
          </PortalButton>
        }
      />

      {/* Gradient accent banner */}
      <div className="rounded-2xl p-6 mb-6 bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Cpu size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">OCR Engine Online</h3>
            <p className="text-sm text-cyan-50 mt-0.5">
              Processing pipeline active · {user?.email ?? 'guest'} · Model v4.2.1
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" />
            <span className="text-sm font-medium">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Documents Scanned" value={stats.scanned.toLocaleString()} icon={FileText} color="teal" />
        <StatTile label="Avg Accuracy" value={`${stats.accuracy}%`} icon={TrendingUp} color="teal" />
        <StatTile label="Pending Review" value={stats.pending} icon={Clock} color="gold" />
        <StatTile label="Verified Today" value={stats.verifiedToday} icon={CheckCircle} color="green" />
      </div>

      {/* Pipeline flow diagram */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink-900">OCR Processing Pipeline</h3>
          <Badge variant="info">Live</Badge>
        </div>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {pipeline.map((stage, i) => {
            const StatusIcon = stage.icon;
            const isActive = stage.status === 'active';
            const isComplete = stage.status === 'complete';
            return (
              <div key={stage.label} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-2 min-w-[90px]">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isComplete
                        ? 'bg-teal-500 text-white'
                        : isActive
                          ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white ring-4 ring-cyan-100 animate-pulse'
                          : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    <StatusIcon size={24} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isComplete || isActive ? 'text-ink-900' : 'text-ink-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-cyan-600 font-semibold uppercase tracking-wide">
                      Processing
                    </span>
                  )}
                  {isComplete && (
                    <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wide">
                      Done
                    </span>
                  )}
                </div>
                {i < pipeline.length - 1 && (
                  <div className="flex items-center mx-1">
                    <div
                      className={`h-0.5 w-8 rounded-full ${
                        isComplete ? 'bg-teal-500' : 'bg-ink-200'
                      }`}
                    />
                    <ArrowRight
                      size={14}
                      className={isComplete ? 'text-teal-500' : 'text-ink-300'}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PortalCard>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Accuracy trends - line chart */}
        <PortalCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-ink-900">Accuracy Trends</h3>
              <p className="text-xs text-ink-500 mt-0.5">OCR accuracy over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-teal-600" />
              <span className="font-semibold text-teal-600">+3.0%</span>
              <span className="text-ink-400">vs last week</span>
            </div>
          </div>
          {/* CSS line chart */}
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {trends.map((point, i) => {
              const range = maxTrend - minTrend;
              const normalized = range === 0 ? 60 : ((point.value - minTrend) / range) * 60 + 30;
              const isLast = i === trends.length - 1;
              return (
                <div key={point.day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '160px' }}>
                    {/* line segment */}
                    <div
                      className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${normalized}%`,
                        background: isLast
                          ? 'linear-gradient(to top, #0e7490, #14b8a6)'
                          : 'linear-gradient(to top, #99f6e4, #5eead4)',
                      }}
                    />
                    {/* value label */}
                    <span className="absolute -top-1 text-xs font-bold text-ink-700 bg-white px-1.5 py-0.5 rounded shadow-sm">
                      {point.value}%
                    </span>
                  </div>
                  <span className="text-xs text-ink-500 font-medium">{point.day}</span>
                </div>
              );
            })}
          </div>
        </PortalCard>

        {/* Document type distribution - horizontal bar chart */}
        <PortalCard className="p-6">
          <h3 className="font-bold text-ink-900 mb-1">Document Type Distribution</h3>
          <p className="text-xs text-ink-500 mb-5">Count by document category</p>
          <div className="space-y-4">
            {typeDistribution.map((t) => (
              <div key={t.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink-700">{t.label}</span>
                  <span className="text-sm font-bold text-ink-900">{t.count}</span>
                </div>
                <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${t.color}`}
                    style={{ width: `${(t.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-ink-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Total documents</span>
              <span className="font-bold text-ink-900">
                {typeDistribution.reduce((sum, t) => sum + t.count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Recent scans table */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink-900">Recent Scans</h3>
          <PortalButton variant="ghost" onClick={() => navigateTo('/ai/scanner')}>
            View all <ArrowRight size={14} />
          </PortalButton>
        </div>
        {recentScans.length === 0 ? (
          <EmptyState icon={ScanLine} title="No scans yet" message="Documents you scan will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-500 border-b border-ink-100">
                  <th className="pb-3 font-medium">Document</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Accuracy</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => {
                  const SIcon = statusIcon(scan.status);
                  return (
                    <tr key={scan.id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={15} className="text-ink-500" />
                          </div>
                          <span className="font-medium text-ink-900 truncate max-w-[200px]">{scan.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="default">{docTypeBadge(scan.type)}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                scan.accuracy >= 95 ? 'bg-teal-500' : scan.accuracy >= 90 ? 'bg-cyan-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${scan.accuracy}%` }}
                            />
                          </div>
                          <span className="font-medium text-ink-700">{scan.accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <SIcon
                            size={14}
                            className={
                              scan.status === 'verified'
                                ? 'text-green-600'
                                : scan.status === 'pending'
                                  ? 'text-amber-500'
                                  : 'text-red-500'
                            }
                          />
                          <Badge variant={statusVariant(scan.status)}>
                            {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                          </Badge>
                        </span>
                      </td>
                      <td className="py-3 text-right text-ink-500">{scan.timestamp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>

      {/* Quick actions */}
      <PortalCard className="p-6">
        <h3 className="font-bold text-ink-900 mb-5">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigateTo('/ai/scanner')}
            className="group flex flex-col items-start gap-3 p-5 rounded-xl border border-ink-100 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Camera size={22} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-ink-900 group-hover:text-teal-700 transition-colors">Document Scanner</h4>
              <p className="text-xs text-ink-500 mt-0.5">Scan and extract text from documents</p>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/ai/certificate')}
            className="group flex flex-col items-start gap-3 p-5 rounded-xl border border-ink-100 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Award size={22} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-ink-900 group-hover:text-teal-700 transition-colors">Certificate Verification</h4>
              <p className="text-xs text-ink-500 mt-0.5">Verify authenticity of certificates</p>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/ai/timetable')}
            className="group flex flex-col items-start gap-3 p-5 rounded-xl border border-ink-100 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Calendar size={22} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-ink-900 group-hover:text-teal-700 transition-colors">Timetable Generator</h4>
              <p className="text-xs text-ink-500 mt-0.5">Generate optimized class schedules</p>
            </div>
          </button>
        </div>
      </PortalCard>
    </div>
  );
}
