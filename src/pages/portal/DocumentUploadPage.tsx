import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle, Clock, XCircle, File } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useDocuments } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState, PortalSelect } from '../../components/portal-ui';

const docTypes = [
  { value: 'Transcript', label: 'Transcript' },
  { value: 'ID Card', label: 'ID Card' },
  { value: 'Certificate', label: 'Certificate' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Recommendation Letter', label: 'Recommendation Letter' },
  { value: 'Other', label: 'Other' },
];

export default function DocumentUploadPage() {
  const { user } = useAuth();
  const { data: documents, loading } = useDocuments(user?.id);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('Transcript');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      // If storage bucket doesn't exist, store metadata only
      await supabase.from('documents').insert({
        student_id: user.id,
        name: file.name,
        doc_type: selectedType,
        file_url: null,
        file_path: null,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
      });
    } else {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
      await supabase.from('documents').insert({
        student_id: user.id,
        name: file.name,
        doc_type: selectedType,
        file_url: urlData.publicUrl,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
      });
    }
    setUploading(false);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Document Upload"
        subtitle="Upload and manage your academic documents"
        icon={Upload}
      />

      {/* Upload zone */}
      <PortalCard className="p-6 mb-6">
        <h3 className="text-lg font-bold text-ink-900 mb-4">Upload New Document</h3>
        <div className="mb-4 max-w-xs">
          <PortalSelect label="Document Type" value={selectedType} onChange={setSelectedType} options={docTypes} />
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragOver ? 'border-gold-500 bg-gold-50' : 'border-ink-200 hover:border-ink-400 hover:bg-ink-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
              <p className="text-sm text-ink-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-ink-900 flex items-center justify-center">
                <Upload className="text-gold-400" size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-900">Drop your file here or click to browse</p>
                <p className="text-xs text-ink-500 mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      </PortalCard>

      {/* Documents list */}
      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents uploaded" message="Upload your transcripts, certificates, and other documents here." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <PortalCard key={doc.id} className="p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                  <File className="text-ink-600" size={20} />
                </div>
                <Badge variant={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}>
                  {doc.status === 'verified' && <CheckCircle size={12} className="mr-1" />}
                  {doc.status === 'pending' && <Clock size={12} className="mr-1" />}
                  {doc.status === 'rejected' && <XCircle size={12} className="mr-1" />}
                  {doc.status}
                </Badge>
              </div>
              <h4 className="font-medium text-ink-900 text-sm truncate">{doc.name}</h4>
              <div className="text-xs text-ink-500 mt-1">{doc.doc_type}</div>
              <div className="text-xs text-ink-400 mt-1">
                {(doc.file_size / 1024).toFixed(0)} KB · {new Date(doc.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 mt-4">
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1">
                    <FileText size={14} /> View
                  </a>
                )}
                <button onClick={() => handleDelete(doc.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
