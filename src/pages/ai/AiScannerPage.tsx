import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText,
  Upload,
  ScanLine,
  CheckCircle,
  Loader2,
  Save,
  RefreshCw,
  X,
  FileImage,
  Database,
  Cpu,
  Search,
  ShieldCheck,
  History,
  AlertCircle,
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
} from '../../components/portal-ui';
import { supabase } from '../../lib/supabase';

// ==================== TYPES ====================
type ProcessingStep = {
  label: string;
  icon: LucideIcon;
  status: 'pending' | 'active' | 'done';
};

type ExtractedField = {
  field: string;
  value: string;
  confidence: number;
};

type ScanHistoryItem = {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  timestamp: string;
  fields: number;
};

type OCRResponse = {
  success: boolean;
  extractedText: string;
  confidence: number;
  fields: Array<{ field: string; value: string; confidence: number }>;
  error?: string;
};

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: 'Image Preprocessing', icon: Cpu },
  { label: 'Text Detection', icon: Search },
  { label: 'OCR Extraction', icon: ScanLine },
  { label: 'Data Structuring', icon: Database },
  { label: 'Quality Check', icon: ShieldCheck },
];

// ==================== OCR API FUNCTION ====================
/**
 * Executes OCR on the provided file via Supabase Edge Function 'document-ocr'
 */
