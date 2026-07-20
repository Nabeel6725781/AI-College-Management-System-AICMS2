import {
  Lightbulb, Users, GraduationCap, DollarSign, Building2, Cpu, TrendingUp,
  AlertTriangle, Clock, ArrowRight, Sparkles, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { useAllStudentProfiles, useFeeRecords } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, StatTile, Badge, PortalButton, PortalLoading, EmptyState,
} from '../../components/portal-ui';

type Priority = 'critical' | 'high' | 'medium' | 'low';

type Recommendation = {
  id: string;
  priority: Priority;
  category: string;
  icon: typeof Users;
  title: string;
  description: string;
  impact: string;
  timeline: string;
};

const priorityConfig: Record<Priority, { variant: 'error' | 'warning' | 'info' | 'success'; label: string; dot: string }> = {
  critical: { variant: 'error', label: 'Critical', dot: 'bg-red-500' },
  high: { variant: 'warning', label: 'High', dot: 'bg-amber-500' },
  medium: { variant: 'info', label: 'Medium', dot: 'bg-blue-500' },
  low: { variant: 'success', label: 'Low', dot: 'bg-green-500' },
};

// Simulated strategic recommendations
const recommendations: Recommendation[] = [
  {
    id: 'r1',
    priority: 'critical',
    category: 'Enrollment',
    icon: Users,
    title: 'Reverse Declining CS Enrollment',
    description: 'Computer Science enrollment has dropped 14% year-over-year. Launch a targeted outreach campaign with high school partnerships and offer early-decision scholarships to stabilize the pipeline.',
    impact: '+18% projected enrollment',
    timeline: 'Q1-Q2',
  },
  {
    id: 'r2',
    priority: 'high',
    category: 'Financial',
    icon: DollarSign,
    title: 'Improve Fee Collection Rate',
    description: 'Outstanding fees have grown to 22% of total billed. Implement automated payment reminders, flexible installment plans, and a 5% early-payment discount to accelerate collection.',
    impact: '+$340K recovered',
    timeline: 'Q1',
  },
  {
    id: 'r3',
    priority: 'high',
    category: 'Academic',
    icon: GraduationCap,
    title: 'Introduce Remedial Math Program',
    description: '31% of first-year students are scoring below threshold in foundational math. A structured remedial track with peer tutoring could lift pass rates significantly before semester-end exams.',
    impact: '+12% pass rate',
    timeline: 'Q1-Q2',
  },
  {
    id: 'r4',
    priority: 'medium',
    category: 'Faculty',
    icon: Users,
    title: 'Rebalance Faculty Workload',
    description: 'Two departments show a faculty-to-student ratio above 22:1 while others sit below 12:1. Reassigning 3 faculty members and hiring 2 adjuncts would bring all departments within target range.',
    impact: 'Ratio normalized to 16:1',
    timeline: 'Q2',
  },
  {
    id: 'r5',
    priority: 'medium',
    category: 'Infrastructure',
    icon: Building2,
    title: 'Upgrade Lab Equipment',
    description: 'Physics and Electronics labs are operating with equipment over 8 years old. A phased replacement plan would improve lab utilization and student satisfaction scores.',
    impact: '+24% lab utilization',
    timeline: 'Q2-Q3',
  },
  {
    id: 'r6',
    priority: 'medium',
    category: 'Technology',
    icon: Cpu,
    title: 'Deploy Learning Analytics Platform',
    description: 'Adopt an AI-driven learning analytics tool to identify at-risk students earlier. Pilot with 2 departments, then scale institution-wide based on outcomes.',
    impact: 'Early intervention +35%',
    timeline: 'Q2-Q3',
  },
  {
    id: 'r7',
    priority: 'low',
    category: 'Academic',
    icon: GraduationCap,
    title: 'Expand Elective Course Catalog',
    description: 'Student surveys show demand for 6 additional elective courses in data science and sustainability. Adding these would improve student satisfaction and retention.',
    impact: '+8% satisfaction score',
    timeline: 'Q3',
  },
  {
    id: 'r8',
    priority: 'low',
    category: 'Technology',
    icon: Cpu,
    title: 'Migrate to Cloud-Based LMS',
    description: 'The on-premise learning management system has had 3 outages this year. Migrating to a cloud-hosted LMS would improve uptime and reduce maintenance overhead.',
    impact: '99.9% uptime target',
    timeline: 'Q3-Q4',
  },
];

