import { useState, useRef, useEffect } from 'react';
import {
  FileBarChart, Sparkles, CheckCircle2, Brain, Target, TrendingUp,
  Lightbulb, BookOpen, ClipboardCheck, GraduationCap, Activity, Award,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  Badge, EmptyState, StatTile,
} from '../../components/portal-ui';
import { useAuth } from '../../lib/auth';

type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

type Prediction = {
  course: string;
  predictedGrade: Grade;
  predictedScore: number;
  scoreLow: number;
  scoreHigh: number;
  passProb: number;
  gradeProbs: Record<Grade, number>;
  insights: string[];
  classDistribution: Record<Grade, number>;
  suggestions: { target: Grade; actions: string[] }[];
};

const STEPS = [
  { label: 'Historical Data Analysis', icon: Activity },
  { label: 'Performance Modeling', icon: TrendingUp },
  { label: 'Grade Prediction', icon: Target },
  { label: 'Confidence Assessment', icon: CheckCircle2 },
];

const COURSES = [
  { value: 'CS101', label: 'CS101 — Introduction to Programming' },
  { value: 'MATH201', label: 'MATH201 — Calculus II' },
  { value: 'PHYS110', label: 'PHYS110 — General Physics' },
  { value: 'ENG150', label: 'ENG150 — Academic Writing' },
  { value: 'BIO220', label: 'BIO220 — Cell Biology' },
  { value: 'CHEM130', label: 'CHEM130 — Organic Chemistry' },
];

const GRADE_ORDER: Grade[] = ['A', 'B', 'C', 'D', 'F'];

function gradeColor(g: Grade): string {
  if (g === 'A') return 'bg-green-500 text-white';
  if (g === 'B') return 'bg-teal-500 text-white';
  if (g === 'C') return 'bg-amber-400 text-ink-900';
  if (g === 'D') return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
}

function gradeTextColor(g: Grade): string {
  if (g === 'A') return 'text-green-600';
  if (g === 'B') return 'text-teal-600';
  if (g === 'C') return 'text-amber-600';
  if (g === 'D') return 'text-orange-600';
  return 'text-red-600';
}

