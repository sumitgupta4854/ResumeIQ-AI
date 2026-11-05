import re

VERBS = ["Led", "Built", "Delivered", "Improved", "Automated", "Optimized", "Launched", "Designed", "Drove", "Scaled"]

def _with_metric(text: str):
    if re.search(r"\d", text):
        return text, "Already quantified — kept your numbers."
    return text + " (add metric: e.g. 'by X%' / 'for N users' / 'in Y weeks' — only if true).", "No numbers found; add a truthful metric placeholder shown in brackets."

def improve(task: str, original: str, job_description=None):
    o = (original or "").strip()
    jd = (job_description or "").strip()[:500]
    if task == "summary":
        suggestion = f"Results-driven professional with hands-on experience reflected in: {o[:220]}. Known for shipping measurable outcomes, clear communication, and continuous improvement."
        if jd:
            suggestion += " Tailored toward role keywords from the provided JD — mirror its top skills in your first two lines."
        alts = [suggestion, "Alternative: " + o[:200] + " — focused on outcomes and stack; keep to 3-4 lines."]
        why = "Leads with value, keeps it short, mirrors JD language without inventing history."
    elif task == "bullet":
        base = o if o.endswith(".") else o + "."
        m, note = _with_metric(base)
        suggestion = f"{m} Started with a strong verb and kept one outcome per bullet."
        alts = [f"Alternative: {VERBS[1]} {o[:180]} with measurable result [add real numbers].", f"Alternative: {VERBS[0]} initiative to improve {o[:120]} — state before/after metric."]
        why = note + " Uses action verb + outcome pattern recruiters skim for."
    else:
        suggestion = "Keep all factual history. Tighten summary to 3 lines, convert duties to verb+outcome bullets, group skills by category, and mirror JD keywords truthfully."
        alts = ["Alternative structure: Header > Summary > Skills > Experience (bullets) > Projects > Education.", "Alternative: cut to 1-2 pages, remove photos/graphics for ATS."]
        why = "Structure + quantification + truthful tailoring beats redesign."
    return {"task": task, "original": o[:4000], "suggestions": [suggestion] + alts, "why": why, "action_verbs": VERBS[:8], "note": "Rule-based assistant. Never invents jobs, degrees, or metrics — fill bracketed placeholders with facts only."}
