"""Optional LLM provider hook. Empty by default — baseline works without it."""
import os

def llm_enabled() -> bool:
    return bool(os.getenv("LLM_PROVIDER") and os.getenv("LLM_API_KEY"))

def enhance_feedback(prompt: str) -> str | None:
    """Return None when no LLM configured; caller must fall back to rule-based text."""
    if not llm_enabled():
        return None
    return None  # plug in provider SDK here (OpenAI/Anthropic/Gemini) using env vars
