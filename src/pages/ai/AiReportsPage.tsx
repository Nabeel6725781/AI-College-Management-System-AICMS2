import { useState, useRef, useEffect } from 'react';
import {
  FileBarChart, Sparkles, Download, TrendingUp, TrendingDown,
  Lightbulb, CheckCircle2, Loader2, FileText, DollarSign, Users,
  GraduationCap, Activity, BarChart3, Clock, Zap, ArrowUp,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalSelect, Badge, EmptyState,
} from '../../components/portal-ui';

type Step = {
  label: string;
  icon: typeof Activity;
};

const STEPS: Step[] = [
  { label: 'Data Aggregation', icon: BarChart3 },
  { label: 'Pattern Recognition', icon: Activity },
  { label: 'Insight Generation', icon: Lightbulb },
  { label: 'Report Formatting', icon: FileText },
];

const REPORT_TYPES = [
  { value: 'enrollment', label: 'Enrollment Report' },
  { value: 'financial', label: 'Financial Report' },
  { value: 'academic', label: 'Academic Report' },
  { value: 'performance', label: 'Performance Report' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'comprehensive', label: 'Comprehensive Report' },
];

const DATE_RANGES = [
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'quarter', label: 'Past Quarter' },
  { value: 'semester', label: 'This Semester' },
  { value: 'year', label: 'Past Year' },
];

const FORMATS = [
  { value: 'summary', label: 'Executive Summary' },
  { value: 'detailed', label: 'Detailed Report' },
  { value: 'visual', label: 'Visual Dashboard' },
];

const TEMPLATES = [
  { icon: Users, title: 'Student Enrollment', desc: 'Track enrollment trends, demographics, and projections', color: 'from-cyan-500 to-cyan-600' },
  { icon: DollarSign, title: 'Financial Overview', desc: 'Revenue, expenses, and budget analysis', color: 'from-teal-500 to-teal-600' },
  { icon: GraduationCap, title: 'Academic Performance', desc: 'Grades, pass rates, and GPA analysis', color: 'from-cyan-500 to-teal-600' },
  { icon: Activity, title: 'Attendance Analysis', desc: 'Attendance patterns and risk assessment', color: 'from-teal-500 to-cyan-500' },
  { icon: TrendingUp, title: 'Performance Trends', desc: 'Year-over-year growth and comparisons', color: 'from-cyan-600 to-teal-600' },
  { icon: FileBarChart, title: 'Comprehensive Annual', desc: 'Full institutional performance report', color: 'from-teal-600 to-cyan-600' },
];

const RECENT_REPORTS = [
  { name: 'Q4 Enrollment Forecast', type: 'Enrollment', date: 'Nov 1, 2025', insights: 18, status: 'Completed' },
  { name: 'October Financial Summary', type: 'Financial', date: 'Oct 30, 2025', insights: 12, status: 'Completed' },
  { name: 'Fall Academic Performance', type: 'Academic', date: 'Oct 28, 2025', insights: 24, status: 'Completed' },
  { name: 'November Attendance Analysis', type: 'Attendance', date: 'Nov 5, 2025', insights: 9, status: 'Completed' },
  { name: 'Annual Comprehensive Review', type: 'Comprehensive', date: 'Oct 15, 2025', insights: 31, status: 'Completed' },
  { name: 'Faculty Performance Q3', type: 'Performance', date: 'Oct 10, 2025', insights: 15, status: 'Completed' },
];

