import { useState, useRef, useEffect } from 'react';
import {
  TrendingUp, Sparkles, CheckCircle2, Activity, AlertTriangle,
  Users, Target, GraduationCap, Lightbulb, Brain,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  Badge, EmptyState, StatTile,
} from '../../components/portal-ui';
import { useAuth } from '../../lib/auth';

type RiskLevel = 'Low' | 'Medium' | 'High';

type Prediction = {
  studentId: string;
  studentName: string;
  predictedGpa: number;
  confidenceLow: number;
  confidenceHigh: number;
  risk: RiskLevel;
  percentile: number;
  factors: { factor: string; weight: number; positive: boolean }[];
  recommendations: string[];
  trajectory: { label: string; gpa: number; predicted: boolean }[];
};

type AtRiskStudent = {
  id: string;
  name: string;
  currentGpa: number;
  predictedGpa: number;
  risk: RiskLevel;
  factors: string[];
};

const STEPS = [
  { label: 'Data Collection', icon: Activity },
  { label: 'Pattern Analysis', icon: TrendingUp },
  { label: 'Model Inference', icon: Brain },
  { label: 'Confidence Calculation', icon: Target },
];

const STUDENTS = [
  { id: 'S1001', name: 'Alice Johnson' },
  { id: 'S1002', name: 'Bob Smith' },
  { id: 'S1003', name: 'Carol Diaz' },
  { id: 'S1004', name: 'David Kim' },
  { id: 'S1005', name: 'Emma Wilson' },
  { id: 'S1006', name: 'Frank Lee' },
  { id: 'S1007', name: 'Grace Patel' },
  { id: 'S1008', name: 'Hassan Ali' },
];

const AT_RISK: AtRiskStudent[] = [
  { id: 'S1002', name: 'Bob Smith', currentGpa: 2.4, predictedGpa: 1.8, risk: 'High', factors: ['Low attendance', 'Missed assignments', 'Declining trend'] },
  { id: 'S1005', name: 'Emma Wilson', currentGpa: 2.2, predictedGpa: 1.9, risk: 'High', factors: ['Poor participation', 'Low study hours'] },
  { id: 'S1008', name: 'Hassan Ali', currentGpa: 2.6, predictedGpa: 1.95, risk: 'High', factors: ['Attendance dropping', 'Failed midterm'] },
  { id: 'S1004', name: 'David Kim', currentGpa: 2.9, predictedGpa: 2.1, risk: 'Medium', factors: ['Inconsistent submissions', 'Low participation'] },
];

function riskBadge(r: RiskLevel) {
  if (r === 'Low') return <Badge variant="success">Low Risk</Badge>;
  if (r === 'Medium') return <Badge variant="warning">Medium Risk</Badge>;
  return <Badge variant="error">High Risk</Badge>;
}

function riskColor(r: RiskLevel): string {
  if (r === 'Low') return 'text-green-600';
  if (r === 'Medium') return 'text-amber-600';
  return 'text-red-600';
}

