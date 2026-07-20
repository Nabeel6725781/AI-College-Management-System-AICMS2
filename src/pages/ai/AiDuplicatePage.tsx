import { useState, useRef, useEffect } from 'react';
import {
  CopyCheck, Upload, FileText, Scan, GitMerge, EyeOff, CheckCircle2,
  Fingerprint, Database, BarChart3, Clock, Sparkles, ArrowRight,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, Badge, EmptyState,
} from '../../components/portal-ui';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';

type DupType = 'exact' | 'near-duplicate' | 'partial';
type DupAction = 'review' | 'merge' | 'ignore';

type Duplicate = {
  id: string;
  doc: string;
  matched: string;
  similarity: number;
  type: DupType;
  action: DupAction;
};

type ScanRecord = {
  id: string;
  date: string;
  scanned: number;
  found: number;
  status: 'completed' | 'running';
};

const SCAN_STEPS = [
  { label: 'Feature Extraction', icon: Scan },
  { label: 'Fingerprint Generation', icon: Fingerprint },
  { label: 'Database Matching', icon: Database },
  { label: 'Similarity Scoring', icon: BarChart3 },
  { label: 'Result Compilation', icon: CheckCircle2 },
];

const SAMPLE_DOCS = [
  'Research_Proposal_Final.pdf',
  'Thesis_Chapter3_v2.pdf',
  'Lab_Report_Physics.pdf',
  'Essay_Literature_Review.pdf',
  'Assignment_CS101.pdf',
  'Project_Report_Engineering.pdf',
  'Scholarship_Essay_2024.pdf',
  'Thesis_Chapter3_v1.pdf',
  'Lab_Report_Physics_Old.pdf',
  'Research_Proposal_Draft.pdf',
];

function similarityColor(sim: number): string {
  if (sim >= 90) return 'bg-red-500 text-white';
  if (sim >= 75) return 'bg-orange-500 text-white';
  if (sim >= 50) return 'bg-amber-400 text-ink-900';
  if (sim >= 25) return 'bg-teal-300 text-ink-900';
  return 'bg-green-400 text-ink-900';
}

function typeBadge(t: DupType) {
  if (t === 'exact') return <Badge variant="error">Exact</Badge>;
  if (t === 'near-duplicate') return <Badge variant="warning">Near-Duplicate</Badge>;
  return <Badge variant="info">Partial</Badge>;
}

function actionLabel(a: DupAction) {
  if (a === 'review') return { text: 'Review', icon: EyeOff };
  if (a === 'merge') return { text: 'Merge', icon: GitMerge };
  return { text: 'Ignore', icon: CheckCircle2 };
}

// Progress ring component (CSS-based)
function ProgressRing({ value, label, color = 'text-teal-600' }: { value: number; label: string; color?: string }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-ink-100" />
          <circle
            cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6"
            strokeLinecap="round" className={color}
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-ink-900">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-ink-500 mt-2 text-center">{label}</span>
    </div>
  );
}

