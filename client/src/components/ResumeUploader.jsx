import { UploadCloud } from 'lucide-react';
import { useDropzone } from '../hooks/useDropzone.js';

export default function ResumeUploader({ onFile, busy, progress }) {
  const { drag, handlers, inputRef } = useDropzone(onFile);
  return (
    <div>
      <div className={`dropzone ${drag ? 'drag' : ''}`} {...handlers} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} aria-label="Upload resume">
        <input ref={inputRef} type="file" accept=".pdf,.docx" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <div className="dropzone-icon"><UploadCloud size={30} /></div>
        <p style={{ margin: '0 0 6px' }}><strong>Drag &amp; drop your resume here</strong> or click to browse</p>
        <p className="muted" style={{ margin: 0 }}>PDF or DOCX · max 5MB · text is extracted locally by the AI service</p>
        {busy && <div className="progress" aria-label="Upload progress" style={{ marginTop: 16, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}><div style={{ width: `${progress || 40}%` }} /></div>}
      </div>
    </div>
  );
}
