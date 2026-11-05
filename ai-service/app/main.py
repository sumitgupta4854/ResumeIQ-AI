from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.analyze import router

app = FastAPI(title="ResumeIQ AI Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

@app.get("/")
def root():
    return {"service": "resumeiq-ai-service", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "resumeiq-ai-service"}
