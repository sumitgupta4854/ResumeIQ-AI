import re
from .skills import find_skills, keywords, tokenize, ACTION_VERBS, WEAK_WORDS

SECTIONS = ["summary", "experience", "education", "skills", "projects", "certifications", "contact"]

def detect_sections(text: str):
    low = (text or "").lower()
    found = {}
    for s in SECTIONS:
        if s == "contact":
            continue
        found[s] = bool(re.search(r"(^|\n)\s*" + re.escape(s) + r"\s*[:\-]?", low))
    found["contact"] = bool(re.search(r"[\w.%-]+@[\w.-]+\.[a-z]{2,}", low) or re.search(r"\+?\d[\d\s\-()]{7,}", text or ""))
    return found
def score_resume(text: str):
    words = tokenize(text)
    wc = len(words)
    sections = detect_sections(text)
    skills, by_cat = find_skills(text)
    kws = keywords(text)
    has_email = bool(re.search(r"[\w.%-]+@[\w.-]+\.[a-z]{2,}", text or "", re.I))
    has_phone = bool(re.search(r"\+?\d[\d\s\-()]{7,}", text or ""))
    has_linkedin = "linkedin" in (text or "").lower()
    has_github = "github" in (text or "").lower()
    bullets = len(re.findall(r"(^|\n)\s*[•\-\*\d.)]\s+\S", text or ""))
    numbers = len(re.findall(r"\d+\s?(%|\+|x|\$|k\b|m\b)|\$\s?\d+|\d+\s?%", text or "", re.I))
    verbs = sum(1 for v in ACTION_VERBS if v in (text or "").lower())
    weak = [w for w in WEAK_WORDS if w in (text or "").lower()]
    sentences = [s.strip() for s in re.split(r"[.!?\n]+", text or "") if len(s.strip().split()) > 2]
    long_sentences = sum(1 for s in sentences if len(s.split()) > 30)
    ats_risks = []
    if wc < 150:
        ats_risks.append("Resume is very short; ATS may flag thin content.")
    if not has_email:
        ats_risks.append("No email detected; ATS contact parsing will fail.")
    if not sections.get("experience"):
        ats_risks.append("No experience section heading detected.")
    def clamp(v): return max(0, min(100, round(v)))
    structure = clamp(30 * sum([bool(sections.get("summary")), bool(sections.get("experience")), bool(sections.get("education")), bool(sections.get("skills"))]) / 4 + (20 if bullets >= 5 else bullets * 4) + (10 if wc >= 300 else wc / 30))
    summary_q = clamp((60 if sections.get("summary") else 20) + (20 if wc >= 300 else 0) + (20 if verbs >= 3 else verbs * 6))
    exp_q = clamp((30 if sections.get("experience") else 10) + min(30, bullets * 5) + min(25, numbers * 5) + min(15, verbs * 2))
    edu_q = clamp(70 if sections.get("education") else 25)
    skills_q = clamp(min(90, 25 + len(skills) * 6 + len(by_cat) * 5))
    ats = clamp(100 - len(ats_risks) * 18 - (0 if (has_email and has_phone) else 15) - (10 if long_sentences > 5 else 0))
    clarity = clamp(85 - len(weak) * 8 - (10 if long_sentences > 8 else 0) + (5 if numbers > 3 else 0))
    recruiter = clamp((structure + summary_q + exp_q + skills_q) / 4)
    overall = clamp(structure * 0.2 + summary_q * 0.12 + exp_q * 0.25 + edu_q * 0.08 + skills_q * 0.12 + ats * 0.13 + clarity * 0.1)
    strengths, weaknesses, recs = [], [], []
    if verbs >= 4: strengths.append(f"Strong action verbs used ({verbs} detected).")
    if numbers >= 4: strengths.append(f"Good quantification ({numbers} measurable signals).")
    if len(skills) >= 8: strengths.append(f"Broad skill coverage: {len(skills)} skills.")
    if sections.get("summary"): strengths.append("Professional summary present.")
    else: weaknesses.append("Missing professional summary section.")
    if not sections.get("experience"): weaknesses.append("No work experience section detected.")
    if numbers < 3:
        weaknesses.append("Few quantified achievements.")
        recs.append("Add 3-5 metrics e.g. Reduced load time 40%, Served 10k users.")
    if bullets < 5:
        weaknesses.append("Few bullet points.")
        recs.append("Rewrite experience as 3-6 bullets per role with action verbs.")
    if len(skills) < 6:
        weaknesses.append("Skill section looks thin.")
        recs.append("Add categorized Skills (Languages, Frameworks, Cloud, DB).")
    if not has_linkedin: recs.append("Add LinkedIn URL to header.")
    if weak: recs.append("Avoid weak phrasing: " + ", ".join(weak[:4]))
    if long_sentences > 5: recs.append("Shorten long sentences; one idea per bullet.")
    if not sections.get("projects"): recs.append("Add Projects section with stack + outcome.")
    recs.append("Tailor top third with keywords from target JD.")
    roadmap = ["1. Fix header (email, phone, LinkedIn).", "2. Write 3-4 line summary.", "3. Quantify every role.", "4. Add categorized skills.", "5. Run Job Match vs 2-3 JDs."]
    return {"overall_score": overall, "category_scores": {"structure": structure, "summary": summary_q, "experience": exp_q, "education": edu_q, "skills": skills_q, "ats_readability": ats, "clarity": clarity, "recruiter_readability": recruiter}, "skills": skills, "skills_by_category": by_cat, "strengths": strengths or ["Clear baseline; keep tailoring."], "weaknesses": weaknesses or ["No major gaps; focus on tailoring."], "recommendations": recs, "roadmap": roadmap, "ats_findings": {"score": ats, "has_email": has_email, "has_phone": has_phone, "has_linkedin": has_linkedin, "has_github": has_github, "risks": ats_risks, "note": "Heuristic estimate only."}, "section_feedback": {k: ("Found" if v else "Missing") for k, v in sections.items()}, "keyword_coverage": {"top_keywords": kws[:20], "word_count": wc, "bullets": bullets, "quantified_signals": numbers, "action_verbs": verbs}, "analysis_method": "rule-based-local + TF-IDF"}
