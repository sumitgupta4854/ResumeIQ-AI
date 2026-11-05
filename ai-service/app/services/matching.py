from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .skills import find_skills, keywords
from .candidate import analyze_requirements, extract_profile, EDUCATION_ORDER

def match_job(resume_text: str, job_description: str):
    r_skills, _ = find_skills(resume_text)
    j_skills, _ = find_skills(job_description)
    rset, jset = set(s.lower() for s in r_skills), set(s.lower() for s in j_skills)
    matched = sorted(rset & jset)
    missing = sorted(jset - rset)
    try:
        vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=2000)
        m = vec.fit_transform([resume_text or "", job_description or ""])
        cos = float(cosine_similarity(m[0], m[1])[0][0])
    except Exception:
        cos = 0.0
    skill_ratio = (len(matched) / max(1, len(jset)))
    score = round(max(0, min(100, cos * 60 + skill_ratio * 40)))
    jd_keys = keywords(job_description, 30)
    rl = (resume_text or "").lower()
    missing_kw = [k for k in jd_keys if k.lower() not in rl][:15]
    recs = []
    for s in missing[:6]:
        recs.append(f"Add truthful evidence for '{s}' if you have it (project/work), else learn it — do not invent experience.")
    for k in missing_kw[:5]:
        recs.append(f"Mirror keyword '{k}' naturally in summary or bullets where truthful.")
    recs.append("Quantify 2-3 bullets with JD-relevant outcomes.")
    if not recs:
        recs = ["Strong alignment — tailor summary to mirror role title and top 3 JD skills."]
    return {"match_score": score, "cosine_similarity": round(cos, 3), "skill_overlap_ratio": round(skill_ratio, 3), "matched_skills": matched, "missing_skills": missing, "missing_keywords": missing_kw, "recommendations": recs, "method": "TF-IDF cosine + skill overlap (explainable, not hiring probability)", "priority_skills": missing[:8]}

def _clamp(value, low=0, high=100):
    return max(low, min(high, int(round(value))))


def _experience_score(req_exp: dict, candidate_years):
    """Compare required experience band with the candidate's estimated years."""
    if req_exp.get("min") is None and req_exp.get("max") is None:
        return 100, "not specified"
    if candidate_years is None:
        return 50, "unknown"
    lo = req_exp.get("min") or 0
    hi = req_exp.get("max")
    if hi is None:
        if candidate_years >= lo:
            return 100, "meets"
        return _clamp(100 - (lo - candidate_years) * 25), "below"
    if lo <= candidate_years <= hi:
        return 100, "within range"
    if candidate_years > hi:
        return _clamp(max(70, 100 - (candidate_years - hi) * 8)), "above range"
    return _clamp(100 - (lo - candidate_years) * 30), "below"


def _education_score(req_education: str, candidate_education: str):
    if not req_education:
        return 100, "not specified"
    if not candidate_education:
        return 50, "unknown"
    try:
        req_idx = EDUCATION_ORDER.index(req_education)
        cand_idx = EDUCATION_ORDER.index(candidate_education)
    except ValueError:
        return 70, "unknown"
    if cand_idx >= req_idx:
        return 100, "meets"
    return _clamp(max(20, 100 - (req_idx - cand_idx) * 35)), "below"


def _location_score(req_location: str, candidate_location: str):
    if not req_location:
        return 100, "not specified"
    if not candidate_location:
        return 50, "unknown"
    req_l, cand_l = req_location.lower(), candidate_location.lower()
    if req_l == cand_l or req_l in cand_l or cand_l in req_l:
        return 100, "match"
    if "remote" in req_l or "remote" in cand_l or "anywhere" in req_l:
        return 85, "remote-friendly"
    return 40, "different"


# Weighting for the composite, explainable match score (sums to 1.0).
WEIGHTS = {"skills": 0.40, "content": 0.20, "experience": 0.20, "education": 0.10, "location": 0.10}


def match_candidates(requirements: str, resumes: List[dict]):
    """Analyse the recruiter's requirements then rank every candidate resume.

    Returns ``{"requirements": {...}, "candidates": [...]}`` where each candidate carries
    the extracted profile, matched/missing skills and a transparent score breakdown.
    """
    req = analyze_requirements(requirements)
    req_skills = req["skills"]
    req_set = set(s.lower() for s in req_skills)
    req_map = {s.lower(): s for s in req_skills}

    similarities = [0.0] * len(resumes)
    if resumes:
        all_texts = [requirements] + [r.get("text", "") for r in resumes]
        try:
            vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=3000)
            tfidf_matrix = vec.fit_transform(all_texts)
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten().tolist()
        except Exception:
            similarities = [0.0] * len(resumes)

    results = []
    for i, resume in enumerate(resumes):
        text = resume.get("text", "")
        profile = extract_profile(text)
        cand_set = set(s.lower() for s in profile["skills"])

        matched_keys = req_set & cand_set
        missing_keys = req_set - cand_set
        matched_skills = sorted(req_map[k] for k in matched_keys)
        missing_skills = sorted(req_map[k] for k in missing_keys)

        content_score = _clamp(similarities[i] * 100)
        if req_set:
            skills_score = _clamp(100 * len(matched_keys) / len(req_set))
        else:
            skills_score = content_score

        exp_score, exp_note = _experience_score(req["experience"], profile["experience_years"])
        edu_score, edu_note = _education_score(req["education"], profile["education"])
        loc_score, loc_note = _location_score(req["location"], profile["location"])

        overall = _clamp(
            skills_score * WEIGHTS["skills"]
            + content_score * WEIGHTS["content"]
            + exp_score * WEIGHTS["experience"]
            + edu_score * WEIGHTS["education"]
            + loc_score * WEIGHTS["location"]
        )

        results.append({
            "id": resume.get("id"),
            "user_id": resume.get("user_id"),
            "match_score": overall,
            "breakdown": {
                "skills": skills_score,
                "content": content_score,
                "experience": exp_score,
                "education": edu_score,
                "location": loc_score,
            },
            "notes": {"experience": exp_note, "education": edu_note, "location": loc_note},
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_overlap_ratio": round(len(matched_keys) / max(1, len(req_set)), 3) if req_set else 0.0,
            "profile": profile,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "requirements": req,
        "candidates": results,
        "method": "Rule-based requirement extraction + TF-IDF cosine + weighted skill/experience/education/location fit (explainable, not hiring probability)",
    }