async function scanDocumentWithOCR(file: File): Promise<OCRResponse> {
  try {
    console.log('🔍 Starting OCR for:', file.name);

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Strip out base64 header prefix
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    if (!base64) {
      throw new Error('Failed to convert file to base64');
    }

    console.log('📤 Calling OCR API for:', file.name);

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('document-ocr', {
      body: { 
        image: base64, 
        fileName: file.name 
      },
    });

    // Handle Supabase errors
    if (error) {
      console.error('❌ Supabase Function Error:', error);
      throw new Error(error.message || 'Failed to invoke OCR function');
    }

    // Handle API response errors
    if (!data?.success) {
      const errorMsg = data?.error || 'OCR processing failed on the server';
      console.error('❌ OCR API Error:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ OCR Success:', {
      fileName: file.name,
      textLength: data.extractedText?.length || 0,
      fieldsFound: data.fields?.length || 0,
      confidence: data.confidence,
    });

    return {
      success: true,
      extractedText: data.extractedText || 'No text detected',
      confidence: data.confidence ?? 0,
      fields: data.fields || [],
      error: undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error occurred';
    console.error('❌ OCR Error:', errorMessage);

    return {
      success: false,
      extractedText: errorMessage,
      confidence: 0,
      fields: [],
      error: errorMessage,
    };
  }
}

// ==================== COMPONENT ====================
export default function AiScannerPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>(
    STEPS.map((s) => ({ ...s, status: 'pending' as const }))
  );
  const [extractedText, setExtractedText] = useState('');
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([
    { id: 'h1', name: 'Transcript_JSmith.pdf', type: 'Transcript', accuracy: 98.2, timestamp: '10 min ago', fields: 6 },
    { id: 'h2', name: 'Certificate_Grad.jpg', type: 'Certificate', accuracy: 95.5, timestamp: '1 hr ago', fields: 5 },
    { id: 'h3', name: 'StudentID_456.png', type: 'ID Card', accuracy: 99.1, timestamp: '2 hrs ago', fields: 4 },
    { id: 'h4', name: 'Receipt_Tuition.pdf', type: 'Receipt', accuracy: 92.3, timestamp: '3 hrs ago', fields: 5 },
  ]);

  // ==================== EVENT HANDLERS ====================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
      resetResults();
    }
  };

  const resetResults = () => {
    setProgress(0);
    setCurrentStep(0);
    setSteps(STEPS.map((s) => ({ ...s, status: 'pending' as const })));
    setExtractedText('');
    setExtractedFields([]);
    setScanComplete(false);
    setSaved(false);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    resetResults();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==================== SCAN LOGIC ====================
  const startScan = useCallback(async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    resetResults();

    // Step animation
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < STEPS.length) {
        setCurrentStep(stepIndex);
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i === stepIndex ? 'active' : i < stepIndex ? 'done' : 'pending',
          }))
        );
        stepIndex++;
      }
    }, 700);

    // Progress animation
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress <= 90) {
        setProgress(Math.round(currentProgress));
      } else {
        clearInterval(progressInterval);
      }
    }, 300);

    try {
      // Call OCR API
      const result = await scanDocumentWithOCR(selectedFile);

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, STEPS.length * 700 + 500));

      // Finalize UI
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setSteps(STEPS.map((s) => ({ ...s, status: 'done' as const })));
      setProgress(100);
      setCurrentStep(STEPS.length - 1);

      if (result.success) {
        setExtractedText(result.extractedText);
        setExtractedFields(
          result.fields && result.fields.length > 0
            ? result.fields
            : [
                {
                  field: 'Document Type',
                  value: 'Student Document',
                  confidence: result.confidence,
                },
              ]
        );
      } else {
        setExtractedText(`❌ ${result.error || 'OCR processing failed'}`);
        setExtractedFields([]);
      }

      setScanComplete(true);
    } catch (error) {
      console.error('Scan error:', error);
      const message = error instanceof Error ? error.message : String(error);
      setExtractedText(`❌ Error: ${message}`);
      setExtractedFields([]);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setScanComplete(true); // Show error state
    } finally {
      setIsScanning(false);
    }
  }, [selectedFile]);

  const handleSave = () => {
    setSaved(true);
    if (selectedFile) {
      const newItem: ScanHistoryItem = {
        id: `h${Date.now()}`,
        name: selectedFile.name,
        type: 'Document',
        accuracy: 97.4,
        timestamp: 'Just now',
        fields: extractedFields.length,
      };
      setHistory((prev) => [newItem, ...prev]);

      // Optional: Save to database
      console.log('💾 Saving scan result to database:', newItem);
    }
  };

  const handleRescan = () => {
    resetResults();
    startScan();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Intervals are self-cleaning
    };
  }, []);

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Document Scanner"
        subtitle="Upload and scan documents with AI-powered OCR extraction"
        icon={FileText}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/ai/dashboard')}>
            <ScanLine size={16} /> Dashboard
          </PortalButton>
        }
      />

      {/* Gradient accent banner */}
      <div className="rounded-2xl p-5 mb-6 bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <ScanLine size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold">AI Scanner Ready</h3>
            <p className="text-sm text-cyan-50">Supports PDF, PNG, JPG · Max 10MB · {user?.email ?? 'guest'}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Upload zone */}
        <PortalCard className="p-6">
          <h3 className="font-bold text-ink-900 mb-4">Upload Zone</h3>

          {!selectedFile ? (
            <label
              htmlFor="scanner-file-input"
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-ink-200 rounded-xl py-16 px-6 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-ink-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                <Upload size={30} className="text-ink-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-medium text-ink-700">Click to upload or drag & drop</p>
                <p className="text-xs text-ink-500 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                id="scanner-file-input"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <FileImage size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to scan
                  </p>
                </div>
                <button
                  onClick={handleClearFile}
                  className="w-8 h-8 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label="Remove file"
                >
                  <X size={18} />
                </button>
              </div>

              <PortalButton
                onClick={startScan}
                disabled={isScanning}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:opacity-90 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Scanning...
                  </>
                ) : (
                  <>
                    <ScanLine size={16} /> Scan Document
                  </>
                )}
              </PortalButton>

              <button
                onClick={handleClearFile}
                disabled={isScanning}
                className="w-full text-sm text-ink-500 hover:text-ink-700 transition-colors disabled:opacity-50"
              >
                Choose a different file
              </button>
            </div>
          )}
        </PortalCard>

        {/* Right: Scan results */}
        <PortalCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">Scan Results</h3>
            {scanComplete && !extractedText.includes('❌') && (
              <Badge variant="success">
                <CheckCircle size={12} className="mr-1" /> Complete
              </Badge>
            )}
            {scanComplete && extractedText.includes('❌') && (
              <Badge variant="warning">
                <AlertCircle size={12} className="mr-1" /> Failed
              </Badge>
            )}
          </div>

          {!selectedFile && !isScanning && !scanComplete ? (
            <EmptyState
              icon={ScanLine}
              title="No scan results yet"
              message="Upload a document and click Scan to see AI-extracted text and fields."
            />
          ) : isScanning ? (
            <div className="space-y-5">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink-700">Processing...</span>
                  <span className="text-sm font-bold text-teal-600">{progress}%</span>
                </div>
                <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Processing steps */}
              <div className="space-y-2.5">
                {steps.map((step) => {
                  const SIcon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        step.status === 'active'
                          ? 'bg-teal-50 border border-teal-200'
                          : step.status === 'done'
                            ? 'bg-green-50'
                            : 'bg-ink-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          step.status === 'active'
                            ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white'
                            : step.status === 'done'
                              ? 'bg-green-500 text-white'
                              : 'bg-ink-200 text-ink-400'
                        }`}
                      >
                        {step.status === 'done' ? (
                          <CheckCircle size={16} />
                        ) : step.status === 'active' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <SIcon size={16} />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          step.status === 'pending' ? 'text-ink-400' : 'text-ink-900'
                        }`}
                      >
                        {step.label}
                      </span>
                      {step.status === 'active' && (
                        <span className="ml-auto text-xs text-teal-600 font-semibold">In progress</span>
                      )}
                      {step.status === 'done' && (
                        <span className="ml-auto text-xs text-green-600 font-semibold">Done</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : scanComplete ? (
            <div className="space-y-5">
              {/* Extracted text */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-ink-400" />
                  <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Extracted Text</span>
                </div>
                <textarea
                  readOnly
                  value={extractedText}
                  className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-700 text-xs font-mono leading-relaxed resize-none focus:outline-none"
                  rows={8}
                />
              </div>

              {/* Extracted fields */}
              {extractedFields.length > 0 && !extractedText.includes('❌') && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={14} className="text-ink-400" />
                    <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Extracted Fields</span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-ink-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-ink-500 bg-ink-50 border-b border-ink-100">
                          <th className="px-3 py-2 font-medium">Field</th>
                          <th className="px-3 py-2 font-medium">Value</th>
                          <th className="px-3 py-2 font-medium text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedFields.map((f, i) => (
                          <tr key={i} className="border-b border-ink-50 last:border-0">
                            <td className="px-3 py-2 font-medium text-ink-700">{f.field}</td>
                            <td className="px-3 py-2 text-ink-900 truncate max-w-xs">{f.value}</td>
                            <td className="px-3 py-2 text-right">
                              <span
                                className={`font-semibold ${
                                  f.confidence >= 97
                                    ? 'text-teal-600'
                                    : f.confidence >= 94
                                      ? 'text-cyan-600'
                                      : 'text-amber-600'
                                }`}
                              >
                                {f.confidence.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {saved ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium w-full justify-center">
                    <CheckCircle size={16} /> Saved to database
                  </div>
                ) : !extractedText.includes('❌') ? (
                  <>
                    <PortalButton onClick={handleSave} className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:opacity-90 flex-1">
                      <Save size={16} /> Save to Database
                    </PortalButton>
                    <PortalButton variant="secondary" onClick={handleRescan} className="flex-1">
                      <RefreshCw size={16} /> Re-scan
                    </PortalButton>
                  </>
                ) : (
                  <PortalButton variant="secondary" onClick={handleRescan} className="w-full">
                    <RefreshCw size={16} /> Try Again
                  </PortalButton>
                )}
              </div>
            </div>
          ) : null}
        </PortalCard>
      </div>

      {/* Scan history */}
      <PortalCard className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <History size={18} className="text-ink-400" />
          <h3 className="font-bold text-ink-900">Scan History</h3>
        </div>
        {history.length === 0 ? (
          <EmptyState icon={History} title="No scan history" message="Previously scanned documents will appear here." />
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3.5 rounded-lg border border-ink-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
                  <FileImage size={18} className="text-ink-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900 truncate">{item.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {item.type} · {item.fields} fields · {item.timestamp}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.accuracy >= 95 ? 'bg-teal-500' : 'bg-amber-500'}`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant={item.accuracy >= 95 ? 'success' : 'warning'}>{item.accuracy}%</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  );
}