const REPORT_DATA: Record<string, {
  summary: string;
  metrics: { label: string; value: string; trend: 'up' | 'down' | 'neutral'; change: string }[];
  insights: { title: string; text: string; confidence: number }[];
  chartData: { label: string; value: number }[];
  recommendations: string[];
}> = {
  enrollment: {
    summary: 'Enrollment for the current period shows strong growth across most departments. Total enrollment reached 1,247 students, representing an 8% increase from the previous period. Computer Science and Business departments are the primary growth drivers, while Arts saw a slight decline. The AI model projects continued growth of 7.4% next semester, reaching approximately 1,340 students.',
    metrics: [
      { label: 'Total Enrolled', value: '1,247', trend: 'up', change: '+8%' },
      { label: 'New Admissions', value: '142', trend: 'up', change: '+15%' },
      { label: 'Retention Rate', value: '94.2%', trend: 'up', change: '+2.1%' },
      { label: 'Avg Class Size', value: '28.3', trend: 'up', change: '+1.2' },
    ],
    insights: [
      { title: 'CS Growth Accelerating', text: 'Computer Science enrollment grew 15% — the highest of any department. This is driven by market demand for AI/ML skills and new course offerings.', confidence: 94 },
      { title: 'Arts Decline Detected', text: 'Arts department enrollment dropped 2%. Recommend reviewing curriculum relevance and marketing outreach for this department.', confidence: 82 },
      { title: 'Retention Improvement', text: 'Retention rate improved to 94.2%, likely due to the new student support program launched in September.', confidence: 88 },
    ],
    chartData: [
      { label: 'Aug', value: 1150 },
      { label: 'Sep', value: 1190 },
      { label: 'Oct', value: 1220 },
      { label: 'Nov', value: 1247 },
      { label: 'Dec', value: 1290 },
      { label: 'Jan', value: 1340 },
    ],
    recommendations: [
      'Expand CS department capacity by hiring 2-3 additional faculty members to maintain optimal class sizes.',
      'Launch a targeted marketing campaign for the Arts department to reverse the enrollment decline.',
      'Continue the student support program that has improved retention by 2.1%.',
      'Prepare infrastructure for projected 1,340 students next semester — review classroom and lab capacity.',
    ],
  },
  financial: {
    summary: 'Financial performance for the period is strong. Total revenue reached $2.4M, exceeding projections by 12%. Fee collection rate stands at 94.2%, though 47 accounts remain overdue totaling $89,000. The Science department has the highest collection rate at 96%, while Arts trails at 78%. AI projections indicate year-end revenue of $2.68M.',
    metrics: [
      { label: 'Total Revenue', value: '$2.4M', trend: 'up', change: '+12%' },
      { label: 'Collection Rate', value: '94.2%', trend: 'up', change: '+3.5%' },
      { label: 'Outstanding', value: '$89K', trend: 'down', change: '-$23K' },
      { label: 'Avg per Student', value: '$1,925', trend: 'up', change: '+$85' },
    ],
    insights: [
      { title: 'Revenue Ahead of Projections', text: 'Revenue is 12% above projections, driven by the early-payment discount campaign launched in August.', confidence: 92 },
      { title: 'Arts Collection Concern', text: 'Arts department collection rate is only 78%. 14 of the 47 overdue accounts are from this department.', confidence: 87 },
      { title: 'Scholarship Impact', text: 'Scholarship disbursements increased 18% this period, supporting 142 students. ROI projection: 3.2x through improved graduation rates.', confidence: 85 },
    ],
    chartData: [
      { label: 'Aug', value: 380 },
      { label: 'Sep', value: 465 },
      { label: 'Oct', value: 410 },
      { label: 'Nov', value: 520 },
      { label: 'Dec', value: 480 },
      { label: 'Jan', value: 545 },
    ],
    recommendations: [
      'Send automated reminders to the 47 overdue accounts, prioritizing the 14 Arts department accounts.',
      'Expand the early-payment discount campaign — it generated $85K in additional upfront revenue.',
      'Review the Arts department fee structure and consider installment plans to improve collection rates.',
      'Allocate 15% of surplus revenue to the scholarship fund to sustain the 3.2x ROI trajectory.',
    ],
  },
  academic: {
    summary: 'Academic performance for the period shows overall improvement. Average GPA rose to 3.2, up 0.15 from last period. Pass rate stands at 87.5%, with 142 students achieving GPA 3.7 or higher. Mathematics remains the weakest subject at 82% pass rate, while Computer Science leads at 94%. The AI model identifies 23 at-risk students requiring intervention.',
    metrics: [
      { label: 'Average GPA', value: '3.2', trend: 'up', change: '+0.15' },
      { label: 'Pass Rate', value: '87.5%', trend: 'up', change: '+2.3%' },
      { label: 'Top Performers', value: '142', trend: 'up', change: '+18' },
      { label: 'At-Risk Students', value: '23', trend: 'down', change: '-5' },
    ],
    insights: [
      { title: 'Mathematics Needs Attention', text: 'Math pass rate is 82%, the lowest across all subjects. AI analysis shows a correlation with Friday afternoon scheduling and lower attendance.', confidence: 89 },
      { title: 'CS Excellence Continues', text: 'Computer Science maintains a 94% pass rate. The project-based learning approach adopted last year is showing strong results.', confidence: 93 },
      { title: 'At-Risk Reduction', text: 'At-risk students decreased from 28 to 23, likely due to the early intervention program launched in September.', confidence: 86 },
    ],
    chartData: [
      { label: 'Aug', value: 84 },
      { label: 'Sep', value: 85 },
      { label: 'Oct', value: 86 },
      { label: 'Nov', value: 87 },
      { label: 'Dec', value: 88 },
      { label: 'Jan', value: 89 },
    ],
    recommendations: [
      'Provide additional tutoring support for Mathematics, especially for Friday afternoon sessions.',
      'Replicate the CS project-based learning model in other departments showing lower pass rates.',
      'Schedule academic counseling for the 23 at-risk students within the next 2 weeks.',
      'Recognize and celebrate the 142 top performers to maintain motivation and retention.',
    ],
  },
  performance: {
    summary: 'Overall institutional performance is trending positive. Student satisfaction scores reached 4.3/5.0, faculty efficiency improved by 5%, and operational metrics are within target ranges. The AI composite performance index stands at 87/100, up 4 points from last period. Key areas for improvement include Arts department engagement and Friday attendance.',
    metrics: [
      { label: 'Performance Index', value: '87/100', trend: 'up', change: '+4' },
      { label: 'Student Satisfaction', value: '4.3/5.0', trend: 'up', change: '+0.2' },
      { label: 'Faculty Efficiency', value: '92%', trend: 'up', change: '+5%' },
      { label: 'Operational Score', value: '89%', trend: 'up', change: '+2%' },
    ],
    insights: [
      { title: 'Composite Score Rising', text: 'The performance index improved 4 points, driven by enrollment growth, financial health, and academic improvements.', confidence: 91 },
      { title: 'Faculty Workload Optimal', text: 'Faculty-to-student ratio is 1:18, within the optimal range. Two departments show slightly elevated workload — CS and Business.', confidence: 84 },
      { title: 'Satisfaction Up', text: 'Student satisfaction improved 0.2 points, correlated with the new support programs and digital infrastructure upgrades.', confidence: 88 },
    ],
    chartData: [
      { label: 'Aug', value: 81 },
      { label: 'Sep', value: 83 },
      { label: 'Oct', value: 85 },
      { label: 'Nov', value: 86 },
      { label: 'Dec', value: 87 },
      { label: 'Jan', value: 89 },
    ],
    recommendations: [
      'Hire 2-3 additional CS/Business faculty to address the slightly elevated workload in growth departments.',
      'Continue investing in digital infrastructure — it directly correlates with satisfaction improvements.',
      'Set a target performance index of 90 for next period, focusing on Arts and Friday attendance.',
      'Conduct a student feedback survey to identify specific drivers of the 0.2 satisfaction improvement.',
    ],
  },
  attendance: {
    summary: 'Attendance for the period averaged 91.4%, up 2.1% from last month. Monday-Thursday rates are strong (93-96%), but Friday drops to 84% and Saturday to 78%. The Science department leads at 94%, while Arts trails at 87%. AI prediction models forecast a slight dip to 89% next month, with 5 high-risk dates identified.',
    metrics: [
      { label: 'Avg Attendance', value: '91.4%', trend: 'up', change: '+2.1%' },
      { label: 'Friday Rate', value: '84%', trend: 'down', change: '-1%' },
      { label: 'Perfect Attendance', value: '342', trend: 'up', change: '+28' },
      { label: 'Chronic Absentees', value: '18', trend: 'down', change: '-4' },
    ],
    insights: [
      { title: 'Friday Dip Pattern', text: 'Friday attendance is consistently 8-12% below weekday average. Likely caused by weekend proximity and afternoon lab scheduling.', confidence: 90 },
      { title: 'Science Leads', text: 'Science department attendance at 94% is the highest, possibly due to mandatory lab sessions and engaging practical work.', confidence: 85 },
      { title: 'Chronic Absentee Reduction', text: 'Chronic absentees decreased from 22 to 18, likely due to the attendance incentive program launched in October.', confidence: 83 },
    ],
    chartData: [
      { label: 'Mon', value: 96 },
      { label: 'Tue', value: 88 },
      { label: 'Wed', value: 92 },
      { label: 'Thu', value: 84 },
      { label: 'Fri', value: 78 },
      { label: 'Sat', value: 71 },
    ],
    recommendations: [
      'Introduce interactive project-based sessions on Fridays to counter the end-of-week attendance dip.',
      'Replicate the Science department lab model in other departments to boost engagement.',
      'Continue the attendance incentive program — it reduced chronic absentees by 18%.',
      'Send pre-emptive alerts to families before the 5 AI-predicted high-risk dates next month.',
    ],
  },
  comprehensive: {
    summary: 'This comprehensive report synthesizes data across enrollment, finance, academics, attendance, and performance. The institution is operating at a healthy level with 1,247 students, $2.4M revenue, 87.5% pass rate, and 91.4% attendance. All key metrics are trending upward. The AI composite health score is 87/100. Priority areas: Arts department support, Friday attendance, and Mathematics tutoring.',
    metrics: [
      { label: 'Health Score', value: '87/100', trend: 'up', change: '+4' },
      { label: 'Total Students', value: '1,247', trend: 'up', change: '+8%' },
      { label: 'Revenue', value: '$2.4M', trend: 'up', change: '+12%' },
      { label: 'Pass Rate', value: '87.5%', trend: 'up', change: '+2.3%' },
    ],
    insights: [
      { title: 'Institutional Health Strong', text: 'All five key domains (enrollment, finance, academics, attendance, performance) show positive trends. The composite score of 87 is the highest in 6 periods.', confidence: 95 },
      { title: 'Arts Department Flagged', text: 'Arts is the only department showing decline across enrollment (-2%), collection rate (78%), and attendance (87%). Needs targeted intervention.', confidence: 88 },
      { title: 'Growth Sustainable', text: 'Current growth patterns are sustainable based on AI projections. Enrollment, revenue, and performance are all on track for continued improvement.', confidence: 91 },
    ],
    chartData: [
      { label: 'Enroll', value: 88 },
      { label: 'Finance', value: 92 },
      { label: 'Academic', value: 85 },
      { label: 'Attend', value: 84 },
      { label: 'Perform', value: 87 },
      { label: 'Overall', value: 87 },
    ],
    recommendations: [
      'Develop a comprehensive Arts department recovery plan addressing enrollment, fees, and attendance simultaneously.',
      'Maintain current growth strategies in CS and Business — they are the primary institutional growth drivers.',
      'Invest surplus revenue in infrastructure to prepare for projected 1,340 students next semester.',
      'Establish a quarterly review cycle to monitor the 4 priority areas identified in this report.',
    ],
  },
};

