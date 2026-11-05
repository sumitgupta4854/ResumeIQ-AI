import base64, io, os

def extract_text(filename: str, file_base64: str):
    raw = base64.b64decode(file_base64)
    if len(raw) > 8 * 1024 * 1024:
        raise ValueError("File too large (max ~8MB for AI service).")
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return _from_pdf(raw)
    if name.endswith(".docx"):
        return _from_docx(raw)
    raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")

def _from_pdf(raw: bytes):
    # Try PyMuPDF first, fallback to pdfplumber
    try:
        import fitz
        doc = fitz.open(stream=raw, filetype="pdf")
        if getattr(doc, "is_encrypted", False) or doc.needs_pass:
            raise ValueError("PDF is encrypted/password-protected.")
        parts = [p.get_text("text") or "" for p in doc]
        text = "\n".join(parts).strip()
        if len(text.strip()) >= 20:
            return text, "pymupdf"
    except ValueError:
        raise
    except Exception:
        pass
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            parts = [(p.extract_text() or "") for p in pdf.pages]
        text = "\n".join(parts).strip()
        if len(text.strip()) >= 20:
            return text, "pdfplumber"
    except Exception as e:
        raise ValueError(f"PDF parsing failed: {e}")
    raise ValueError("No readable text found. PDF may be scanned images, encrypted, corrupt, or empty.")

def _from_docx(raw: bytes):
    try:
        import docx
        d = docx.Document(io.BytesIO(raw))
        text = "\n".join([p.text for p in d.paragraphs]).strip()
        # include tables
        for t in d.tables:
            for row in t.rows:
                text += "\n" + " | ".join([c.text for c in row.cells])
        if len(text.strip()) < 20:
            raise ValueError("No readable text found. DOCX appears empty or corrupt.")
        return text.strip(), "python-docx"
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"DOCX parsing failed: {e}")