// Implementation roadmap by quarter
const roadmap: { quarter: string; items: { title: string; category: string; icon: typeof Users }[] }[] = [
  {
    quarter: 'Q1',
    items: [
      { title: 'Launch CS outreach campaign', category: 'Enrollment', icon: Users },
      { title: 'Automated fee reminders live', category: 'Financial', icon: DollarSign },
      { title: 'Remedial math program pilot', category: 'Academic', icon: GraduationCap },
    ],
  },
  {
    quarter: 'Q2',
    items: [
      { title: 'Faculty workload rebalancing', category: 'Faculty', icon: Users },
      { title: 'Lab equipment phase 1', category: 'Infrastructure', icon: Building2 },
      { title: 'Learning analytics pilot', category: 'Technology', icon: Cpu },
    ],
  },
  {
    quarter: 'Q3',
    items: [
      { title: 'New electives launched', category: 'Academic', icon: GraduationCap },
      { title: 'Lab equipment phase 2', category: 'Infrastructure', icon: Building2 },
      { title: 'LMS migration begins', category: 'Technology', icon: Cpu },
    ],
  },
  {
    quarter: 'Q4',
    items: [
      { title: 'Analytics platform scaled', category: 'Technology', icon: Cpu },
      { title: 'Annual enrollment review', category: 'Enrollment', icon: Users },
      { title: 'LMS migration complete', category: 'Technology', icon: Cpu },
    ],
  },
];

// Risk assessment matrix: rows = impact (Low/Med/High), cols = likelihood (Low/Med/High)
// Each cell contains simulated risks with a severity color
type RiskDot = { label: string; severity: 'low' | 'medium' | 'high' | 'critical' };
const riskMatrix: RiskDot[][][] = [
  // Impact: Low
  [
    [], // Likelihood: Low
    [{ label: 'Elective demand unmet', severity: 'low' }], // Likelihood: Med
    [{ label: 'LMS minor outages', severity: 'medium' }], // Likelihood: High
  ],
  // Impact: Medium
  [
    [{ label: 'Lab equipment aging', severity: 'medium' }], // Likelihood: Low
    [{ label: 'Faculty imbalance', severity: 'medium' }], // Likelihood: Med
    [{ label: 'Fee collection delays', severity: 'high' }], // Likelihood: High
  ],
  // Impact: High
  [
    [{ label: 'CS enrollment drop', severity: 'high' }], // Likelihood: Low
    [{ label: 'Math pass rates', severity: 'high' }], // Likelihood: Med
    [{ label: 'Revenue shortfall', severity: 'critical' }], // Likelihood: High
  ],
];

