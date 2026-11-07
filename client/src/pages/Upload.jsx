import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import api from '../services/api.js';
import ResumeUploader from '../components/ResumeUploader.jsx';
import { useToast, errMsg } from '../context/ToastContext.jsx';

const MAX_FILE_SIZE_MB = import.meta.env.PROD ? 4 : 5;

export default function Upload() {
  const { success, error } = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState('');
  const [resumeId, setResumeId] = useState(null);

  const onFile = async (file) => {
    const ok = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(file.type) && !/\.pdf$|\.docx$/i.test(file.name)) return error('Only PDF and DOCX allowed.');
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return error(`File too large (max ${MAX_FILE_SIZE_MB}MB).`);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const r = await api.post('/api/resumes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPreview(r.data.data.preview);
      setResumeId(r.data.data.resume._id);
      success('Resume uploaded & text extracted!');
    } catch (e) { error(errMsg(e, 'Upload failed')); } finally { setBusy(false); }
  };

  const analyze = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/api/analysis/${resumeId}`);
      success(`Analysis complete: ${r.data.data.analysis.overallScore}/100`);
      nav(`/app/report/${r.data.data.analysis._id}`);
    } catch (e) { error(errMsg(e, 'Analysis failed. Is the AI service running?')); } finally { setBusy(false); }
  };

  return (
    <div className="grid">
      <h2 style={{ margin: 0 }}>Upload resume</h2>
      <div className="card card-glow"><ResumeUploader onFile={onFile} busy={busy} progress={60} /></div>
      {preview && (
        <div className="card card-glow">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={20} /> Extracted text preview</h3>
          <pre className="muted" style={{ whiteSpace: 'pre-wrap', maxHeight: 280, overflow: 'auto', background: 'var(--bg-soft)', padding: 16, borderRadius: 14, border: '1px solid var(--border)' }}>{preview}</pre>
          <button className="btn btn-primary" onClick={analyze} disabled={busy || !resumeId}>{busy ? 'Analyzing…' : 'Run AI analysis'}</button>
        </div>
      )}
    </div>
  );
}