export default function AiResultPredictionPage() {
  const { user } = useAuth();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const [course, setCourse] = useState(COURSES[0].value);
  const [inputs, setInputs] = useState({
    midterm: '72',
    assignment: '85',
    attendance: '90',
    lab: '78',
    participation: '7',
  });
  const [predicting, setPredicting] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Prediction | null>(null);

  function setI<K extends keyof typeof inputs>(k: K, v: string) {
    setInputs((p) => ({ ...p, [k]: v }));
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
    const midterm = parseFloat(inputs.midterm) || 0;
    const assignment = parseFloat(inputs.assignment) || 0;
    const attendance = parseFloat(inputs.attendance) || 0;
    const lab = parseFloat(inputs.lab) || 0;
    const participation = parseFloat(inputs.participation) || 0;

    // Weighted predicted score
    const predictedScore = Math.round(
      midterm * 0.35 + assignment * 0.25 + attendance * 0.1 + lab * 0.2 + (participation / 10) * 100 * 0.1
    );
    const scoreLow = Math.max(0, predictedScore - 6);
    const scoreHigh = Math.min(100, predictedScore + 6);

    let predictedGrade: Grade = 'F';
    if (predictedScore >= 90) predictedGrade = 'A';
    else if (predictedScore >= 80) predictedGrade = 'B';
    else if (predictedScore >= 70) predictedGrade = 'C';
    else if (predictedScore >= 60) predictedGrade = 'D';

    // Grade probability distribution (softmax-ish around predicted score)
    const gradeProbs: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const centers: Record<Grade, number> = { A: 95, B: 85, C: 75, D: 65, F: 50 };
    let total = 0;
    GRADE_ORDER.forEach((g) => {
      const d = Math.abs(predictedScore - centers[g]);
      const p = Math.exp(-d / 8);
      gradeProbs[g] = p;
      total += p;
    });
    GRADE_ORDER.forEach((g) => {
      gradeProbs[g] = Math.round((gradeProbs[g] / total) * 100);
    });
    // Normalize to sum 100
    const sum = gradeProbs.A + gradeProbs.B + gradeProbs.C + gradeProbs.D + gradeProbs.F;
    if (sum !== 100) {
      gradeProbs[predictedGrade] += 100 - sum;
    }

    const passProb = Math.min(99, Math.max(20, Math.round((predictedScore / 100) * 100)));

    const insights: string[] = [];
    if (midterm >= 80) insights.push('Strong midterm performance is a leading indicator of a high final grade.');
    else if (midterm < 60) insights.push('Low midterm score is the primary driver pulling down the predicted grade.');
    if (assignment >= 85) insights.push('Consistent assignment submission is boosting the predicted score.');
    else if (assignment < 70) insights.push('Below-average assignment scores are dragging down the prediction.');
    if (attendance < 80) insights.push('Attendance below 80% correlates with a higher risk of failing.');
    if (lab < 70) insights.push('Lab scores need improvement to lift the overall grade.');
    if (participation >= 8) insights.push('High participation adds a meaningful margin to the predicted grade.');
    if (insights.length === 0) insights.push('Inputs are balanced; no single factor dominates the prediction.');

    // Class distribution (simulated)
    const classDistribution: Record<Grade, number> = {
      A: 18, B: 32, C: 28, D: 14, F: 8,
    };

    // Improvement suggestions to reach next grade up
    const suggestions: { target: Grade; actions: string[] }[] = [];
    const nextGrade: Grade | null = predictedGrade === 'A' ? null
      : predictedGrade === 'B' ? 'A'
      : predictedGrade === 'C' ? 'B'
      : predictedGrade === 'D' ? 'C' : 'D';
    if (nextGrade) {
      const actions: string[] = [];
      if (midterm < 85) actions.push('Focus practice on past midterm-style questions to add 5+ points.');
      if (assignment < 90) actions.push('Submit all remaining assignments early for full credit.');
      if (attendance < 95) actions.push('Attend every remaining lecture — attendance is a top-3 predictor.');
      if (lab < 85) actions.push('Schedule lab office hours to improve lab report quality.');
      if (participation < 9) actions.push('Increase in-class participation to maximize engagement credit.');
      if (actions.length === 0) actions.push('Maintain current performance to secure the higher grade.');
      suggestions.push({ target: nextGrade, actions });
    } else {
      suggestions.push({ target: 'A', actions: ['Maintain current performance — already at the top grade band.'] });
    }

    setResult({
      course,
      predictedGrade,
      predictedScore,
      scoreLow,
      scoreHigh,
      passProb,
      gradeProbs,
      insights,
      classDistribution,
      suggestions,
    });
    setPredicting(false);
    setStepIdx(STEPS.length);
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Result Prediction"
        subtitle="AI-powered exam result & grade prediction"
        icon={FileBarChart}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
            <Sparkles size={14} className="text-teal-600" />
            <span className="text-xs font-medium text-teal-700">AI Engine Active</span>
          </div>
        }
      />

      {/* Course Selection + Inputs */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <BookOpen className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Course Selection & Performance Inputs</h3>
        </div>
        <div className="mb-5">
          <PortalSelect
            label="Select Course"
            value={course}
            onChange={setCourse}
            options={COURSES}
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <PortalInput label="Midterm Score (/100)" type="number" value={inputs.midterm} onChange={(v) => setI('midterm', v)} placeholder="72" />
          <PortalInput label="Assignment Average (/100)" type="number" value={inputs.assignment} onChange={(v) => setI('assignment', v)} placeholder="85" />
          <PortalInput label="Attendance (%)" type="number" value={inputs.attendance} onChange={(v) => setI('attendance', v)} placeholder="90" />
          <PortalInput label="Lab Scores (/100)" type="number" value={inputs.lab} onChange={(v) => setI('lab', v)} placeholder="78" />
          <PortalInput label="Participation (1-10)" type="number" value={inputs.participation} onChange={(v) => setI('participation', v)} placeholder="7" />
        </div>
        <div className="mt-5">
          <PortalButton onClick={runPrediction} disabled={predicting}>
            {predicting ? <><Brain size={16} className="animate-pulse" /> Predicting...</> : <><FileBarChart size={16} /> Predict Result</>}
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
              <span className="text-sm font-medium text-ink-700">Analyzing performance patterns...</span>
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

      {/* Predicted Result */}
      {!predicting && result && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Predicted Grade" value={result.predictedGrade} icon={GraduationCap} color="teal" />
            <StatTile label="Predicted Score" value={`${result.predictedScore}/100`} icon={Target} color="ink" />
            <StatTile label="Confidence Interval" value={`${result.scoreLow}–${result.scoreHigh}`} icon={Activity} color="teal" />
            <StatTile label="Pass Probability" value={`${result.passProb}%`} icon={Award} color={result.passProb >= 70 ? 'green' : result.passProb >= 50 ? 'gold' : 'red'} />
          </div>

          <PortalCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                  <FileBarChart className="text-teal-600" size={18} />
                </div>
                <h3 className="text-lg font-bold text-ink-900">Predicted Result</h3>
              </div>
              <Badge variant={result.passProb >= 70 ? 'success' : result.passProb >= 50 ? 'warning' : 'error'}>
                {result.passProb >= 70 ? 'Likely Pass' : result.passProb >= 50 ? 'Borderline' : 'At Risk'}
              </Badge>
            </div>

            {/* Grade probability distribution */}
            <div className="mb-6">
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-teal-600" /> Grade Probability Distribution
              </div>
              <div className="flex items-end justify-between gap-3 h-44">
                {GRADE_ORDER.map((g) => {
                  const p = result.gradeProbs[g];
                  const isPred = g === result.predictedGrade;
                  return (
                    <div key={g} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="text-xs font-bold text-ink-700">{p}%</div>
                      <div className="w-full flex items-end" style={{ height: '140px' }}>
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${gradeColor(g)} ${isPred ? 'ring-2 ring-ink-900 ring-offset-1' : 'opacity-70'}`}
                          style={{ height: `${Math.max(4, p)}%` }}
                        />
                      </div>
                      <div className={`text-sm font-bold ${isPred ? 'text-ink-900' : gradeTextColor(g)}`}>{g}{isPred && ' ★'}</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-ink-500 mt-2">★ indicates the most likely predicted grade. Probabilities sum to 100%.</p>
            </div>

            {/* Key insights */}
            <div>
              <div className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-teal-600" /> Key Insights
              </div>
              <div className="space-y-2">
                {result.insights.map((ins, i) => (
                  <div key={i} className="p-3 rounded-xl bg-ink-50 border border-ink-100 flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-sm text-ink-700">{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          </PortalCard>

          {/* Class Performance Distribution */}
          <PortalCard className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                <ClipboardCheck className="text-teal-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Class Performance Distribution</h3>
            </div>
            <p className="text-sm text-ink-500 mb-4">Predicted grade distribution for the entire class enrolled in this course.</p>
            <div className="space-y-3">
              {GRADE_ORDER.map((g) => {
                const pct = result.classDistribution[g];
                return (
                  <div key={g}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${gradeColor(g)}`}>{g}</span>
                        <span className="text-sm text-ink-700">Grade {g}</span>
                      </div>
                      <span className="text-sm font-bold text-ink-900">{pct}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-ink-100 overflow-hidden">
                      <div className={`h-full rounded-full ${gradeColor(g)} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-lg font-bold text-green-600">{result.classDistribution.A + result.classDistribution.B}%</div>
                <div className="text-xs text-ink-500">Pass with Distinction</div>
              </div>
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-lg font-bold text-teal-600">{result.classDistribution.C}%</div>
                <div className="text-xs text-ink-500">Satisfactory</div>
              </div>
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-lg font-bold text-red-600">{result.classDistribution.D + result.classDistribution.F}%</div>
                <div className="text-xs text-ink-500">At Risk / Fail</div>
              </div>
            </div>
          </PortalCard>

          {/* Improvement Suggestions */}
          <PortalCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                <Lightbulb className="text-teal-600" size={18} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Improvement Suggestions</h3>
            </div>
            <p className="text-sm text-ink-500 mb-4">What the student needs to do to improve by one grade level.</p>
            {result.suggestions.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${gradeColor(s.target)}`}>{s.target}</span>
                  <span className="text-sm font-bold text-ink-900">Target: Grade {s.target}</span>
                </div>
                <ul className="space-y-2">
                  {s.actions.map((a, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-ink-700">
                      <CheckCircle2 size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </PortalCard>
        </>
      )}

      {!predicting && !result && (
        <PortalCard className="p-6">
          <EmptyState icon={FileBarChart} title="No prediction yet" message="Select a course, enter performance inputs, and click Predict Result to see the predicted grade." />
        </PortalCard>
      )}

      {/* Footer */}
      <div className="mt-6 p-4 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-3">
        <Sparkles size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-ink-600">
          Result predictions are based on a weighted performance model using historical grade patterns.
          Predictions are simulated for demonstration and should not replace official grading. {user ? `Signed in as ${user.email}.` : ''}
        </p>
      </div>
    </div>
  );
}
