import { useState, useEffect, useRef } from 'react';
import {
  CalendarCheck, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  Calendar, Activity, Users, Sparkles, CheckCircle2, Loader2,
  ArrowUp, ArrowDown, Bus, Heart, Brain, Home,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalSelect, Badge, EmptyState,
} from '../../components/portal-ui';

type Step = {
  label: string;
  icon: typeof Activity;
};

const STEPS: Step[] = [
  { label: 'Historical Pattern Analysis', icon: Activity },
  { label: 'Behavioral Modeling', icon: Brain },
  { label: 'Calendar Integration', icon: Calendar },
  { label: 'Risk Prediction', icon: AlertTriangle },
];

const STUDENTS = [
  { value: 's1', label: 'Ahmed Hassan — Grade 10-A' },
  { value: 's2', label: 'Sara Khan — Grade 9-B' },
  { value: 's3', label: 'Bilal Raza — Grade 11-C' },
  { value: 's4', label: 'Fatima Ali — Grade 10-A' },
  { value: 'c1', label: 'Class 10-A (All Students)' },
  { value: 'c2', label: 'Class 9-B (All Students)' },
];

const DAY_TRENDS = [
  { day: 'Mon', rate: 96 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 92 },
  { day: 'Thu', rate: 84 },
  { day: 'Fri', rate: 78 },
  { day: 'Sat', rate: 71 },
  { day: 'Sun', rate: 99 },
];

const TRAJECTORY = [
  { week: 'W1', actual: 94, predicted: null as number | null },
  { week: 'W2', actual: 91, predicted: null as number | null },
  { week: 'W3', actual: 89, predicted: null as number | null },
  { week: 'W4', actual: 87, predicted: null as number | null },
  { week: 'W5', actual: 85, predicted: null as number | null },
  { week: 'W6', actual: 83, predicted: null as number | null },
  { week: 'W7', actual: null, predicted: 82 },
  { week: 'W8', actual: null, predicted: 80 },
  { week: 'W9', actual: null, predicted: 79 },
  { week: 'W10', actual: null, predicted: 78 },
];

const AT_RISK_DATES = [
  { date: 'Nov 14, 2025', day: 'Friday', reason: 'Long weekend pattern — historically low attendance', confidence: 87 },
  { date: 'Nov 21, 2025', day: 'Friday', reason: 'Consecutive Friday absence pattern detected', confidence: 84 },
  { date: 'Dec 3, 2025', day: 'Tuesday', reason: 'Transport disruption likely (route maintenance)', confidence: 71 },
  { date: 'Dec 12, 2025', day: 'Thursday', reason: 'Exam stress period — elevated absence probability', confidence: 79 },
  { date: 'Dec 19, 2025', day: 'Thursday', reason: 'Pre-holiday dip — historical trend', confidence: 82 },
];

const FACTORS = [
  { label: 'Health', value: 28, icon: Heart, color: 'from-rose-400 to-rose-500' },
  { label: 'Transport', value: 35, icon: Bus, color: 'from-amber-400 to-amber-500' },
  { label: 'Academic Stress', value: 22, icon: Brain, color: 'from-cyan-400 to-cyan-500' },
  { label: 'Personal', value: 15, icon: Home, color: 'from-teal-400 to-teal-500' },
];

const WEEK_FORECAST = [
  { day: 'Mon', date: 'Nov 10', predicted: 95, risk: 'Low' },
  { day: 'Tue', date: 'Nov 11', predicted: 86, risk: 'Medium' },
  { day: 'Wed', date: 'Nov 12', predicted: 91, risk: 'Low' },
  { day: 'Thu', date: 'Nov 13', predicted: 83, risk: 'Medium' },
  { day: 'Fri', date: 'Nov 14', predicted: 68, risk: 'High' },
  { day: 'Sat', date: 'Nov 15', predicted: 72, risk: 'High' },
];

const INTERVENTIONS = [
  {
    title: 'Friday Engagement Program',
    text: 'Introduce interactive project-based sessions on Fridays to counter the end-of-week attendance dip. Expected improvement: +12%.',
    priority: 'High',
    impact: '+12%',
  },
  {
    title: 'Transport Coordination',
    text: 'Coordinate with transport providers for alternate route planning on Dec 3. Notify family 48 hours in advance.',
    priority: 'Medium',
    impact: '+5%',
  },
  {
    title: 'Exam Stress Counseling',
    text: 'Schedule a counseling session before the December exam period. Provide stress management resources.',
    priority: 'High',
    impact: '+8%',
  },
  {
    title: 'Attendance Incentive',
    text: 'Implement a weekly perfect-attendance recognition program. Gamification has shown 15% improvement in peer institutions.',
    priority: 'Medium',
    impact: '+7%',
  },
];

