import { useRef, useState } from 'react';

export function useDropzone(onFile) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  return {
    drag, inputRef,
    handlers: {
      onDragOver: (e) => { e.preventDefault(); setDrag(true); },
      onDragLeave: () => setDrag(false),
      onDrop: (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); },
      onKeyDown: (e) => { if (e.key === 'Enter') inputRef.current?.click(); }
    }
  };
}
