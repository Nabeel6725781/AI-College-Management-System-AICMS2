import { useState, useRef, useEffect } from 'react';
import {
  UserPlus, Sparkles, CheckCircle2, GraduationCap, Award, BookOpen,
  Users, FileText, TrendingUp, Brain, Target, Lightbulb,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput,
  Badge, EmptyState,
} from '../../components/portal-ui';
import { useAuth } from '../../lib/auth';

type Recommendation = 'Strong Accept' | 'Accept' | 'Waitlist' | 'Reject';

type Result = {
  applicant: string;
  recommendation: Recommendation;
  confidence: number;
  predictedGpa: number;
  graduationProb: number;
  scholarship: { yes: boolean; amount: number };
  strengths: string[];
  concerns: string[];
  date: string;
};

const STEPS = [
  { label: 'Profile Analysis', icon: UserPlus },
  { label: 'Academic Assessment', icon: GraduationCap },
  { label: 'Holistic Review', icon: Brain },
  { label: 'Recommendation Generation', icon: Target },
];

const FEATURE_IMPORTANCE = [
  { factor: 'GPA', weight: 32, icon: GraduationCap },
  { factor: 'Test Scores (SAT)', weight: 24, icon: BookOpen },
  { factor: 'Essay Quality', weight: 18, icon: FileText },
  { factor: 'Extracurriculars', weight: 14, icon: Users },
  { factor: 'Recommendations', weight: 12, icon: Award },
];

function recBadge(r: Recommendation) {
  if (r === 'Strong Accept') return <Badge variant="success">Strong Accept</Badge>;
  if (r === 'Accept') return <Badge variant="info">Accept</Badge>;
  if (r === 'Waitlist') return <Badge variant="warning">Waitlist</Badge>;
  return <Badge variant="error">Reject</Badge>;
}

function recColor(r: Recommendation): string {
  if (r === 'Strong Accept') return 'text-green-600';
  if (r === 'Accept') return 'text-cyan-600';
  if (r === 'Waitlist') return 'text-amber-600';
  return 'text-red-600';
}

