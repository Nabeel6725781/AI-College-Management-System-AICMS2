import { useState, useRef, useCallback } from 'react';
import {
  Eye,
  ScanFace,
  Boxes,
  FileStack,
  PenLine,
  Table,
  Gauge,
  Upload,
  Loader2,
  CheckCircle,
  Cpu,
  Activity,
  Layers,
  ShieldCheck,
  X,
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

type Capability = {
  name: string;
  description: string;
  icon: LucideIcon;
  accuracy: number;
  status: 'active' | 'beta' | 'maintenance';
};

type DetectedObject = {
  label: string;
  confidence: number;
  box: { x: number; y: number; w: number; h: number };
};

type QualityMetric = {
  label: string;
  value: number;
  unit: string;
};

type ModelPerf = {
  name: string;
  accuracy: number;
  color: string;
};

type ActiveModel = {
  name: string;
  version: string;
  updated: string;
  status: 'active' | 'idle' | 'training';
};

export default function AiComputerVisionPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [capabilities] = useState<Capability[]>([
    { name: 'Face Detection', description: 'Detect and identify faces in images', icon: ScanFace, accuracy: 98.4, status: 'active' },
    { name: 'Object Recognition', description: 'Identify objects within images', icon: Boxes, accuracy: 95.7, status: 'active' },
    { name: 'Document Classification', description: 'Classify document types automatically', icon: FileStack, accuracy: 97.2, status: 'active' },
    { name: 'Handwriting Recognition', description: 'Convert handwritten text to digital', icon: PenLine, accuracy: 91.3, status: 'beta' },
    { name: 'Table Extraction', description: 'Extract structured data from tables', icon: Table, accuracy: 93.8, status: 'active' },
    { name: 'Image Quality Assessment', description: 'Evaluate image resolution and clarity', icon: Gauge, accuracy: 99.1, status: 'active' },
  ]);

  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [detectedText, setDetectedText] = useState('');

  const [modelPerf] = useState<ModelPerf[]>([
    { name: 'ResNet-50', accuracy: 94.2, color: 'bg-teal-500' },
    { name: 'EfficientNet-B7', accuracy: 96.8, color: 'bg-cyan-500' },
    { name: 'Vision Transformer', accuracy: 97.5, color: 'bg-teal-400' },
    { name: 'YOLOv8', accuracy: 93.1, color: 'bg-cyan-400' },
    { name: 'Custom Ensemble', accuracy: 98.3, color: 'bg-teal-600' },
  ]);

  const [activeModels] = useState<ActiveModel[]>([
    { name: 'OCR Engine v4.2', version: 'v4.2.1', updated: '2 hours ago', status: 'active' },
    { name: 'FaceNet Recognition', version: 'v2.1.0', updated: '1 day ago', status: 'active' },
    { name: 'DocClassifier Pro', version: 'v3.0.4', updated: '3 days ago', status: 'active' },
    { name: 'Handwriting OCR', version: 'v1.0.0-beta', updated: '5 days ago', status: 'training' },
    { name: 'TableExtractor X', version: 'v2.3.1', updated: '1 week ago', status: 'idle' },
  ]);

  const statusVariant = (s: Capability['status']) =>
    s === 'active' ? 'success' : s === 'beta' ? 'info' : 'warning';

  const modelStatusVariant = (s: ActiveModel['status']) =>
    s === 'active' ? 'success' : s === 'training' ? 'info' : 'default';

  const maxModelAcc = Math.max(...modelPerf.map((m) => m.accuracy));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      setHasResults(false);
      setAnalysisProgress(0);
    }
  };

  const runAnalysis = useCallback(() => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setHasResults(false);
    setAnalysisProgress(0);
    setDetectedObjects([]);
    setQualityMetrics([]);
    setDetectedText('');

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Generate results
          setDetectedObjects([
            { label: 'Person', confidence: 98.7, box: { x: 120, y: 85, w: 180, h: 240 } },
            { label: 'Document', confidence: 96.2, box: { x: 50, y: 200, w: 320, h: 180 } },
            { label: 'Text Region', confidence: 94.8, box: { x: 60, y: 210, w: 300, h: 160 } },
            { label: 'Signature', confidence: 89.3, box: { x: 280, y: 340, w: 80, h: 40 } },
            { label: 'Watermark', confidence: 85.6, box: { x: 150, y: 150, w: 120, h: 120 } },
          ]);
          setQualityMetrics([
            { label: 'Resolution', value: 92, unit: 'DPI' },
            { label: 'Brightness', value: 68, unit: '%' },
            { label: 'Contrast', value: 74, unit: '%' },
            { label: 'Sharpness', value: 85, unit: '%' },
          ]);
          setDetectedText(
            `CERTIFICATE OF ACHIEVEMENT
=========================
This is to certify that
Jonathan Smith
has successfully completed the
Advanced Computer Science Program
Awarded: June 15, 2024
Institution: Meridian University
Signature: [Verified]`
          );
          setAnalyzing(false);
          setHasResults(true);
          return 100;
        }
        return prev + 3;
      });
    }, 60);
  }, [selectedFile]);

  const handleClear = () => {
    setSelectedFile(null);
    setHasResults(false);
    setAnalysisProgress(0);
    setDetectedObjects([]);
    setQualityMetrics([]);
    setDetectedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Computer Vision"
        subtitle="AI-powered image analysis, object detection, and visual recognition"
        icon={Eye}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/ai/dashboard')}>
            <Cpu size={16} /> AI Dashboard
          </PortalButton>
        }
      />

      {/* Gradient accent banner */}
      <div className="rounded-2xl p-5 mb-6 bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Eye size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold">CV Engine Active</h3>
            <p className="text-sm text-cyan-50">5 models loaded · {user?.email ?? 'guest'} · GPU acceleration enabled</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <Activity size={16} className="text-cyan-100" />
            <span className="text-sm font-medium">Latency: 42ms avg</span>
          </div>
        </div>
      </div>

      {/* CV Capabilities grid */}
      <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3">CV Capabilities</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {capabilities.map((cap) => {
          const CIcon = cap.icon;
          return (
            <PortalCard key={cap.name} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <CIcon size={22} className="text-white" />
                </div>
                <Badge variant={statusVariant(cap.status)}>
                  {cap.status.charAt(0).toUpperCase() + cap.status.slice(1)}
                </Badge>
              </div>
              <h4 className="font-semibold text-ink-900">{cap.name}</h4>
              <p className="text-xs text-ink-500 mt-1 mb-3">{cap.description}</p>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ink-500">Accuracy</span>
                  <span className="text-xs font-bold text-teal-600">{cap.accuracy}%</span>
                </div>
                <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-700"
                    style={{ width: `${cap.accuracy}%` }}
                  />
                </div>
              </div>
            </PortalCard>
          );
        })}
      </div>

      {/* Live demo */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-teal-600" />
            <h3 className="font-bold text-ink-900">Live Demo</h3>
          </div>
          {hasResults && <Badge variant="success"><CheckCircle size={12} className="mr-1" /> Analysis complete</Badge>}
        </div>

        {/* Upload / file display */}
        <div className="mb-5">
          {!selectedFile ? (
            <label
              htmlFor="cv-file-input"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-ink-200 rounded-xl py-12 px-6 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-ink-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                <Upload size={26} className="text-ink-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-medium text-ink-700">Upload an image to analyze</p>
                <p className="text-xs text-ink-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                id="cv-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Layers size={20} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-900 truncate">{selectedFile}</p>
                <p className="text-xs text-ink-500 mt-0.5">{hasResults ? 'Analysis complete' : 'Ready for analysis'}</p>
              </div>
              {!analyzing && !hasResults && (
                <PortalButton onClick={runAnalysis} className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:opacity-90">
                  <Eye size={16} /> Analyze
                </PortalButton>
              )}
              {!analyzing && (
                <button
                  onClick={handleClear}
                  className="w-8 h-8 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label="Clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Analyzing state */}
        {analyzing && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink-700 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-teal-600" /> Running CV analysis...
                </span>
                <span className="text-sm font-bold text-teal-600">{analysisProgress}%</span>
              </div>
              <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-100"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center py-8 text-sm text-ink-500">
              Detecting objects, extracting text, and assessing image quality...
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && !analyzing && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Detected objects */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Boxes size={16} className="text-teal-600" />
                <h4 className="font-semibold text-ink-900 text-sm">Detected Objects</h4>
                <Badge variant="info">{detectedObjects.length} found</Badge>
              </div>
              <div className="space-y-2">
                {detectedObjects.map((obj, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-ink-100 hover:border-teal-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Boxes size={15} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900">{obj.label}</p>
                      <p className="text-xs text-ink-500 font-mono mt-0.5">
                        box: [{obj.box.x}, {obj.box.y}, {obj.box.w}×{obj.box.h}]
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            obj.confidence >= 95 ? 'bg-teal-500' : obj.confidence >= 90 ? 'bg-cyan-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${obj.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink-700 w-12 text-right">{obj.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: quality metrics + detected text */}
            <div className="space-y-6">
              {/* Image quality metrics */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gauge size={16} className="text-teal-600" />
                  <h4 className="font-semibold text-ink-900 text-sm">Image Quality Metrics</h4>
                </div>
                <div className="space-y-3">
                  {qualityMetrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-ink-700">{m.label}</span>
                        <span className="text-sm font-bold text-ink-900">
                          {m.value}
                          <span className="text-ink-400 font-normal text-xs ml-0.5">{m.unit}</span>
                        </span>
                      </div>
                      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            m.value >= 80 ? 'bg-teal-500' : m.value >= 60 ? 'bg-cyan-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected text */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <PenLine size={16} className="text-teal-600" />
                  <h4 className="font-semibold text-ink-900 text-sm">Detected Text (OCR)</h4>
                </div>
                <textarea
                  readOnly
                  value={detectedText}
                  className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-700 text-xs font-mono leading-relaxed resize-none focus:outline-none"
                  rows={7}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedFile && !analyzing && !hasResults && (
          <div className="pt-2">
            <EmptyState
              icon={Eye}
              title="No image analyzed yet"
              message="Upload an image above to run computer vision analysis — object detection, quality metrics, and OCR."
            />
          </div>
        )}
      </PortalCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model performance bar chart */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-teal-600" />
            <h3 className="font-bold text-ink-900">Model Performance</h3>
          </div>
          <p className="text-xs text-ink-500 mb-5">Accuracy comparison across CV models</p>
          <div className="space-y-4">
            {modelPerf.map((m) => (
              <div key={m.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink-700">{m.name}</span>
                  <span className="text-sm font-bold text-teal-600">{m.accuracy}%</span>
                </div>
                <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${m.color}`}
                    style={{ width: `${(m.accuracy / maxModelAcc) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PortalCard>

        {/* Active models list */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={18} className="text-teal-600" />
            <h3 className="font-bold text-ink-900">Active Models</h3>
          </div>
          <div className="space-y-2">
            {activeModels.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-ink-100 hover:border-teal-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Cpu size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900 truncate">{m.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {m.version} · Updated {m.updated}
                  </p>
                </div>
                <Badge variant={modelStatusVariant(m.status)}>
                  {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