export default function AiAttendancePredictionPage() {
  const [selection, setSelection] = useState('s1');
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [hasResults, setHasResults] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handlePredict = () => {
    setProcessing(true);
    setHasResults(false);
    setCurrentStep(0);

    STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
        if (i === STEPS.length - 1) {
          const tEnd = setTimeout(() => {
            setProcessing(false);
            setHasResults(true);
          }, 800);
          timersRef.current.push(tEnd);
        }
      }, i * 900);
      timersRef.current.push(t);
    });
  };

  const riskLevel = 'High';
  const predictedRate = 78;
  const trendDir = 'down' as string;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Attendance Prediction"
        subtitle="AI-powered attendance forecasting and risk assessment"
        icon={CalendarCheck}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200">
            <Sparkles size={14} className="text-cyan-600" />
            <span className="text-xs font-medium text-cyan-700">Predictive AI</span>
          </div>
        }
      />

      {/* Student/Class Selection */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Users className="text-cyan-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Student / Class Selection</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <PortalSelect
            label="Select Student or Class"
            value={selection}
            onChange={setSelection}
            options={STUDENTS}
          />
          <div className="flex items-end">
            <PortalButton onClick={handlePredict} disabled={processing} className="w-full">
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CalendarCheck size={16} />
                  Predict Attendance
                </>
              )}
            </PortalButton>
          </div>
        </div>
      </PortalCard>

      {/* Current Attendance Metrics */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Activity className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Current Attendance Metrics</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
            <div className="text-2xl font-bold text-ink-900">83.2%</div>
            <div className="text-xs text-ink-500 mt-1">Current Attendance Rate</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-2xl font-bold text-amber-700">3</div>
            <div className="text-xs text-ink-500 mt-1">Consecutive Absences</div>
          </div>
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
            <div className="text-2xl font-bold text-cyan-700">Morning</div>
            <div className="text-xs text-ink-500 mt-1">Absence Pattern</div>
          </div>
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
            <div className="text-2xl font-bold text-teal-700">Friday</div>
            <div className="text-xs text-ink-500 mt-1">Lowest Day</div>
          </div>
        </div>

        {/* Day-of-week trends */}
        <div>
          <div className="text-sm font-medium text-ink-700 mb-3">Day-of-Week Attendance Trends</div>
          <div className="flex items-end justify-between gap-2 h-32">
            {DAY_TRENDS.map((d) => {
              const isLow = d.rate < 80;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] font-bold text-ink-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.rate}%
                  </div>
                  <div className="w-full flex items-end" style={{ height: '100px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isLow
                          ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                          : 'bg-gradient-to-t from-teal-600 to-cyan-400'
                      }`}
                      style={{ height: `${d.rate}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-500">{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </PortalCard>

      {/* Processing Steps */}
      {processing && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Loader2 size={18} className="text-cyan-600 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-ink-900">AI Processing</h3>
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

      {/* Prediction Results */}
      {hasResults && !processing && (
        <>
          <PortalCard className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                <TrendingUp className="text-cyan-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Prediction Results</h3>
              <Badge variant="info">AI Generated</Badge>
            </div>

            {/* Predicted attendance + risk */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100">
                <div className="text-xs text-ink-500 mb-1">Predicted Next Month</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-ink-900">{predictedRate}%</span>
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-bold ${
                      trendDir === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trendDir === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    5.2%
                  </div>
                </div>
                <div className="text-xs text-ink-500 mt-1">vs. current 83.2%</div>
              </div>
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-xs text-ink-500 mb-1">Risk Level</div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-600" size={24} />
                  <span className="text-2xl font-bold text-amber-700">{riskLevel}</span>
                </div>
                <div className="text-xs text-ink-500 mt-1">Intervention recommended</div>
              </div>
              <div className="p-5 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-xs text-ink-500 mb-1">Model Confidence</div>
                <div className="text-3xl font-bold text-ink-900">86%</div>
                <div className="w-full h-1.5 rounded-full bg-ink-200 overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600" style={{ width: '86%' }} />
                </div>
              </div>
            </div>

            {/* Attendance Trajectory Chart */}
            <div className="mb-6">
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <TrendingDown size={16} className="text-cyan-600" />
                Attendance Trajectory (Past & Predicted)
              </div>
              <div className="relative h-48">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-dashed border-ink-100" />
                  ))}
                </div>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-ink-400">
                  <span>100%</span>
                  <span>90%</span>
                  <span>80%</span>
                  <span>70%</span>
                  <span>60%</span>
                </div>
                {/* Bars */}
                <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end justify-between gap-1">
                  {TRAJECTORY.map((w) => {
                    const val = w.actual ?? w.predicted ?? 0;
                    const isPredicted = w.predicted !== null;
                    return (
                      <div key={w.week} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full flex items-end" style={{ height: '140px' }}>
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${
                              isPredicted
                                ? 'bg-gradient-to-t from-cyan-500 to-cyan-300 opacity-70 border-2 border-dashed border-cyan-500'
                                : 'bg-gradient-to-t from-teal-600 to-teal-400'
                            }`}
                            style={{ height: `${((val - 60) / 40) * 100}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-ink-500">{w.week}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Divider line between actual and predicted */}
                <div className="absolute left-[calc(50%+20px)] top-0 bottom-6 border-l-2 border-dashed border-cyan-300" />
              </div>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-t from-teal-600 to-teal-400" />
                  <span className="text-xs text-ink-600">Actual (Past 6 Weeks)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-dashed border-cyan-500 bg-cyan-200" />
                  <span className="text-xs text-ink-600">Predicted (Next 4 Weeks)</span>
                </div>
              </div>
            </div>

            {/* At-risk dates */}
            <div className="mb-6">
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                At-Risk Dates — Predicted Absences
              </div>
              <div className="space-y-2">
                {AT_RISK_DATES.map((d) => (
                  <div key={d.date} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 border border-ink-100">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-amber-600" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-ink-900">{d.date}</span>
                        <Badge variant="default">{d.day}</Badge>
                        <Badge variant={d.confidence >= 80 ? 'error' : 'warning'}>{d.confidence}% likely</Badge>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">{d.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contributing Factors */}
            <div>
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-cyan-600" />
                Contributing Factors to Absence Risk
              </div>
              <div className="space-y-3">
                {FACTORS.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="w-28 flex items-center gap-2 flex-shrink-0">
                      <f.icon size={16} className="text-ink-500" />
                      <span className="text-sm text-ink-700">{f.label}</span>
                    </div>
                    <div className="flex-1 h-6 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${f.color} transition-all duration-700`}
                        style={{ width: `${f.value * 2.5}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-ink-900 w-10 text-right">{f.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </PortalCard>

          {/* Class Attendance Forecast */}
          <PortalCard className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                <Calendar className="text-teal-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Class Attendance Forecast — Next Week</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {WEEK_FORECAST.map((d) => {
                const riskBadge =
                  d.risk === 'High' ? 'error' : d.risk === 'Medium' ? 'warning' : 'success';
                const barColor =
                  d.risk === 'High'
                    ? 'from-amber-500 to-amber-300'
                    : d.risk === 'Medium'
                    ? 'from-cyan-500 to-cyan-300'
                    : 'from-teal-600 to-teal-400';
                return (
                  <div key={d.day} className="p-4 rounded-xl bg-ink-50 border border-ink-100 text-center">
                    <div className="text-xs text-ink-500 mb-1">{d.date}</div>
                    <div className="text-sm font-bold text-ink-900 mb-2">{d.day}</div>
                    <div className="h-16 flex items-end mb-2">
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t ${barColor}`}
                        style={{ height: `${d.predicted}%` }}
                      />
                    </div>
                    <div className="text-lg font-bold text-ink-900">{d.predicted}%</div>
                    <div className="mt-1.5">
                      <Badge variant={riskBadge as 'success' | 'warning' | 'error'}>{d.risk}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </PortalCard>

          {/* Intervention Suggestions */}
          <PortalCard className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Lightbulb className="text-cyan-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">AI Intervention Suggestions</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {INTERVENTIONS.map((int, i) => (
                <div key={int.title} className="p-4 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-ink-900">{int.title}</h4>
                        <Badge variant={int.priority === 'High' ? 'error' : 'warning'}>{int.priority}</Badge>
                      </div>
                      <p className="text-sm text-ink-600 leading-relaxed mb-2">{int.text}</p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600">
                        <TrendingUp size={14} /> Expected impact: {int.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>
        </>
      )}

      {/* Empty state before first prediction */}
      {!hasResults && !processing && (
        <PortalCard className="p-6">
          <EmptyState
            icon={CalendarCheck}
            title="No Predictions Yet"
            message="Select a student or class above and click 'Predict Attendance' to generate AI-powered attendance forecasts."
          />
        </PortalCard>
      )}

      {/* Footer note */}
      <div className="mt-6 p-4 rounded-xl bg-cyan-50 border border-cyan-100 flex items-start gap-3">
        <Sparkles size={18} className="text-cyan-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-ink-600">
          Predictions are generated using historical attendance patterns, behavioral models, and calendar data.
          Confidence scores reflect model certainty. Interventions should be reviewed by academic staff before implementation.
        </p>
      </div>
    </div>
  );
}
