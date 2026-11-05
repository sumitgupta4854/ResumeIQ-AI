from pydantic import BaseModel, Field
from typing import Optional, Dict, List

class ExtractRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    file_base64: str = Field(min_length=10, max_length=15_000_000)

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=50, max_length=20000)

class MatchRequest(BaseModel):
    resume_text: str = Field(min_length=50, max_length=20000)
    job_description: str = Field(min_length=50, max_length=20000)

class ImproveRequest(BaseModel):
    task: str = Field(pattern="^(summary|bullet|general)$")
    original: str = Field(min_length=10, max_length=12000)
    job_description: Optional[str] = Field(default=None, max_length=20000)

class CandidateMatchRequest(BaseModel):
    requirements: str = Field(min_length=10, max_length=20000)
    resumes: List[Dict[str, str]] # List of { id, text }