const riskColor: Record<RiskDot['severity'], string> = {
  low: 'bg-green-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function PrincipalRecommendationsPage() {
  const { user } = useAuth();
  const { data: students, loading: lStudents } = useAllStudentProfiles();
  const { data: fees, loading: lFees } = useFeeRecords();

  if (!user) {
    navigateTo('/principal/login');
    return <PortalLoading />;
  }

  if (lStudents || lFees) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Strategic Recommendations" subtitle="AI-generated strategic recommendations" icon={Lightbulb} />
        <PortalLoading />
      </div>
    );
  }

  const totalOutstanding = fees.reduce((sum, f) => sum + ((f.amount || 0) - (f.paid_amount || 0)), 0);

  const sortedRecs = [...recommendations].sort((a, b) => {
    const order: Priority[] = ['critical', 'high', 'medium', 'low'];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="AI-Generated Strategic Recommendations"
        subtitle="Data-driven recommendations to guide institutional strategy"
        icon={Lightbulb}
        action={<Badge variant="warning"><Sparkles size={12} className="mr-1" /> AI Powered</Badge>}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Recommendations" value={recommendations.length} icon={Lightbulb} color="gold" />
        <StatTile label="Critical Priority" value={recommendations.filter((r) => r.priority === 'critical').length} icon={AlertTriangle} color="red" />
        <StatTile label="Students Analyzed" value={students.length} icon={Users} color="blue" />
        <StatTile label="Revenue at Stake" value={`$${(totalOutstanding / 1000).toFixed(0)}K`} icon={DollarSign} color="green" />
      </div>

      {/* Priority recommendations */}
      <h2 className="text-lg font-bold text-ink-900 mb-4">Priority Recommendations</h2>
      {sortedRecs.length === 0 ? (
        <PortalCard className="p-6 mb-6">
          <EmptyState icon={Lightbulb} title="No recommendations" message="Strategic recommendations will appear here once data is analyzed." />
        </PortalCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {sortedRecs.map((rec) => {
            const cfg = priorityConfig[rec.priority];
            return (
              <PortalCard key={rec.id} className="p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                      <rec.icon size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs text-ink-500">{rec.category}</div>
                      <h3 className="text-base font-bold text-ink-900 leading-tight">{rec.title}</h3>
                    </div>
                  </div>
                  <Badge variant={cfg.variant}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-sm text-ink-600 mb-4 flex-1">{rec.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-ink-50">
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1">
                      <TrendingUp size={12} /> Expected Impact
                    </div>
                    <div className="text-sm font-bold text-ink-900">{rec.impact}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-ink-50">
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1">
                      <Clock size={12} /> Timeline
                    </div>
                    <div className="text-sm font-bold text-ink-900">{rec.timeline}</div>
                  </div>
                </div>
                <div className="flex items-center justify-end pt-3 border-t border-ink-100">
                  <PortalButton variant="secondary" className="!px-4 !py-2 !text-xs">
                    Take Action <ArrowRight size={12} />
                  </PortalButton>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}

      {/* Implementation roadmap */}
      <h2 className="text-lg font-bold text-ink-900 mb-4">Implementation Roadmap</h2>
      <PortalCard className="p-6 mb-8">
        <p className="text-sm text-ink-500 mb-6">Recommended initiatives sequenced across fiscal quarters</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmap.map((q, i) => (
            <div key={q.quarter} className="relative">
              {/* Connector line */}
              {i < roadmap.length - 1 && (
                <div className="hidden lg:block absolute top-5 -right-2 w-4 h-0.5 bg-amber-300" />
              )}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                  {q.quarter}
                </div>
                <div className="text-sm font-semibold text-ink-900">Quarter {q.quarter.replace('Q', '')}</div>
              </div>
              <div className="space-y-2.5">
                {q.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 p-2.5 rounded-lg bg-ink-50 border border-ink-100">
                    <item.icon size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-ink-900 leading-tight">{item.title}</div>
                      <div className="text-xs text-ink-500">{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PortalCard>

      {/* Risk assessment matrix */}
      <h2 className="text-lg font-bold text-ink-900 mb-4">Risk Assessment Matrix</h2>
      <PortalCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={18} className="text-amber-600" />
          <p className="text-sm text-ink-500">Impact vs. likelihood analysis of identified risks</p>
        </div>
        <div className="mt-6 flex">
          {/* Y-axis label */}
          <div className="flex flex-col items-center justify-center pr-3">
            <div className="text-xs font-semibold text-ink-700 -rotate-90 whitespace-nowrap">Impact →</div>
          </div>
          {/* Matrix grid */}
          <div className="flex-1">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1">
              {/* Header row */}
              <div />
              <div className="text-xs text-center text-ink-500 font-medium pb-2">Low Likelihood</div>
              <div className="text-xs text-center text-ink-500 font-medium pb-2">Medium</div>
              <div className="text-xs text-center text-ink-500 font-medium pb-2">High Likelihood</div>
              {/* Row: High impact */}
              <div className="text-xs text-ink-500 font-medium flex items-center pr-2">High</div>
              {riskMatrix[2].map((cell, c) => (
                <div key={`h-${c}`} className="min-h-[80px] p-2 rounded-lg bg-ink-50 border border-ink-100 flex flex-wrap content-start gap-1.5">
                  {cell.map((risk, k) => (
                    <div key={k} className="flex items-center gap-1.5 bg-white rounded-full pl-1.5 pr-2.5 py-1 border border-ink-100">
                      <span className={`w-2.5 h-2.5 rounded-full ${riskColor[risk.severity]}`} />
                      <span className="text-xs text-ink-700">{risk.label}</span>
                    </div>
                  ))}
                </div>
              ))}
              {/* Row: Medium impact */}
              <div className="text-xs text-ink-500 font-medium flex items-center pr-2">Medium</div>
              {riskMatrix[1].map((cell, c) => (
                <div key={`m-${c}`} className="min-h-[80px] p-2 rounded-lg bg-ink-50 border border-ink-100 flex flex-wrap content-start gap-1.5">
                  {cell.map((risk, k) => (
                    <div key={k} className="flex items-center gap-1.5 bg-white rounded-full pl-1.5 pr-2.5 py-1 border border-ink-100">
                      <span className={`w-2.5 h-2.5 rounded-full ${riskColor[risk.severity]}`} />
                      <span className="text-xs text-ink-700">{risk.label}</span>
                    </div>
                  ))}
                </div>
              ))}
              {/* Row: Low impact */}
              <div className="text-xs text-ink-500 font-medium flex items-center pr-2">Low</div>
              {riskMatrix[0].map((cell, c) => (
                <div key={`l-${c}`} className="min-h-[80px] p-2 rounded-lg bg-ink-50 border border-ink-100 flex flex-wrap content-start gap-1.5">
                  {cell.map((risk, k) => (
                    <div key={k} className="flex items-center gap-1.5 bg-white rounded-full pl-1.5 pr-2.5 py-1 border border-ink-100">
                      <span className={`w-2.5 h-2.5 rounded-full ${riskColor[risk.severity]}`} />
                      <span className="text-xs text-ink-700">{risk.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* X-axis label */}
            <div className="text-xs font-semibold text-ink-700 text-center mt-3">Likelihood →</div>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-ink-500">Low</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-ink-500">Medium</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-xs text-ink-500">High</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-ink-500">Critical</span></div>
        </div>
      </PortalCard>
    </div>
  );
}
