import { useState, useRef, useCallback } from 'react';
import {
  BadgeCheck,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileSearch,
  Database,
  ShieldCheck,
  Link2,
  X,
  Award,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import {
  PortalCard,
  PortalPageHeader,
  PortalButton,
  Badge,
  EmptyState,
  PortalLoading,
} from '../../components/portal-ui';

type StepStatus = 'pending' | 'active' | 'pass' | 'fail' | 'warning';

type VerificationStep = {
  label: string;
  description: string;
  icon: LucideIcon;
  status: StepStatus;
  detail: string;
};

type VerifiedCert = {
  id: string;
  name: string;
  institution: string;
  degree: string;
  year: string;
  verifiedDate: string;
  status: 'verified' | 'flagged' | 'pending';
};

const STEP_DEFS: { label: string; description: string; icon: LucideIcon }[] = [
  { label: 'Document Analysis', description: 'Extracting text and checking layout', icon: FileSearch },
  { label: 'Database Cross-Reference', description: 'Checking against institution records', icon: Database },
  { label: 'Security Features', description: 'Watermark, hologram, signature verification', icon: ShieldCheck },
  { label: 'Blockchain Verification', description: 'Checking hash on chain', icon: Link2 },
];

export default function AiCertificatePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState<VerificationStep[]>(
    STEP_DEFS.map((s) => ({ ...s, status: 'pending' as StepStatus, detail: '' }))
  );
  const [verdict, setVerdict] = useState<'authentic' | 'suspicious' | null>(null);
  const [confidence, setConfidence] = useState(0);

  const [verifiedCerts] = useState<VerifiedCert[]>([
    { id: '1', name: 'Jonathan Smith', institution: 'Meridian University', degree: 'B.Sc. Computer Science', year: '2024', verifiedDate: 'Jan 15, 2024', status: 'verified' },
    { id: '2', name: 'Alice Garcia', institution: 'Harvard University', degree: 'M.A. Economics', year: '2023', verifiedDate: 'Dec 03, 2023', status: 'verified' },
    { id: '3', name: 'Robert Chen', institution: 'Unknown Institute', degree: 'Ph.D. Physics', year: '2022', verifiedDate: 'Nov 20, 2023', status: 'flagged' },
    { id: '4', name: 'Maria Lopez', institution: 'Stanford University', degree: 'B.A. History', year: '2024', verifiedDate: 'Jan 08, 2024', status: 'verified' },
    { id: '5', name: 'David Kim', institution: 'MIT', degree: 'M.Eng. Electrical', year: '2023', verifiedDate: 'Oct 29, 2023', status: 'pending' },
  ]);

  const stats = {
    total: verifiedCerts.length,
    verified: verifiedCerts.filter((c) => c.status === 'verified').length,
    flagged: verifiedCerts.filter((c) => c.status === 'flagged').length,
    pending: verifiedCerts.filter((c) => c.status === 'pending').length,
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      resetVerification();
    }
  };

  const resetVerification = () => {
    setVerifying(false);
    setCurrentStep(-1);
    setSteps(STEP_DEFS.map((s) => ({ ...s, status: 'pending' as StepStatus, detail: '' })));
    setVerdict(null);
    setConfidence(0);
  };

  const handleClear = () => {
    setSelectedFile(null);
    resetVerification();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVerification = useCallback(() => {
    if (!selectedFile) return;
    setVerifying(true);
    resetVerification();
    setVerifying(true);

    // Simulate each verification step sequentially
    const stepResults: { status: StepStatus; detail: string }[] = [
      { status: 'pass', detail: 'Layout matches standard certificate format. Text extracted successfully.' },
      { status: 'pass', detail: 'Institution record found. Degree and year match database entry.' },
      { status: 'warning', detail: 'Watermark detected. Signature matches. Hologram partially visible.' },
      { status: 'pass', detail: 'Hash verified on blockchain. Certificate registered on 2024-01-15.' },
    ];

    let stepIndex = 0;
    const stepDuration = 1400;

    const runStep = () => {
      if (stepIndex >= STEP_DEFS.length) {
        // Finalize verdict
        const hasFail = stepResults.some((r) => r.status === 'fail');
        const hasWarning = stepResults.some((r) => r.status === 'warning');
        const finalVerdict = hasFail ? 'suspicious' : 'authentic';
        const finalConfidence = hasFail ? 42 : hasWarning ? 87 : 96;
        setVerdict(finalVerdict);
        setConfidence(finalConfidence);
        setVerifying(false);
        return;
      }

      // Set current step active
      setCurrentStep(stepIndex);
      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i === stepIndex ? 'active' : i < stepIndex ? stepResults[i].status : 'pending',
          detail: i < stepIndex ? stepResults[i].detail : '',
        }))
      );

      // After duration, mark step complete and move to next
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) =>
            i === stepIndex
              ? { ...s, status: stepResults[stepIndex].status, detail: stepResults[stepIndex].detail }
              : s
          )
        );
        stepIndex++;
        runStep();
      }, stepDuration);
    };

    // Small initial delay
    setTimeout(runStep, 200);
  }, [selectedFile]);

  const statusVariant = (s: VerifiedCert['status']) =>
    s === 'verified' ? 'success' : s === 'flagged' ? 'error' : 'warning';

  const statusIcon = (s: StepStatus): LucideIcon =>
    s === 'pass' ? CheckCircle : s === 'fail' ? XCircle : s === 'warning' ? AlertTriangle : s === 'active' ? Loader2 : FileSearch;

  const statusColor = (s: StepStatus) =>
    s === 'pass' ? 'text-green-600' : s === 'fail' ? 'text-red-500' : s === 'warning' ? 'text-amber-500' : s === 'active' ? 'text-teal-600' : 'text-ink-400';

  const statusBg = (s: StepStatus) =>
    s === 'pass' ? 'bg-green-500' : s === 'fail' ? 'bg-red-500' : s === 'warning' ? 'bg-amber-500' : s === 'active' ? 'bg-gradient-to-br from-cyan-500 to-teal-600' : 'bg-ink-200';

  // Progress ring calculation
  const ringPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Certificate Verification"
        subtitle="AI-powered certificate authenticity verification with blockchain validation"
        icon={BadgeCheck}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/ai/dashboard')}>
            <BadgeCheck size={16} /> AI Dashboard
          </PortalButton>
        }
      />

      {/* Gradient accent banner */}
      <div className="rounded-2xl p-5 mb-6 bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <BadgeCheck size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold">Verification Engine Ready</h3>
            <p className="text-sm text-cyan-50">4-step verification · {user?.email ?? 'guest'} · Blockchain enabled</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <Link2 size={16} className="text-cyan-100" />
            <span className="text-sm font-medium">Chain: Ethereum mainnet</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Upload certificate zone */}
        <PortalCard className="p-6">
          <h3 className="font-bold text-ink-900 mb-4">Upload Certificate</h3>

          {!selectedFile ? (
            <label
              htmlFor="cert-file-input"
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-ink-200 rounded-xl py-16 px-6 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-ink-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                <Upload size={30} className="text-ink-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-medium text-ink-700">Click to upload a certificate</p>
                <p className="text-xs text-ink-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                id="cert-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Award size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900 truncate">{selectedFile}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {verifying ? 'Verification in progress...' : verdict ? 'Verification complete' : 'Ready to verify'}
                  </p>
                </div>
                {!verifying && (
                  <button
                    onClick={handleClear}
                    className="w-8 h-8 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-400 hover:text-ink-700 transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {!verifying && !verdict && (
                <PortalButton
                  onClick={startVerification}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:opacity-90"
                >
                  <BadgeCheck size={16} /> Start Verification
                </PortalButton>
              )}

              {verdict && (
                <PortalButton
                  variant="secondary"
                  onClick={startVerification}
                  className="w-full"
                >
                  <Loader2 size={16} /> Re-verify
                </PortalButton>
              )}
            </div>
          )}
        </PortalCard>

        {/* Verification status */}
        <PortalCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">Verification Status</h3>
            {verdict && (
              <Badge variant={verdict === 'authentic' ? 'success' : 'error'}>
                {verdict === 'authentic' ? 'Authentic' : 'Suspicious'}
              </Badge>
            )}
          </div>

          {!selectedFile && !verifying && !verdict ? (
            <EmptyState
              icon={BadgeCheck}
              title="No certificate uploaded"
              message="Upload a certificate image to begin the 4-step AI verification process."
            />
          ) : (
            <div className="space-y-3">
              {/* Steps */}
              {steps.map((step, i) => {
                const SIcon = statusIcon(step.status);
                return (
                  <div
                    key={step.label}
                    className={`p-3.5 rounded-lg border transition-all ${
                      step.status === 'active'
                        ? 'border-teal-300 bg-teal-50'
                        : step.status === 'pass'
                          ? 'border-green-100 bg-green-50/50'
                          : step.status === 'warning'
                            ? 'border-amber-100 bg-amber-50/50'
                            : step.status === 'fail'
                              ? 'border-red-100 bg-red-50/50'
                              : 'border-ink-100 bg-ink-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${statusBg(step.status)}`}
                      >
                        {step.status === 'active' ? (
                          <Loader2 size={18} className="text-white animate-spin" />
                        ) : (
                          <SIcon size={18} className={step.status === 'pending' ? 'text-ink-400' : 'text-white'} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink-900">
                            Step {i + 1}: {step.label}
                          </span>
                          {step.status !== 'pending' && step.status !== 'active' && (
                            <span className={`text-xs font-bold uppercase ${statusColor(step.status)}`}>
                              {step.status}
                            </span>
                          )}
                          {step.status === 'active' && (
                            <span className="text-xs font-bold uppercase text-teal-600">Checking...</span>
                          )}
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">{step.description}</p>
                        {step.detail && (
                          <p className="text-xs text-ink-600 mt-1.5 pt-1.5 border-t border-ink-100/60">
                            {step.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Final verdict */}
              {verdict && (
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    verdict === 'authentic'
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        verdict === 'authentic' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {verdict === 'authentic' ? (
                        <CheckCircle size={26} className="text-white" />
                      ) : (
                        <XCircle size={26} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-lg font-bold ${
                          verdict === 'authentic' ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {verdict === 'authentic' ? 'Certificate is Authentic' : 'Certificate is Suspicious'}
                      </p>
                      <p className="text-sm text-ink-600 mt-0.5">
                        Confidence score:{' '}
                        <span className={`font-bold ${verdict === 'authentic' ? 'text-green-700' : 'text-red-700'}`}>
                          {confidence}%
                        </span>
                      </p>
                    </div>
                    {/* Confidence ring */}
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" className="text-ink-100" strokeWidth="5" />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="currentColor"
                          className={verdict === 'authentic' ? 'text-green-500' : 'text-red-500'}
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - confidence / 100)}`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-700">
                        {confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </PortalCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Verified certificates table */}
        <PortalCard className="p-6 lg:col-span-2">
          <h3 className="font-bold text-ink-900 mb-5">Verified Certificates</h3>
          {verifiedCerts.length === 0 ? (
            <EmptyState icon={Award} title="No certificates yet" message="Verified certificates will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-500 border-b border-ink-100">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Institution</th>
                    <th className="pb-3 font-medium">Degree</th>
                    <th className="pb-3 font-medium">Year</th>
                    <th className="pb-3 font-medium">Verified</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedCerts.map((c) => (
                    <tr key={c.id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="py-3 font-medium text-ink-900">{c.name}</td>
                      <td className="py-3 text-ink-700">{c.institution}</td>
                      <td className="py-3 text-ink-700">{c.degree}</td>
                      <td className="py-3 text-ink-500">{c.year}</td>
                      <td className="py-3 text-ink-500">{c.verifiedDate}</td>
                      <td className="py-3 text-right">
                        <Badge variant={statusVariant(c.status)}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PortalCard>

        {/* Verification statistics with progress rings */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-teal-600" />
            <h3 className="font-bold text-ink-900">Verification Statistics</h3>
          </div>
          <p className="text-xs text-ink-500 mb-5">Overview of verification outcomes</p>

          <div className="space-y-5">
            {/* Total verified ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-ink-100" strokeWidth="6" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    className="text-teal-500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - ringPercent(stats.verified, stats.total) / 100)}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-900">
                  {stats.verified}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Verified</p>
                <p className="text-xs text-ink-500">{Math.round(ringPercent(stats.verified, stats.total))}% of total</p>
              </div>
            </div>

            {/* Flagged ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-ink-100" strokeWidth="6" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    className="text-red-500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - ringPercent(stats.flagged, stats.total) / 100)}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-900">
                  {stats.flagged}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Flagged</p>
                <p className="text-xs text-ink-500">{Math.round(ringPercent(stats.flagged, stats.total))}% of total</p>
              </div>
            </div>

            {/* Pending ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-ink-100" strokeWidth="6" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    className="text-amber-500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - ringPercent(stats.pending, stats.total) / 100)}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-900">
                  {stats.pending}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Pending</p>
                <p className="text-xs text-ink-500">{Math.round(ringPercent(stats.pending, stats.total))}% of total</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between">
            <span className="text-sm text-ink-500">Total processed</span>
            <span className="text-lg font-bold text-ink-900">{stats.total}</span>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
