import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloudUpload, Download, Play, CheckCircle, XCircle } from 'lucide-react';

// AI Admission Advisor
// This is a self-contained UI-only admin page that uses TailwindCSS and follows the project's design language.
// No APIs, no backend, mock data only.

type Stats = {
  totalApplications: number;
  eligibleStudents: number;
  rejectedStudents: number;
  pendingReview: number;
};

type Prediction = {
  id: string;
  student: string;
  department: string;
  confidence: number; // 0..1
  status: 'Eligible' | 'Rejected' | 'Pending';
};

export default function AdminAiAdmissionAdvisorPage(): JSX.Element {
  // --- Stats ---
  const [stats, setStats] = useState<Stats>({
    totalApplications: 1240,
    eligibleStudents: 320,
    rejectedStudents: 640,
    pendingReview: 280,
  });

  // --- Upload / dataset ---
  const [datasetFiles, setDatasetFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationPassed, setValidationPassed] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- Training ---
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [metrics, setMetrics] = useState({ accuracy: 0.0, precision: 0.0, recall: 0.0, f1: 0.0 });
  const [modelReady, setModelReady] = useState(false);

  // --- Predictions ---
  const [studentForm, setStudentForm] = useState({ name: '', marks: '', subjects: '', percentage: '' });
  const [predictionResult, setPredictionResult] = useState<{ department?: string; eligibility?: string; confidence?: number; reasoning?: string } | null>(null);

  // --- Recent predictions mock ---
  const [recent, setRecent] = useState<Prediction[]>(() => {
    return [
      { id: 'S-1001', student: 'Ali Khan', department: 'Computer Science', confidence: 0.92, status: 'Eligible' },
      { id: 'S-1002', student: 'Sara Ahmed', department: 'Business', confidence: 0.78, status: 'Pending' },
      { id: 'S-1003', student: 'Omar Latif', department: 'Electrical', confidence: 0.61, status: 'Rejected' },
    ];
  });

  // --- Charts data (derived) ---
  const departmentDistribution = useMemo(() => {
    return [
      { name: 'Computer Science', value: 120 },
      { name: 'Electrical', value: 80 },
      { name: 'Business', value: 200 },
      { name: 'Arts', value: 40 },
    ];
  }, []);

  const eligibilityRatio = useMemo(() => {
    const eligible = stats.eligibleStudents;
    const rejected = stats.rejectedStudents;
    const pending = stats.pendingReview;
    return { eligible, rejected, pending };
  }, [stats]);

  // --- Helpers ---
  const humanPercent = (v: number) => `${Math.round(v * 100)}%`;

  // Drag & drop handlers
  const onFilesSelected = useCallback((files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => f.name.endsWith('.csv'));
    setDatasetFiles(accepted);
    setValidationPassed(false);
    setValidationErrors([]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onFilesSelected(e.dataTransfer.files);
  }, [onFilesSelected]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const startUploadSimulation = useCallback(() => {
    setUploadProgress(0);
    setValidationErrors([]);
    setValidationPassed(false);
    // simulate upload progress
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 12;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        // run validation simulation
        const errors: string[] = [];
        // pretend we check filenames
        if (!datasetFiles.some((f) => f.name === 'student_admissions.csv')) {
          errors.push('student_admissions.csv is missing');
        }
        if (!datasetFiles.some((f) => f.name === 'department_admission_rules.csv')) {
          errors.push('department_admission_rules.csv is missing');
        }
        if (errors.length === 0) {
          setValidationPassed(true);
          // tiny success pulse
          setTimeout(() => setUploadProgress(0), 400);
        } else {
          setValidationErrors(errors);
        }
      }
      setUploadProgress(Math.round(p));
    }, 250);
  }, [datasetFiles]);

  // Training simulation
  useEffect(() => {
    let tId: number | undefined;
    if (isTraining) {
      setModelReady(false);
      setTrainingProgress(0);
      let p = 0;
      tId = window.setInterval(() => {
        p += 6 + Math.random() * 8;
        if (p >= 100) {
          p = 100;
          // set metrics
          setMetrics({ accuracy: 0.88, precision: 0.85, recall: 0.82, f1: 0.835 });
          setIsTraining(false);
          setModelReady(true);
          if (tId) window.clearInterval(tId);
        }
        setTrainingProgress(Math.round(p));
      }, 400);
    }
    return () => {
      if (tId) window.clearInterval(tId);
    };
  }, [isTraining]);

  const onStartTraining = () => {
    // require validation
    if (!validationPassed) {
      alert('Please upload and validate datasets before training.');
      return;
    }
    setIsTraining(true);
    setTrainingProgress(0);
  };

  const onDownloadModel = () => {
    // UI-only: simulate download
    const data = JSON.stringify({ model: 'random-forest', created: new Date().toISOString(), metrics });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-admission-model.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRecommendation = () => {
    // simple deterministic pseudo-prediction based on percentage
    const pct = Number(studentForm.percentage) || 0;
    let department = 'General Studies';
    let eligibility: string = 'Pending';
    let confidence = 0.5;
    let reasoning = '';
    if (pct >= 85) {
      department = 'Computer Science';
      eligibility = 'Eligible';
      confidence = 0.95;
      reasoning = 'High percentage and strong subject marks indicate suitability for CS.';
    } else if (pct >= 70) {
      department = 'Business';
      eligibility = 'Eligible';
      confidence = 0.82;
      reasoning = 'Good academic performance and balanced subject strengths.';
    } else if (pct >= 55) {
      department = 'Electrical';
      eligibility = 'Pending';
      confidence = 0.68;
      reasoning = 'Moderate performance; additional review recommended.';
    } else {
      department = 'Foundation / Remedial';
      eligibility = 'Rejected';
      confidence = 0.6;
      reasoning = 'Low percentage relative to program requirements.';
    }
    setPredictionResult({ department, eligibility, confidence, reasoning });
    // add to recent
    const newPred: Prediction = {
      id: `S-${Math.floor(1000 + Math.random() * 9000)}`,
      student: studentForm.name || 'Unknown',
      department,
      confidence,
      status: eligibility === 'Eligible' ? 'Eligible' : eligibility === 'Rejected' ? 'Rejected' : 'Pending',
    };
    setRecent((r) => [newPred, ...r].slice(0, 8));
  };

  // small helper UI components within this file
  const StatCard = ({ title, value, accent }: { title: string; value: string | number; accent?: string }) => (
    <div className={`rounded-xl bg-white/80 shadow-soft p-4 flex-1 min-w-[180px]`}> 
      <div className="text-sm text-ink-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-ink-900">{value}</div>
    </div>
  );

  const Progress = ({ value }: { value: number }) => (
    <div className="w-full bg-ink-100 rounded-full h-3 overflow-hidden">
      <div className="bg-gradient-to-r from-theme-primary to-theme-accent h-3 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );

  // Simple donut chart for eligibility ratio
  const Donut = ({ eligible, rejected, pending }: { eligible: number; rejected: number; pending: number }) => {
    const total = eligible + rejected + pending || 1;
    const e = (eligible / total) * 100;
    const r = (rejected / total) * 100;
    const p = (pending / total) * 100;
    // compute arcs
    const size = 120;
    const stroke = 18;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const eLen = (e / 100) * circumference;
    const rLen = (r / 100) * circumference;
    const pLen = (p / 100) * circumference;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          <circle r={radius} fill="none" stroke="#10b981" strokeWidth={stroke} strokeDasharray={`${eLen} ${circumference - eLen}`} strokeLinecap="round" transform={`rotate(-90)`} />
          <circle r={radius} fill="none" stroke="#ef4444" strokeWidth={stroke} strokeDasharray={`${rLen} ${circumference - rLen}`} strokeLinecap="round" transform={`rotate(${(e / 100) * 360 - 90})`} />
          <circle r={radius} fill="none" stroke="#f59e0b" strokeWidth={stroke} strokeDasharray={`${pLen} ${circumference - pLen}`} strokeLinecap="round" transform={`rotate(${((e + r) / 100) * 360 - 90})`} />
          <text x={0} y={4} textAnchor="middle" fontSize={14} className="text-ink-900 font-semibold">{Math.round((eligible / total) * 100)}%</text>
        </g>
      </svg>
    );
  };

  // Simple bar chart for department distribution
  const BarChart = ({ data }: { data: { name: string; value: number }[] }) => {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
      <div className="flex flex-col gap-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <div className="w-32 text-sm text-ink-600">{d.name}</div>
            <div className="flex-1 h-4 bg-ink-100 rounded overflow-hidden">
              <div className="bg-theme-primary h-4 rounded" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <div className="w-12 text-right text-sm text-ink-700">{d.value}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-ink-50">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">AI Admission Advisor</h1>
            <p className="text-sm text-ink-500 mt-1">Admin dashboard for dataset management, model training and prediction exploration.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-white shadow-soft text-sm font-medium flex items-center gap-2">
              <Download size={16} /> Export Results
            </button>
            <button className="px-4 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium flex items-center gap-2">
              <Play size={16} /> Run Batch
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <StatCard title="Total Applications" value={stats.totalApplications} />
          <StatCard title="Eligible Students" value={stats.eligibleStudents} />
          <StatCard title="Rejected Students" value={stats.rejectedStudents} />
          <StatCard title="Pending Review" value={stats.pendingReview} />
        </div>

        {/* Grid: Upload | Train | Prediction | Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upload dataset card */}
          <div className="rounded-xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Upload Dataset</h3>
                <p className="text-sm text-ink-500">student_admissions.csv & department_admission_rules.csv</p>
              </div>
              <div className="text-sm text-ink-500">CSV • UTF-8</div>
            </div>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="mt-4 border-2 border-dashed border-ink-100 rounded-lg p-4 text-center bg-ink-50 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" className="hidden" multiple accept=".csv" onChange={(e) => onFilesSelected(e.target.files)} />
              <div className="flex flex-col items-center justify-center gap-2">
                <CloudUpload size={36} className="text-ink-500" />
                <div className="text-sm text-ink-600">Drag &amp; drop CSV files here, or click to browse</div>
                <div className="text-xs text-ink-400">Required: student_admissions.csv and department_admission_rules.csv</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-ink-600">Upload Progress</div>
                <div className="text-sm text-ink-700">{uploadProgress}%</div>
              </div>
              <Progress value={uploadProgress} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={startUploadSimulation} className="px-3 py-2 rounded-md bg-theme-primary text-white text-sm">Start Upload</button>
              <button onClick={() => { setDatasetFiles([]); setValidationErrors([]); setValidationPassed(false); setUploadProgress(0); }} className="px-3 py-2 rounded-md bg-ink-100 text-sm">Clear</button>
              <div className="ml-auto text-sm text-ink-500">{datasetFiles.length} file(s) selected</div>
            </div>

            <div className="mt-3">
              {validationPassed ? (
                <div className="text-sm text-green-600 flex items-center gap-2"><CheckCircle size={16} /> Dataset validated successfully</div>
              ) : validationErrors.length > 0 ? (
                <div className="text-sm text-ink-700">
                  <div className="text-sm font-medium text-ink-900">Validation Errors</div>
                  <ul className="list-disc list-inside text-sm text-ink-600 mt-1">
                    {validationErrors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="text-sm text-ink-500">No validation run yet</div>
              )}
            </div>
          </div>

          {/* Train Model card */}
          <div className="rounded-xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Train Model</h3>
                <p className="text-sm text-ink-500">Random Forest — lightweight, interpretable ensemble</p>
              </div>
              <div className="text-sm text-ink-500">Model: Random Forest</div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-ink-600 mb-2">
                <div>Training Progress</div>
                <div>{trainingProgress}%</div>
              </div>
              <Progress value={trainingProgress} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md p-3 bg-ink-50">
                <div className="text-xs text-ink-500">Training Accuracy</div>
                <div className="text-lg font-semibold text-ink-900">{Math.round(metrics.accuracy * 100)}%</div>
              </div>
              <div className="rounded-md p-3 bg-ink-50">
                <div className="text-xs text-ink-500">Precision</div>
                <div className="text-lg font-semibold text-ink-900">{Math.round(metrics.precision * 100)}%</div>
              </div>
              <div className="rounded-md p-3 bg-ink-50">
                <div className="text-xs text-ink-500">Recall</div>
                <div className="text-lg font-semibold text-ink-900">{Math.round(metrics.recall * 100)}%</div>
              </div>
              <div className="rounded-md p-3 bg-ink-50">
                <div className="text-xs text-ink-500">F1 Score</div>
                <div className="text-lg font-semibold text-ink-900">{Math.round(metrics.f1 * 100)}%</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={onStartTraining} className="px-3 py-2 bg-theme-primary text-white rounded-md flex items-center gap-2"><Play size={16} /> Train</button>
              <button onClick={onDownloadModel} disabled={!modelReady} className={`px-3 py-2 rounded-md flex items-center gap-2 ${modelReady ? 'bg-white shadow-soft' : 'bg-ink-100 text-ink-400'}`}><Download size={16} /> Download Model</button>
              <div className="ml-auto text-sm text-ink-500">{modelReady ? 'Model ready' : isTraining ? 'Training...' : 'Not trained'}</div>
            </div>
          </div>

          {/* Prediction card */}
          <div className="rounded-xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Prediction</h3>
                <p className="text-sm text-ink-500">Single-student prediction using trained model (UI-only)</p>
              </div>
              <div className="text-sm text-ink-500">Confidence & reasoning</div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <input value={studentForm.name} onChange={(e) => setStudentForm(s => ({ ...s, name: e.target.value }))} placeholder="Student name" className="rounded-md border border-ink-100 px-3 py-2" />
              <input value={studentForm.marks} onChange={(e) => setStudentForm(s => ({ ...s, marks: e.target.value }))} placeholder="Marks (comma separated)" className="rounded-md border border-ink-100 px-3 py-2" />
              <input value={studentForm.subjects} onChange={(e) => setStudentForm(s => ({ ...s, subjects: e.target.value }))} placeholder="Subjects" className="rounded-md border border-ink-100 px-3 py-2" />
              <input value={studentForm.percentage} onChange={(e) => setStudentForm(s => ({ ...s, percentage: e.target.value }))} placeholder="Percentage" className="rounded-md border border-ink-100 px-3 py-2" />

              <div className="flex items-center gap-3">
                <button onClick={generateRecommendation} className="px-3 py-2 bg-theme-primary text-white rounded-md">Generate Recommendation</button>
                <button onClick={() => setStudentForm({ name: '', marks: '', subjects: '', percentage: '' })} className="px-3 py-2 bg-ink-100 rounded-md">Clear</button>
                <div className="ml-auto text-sm text-ink-500">Model: Random Forest</div>
              </div>

              {predictionResult && (
                <div className="mt-2 rounded-md border border-ink-100 p-3 bg-ink-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-ink-500">Recommended Department</div>
                      <div className="text-lg font-semibold text-ink-900">{predictionResult.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-ink-500">Eligibility</div>
                      <div className="text-lg font-semibold text-ink-900">{predictionResult.eligibility}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-28">
                      <div className="text-xs text-ink-500">Confidence</div>
                      <div className="text-lg font-semibold text-ink-900">{Math.round((predictionResult.confidence ?? 0) * 100)}%</div>
                      <Progress value={Math.round((predictionResult.confidence ?? 0) * 100)} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-ink-500">Reasoning</div>
                      <div className="text-sm text-ink-700 mt-1">{predictionResult.reasoning}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts and recent predictions */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 lg:col-span-1 rounded-xl bg-white p-5 shadow-soft">
            <h4 className="text-sm text-ink-600 mb-3">Department Distribution</h4>
            <BarChart data={departmentDistribution} />
          </div>

          <div className="col-span-1 lg:col-span-1 rounded-xl bg-white p-5 shadow-soft flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div>
                <h4 className="text-sm text-ink-600">Eligibility Ratio</h4>
                <div className="mt-3"><Donut eligible={eligibilityRatio.eligible} rejected={eligibilityRatio.rejected} pending={eligibilityRatio.pending} /></div>
              </div>
              <div>
                <div className="text-sm text-ink-600">Legend</div>
                <div className="mt-2 text-sm text-ink-700">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#10b981] rounded" /> Eligible</div>
                  <div className="flex items-center gap-2 mt-2"><div className="w-3 h-3 bg-[#ef4444] rounded" /> Rejected</div>
                  <div className="flex items-center gap-2 mt-2"><div className="w-3 h-3 bg-[#f59e0b] rounded" /> Pending</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-1 rounded-xl bg-white p-5 shadow-soft">
            <h4 className="text-sm text-ink-600 mb-3">Prediction Accuracy (mock)</h4>
            <div className="w-full h-40 bg-ink-50 rounded flex items-center justify-center text-ink-500">Placeholder for accuracy chart</div>
            <div className="mt-3 text-sm text-ink-600">Current accuracy: <span className="font-semibold text-ink-900">{Math.round(metrics.accuracy * 100)}%</span></div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-ink-900">Recent Predictions</h4>
            <div className="text-sm text-ink-500">Most recent 8</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ink-600">
                  <th className="p-3">Student</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-ink-100">
                    <td className="p-3">{r.student} <div className="text-xs text-ink-400">{r.id}</div></td>
                    <td className="p-3">{r.department}</td>
                    <td className="p-3">{Math.round(r.confidence * 100)}%</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 rounded bg-ink-100 text-sm">View</button>
                        <button className="px-2 py-1 rounded bg-theme-primary text-white text-sm">Apply</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
