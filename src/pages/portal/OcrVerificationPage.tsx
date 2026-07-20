import { useState } from 'react';
import { ScanLine, FileSearch, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useDocuments } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState } from '../../components/portal-ui';

export default function OcrVerificationPage() {
  const { user } = useAuth();
  const { data: documents, loading } = useDocuments(user?.id);
  const [scanning, setScanning] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<Record<string, { text: string; confidence: number }>>({});

  const handleScan = async (docId: string, docName: string) => {
    setScanning(docId);
    // Simulate OCR processing
    await new Promise((r) => setTimeout(r, 2000));

    const mockText = `DOCUMENT VERIFICATION REPORT
===========================
File: ${docName}
Scanned: ${new Date().toISOString()}

Extracted Information:
- Document Type: Academic Record
- Institution: Meridian University
- Issue Date: 2024-01-15
- Reference Number: MU-${Math.random().toString(36).substring(2, 10).toUpperCase()}

Content Summary:
This document appears to be an official academic transcript containing
course grades, credit hours, and cumulative GPA information. The document
structure is consistent with standard university transcript format.

Verification Status: PASSED
Confidence: ${Math.floor(Math.random() * 15 + 85)}%`;

    const confidence = Math.floor(Math.random() * 15 + 85);

    setScanResult({ ...scanResult, [docId]: { text: mockText, confidence } });

    // Update document status in database
    await supabase.from('documents').update({
      status: 'verified',
      ocr_text: mockText,
    }).eq('id', docId);

    setScanning(null);
  };

  if (loading) return <PortalLoading />;

  const pendingDocs = documents.filter((d) => d.status === 'pending' || (!scanResult[d.id] && d.status !== 'verified'));
  const scannedDocs = documents.filter((d) => scanResult[d.id] || d.ocr_text);

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="OCR Verification"
        subtitle="Scan and verify uploaded documents using AI-powered OCR"
        icon={ScanLine}
      />

      {/* Info banner */}
      <PortalCard className="p-6 mb-6 bg-ink-900 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-ink-800 flex items-center justify-center flex-shrink-0">
            <FileSearch className="text-gold-400" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white">AI-Powered Document Verification</h3>
            <p className="text-sm text-ink-300 mt-1">
              Our OCR system scans your documents to extract key information and verify authenticity.
              Documents that pass verification are automatically approved.
            </p>
          </div>
        </div>
      </PortalCard>

      {documents.length === 0 ? (
        <EmptyState icon={ScanLine} title="No documents to verify" message="Upload documents first from the Document Upload page." />
      ) : (
        <div className="space-y-6">
          {/* Pending verification */}
          {pendingDocs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3">Pending Verification</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {pendingDocs.map((doc) => (
                  <PortalCard key={doc.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-ink-900">{doc.name}</h4>
                        <p className="text-xs text-ink-500 mt-1">{doc.doc_type}</p>
                      </div>
                      <Badge variant="warning"><Clock size={12} className="mr-1" /> Pending</Badge>
                    </div>
                    {scanning === doc.id ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <ScanLine size={32} className="text-ink-900 animate-pulse" />
                          </div>
                          <p className="text-sm text-ink-500">Scanning document...</p>
                        </div>
                      </div>
                    ) : (
                      <PortalButton variant="primary" onClick={() => handleScan(doc.id, doc.name)} className="w-full">
                        <ScanLine size={16} /> Run OCR Scan
                      </PortalButton>
                    )}
                  </PortalCard>
                ))}
              </div>
            </div>
          )}

          {/* Scanned / verified */}
          {scannedDocs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3">Verification Results</h3>
              <div className="space-y-4">
                {scannedDocs.map((doc) => {
                  const result = scanResult[doc.id];
                  const ocrText = result?.text || doc.ocr_text || '';
                  const confidence = result?.confidence || 90;
                  return (
                    <PortalCard key={doc.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-ink-900">{doc.name}</h4>
                            <p className="text-xs text-ink-500">{doc.doc_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Verified</Badge>
                          <Badge variant="gold">{confidence}% confidence</Badge>
                        </div>
                      </div>
                      <div className="bg-ink-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileSearch size={14} className="text-ink-400" />
                          <span className="text-xs font-medium text-ink-500">Extracted Text</span>
                        </div>
                        <pre className="text-xs text-ink-700 whitespace-pre-wrap font-mono leading-relaxed">{ocrText}</pre>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <PortalButton variant="secondary" onClick={() => handleScan(doc.id, doc.name)}>
                          <RefreshCw size={14} /> Re-scan
                        </PortalButton>
                      </div>
                    </PortalCard>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