export default function AiReportsPage() {
  const [reportType, setReportType] = useState('enrollment');
  const [dateRange, setDateRange] = useState('semester');
  const [format, setFormat] = useState('detailed');
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [hasReport, setHasReport] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleGenerate = () => {
    setProcessing(true);
    setHasReport(false);
    setCurrentStep(0);

    STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
        if (i === STEPS.length - 1) {
          const tEnd = setTimeout(() => {
            setProcessing(false);
            setHasReport(true);
          }, 800);
          timersRef.current.push(tEnd);
        }
      }, i * 900);
      timersRef.current.push(t);
    });
  };

  const data = REPORT_DATA[reportType];
  const maxChart = Math.max(...data.chartData.map((c) => c.value));

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="AI Reports"
        subtitle="AI-generated institutional reports with insights and recommendations"
        icon={FileBarChart}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200">
            <Sparkles size={14} className="text-cyan-600" />
            <span className="text-xs font-medium text-cyan-700">AI Report Engine</span>
          </div>
        }
      />

      {/* Report Generator */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
            <FileBarChart className="text-cyan-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Report Generator</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <PortalSelect
            label="Report Type"
            value={reportType}
            onChange={setReportType}
            options={REPORT_TYPES}
          />
          <PortalSelect
            label="Date Range"
            value={dateRange}
            onChange={setDateRange}
            options={DATE_RANGES}
          />
          <PortalSelect
            label="Format"
            value={format}
            onChange={setFormat}
            options={FORMATS}
          />
        </div>
        <PortalButton
          onClick={handleGenerate}
          disabled={processing}
          className="w-full sm:w-auto"
        >
          {processing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate with AI
            </>
          )}
        </PortalButton>
      </PortalCard>

      {/* Processing Steps */}
      {processing && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Loader2 size={18} className="text-cyan-600 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-ink-900">AI Report Generation</h3>
          </div>
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    active ? 'bg-cyan-50 border border-cyan-200' : done ? 'bg-teal-50 border border-teal-100' : 'bg-ink-50 border border-ink-100'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      done ? 'bg-teal-500' : active ? 'bg-cyan-500' : 'bg-ink-200'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="text-white" size={18} />
                    ) : active ? (
                      <Loader2 className="text-white animate-spin" size={18} />
                    ) : (
                      <step.icon className="text-ink-400" size={18} />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      done ? 'text-teal-700' : active ? 'text-cyan-700' : 'text-ink-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {done && <Badge variant="success">Complete</Badge>}
                  {active && <Badge variant="info">Processing...</Badge>}
                </div>
              );
            })}
          </div>
        </PortalCard>
      )}

      {/* Generated Report */}
      {hasReport && !processing && data && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-ink-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <FileBarChart className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink-900">
                  {REPORT_TYPES.find((r) => r.value === reportType)?.label}
                </h3>
                <p className="text-xs text-ink-500">
                  {DATE_RANGES.find((d) => d.value === dateRange)?.label} · {FORMATS.find((f) => f.value === format)?.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">AI Generated</Badge>
              <Badge variant="success">Ready</Badge>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-ink-900 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-cyan-600" />
              Executive Summary
            </h4>
            <p className="text-sm text-ink-600 leading-relaxed">{data.summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-cyan-600" />
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.metrics.map((m) => (
                <div key={m.label} className="p-4 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="text-xs text-ink-500 mb-1">{m.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-ink-900">{m.value}</span>
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                        m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-600' : 'text-ink-500'
                      }`}
                    >
                      {m.trend === 'up' ? <ArrowUp size={12} /> : m.trend === 'down' ? <TrendingDown size={12} /> : null}
                      {m.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Insights */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-cyan-600" />
              AI-Generated Insights
            </h4>
            <div className="space-y-3">
              {data.insights.map((insight, i) => (
                <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h5 className="text-sm font-bold text-ink-900">{insight.title}</h5>
                        <Badge variant="gold">{insight.confidence}% confidence</Badge>
                      </div>
                      <p className="text-sm text-ink-600 leading-relaxed">{insight.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CSS Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-600" />
              Trend Analysis
            </h4>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="flex items-end justify-between gap-2 h-44 mb-3">
                {data.chartData.map((c) => (
                  <div key={c.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="text-[10px] font-bold text-ink-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.value}
                    </div>
                    <div className="w-full flex items-end" style={{ height: '140px' }}>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-teal-600 to-cyan-400 transition-all duration-500 hover:from-teal-700 hover:to-cyan-500"
                        style={{ height: `${(c.value / maxChart) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-ink-500">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-600" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 border border-ink-100">
                  <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-600 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-ink-100">
            <PortalButton variant="secondary">
              <Download size={16} />
              Download Report (PDF)
            </PortalButton>
            <PortalButton variant="ghost">
              <Download size={16} />
              Download as CSV
            </PortalButton>
            <span className="text-xs text-ink-400 ml-auto">Generated just now · AI Engine v2.0</span>
          </div>
        </PortalCard>
      )}

      {/* Empty state before first generation */}
      {!hasReport && !processing && (
        <PortalCard className="p-6 mb-6">
          <EmptyState
            icon={FileBarChart}
            title="No Report Generated Yet"
            message="Select a report type above and click 'Generate with AI' to create an AI-powered institutional report with insights and recommendations."
          />
        </PortalCard>
      )}

      {/* Recent AI Reports Table */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Clock className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Recent AI Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider py-3 px-2">Report Name</th>
                <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider py-3 px-2">Type</th>
                <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider py-3 px-2 hidden sm:table-cell">Generated</th>
                <th className="text-center text-xs font-semibold text-ink-500 uppercase tracking-wider py-3 px-2 hidden sm:table-cell">Insights</th>
                <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS.map((r, i) => (
                <tr key={i} className="border-b border-ink-50 hover:bg-ink-50 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-ink-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-ink-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="default">{r.type}</Badge>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    <span className="text-sm text-ink-500">{r.date}</span>
                  </td>
                  <td className="py-3 px-2 text-center hidden sm:table-cell">
                    <span className="text-sm font-bold text-cyan-600">{r.insights}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Badge variant="success">{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PortalCard>

      {/* Report Templates & Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Report Templates */}
        <div className="lg:col-span-2">
          <PortalCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                <FileText className="text-cyan-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">AI Report Templates</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.title}
                  onClick={() => {
                    const match = REPORT_TYPES.find((r) => t.title.includes(r.label.split(' ')[0]));
                    if (match) {
                      setReportType(match.value);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="text-left p-4 rounded-xl bg-ink-50 border border-ink-100 hover:border-cyan-200 hover:bg-cyan-50/50 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                    <t.icon className="text-white" size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-ink-900 mb-1 group-hover:text-cyan-700">{t.title}</h4>
                  <p className="text-xs text-ink-500 leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
          </PortalCard>
        </div>

        {/* Report Analytics */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <Zap className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Report Analytics</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Reports This Month</span>
                <FileBarChart size={16} className="text-cyan-600" />
              </div>
              <div className="text-2xl font-bold text-ink-900">24</div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                <ArrowUp size={12} /> +8 vs last month
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Avg Generation Time</span>
                <Clock size={16} className="text-ink-400" />
              </div>
              <div className="text-2xl font-bold text-ink-900">3.4s</div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                <TrendingDown size={12} /> -0.6s faster
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Avg Insights per Report</span>
                <Lightbulb size={16} className="text-ink-400" />
              </div>
              <div className="text-2xl font-bold text-ink-900">16.2</div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                <ArrowUp size={12} /> +2.4 vs last month
              </div>
            </div>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