export default function AiPerformancePredictionPage() {
  const { user } = useAuth();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const [studentId, setStudentId] = useState(STUDENTS[0].id);
  const [customId, setCustomId] = useState('');
  const [params, setParams] = useState({
    gpa: '3.4',
    attendance: '88',
    studyHours: '18',
    assignments: '92',
    participation: '7',
  });
  const [predicting, setPredicting] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Prediction | null>(null);

  const selectedStudent = STUDENTS.find((s) => s.id === studentId) || STUDENTS[0];
  const effectiveId = customId.trim() || studentId;
  const effectiveName = customId.trim() ? `Student ${customId.trim()}` : selectedStudent.name;

  function setP<K extends keyof typeof params>(k: K, v: string) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  function runPrediction() {
    if (predicting) return;
    setPredicting(true);
    setResult(null);
    setStepIdx(0);
    setProgress(0);

    const totalMs = 2600;
    const tickMs = 65;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += tickMs;
      setProgress(Math.min(100, Math.round((elapsed / totalMs) * 100)));
      setStepIdx(Math.min(STEPS.length - 1, Math.floor((elapsed / totalMs) * STEPS.length)));
      if (elapsed >= totalMs) {
        clearInterval(interval);
        finishPrediction();
      }
    }, tickMs);
    timers.current.push(setTimeout(() => clearInterval(interval), totalMs + 500));
  }

  function finishPrediction() {
    const gpa = parseFloat(params.gpa) || 0;
    const attendance = parseFloat(params.attendance) || 0;
    const study = parseFloat(params.studyHours) || 0;
    const assignments = parseFloat(params.assignments) || 0;
    const participation = parseFloat(params.participation) || 0;

    // Weighted prediction
    const base = gpa * 0.4 + (attendance / 100) * 4 * 0.2 + (assignments / 100) * 4 * 0.2 + (participation / 10) * 4 * 0.1 + Math.min(study / 40, 1) * 4 * 0.1;
    const predictedGpa = Math.max(0.5, Math.min(4.0, Math.round(base * 100) / 100));
    const confidenceLow = Math.max(0.0, Math.round((predictedGpa - 0.25) * 100) / 100);
    const confidenceHigh = Math.min(4.0, Math.round((predictedGpa + 0.25) * 100) / 100);

    let risk: RiskLevel = 'Low';
    if (predictedGpa < 2.0) risk = 'High';
    else if (predictedGpa < 2.7) risk = 'Medium';

    const percentile = Math.min(99, Math.max(5, Math.round((predictedGpa / 4.0) * 100)));

    const factors = [
      { factor: 'Current GPA', weight: Math.round(gpa / 4 * 100), positive: gpa >= 3.0 },
      { factor: 'Attendance Rate', weight: Math.round(attendance), positive: attendance >= 80 },
      { factor: 'Study Hours/Week', weight: Math.round(Math.min(study / 40 * 100, 100)), positive: study >= 15 },
      { factor: 'Assignment Submission', weight: Math.round(assignments), positive: assignments >= 85 },
      { factor: 'Participation Score', weight: Math.round(participation * 10), positive: participation >= 6 },
    ];

    const recommendations: string[] = [];
    if (gpa < 3.0) recommendations.push('Schedule weekly tutoring sessions for core subjects.');
    if (attendance < 85) recommendations.push('Improve attendance to at least 90% — current rate is a strong predictor of GPA decline.');
    if (study < 15) recommendations.push('Increase study hours to 20+ per week; current load is below the cohort average.');
    if (assignments < 90) recommendations.push('Submit all assignments on time; missed submissions heavily impact predicted GPA.');
    if (participation < 6) recommendations.push('Increase classroom participation to boost engagement scores.');
    if (recommendations.length === 0) recommendations.push('Maintain current habits — performance trajectory is strong and stable.');

    // Trajectory: 4 past + 3 predicted
    const trajectory = [
      { label: 'Sem 1', gpa: Math.max(0.5, Math.round((gpa - 0.4) * 100) / 100), predicted: false },
      { label: 'Sem 2', gpa: Math.max(0.5, Math.round((gpa - 0.2) * 100) / 100), predicted: false },
      { label: 'Sem 3', gpa: Math.max(0.5, Math.round((gpa - 0.1) * 100) / 100), predicted: false },
      { label: 'Sem 4', gpa: gpa, predicted: false },
      { label: 'Sem 5', gpa: predictedGpa, predicted: true },
      { label: 'Sem 6', gpa: Math.min(4.0, Math.round((predictedGpa + 0.08) * 100) / 100), predicted: true },
      { label: 'Sem 7', gpa: Math.min(4.0, Math.round((predictedGpa + 0.12) * 100) / 100), predicted: true },
    ];

    setResult({
      studentId: effectiveId,
      studentName: effectiveName,
      predictedGpa,
      confidenceLow,
      confidenceHigh,
      risk,
      percentile,
      factors,
      recommendations,
      trajectory,
    });
    setPredicting(false);
    setStepIdx(STEPS.length);
  }

  // Trajectory chart scaling
  const trajMax = 4.0;
  const chartH = 180;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Performance Prediction"
        subtitle="AI-powered student performance forecasting"
        icon={TrendingUp}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
            <Sparkles size={14} className="text-teal-600" />
            <span className="text-xs font-medium text-teal-700">AI Engine Active</span>
          </div>
        }
      />

      {/* Student Selection */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Users className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Student Selection</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <PortalSelect
            label="Select Student"
            value={studentId}
            onChange={setStudentId}
            options={STUDENTS.map((s) => ({ value: s.id, label: `${s.name} (${s.id})` }))}
          />
          <PortalInput label="Or enter Student ID" value={customId} onChange={setCustomId} placeholder="e.g. S1009" />
        </div>
        <div className="mt-3 text-sm text-ink-500">
          Predicting for: <span className="font-medium text-ink-900">{effectiveName}</span> ({effectiveId})
        </div>
      </PortalCard>

      {/* Prediction Parameters */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Activity className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Prediction Parameters</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <PortalInput label="Current GPA" type="number" value={params.gpa} onChange={(v) => setP('gpa', v)} placeholder="3.4" />
          <PortalInput label="Attendance Rate (%)" type="number" value={params.attendance} onChange={(v) => setP('attendance', v)} placeholder="88" />
          <PortalInput label="Study Hours/Week" type="number" value={params.studyHours} onChange={(v) => setP('studyHours', v)} placeholder="18" />
          <PortalInput label="Assignments Submitted (%)" type="number" value={params.assignments} onChange={(v) => setP('assignments', v)} placeholder="92" />
          <PortalInput label="Participation Score (1-10)" type="number" value={params.participation} onChange={(v) => setP('participation', v)} placeholder="7" />
        </div>
        <div className="mt-5">
          <PortalButton onClick={runPrediction} disabled={predicting}>
            {predicting ? <><Brain size={16} className="animate-pulse" /> Predicting...</> : <><TrendingUp size={16} /> Run Prediction</>}
          </PortalButton>
        </div>
      </PortalCard>

      {/* Processing */}
      {predicting && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-teal-600" size={18} />
            <h3 className="text-lg font-bold text-ink-900">AI Processing</h3>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink-700">Running prediction model...</span>
              <span className="text-sm font-bold text-teal-600">{progress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            {STEPS.map((s, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              return (
                <div key={s.label} className={`p-3 rounded-xl border text-center ${done ? 'bg-teal-50 border-teal-200' : active ? 'bg-cyan-50 border-cyan-300 animate-pulse' : 'bg-ink-50 border-ink-100'}`}>
                  {done ? <CheckCircle2 className="text-teal-600 mx-auto mb-1" size={18} /> : <s.icon className={`mx-auto mb-1 ${active ? 'text-cyan-600' : 'text-ink-400'}`} size={18} />}
                  <div className="text-[11px] font-medium text-ink-700">{s.label}</div>
                </div>
              );
            })}
          </div>
        </PortalCard>
      )}

      {/* Prediction Results */}
      {!predicting && result && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Predicted GPA" value={result.predictedGpa.toFixed(2)} icon={GraduationCap} color="teal" />
            <StatTile label="Confidence Interval" value={`${result.confidenceLow.toFixed(2)}–${result.confidenceHigh.toFixed(2)}`} icon={Target} color="ink" />
            <StatTile label="Percentile Rank" value={`${result.percentile}%`} icon={TrendingUp} color="teal" />
            <StatTile label="Risk Level" value={result.risk} icon={AlertTriangle} color={result.risk === 'High' ? 'red' : result.risk === 'Medium' ? 'gold' : 'green'} />
          </div>

          <PortalCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                  <TrendingUp className="text-teal-600" size={18} />
                </div>
                <h3 className="text-lg font-bold text-ink-900">Prediction Results</h3>
              </div>
              {riskBadge(result.risk)}
            </div>

            {/* Performance trajectory - CSS line chart */}
            <div className="mb-6">
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <Activity size={14} className="text-teal-600" /> Performance Trajectory
                <span className="text-xs text-ink-400">(solid = past, dashed = predicted)</span>
              </div>
              <div className="relative" style={{ height: chartH + 30 }}>
                {/* Y axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-ink-400">
                  <span>4.0</span><span>3.0</span><span>2.0</span><span>1.0</span><span>0.0</span>
                </div>
                {/* Grid lines */}
                <div className="absolute left-8 right-0 top-0 bottom-6">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-ink-100" style={{ top: `${(i / 4) * 100}%` }} />
                  ))}
                  {/* Bars representing GPA per semester */}
                  <div className="absolute inset-0 flex items-end justify-around">
                    {result.trajectory.map((t, i) => {
                      const h = (t.gpa / trajMax) * chartH;
                      return (
                        <div key={i} className="flex flex-col items-center" style={{ width: `${100 / result.trajectory.length}%` }}>
                          <div className="text-[10px] font-bold text-ink-600 mb-0.5">{t.gpa.toFixed(2)}</div>
                          <div className="w-full flex items-end" style={{ height: chartH }}>
                            <div
                              className={`w-full max-w-[28px] mx-auto rounded-t-md ${t.predicted ? 'bg-cyan-300 border border-dashed border-cyan-500' : 'bg-gradient-to-t from-teal-600 to-teal-400'}`}
                              style={{ height: `${h}px` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* X labels */}
                <div className="absolute left-8 right-0 bottom-0 flex justify-around">
                  {result.trajectory.map((t, i) => (
                    <div key={i} className="text-[10px] text-ink-500 text-center" style={{ width: `${100 / result.trajectory.length}%` }}>{t.label}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key factors */}
            <div className="mb-6">
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <Brain size={14} className="text-teal-600" /> Key Factors Influencing Prediction
              </div>
              <div className="space-y-2.5">
                {result.factors.map((f) => (
                  <div key={f.factor}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink-700">{f.factor}</span>
                      <span className={`text-sm font-bold ${f.positive ? 'text-green-600' : 'text-red-600'}`}>{f.positive ? '+' : ''}{f.weight}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                      <div className={`h-full rounded-full ${f.positive ? 'bg-teal-500' : 'bg-red-400'}`} style={{ width: `${Math.min(100, f.weight)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-teal-600" /> Personalized Recommendations
              </div>
              <div className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-sm text-ink-700">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </PortalCard>

          {/* Cohort Comparison */}
          <PortalCard className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                <Users className="text-teal-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Cohort Comparison</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-ink-50 border border-ink-100 text-center">
                <div className="text-2xl font-bold text-teal-600">{result.percentile}</div>
                <div className="text-xs text-ink-500 mt-1">Percentile Ranking</div>
              </div>
              <div className="p-4 rounded-xl bg-ink-50 border border-ink-100 text-center">
                <div className="text-2xl font-bold text-ink-900">{result.predictedGpa > 3.0 ? 'Above' : result.predictedGpa > 2.5 ? 'At' : 'Below'}</div>
                <div className="text-xs text-ink-500 mt-1">vs. Cohort Average (2.85)</div>
              </div>
              <div className="p-4 rounded-xl bg-ink-50 border border-ink-100 text-center">
                <div className="text-2xl font-bold text-ink-900">{result.risk === 'High' ? 'Bottom 15%' : result.risk === 'Medium' ? 'Middle 50%' : 'Top 25%'}</div>
                <div className="text-xs text-ink-500 mt-1">Performance Band</div>
              </div>
            </div>
            {/* Percentile bar */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-ink-500">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
              <div className="relative w-full h-3 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-teal-500">
                <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-ink-900 rounded-full" style={{ left: `${result.percentile}%` }} />
              </div>
              <div className="text-center text-xs text-ink-600 mt-2">
                <span className={`font-bold ${riskColor(result.risk)}`}>{result.studentName}</span> is at the {result.percentile}th percentile of the cohort.
              </div>
            </div>
          </PortalCard>
        </>
      )}

      {!predicting && !result && (
        <PortalCard className="p-6 mb-6">
          <EmptyState icon={TrendingUp} title="No prediction yet" message="Select a student, set the parameters, and run a prediction to see results." />
        </PortalCard>
      )}

      {/* At-Risk Students */}
      <PortalCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">At-Risk Students</h3>
          <Badge variant="error">Predicted below 2.0 GPA</Badge>
        </div>
        {AT_RISK.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No at-risk students" message="No students are currently predicted to drop below 2.0 GPA." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2.5 pr-4 font-medium">Student</th>
                  <th className="py-2.5 pr-4 font-medium">Current GPA</th>
                  <th className="py-2.5 pr-4 font-medium">Predicted GPA</th>
                  <th className="py-2.5 pr-4 font-medium">Risk Level</th>
                  <th className="py-2.5 pr-4 font-medium">Risk Factors</th>
                </tr>
              </thead>
              <tbody>
                {AT_RISK.map((s) => (
                  <tr key={s.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-ink-900">{s.name}</div>
                      <div className="text-xs text-ink-500">{s.id}</div>
                    </td>
                    <td className="py-3 pr-4 text-ink-600">{s.currentGpa.toFixed(1)}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${riskColor(s.risk)}`}>{s.predictedGpa.toFixed(2)}</span>
                    </td>
                    <td className="py-3 pr-4">{riskBadge(s.risk)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {s.factors.map((f, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-ink-100 text-ink-600">{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>

      {/* Footer */}
      <div className="mt-6 p-4 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-3">
        <Sparkles size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-ink-600">
          Performance predictions use a weighted ensemble model based on academic and behavioral signals.
          Predictions are simulated for demonstration. {user ? `Signed in as ${user.email}.` : ''}
        </p>
      </div>
    </div>
  );
}
