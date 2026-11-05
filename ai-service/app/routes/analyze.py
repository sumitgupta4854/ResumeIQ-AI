from fastapi import APIRouter, HTTPException
from ..schemas.models import ExtractRequest, AnalyzeRequest, MatchRequest, ImproveRequest, CandidateMatchRequest
from ..services.parser import extract_text
from ..services.scoring import score_resume
from ..services.matching import match_job, match_candidates
from ..services.improve import improve
from ..config import settings

router = APIRouter()

@router.post("/extract-text")
def extract(req: ExtractRequest):
    try:
        text, method = extract_text(req.filename, req.file_base64)
        text = text[: settings.MAX_TEXT_CHARS]
        return {"text": text, "chars": len(text), "method": method}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/analyze-resume")
def analyze(req: AnalyzeRequest):
    try:
        return score_resume(req.text[: settings.MAX_TEXT_CHARS])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

@router.post("/match-job")
def match(req: MatchRequest):
    try:
        return match_job(req.resume_text[: settings.MAX_TEXT_CHARS], req.job_description[: settings.MAX_TEXT_CHARS])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Match failed: {e}")

@router.post("/improve-resume")
def improve_route(req: ImproveRequest):
    try:
        return improve(req.task, req.original, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Improve failed: {e}")

@router.post("/match-candidates")
def match_candidates_route(req: CandidateMatchRequest):
    try:
        return match_candidates(req.requirements, req.resumes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Candidate match failed: {e}")

@router.get("/health")
def health():
    return {"status": "ok", "service": "resumeiq-ai-service"}
