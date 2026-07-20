import { useState } from 'react';
import { ScanLine, Upload, FileText, CheckCircle, Clock, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import {
  PortalCard, PortalPageHeader, PortalButton, Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

type ExtractedField = { label: string; value: string; confidence: number };
type VerifiedDoc = { id: number; name: string; date: string; status: string; fields: number };

export default function AdminOcrPage() {
  const { user } = useAuth();
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedField[] | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [recent, setRecent] = useState<VerifiedDoc[]>([]);

  if (!user) {
    navigateTo('/admin/login');
    return <PortalLoading />;
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      setFileName(f.name);
      setFile(f);
    }
  };

  const runScan = async () => {
    if (!file) return;
    setScanning(true);
    setExtracted(null);
    setOcrText(null);

    try {
      const form = new FormData();
      form.append('file', file);

      // Use a configurable API base if provided at build time (NEXT_PUBLIC_OCR_API_URL).
      // If not set, fall back to the relative endpoint used in server-hosted deployments.
      const apiBase = (process.env.NEXT_PUBLIC_OCR_API_URL && process.env.NEXT_PUBLIC_OCR_API_URL.trim() !== '')
        ? process.env.NEXT_PUBLIC_OCR_API_URL.replace(/\/$/, '')
        : '';
      const endpoint = apiBase ? `${apiBase}/api/ocr` : '/api/ocr';

      const res = await fetch(endpoint, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`OCR API error: ${res.status}`);
      }

      const body = await res.json();

      // Expecting { ok, extracted: [{label,value,confidence}], ocr_text, status }
      const extractedFields: ExtractedField[] = body.extracted ?? [];
      const fullText: string = body.ocr_text ?? extractedFields.map((f: any) => `${f.label}: ${f.value}`).join('\n');

      setExtracted(extractedFields.length ? extractedFields : null);
      setOcrText(fullText || null);
    } catch (err) {
      console.error('OCR failed', err);
      setExtracted(null);
      setOcrText('OCR failed. Check console for details.');
    } finally {
      setScanning(false);
    }
  };

  const confirmVerify = async () => {
    if (!extracted && !ocrText) return;
    setSaving(true);

    try {
      // Insert a document record into supabase. Adjust columns if your table requires student_id etc.
      const insertPayload: any = {
        name: fileName || 'uploaded-document',
        file_size: file?.size ?? null,
        mime_type: file?.type ?? null,
        status: 'verified',
        ocr_text: ocrText ?? null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('documents').insert(insertPayload).select().single();

      if (error) throw error;

      const docId = (data as any)?.id ?? Date.now();

      setRecent((prev) => [
        { id: docId, name: fileName, date: new Date().toLocaleString(), status: 'verified', fields: extracted ? extracted.length : 0 },
        ...prev,
      ]);

      // clear state
      setExtracted(null);
      setOcrText(null);
      setFile(null);
      setFileName('');
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const avgConfidence = extracted ? Math.round(extracted.reduce((s, f) => s + f.confidence, 0) / extracted.length) : 0;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="OCR Verification"
        subtitle="Upload and verify documents using OCR API"
        icon={ScanLine}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatTile label="Documents Verified" value={recent.filter((r) => r.status === 'verified').length} icon={CheckCircle} color="green" />
        <StatTile label="Pending Review" value={extracted ? 1 : 0} icon={Clock} color="gold" />
        <StatTile label="Avg Confidence" value={extracted ? `${avgConfidence}%` : '—'} icon={Sparkles} color="ink" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload + scan */}
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Document Scanner</h3>
          <div className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center mb-4">
            <Upload size={32} className="mx-auto text-ink-400 mb-3" />
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-900 text-white text-sm font-medium hover:bg-ink-800">
                <FileText size={16} /> Choose File
              </span>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
            </label>
            {fileName && <p className="text-sm text-ink-700 mt-3 font-medium">{fileName}</p>}
          </div>
          <div className="flex gap-3">
            <PortalButton variant="primary" onClick={runScan} disabled={!file || scanning}>
              <ScanLine size={16} /> {scanning ? 'Scanning...' : 'Run OCR Scan'}
            </PortalButton>
            {fileName && !scanning && (
              <PortalButton variant="secondary" onClick={() => { setFileName(''); setFile(null); setExtracted(null); setOcrText(null); }}>
                <X size={16} /> Clear
              </PortalButton>
            )}
          </div>
          {scanning && (
            <div className="mt-6">
              <div className="flex items-center justify-center py-8">
                <div className="w-10 h-10 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
              </div>
              <p className="text-center text-sm text-ink-500">Analyzing document with OCR engine...</p>
            </div>
          )}
        </PortalCard>

        {/* Extracted results */}
        <PortalCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">Extracted Data</h3>
            {extracted && <Badge variant="success">{avgConfidence}% confidence</Badge>}
          </div>
          {!extracted && !scanning ? (
            <EmptyState icon={ScanLine} title="No Data Yet" message="Upload a document and run a scan to see extracted fields." />
          ) : extracted ? (
            <>
              <div className="space-y-3 mb-4">
                {extracted.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg bg-ink-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">{f.label}</span>
                      <Badge variant={f.confidence >= 90 ? 'success' : f.confidence >= 80 ? 'warning' : 'error'}>
                        {f.confidence}%
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-ink-900">{f.value}</div>
                    <div className="w-full h-1 rounded-full bg-ink-200 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.confidence >= 90 ? 'bg-rose-600' : f.confidence >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${f.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <PortalButton variant="primary" onClick={confirmVerify} className="w-full" disabled={saving}>
                <CheckCircle size={16} /> {saving ? 'Saving...' : 'Verify & Save'}
              </PortalButton>
            </>
          ) : (
            <div className="py-4">
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{ocrText}</p>
            </div>
          )}
        </PortalCard>
      </div>

      {/* Recently verified */}
      <PortalCard className="p-6 mt-6">
        <h3 className="text-lg font-bold text-ink-900 mb-4">Recently Verified Documents</h3>
        {recent.length === 0 ? (
          <EmptyState icon={FileText} title="No Verified Documents" message="Verified documents will appear here." />
        ) : (
          <div className="space-y-3">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-ink-50">
                <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 truncate">{r.name}</div>
                  <div className="text-xs text-ink-500">{r.date} · {r.fields} fields extracted</div>
                </div>
                <Badge variant="success">{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  );
}