export default function AiDuplicatePage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([
    { id: 's1', date: '2026-07-10 14:22', scanned: 124, found: 8, status: 'completed' },
    { id: 's2', date: '2026-07-02 09:15', scanned: 86, found: 3, status: 'completed' },
    { id: 's3', date: '2026-06-21 16:40', scanned: 210, found: 15, status: 'completed' },
  ]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setSelectedFiles((prev) => [...prev, ...names]);
  }

  function addSample() {
    const remaining = SAMPLE_DOCS.filter((d) => !selectedFiles.includes(d));
    if (remaining.length === 0) return;
    setSelectedFiles((prev) => [...prev, remaining[0]]);
  }

  function removeFile(name: string) {
    setSelectedFiles((prev) => prev.filter((f) => f !== name));
  }

  function runScan() {
    if (selectedFiles.length === 0 || scanning) return;
    setScanning(true);
    setHasResults(false);
    setProgress(0);
    setStepIdx(0);

    // Animate progress bar + steps
    const totalMs = 2600;
    const tickMs = 60;
    // const incPerTick = (100 / (totalMs / tickMs));
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += tickMs;
      setProgress(Math.min(100, Math.round((elapsed / totalMs) * 100)));
      setStepIdx(Math.min(SCAN_STEPS.length - 1, Math.floor((elapsed / totalMs) * SCAN_STEPS.length)));
      if (elapsed >= totalMs) {
        clearInterval(interval);
        finishScan();
      }
    }, tickMs);
    timers.current.push(setTimeout(() => clearInterval(interval), totalMs + 500));
  }

  function finishScan() {
    // Build deterministic-ish duplicates from selected files
    const pairs: Duplicate[] = [];
    const pool = [...selectedFiles];
    // Pair each file with a "matched" doc from sample pool
    const matchPool = SAMPLE_DOCS;
    const types: DupType[] = ['exact', 'near-duplicate', 'partial'];
    const actions: DupAction[] = ['review', 'merge', 'ignore'];
    for (let i = 0; i < pool.length; i++) {
      const sim = Math.floor(40 + Math.random() * 60);
      const t = sim >= 92 ? 'exact' : sim >= 70 ? 'near-duplicate' : 'partial';
      const a = sim >= 92 ? 'merge' : sim >= 70 ? 'review' : 'ignore';
      pairs.push({
        id: `d${i}`,
        doc: pool[i],
        matched: matchPool[(i + 3) % matchPool.length],
        similarity: sim,
        type: t,
        action: a,
      });
      void types; void actions;
    }
    setDuplicates(pairs.sort((a, b) => b.similarity - a.similarity));
    setScanning(false);
    setHasResults(true);
    setStepIdx(SCAN_STEPS.length);
    setHistory((prev) => [
      { id: `s${Date.now()}`, date: new Date().toISOString().slice(0, 16).replace('T', ' '), scanned: pool.length, found: pairs.length, status: 'completed' },
      ...prev,
    ]);
  }

  function setAction(id: string, a: DupAction) {
    setDuplicates((prev) => prev.map((d) => (d.id === id ? { ...d, action: a } : d)));
  }

  // Stats
  const totalScanned = selectedFiles.length;
  const dupCount = duplicates.length;
  const uniqueCount = totalScanned - dupCount;
  const dupRate = totalScanned > 0 ? Math.round((dupCount / totalScanned) * 100) : 0;

  // Similarity matrix (NxN over selectedFiles, capped to 8 for display)
  const matrixDocs = selectedFiles.slice(0, 8);
  const matrix: number[][] = matrixDocs.map((_, i) =>
    matrixDocs.map((__, j) => (i === j ? 100 : Math.floor(20 + Math.abs(Math.sin((i + 1) * (j + 1) * 1.7)) * 78)))
  );

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Duplicate Detection"
        subtitle="AI-powered duplicate document & student record detection"
        icon={CopyCheck}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
            <Sparkles size={14} className="text-teal-600" />
            <span className="text-xs font-medium text-teal-700">AI Engine Active</span>
          </div>
        }
      />

      {/* Upload / Select zone */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Upload className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Upload or Select Documents</h3>
        </div>

        <div
          className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center hover:border-teal-400 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          <Upload className="mx-auto text-ink-400 mb-2" size={28} />
          <p className="text-sm font-medium text-ink-700">Click to upload or drag & drop</p>
          <p className="text-xs text-ink-500 mt-1">PDF, DOCX, TXT up to 50MB each</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <PortalButton variant="secondary" onClick={addSample} disabled={scanning}>
            <FileText size={16} /> Add Sample Document
          </PortalButton>
          <span className="text-sm text-ink-500">{selectedFiles.length} document(s) selected</span>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedFiles.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-50 border border-ink-100 text-xs text-ink-700">
                <FileText size={12} className="text-teal-600" />
                {f}
                <button onClick={() => removeFile(f)} className="text-ink-400 hover:text-red-500 ml-1">×</button>
              </span>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Duplicate Analysis */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <Scan className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Duplicate Analysis</h3>
          </div>
          <PortalButton onClick={runScan} disabled={selectedFiles.length === 0 || scanning}>
            {scanning ? <><Scan size={16} className="animate-pulse" /> Scanning...</> : <><Scan size={16} /> Run Duplicate Scan</>}
          </PortalButton>
        </div>

        {scanning && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink-700">Analyzing document patterns...</span>
                <span className="text-sm font-bold text-teal-600">{progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-5 gap-3">
              {SCAN_STEPS.map((s, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <div
                    key={s.label}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      done ? 'bg-teal-50 border-teal-200' : active ? 'bg-cyan-50 border-cyan-300 animate-pulse' : 'bg-ink-50 border-ink-100'
                    }`}
                  >
                    <s.icon className={`mx-auto mb-1.5 ${done ? 'text-teal-600' : active ? 'text-cyan-600' : 'text-ink-400'}`} size={18} />
                    <div className="text-[11px] font-medium text-ink-700 leading-tight">{s.label}</div>
                    {done && <CheckCircle2 className="text-teal-600 mx-auto mt-1" size={12} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!scanning && !hasResults && (
          <EmptyState
            icon={CopyCheck}
            title="No scan performed yet"
            message="Select documents above and run a duplicate scan to see analysis results."
          />
        )}
      </PortalCard>

      {/* Detected Duplicates table */}
      {hasResults && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <CopyCheck className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Detected Duplicates</h3>
            <Badge variant="info">{duplicates.length} matches</Badge>
          </div>
          {duplicates.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No duplicates found" message="All documents appear to be unique." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-ink-500">
                    <th className="py-2.5 pr-4 font-medium">Document</th>
                    <th className="py-2.5 pr-4 font-medium">Matched Document</th>
                    <th className="py-2.5 pr-4 font-medium">Similarity</th>
                    <th className="py-2.5 pr-4 font-medium">Type</th>
                    <th className="py-2.5 pr-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((d) => {
                    const al = actionLabel(d.action);
                    return (
                      <tr key={d.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2 text-ink-900 font-medium">
                            <FileText size={14} className="text-teal-600 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{d.doc}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-ink-600">
                          <span className="truncate inline-block max-w-[180px]">{d.matched}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                              <div className={`h-full rounded-full ${similarityColor(d.similarity)}`} style={{ width: `${d.similarity}%` }} />
                            </div>
                            <span className="font-bold text-ink-900">{d.similarity}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{typeBadge(d.type)}</td>
                        <td className="py-3 pr-4">
                          <div className="inline-flex items-center gap-1.5">
                            <al.icon size={14} className="text-ink-500" />
                            <select
                              value={d.action}
                              onChange={(e) => setAction(d.id, e.target.value as DupAction)}
                              className="text-xs border border-ink-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="review">Review</option>
                              <option value="merge">Merge</option>
                              <option value="ignore">Ignore</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </PortalCard>
      )}

      {/* Duplicate Statistics */}
      {hasResults && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <BarChart3 className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Duplicate Statistics</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            <ProgressRing value={totalScanned > 0 ? 100 : 0} label="Total Scanned" color="text-cyan-500" />
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-red-600">{dupCount}</div>
              <span className="text-xs text-ink-500 mt-1">Duplicates Found</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-green-600">{uniqueCount}</div>
              <span className="text-xs text-ink-500 mt-1">Unique Documents</span>
            </div>
            <ProgressRing value={dupRate} label="Duplicate Rate" color="text-red-500" />
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Exact Matches</span>
                <span className="text-sm font-bold text-red-600">{duplicates.filter((d) => d.type === 'exact').length}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${totalScanned ? (duplicates.filter((d) => d.type === 'exact').length / totalScanned) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Near-Duplicates</span>
                <span className="text-sm font-bold text-amber-600">{duplicates.filter((d) => d.type === 'near-duplicate').length}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${totalScanned ? (duplicates.filter((d) => d.type === 'near-duplicate').length / totalScanned) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Partial Matches</span>
                <span className="text-sm font-bold text-teal-600">{duplicates.filter((d) => d.type === 'partial').length}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${totalScanned ? (duplicates.filter((d) => d.type === 'partial').length / totalScanned) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </PortalCard>
      )}

      {/* Similarity Matrix */}
      {hasResults && matrixDocs.length > 1 && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <BarChart3 className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Similarity Matrix</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">Pairwise similarity between documents. Green = low similarity, Red = high similarity.</p>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex">
                <div className="w-20 flex-shrink-0" />
                {matrixDocs.map((d, j) => (
                  <div key={j} className="flex-1 min-w-[60px] text-center text-[10px] text-ink-500 truncate px-1 pb-1" title={d}>
                    {d.length > 10 ? d.slice(0, 8) + '…' : d}
                  </div>
                ))}
              </div>
              {matrix.map((row, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-20 flex-shrink-0 text-[10px] text-ink-500 truncate pr-2 text-right" title={matrixDocs[i]}>
                    {matrixDocs[i].length > 14 ? matrixDocs[i].slice(0, 12) + '…' : matrixDocs[i]}
                  </div>
                  {row.map((val, j) => (
                    <div
                      key={j}
                      className={`flex-1 min-w-[60px] h-12 flex items-center justify-center text-[11px] font-bold border border-white ${similarityColor(val)}`}
                      title={`${matrixDocs[i]} ↔ ${matrixDocs[j]}: ${val}%`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400" /> Low (0-25%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-300" /> Moderate (25-50%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> High (50-75%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Very High (75-100%)</span>
          </div>
        </PortalCard>
      )}

      {/* Recent Scans */}
      <PortalCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Clock className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Recent Scans</h3>
        </div>
        {history.length === 0 ? (
          <EmptyState icon={Clock} title="No scan history" message="Run your first duplicate scan to see history here." />
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-ink-50 border border-ink-100 hover:border-teal-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-ink-100 flex items-center justify-center">
                    <Scan className="text-teal-600" size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-900">{h.date}</div>
                    <div className="text-xs text-ink-500">{h.scanned} scanned · {h.found} duplicates found</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={h.status === 'completed' ? 'success' : 'info'}>{h.status}</Badge>
                  <button
                    onClick={() => navigateTo('/ai/duplicate')}
                    className="text-ink-400 hover:text-teal-600"
                    title="View"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Footer */}
      <div className="mt-6 p-4 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-3">
        <Sparkles size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-ink-600">
          Duplicate detection uses semantic fingerprinting and similarity scoring. Results are simulated for demonstration.
          {user ? ` Signed in as ${user.email}.` : ''}
        </p>
      </div>
    </div>
  );
}