export default function AiAdmissionPage() {
  const { user } = useAuth();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const [form, setForm] = useState({
    name: '',
    gpa: '3.5',
    sat: '1200',
    extracurriculars: '3',
    essay: '7',
    letters: '2',
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([
    { applicant: 'Alice Johnson', recommendation: 'Strong Accept', confidence: 92, predictedGpa: 3.78, graduationProb: 94, scholarship: { yes: true, amount: 8000 }, strengths: ['Excellent GPA', 'Strong essay'], concerns: ['Low test score'], date: '2026-07-12' },
    { applicant: 'Bob Smith', recommendation: 'Waitlist', confidence: 68, predictedGpa: 3.05, graduationProb: 72, scholarship: { yes: false, amount: 0 }, strengths: ['Good extracurriculars'], concerns: ['Below-average GPA', 'Weak essay'], date: '2026-07-08' },
    { applicant: 'Carol Diaz', recommendation: 'Accept', confidence: 81, predictedGpa: 3.42, graduationProb: 85, scholarship: { yes: true, amount: 4000 }, strengths: ['Balanced profile', 'Strong recommendations'], concerns: ['Average test score'], date: '2026-06-29' },
  ]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function runAnalysis() {
    if (!form.name.trim() || analyzing) return;
    setAnalyzing(true);
    setResult(null);
    setStepIdx(0);
    setProgress(0);

    const totalMs = 2800;
    const tickMs = 70;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += tickMs;
      setProgress(Math.min(100, Math.round((elapsed / totalMs) * 100)));
      setStepIdx(Math.min(STEPS.length - 1, Math.floor((elapsed / totalMs) * STEPS.length)));
      if (elapsed >= totalMs) {
        clearInterval(interval);
        finishAnalysis();
      }
    }, tickMs);
    timers.current.push(setTimeout(() => clearInterval(interval), totalMs + 500));
  }

  function finishAnalysis() {
    const gpa = parseFloat(form.gpa) || 0;
    const sat = parseInt(form.sat) || 0;
    const extra = parseInt(form.extracurriculars) || 0;
    const essay = parseFloat(form.essay) || 0;
    const letters = parseInt(form.letters) || 0;

    // Simple heuristic score
    const score = gpa * 25 + (sat / 1600) * 30 + essay * 4 + extra * 1.5 + letters * 2;
    let rec: Recommendation = 'Reject';
    if (score >= 130) rec = 'Strong Accept';
    else if (score >= 110) rec = 'Accept';
    else if (score >= 90) rec = 'Waitlist';

    const confidence = Math.min(97, Math.max(55, Math.round(60 + (score - 90) / 2)));
    const predictedGpa = Math.min(4.0, Math.max(1.5, Math.round((gpa * 0.6 + (sat / 1600) * 4 * 0.4) * 100) / 100));
    const graduationProb = Math.min(98, Math.max(45, Math.round(50 + score / 2)));
    const scholarshipYes = rec === 'Strong Accept' || (rec === 'Accept' && essay >= 8);
    const amount = scholarshipYes ? (rec === 'Strong Accept' ? 8000 : 4000) : 0;

    const strengths: string[] = [];
    const concerns: string[] = [];
    if (gpa >= 3.7) strengths.push('Excellent GPA'); else if (gpa < 3.0) concerns.push('Below-average GPA');
    if (sat >= 1400) strengths.push('Outstanding test scores'); else if (sat < 1100) concerns.push('Low test scores');
    if (essay >= 8) strengths.push('Compelling essay'); else if (essay < 5) concerns.push('Weak essay');
    if (extra >= 5) strengths.push('Strong extracurricular involvement'); else if (extra < 2) concerns.push('Limited extracurriculars');
    if (letters >= 3) strengths.push('Multiple strong recommendations'); else if (letters < 1) concerns.push('No recommendation letters');
    if (strengths.length === 0) strengths.push('Balanced overall profile');
    if (concerns.length === 0) concerns.push('No significant concerns identified');

    const r: Result = {
      applicant: form.name,
      recommendation: rec,
      confidence,
      predictedGpa,
      graduationProb,
      scholarship: { yes: scholarshipYes, amount },
      strengths,
      concerns,
      date: new Date().toISOString().slice(0, 10),
    };
    setResult(r);
    setHistory((prev) => [r, ...prev]);
    setAnalyzing(false);
    setStepIdx(STEPS.length);
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Admission Recommendation"
        subtitle="AI-powered admission decision support engine"
        icon={UserPlus}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
            <Sparkles size={14} className="text-teal-600" />
            <span className="text-xs font-medium text-teal-700">AI Engine Active</span>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applicant Evaluation form */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <UserPlus className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Applicant Evaluation</h3>
          </div>
          <div className="space-y-4">
            <PortalInput label="Student Name" value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Jane Doe" required />
            <div className="grid grid-cols-2 gap-4">
              <PortalInput label="GPA (0-4.0)" type="number" value={form.gpa} onChange={(v) => set('gpa', v)} placeholder="3.5" />
              <PortalInput label="SAT Score (400-1600)" type="number" value={form.sat} onChange={(v) => set('sat', v)} placeholder="1200" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <PortalInput label="Extracurriculars" type="number" value={form.extracurriculars} onChange={(v) => set('extracurriculars', v)} placeholder="3" />
              <PortalInput label="Essay (1-10)" type="number" value={form.essay} onChange={(v) => set('essay', v)} placeholder="7" />
              <PortalInput label="Rec. Letters" type="number" value={form.letters} onChange={(v) => set('letters', v)} placeholder="2" />
            </div>
            <PortalButton onClick={runAnalysis} disabled={!form.name.trim() || analyzing} className="w-full">
              {analyzing ? <><Brain size={16} className="animate-pulse" /> Analyzing...</> : <><Sparkles size={16} /> Run AI Analysis</>}
            </PortalButton>
          </div>
        </PortalCard>

        {/* AI Analysis progress / result */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <Brain className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">AI Analysis</h3>
          </div>

          {analyzing && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink-700">Evaluating applicant profile...</span>
                  <span className="text-sm font-bold text-teal-600">{progress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="space-y-2.5">
                {STEPS.map((s, i) => {
                  const done = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-teal-100' : active ? 'bg-cyan-100 animate-pulse' : 'bg-ink-100'}`}>
                        {done ? <CheckCircle2 className="text-teal-600" size={16} /> : <s.icon className={done ? 'text-teal-600' : active ? 'text-cyan-600' : 'text-ink-400'} size={16} />}
                      </div>
                      <span className={`text-sm ${done ? 'text-ink-900 font-medium' : active ? 'text-cyan-700' : 'text-ink-400'}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!analyzing && !result && (
            <EmptyState icon={Brain} title="No analysis yet" message="Fill out the applicant evaluation form and run AI analysis to see a recommendation." />
          )}

          {!analyzing && result && (
            <div className="space-y-4">
              {/* Recommendation */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-ink-900 to-ink-950 border border-ink-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-ink-400 uppercase tracking-wide">AI Recommendation</span>
                  {recBadge(result.recommendation)}
                </div>
                <div className={`text-2xl font-bold ${recColor(result.recommendation)}`}>{result.recommendation}</div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink-400">Confidence Score</span>
                    <span className="text-sm font-bold text-teal-400">{result.confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1"><GraduationCap size={12} /> Predicted GPA</div>
                  <div className="text-xl font-bold text-ink-900">{result.predictedGpa.toFixed(2)}</div>
                </div>
                <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1"><TrendingUp size={12} /> Graduation Prob.</div>
                  <div className="text-xl font-bold text-teal-600">{result.graduationProb}%</div>
                </div>
              </div>

              {/* Scholarship */}
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${result.scholarship.yes ? 'bg-teal-50 border-teal-200' : 'bg-ink-50 border-ink-100'}`}>
                <Award size={16} className={result.scholarship.yes ? 'text-teal-600' : 'text-ink-400'} />
                <span className="text-sm text-ink-700">
                  {result.scholarship.yes ? `Scholarship recommended: $${result.scholarship.amount.toLocaleString()}` : 'No scholarship recommended'}
                </span>
              </div>

              {/* Key factors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-ink-700 mb-2 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-600" /> Strengths</div>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5"><span className="text-green-500 mt-0.5">•</span> {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink-700 mb-2 flex items-center gap-1.5"><Lightbulb size={12} className="text-amber-600" /> Concerns</div>
                  <ul className="space-y-1">
                    {result.concerns.map((c, i) => (
                      <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span> {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </PortalCard>
      </div>

      {/* Model Insights */}
      <PortalCard className="p-6 mt-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Brain className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Model Insights</h3>
          <Badge variant="info">Feature Importance</Badge>
        </div>
        <div className="space-y-3">
          {FEATURE_IMPORTANCE.map((f) => (
            <div key={f.factor}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm text-ink-700">
                  <f.icon size={14} className="text-teal-600" />
                  {f.factor}
                </div>
                <span className="text-sm font-bold text-ink-900">{f.weight}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-500" style={{ width: `${f.weight * 3}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-500 mt-4">Relative weight each factor carries in the recommendation model. GPA and test scores dominate, followed by essay quality.</p>
      </PortalCard>

      {/* Recommendation History */}
      <PortalCard className="p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Users className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Recommendation History</h3>
        </div>
        {history.length === 0 ? (
          <EmptyState icon={Users} title="No recommendations yet" message="Run an applicant analysis to build history." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2.5 pr-4 font-medium">Applicant</th>
                  <th className="py-2.5 pr-4 font-medium">Predicted GPA</th>
                  <th className="py-2.5 pr-4 font-medium">Recommendation</th>
                  <th className="py-2.5 pr-4 font-medium">Confidence</th>
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="py-3 pr-4 font-medium text-ink-900">{h.applicant}</td>
                    <td className="py-3 pr-4 text-ink-600">{h.predictedGpa.toFixed(2)}</td>
                    <td className="py-3 pr-4">{recBadge(h.recommendation)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${h.confidence}%` }} />
                        </div>
                        <span className="font-bold text-ink-900">{h.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink-500 text-xs">{h.date}</td>
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
          Admission recommendations are generated using a holistic review model and are simulated for demonstration.
          Final decisions should be made by the admissions committee. {user ? `Signed in as ${user.email}.` : ''}
        </p>
      </div>
    </div>
  );
}
