"""Rule-based requirement analysis + candidate profile extraction.

Uses only the technologies already present in this project (Python stdlib + scikit-learn
via ``skills.py``/``matching.py``). No external AI service is called, so the behaviour is
deterministic and explainable.
"""
import re

from .skills import find_skills

# ---------------------------------------------------------------------------
# Reference data (static, curated — no random or dummy candidate data is used)
# ---------------------------------------------------------------------------

ROLE_KEYWORDS = [
    "developer", "engineer", "manager", "analyst", "designer", "scientist", "architect",
    "consultant", "specialist", "lead", "intern", "executive", "administrator", "officer",
    "tester", "programmer", "director", "coordinator", "associate", "recruiter",
]

KNOWN_ROLES = [
    "full stack developer", "fullstack developer", "frontend developer", "front end developer",
    "backend developer", "back end developer", "software engineer", "software developer",
    "web developer", "python developer", "java developer", "react developer", "node.js developer",
    "node developer", "mobile developer", "android developer", "ios developer", "devops engineer",
    "site reliability engineer", "data scientist", "data analyst", "data engineer",
    "machine learning engineer", "ml engineer", "ai engineer", "business analyst", "product manager",
    "project manager", "program manager", "qa engineer", "test engineer", "automation engineer",
    "ui designer", "ux designer", "ui/ux designer", "graphic designer", "cloud engineer",
    "security engineer", "database administrator", "system administrator", "network engineer",
    "sales executive", "marketing manager", "content writer", "hr manager", "human resource",
    "accountant", "financial analyst", "operations manager", "support engineer", "technical lead",
]

EDUCATION_LEVELS = [
    ("PhD", ["phd", "ph.d", "doctorate", "doctoral"]),
    ("Master's", ["master", "masters", "mba", "m.sc", "msc", "m.tech", "mtech", "post graduate", "postgraduate"]),
    ("Bachelor's", ["bachelor", "bachelors", "b.tech", "btech", "b.e", "bsc", "b.sc", "bca", "b.com", "undergraduate", "graduation", "degree"]),
    ("Diploma", ["diploma", "associate degree"]),
    ("High School", ["high school", "12th grade", "hsc", "secondary school"]),
]
EDUCATION_ORDER = ["High School", "Diploma", "Bachelor's", "Master's", "PhD"]

EMPLOYMENT_TYPES = [
    ("Internship", ["internship", "intern", "trainee"]),
    ("Full-time", ["full-time", "full time", "fulltime", "permanent"]),
    ("Part-time", ["part-time", "part time", "parttime"]),
    ("Contract", ["contract", "contractual", "freelance", "c2c", "corp to corp"]),
    ("Remote", ["remote", "work from home", "wfh", "anywhere"]),
    ("Hybrid", ["hybrid"]),
    ("On-site", ["on-site", "onsite", "on site", "in-office", "in office"]),
]

CITIES = [
    # US
    "new york", "san francisco", "seattle", "austin", "boston", "chicago", "los angeles",
    "dallas", "atlanta", "denver", "miami", "houston", "phoenix", "san jose", "san diego",
    "washington", "philadelphia", "portland", "detroit", "minneapolis",
    # India
    "bangalore", "bengaluru", "hyderabad", "mumbai", "pune", "chennai", "delhi", "new delhi",
    "noida", "gurgaon", "gurugram", "kolkata", "ahmedabad", "jaipur", "indore", "kochi",
    "coimbatore", "chandigarh", "lucknow", "trivandrum", "mysore",
    # UK / EU / others
    "london", "manchester", "birmingham", "edinburgh", "leeds", "bristol", "dublin",
    "berlin", "munich", "hamburg", "paris", "amsterdam", "madrid", "barcelona", "milan",
    "zurich", "stockholm", "dubai", "abu dhabi", "singapore", "toronto", "vancouver",
    "sydney", "melbourne", "auckland", "tokyo", "hong kong", "seoul", "riyadh", "doha",
]
COUNTRIES = [
    "united states", "usa", "united kingdom", "uk", "india", "canada", "germany", "france",
    "netherlands", "australia", "singapore", "uae", "japan", "ireland", "switzerland",
    "sweden", "spain", "italy", "brazil", "new zealand", "poland", "portugal",
]

_SPECIAL_CASE = {
    "ui/ux": "UI/UX", "ui": "UI", "ux": "UX", "qa": "QA", "hr": "HR", "ai": "AI", "ml": "ML",
    "devops": "DevOps", "ios": "iOS", "php": "PHP", "sql": "SQL", "aws": "AWS", "gcp": "GCP",
    "node.js": "Node.js", "node": "Node", "api": "API", "seo": "SEO", "crm": "CRM", "erp": "ERP",
    "html": "HTML", "css": "CSS", "js": "JS", "ts": "TS", "c++": "C++", "c#": "C#", ".net": ".NET",
}

_STOPWORDS = set(
    "a an the and or with for of in on at to using use used need needs needed want wants looking "
    "hire hiring seeking seek require requires required experience exp years year strong good "
    "excellent must should plus knowledge working work ability able candidate candidates developer "
    "engineer role position job please who that this have has ideal someone candidate's are is be "
    "we you our their his her they them it as well also very highly minimum least new great "
    "responsibilities requirements qualifications preferred plus".split()
)
_NOISE_START = {
    "strong", "good", "excellent", "solid", "proven", "deep", "extensive", "hands", "hands-on",
    "minimum", "at", "least", "plus", "must", "should", "highly", "very", "ability", "able",
    "experience", "knowledge", "skilled", "proficient", "familiar", "expertise", "background",
}

_PLACE_SET = set(p.lower() for p in CITIES + COUNTRIES)


def _is_standalone(skill: str, low_text: str) -> bool:
    """True when ``skill`` occurs as a whole token (avoids 'go' matching inside 'Django')."""
    return re.search(r"(?<![a-z0-9])" + re.escape(skill.lower()) + r"(?![a-z0-9])", low_text) is not None


def _filter_taxonomy(text: str):
    """Return (flat_skills, by_category) from the shared taxonomy with token boundaries applied."""
    flat, by_cat = find_skills(text)
    low = " " + (text or "").lower().replace("\n", " ") + " "
    kept = [s for s in flat if _is_standalone(s, low) and s.lower() not in _PLACE_SET]
    allowed = set(kept)
    filtered_cat = {cat: [s for s in items if s in allowed] for cat, items in by_cat.items()}
    filtered_cat = {cat: items for cat, items in filtered_cat.items() if items}
    return kept, filtered_cat


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _canonical(phrase: str) -> str:
    out = []
    for word in re.sub(r"\s+", " ", (phrase or "").strip()).split(" "):
        low = word.lower().strip(",.;:()")
        if not low:
            continue
        if low in _SPECIAL_CASE:
            out.append(_SPECIAL_CASE[low])
        else:
            out.append(word[:1].upper() + word[1:].lower() if word else word)
    return " ".join(out)


def _preview(text: str, limit: int = 320) -> str:
    clean = re.sub(r"\s+", " ", (text or "")).strip()
    return clean[:limit]


# ---------------------------------------------------------------------------
# Requirement analysis
# ---------------------------------------------------------------------------

def detect_role(text: str) -> str:
    low = " " + re.sub(r"\s+", " ", (text or "").lower()) + " "
    for role in sorted(KNOWN_ROLES, key=len, reverse=True):
        if re.search(r"\b" + re.escape(role) + r"\b", low):
            return _canonical(role)
    keywords = "|".join(ROLE_KEYWORDS)
    m = re.search(
        r"(?:hiring|need|needs|looking for|seeking|require|requires|want|wanted|searching for)\s+"
        r"(?:for\s+)?(?:a|an|some)?\s*([a-z0-9+.#/&'\- ]{2,40}?\b(?:" + keywords + r"))",
        low,
    )
    if m:
        return _canonical(m.group(1))
    m = re.search(r"\b([a-z0-9+.#/&'\-]{2,20}(?:\s+[a-z0-9+.#/&'\-]{2,20})?\s+(?:" + keywords + r"))\b", low)
    if m:
        return _canonical(m.group(1))
    return ""


def detect_experience(text: str) -> dict:
    t = (text or "").lower()
    m = re.search(r"(\d{1,2})\s*(?:-|–|—|to)\s*(\d{1,2})\s*\+?\s*(?:years?|yrs?)", t)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return {"min": min(a, b), "max": max(a, b), "raw": f"{min(a, b)}-{max(a, b)} years"}
    m = re.search(r"(\d{1,2})\s*\+\s*(?:years?|yrs?)", t)
    if m:
        return {"min": int(m.group(1)), "max": None, "raw": f"{m.group(1)}+ years"}
    m = re.search(r"(?:at least|minimum(?: of)?|over|more than|min)\s*(\d{1,2})\s*(?:years?|yrs?)", t)
    if m:
        return {"min": int(m.group(1)), "max": None, "raw": f"{m.group(1)}+ years"}
    m = re.search(r"(\d{1,2})\s*(?:years?|yrs?)\b", t)
    if m:
        n = int(m.group(1))
        return {"min": n, "max": n, "raw": f"{n} years"}
    if re.search(r"\b(fresher|entry[- ]?level|no experience|recent graduate)\b", t):
        return {"min": 0, "max": 1, "raw": "Fresher / entry level"}
    if re.search(r"\b(senior|sr\.?|lead|principal|staff)\b", t):
        return {"min": 5, "max": None, "raw": "Senior (5+ years)"}
    if re.search(r"\b(junior|jr\.?)\b", t):
        return {"min": 1, "max": 3, "raw": "Junior (1-3 years)"}
    if re.search(r"\b(mid[- ]?level|intermediate)\b", t):
        return {"min": 3, "max": 5, "raw": "Mid-level (3-5 years)"}
    return {"min": None, "max": None, "raw": ""}


def detect_education(text: str) -> str:
    low = " " + (text or "").lower() + " "
    for label, kws in EDUCATION_LEVELS:
        for kw in kws:
            if kw in low:
                return label
    return ""


def detect_degree(text: str) -> str:
    m = re.search(
        r"\b((?:b|m)\.?\s?(?:tech|e|sc|a|com|ca|s|ed|ba)\b|mba\b|phd\b|bachelor(?:'?s)?\b|master(?:'?s)?\b)"
        r"[^.\n]{0,60}",
        text or "",
        re.I,
    )
    return re.sub(r"\s+", " ", m.group(0)).strip(" .,") if m else ""


def detect_location(text: str) -> str:
    t = text or ""
    for pattern in (
        r"location\s*[:\-]\s*([A-Za-z][A-Za-z .\-]{1,40})",
        r"(?:based|located|preferred|preferably)\s+(?:in|at)\s+([A-Za-z][A-Za-z .\-]{1,40})",
    ):
        m = re.search(pattern, t, re.I)
        if m:
            candidate = re.split(r"\b(?:with|and|having|who|that|for|salary|experience|skills)\b", m.group(1), flags=re.I)[0]
            candidate = candidate.strip().strip(".,;")
            if 2 <= len(candidate) <= 40:
                return _canonical(candidate)
    low = t.lower()
    for place in sorted(CITIES + COUNTRIES, key=len, reverse=True):
        if re.search(r"\b" + re.escape(place) + r"\b", low):
            return _canonical(place)
    if re.search(r"\bremote\b", low):
        return "Remote"
    return ""


def detect_employment_type(text: str) -> str:
    low = (text or "").lower()
    found = []
    for label, kws in EMPLOYMENT_TYPES:
        if any(kw in low for kw in kws):
            found.append(label)
    return " · ".join(found) if found else ""


def detect_salary(text: str) -> str:
    t = text or ""
    m = re.search(
        r"(?:₹|rs\.?|inr|\$|usd|€|eur|£|gbp)\s?\d[\d,.]*\s?(?:k|lpa|lakhs?|lacs?|million|m\b|cr\b)?"
        r"(?:\s*(?:-|–|to)\s*(?:₹|rs\.?|inr|\$|usd|€|eur|£|gbp)?\s?\d[\d,.]*\s?(?:k|lpa|lakhs?|lacs?|million|m\b|cr\b)?)?",
        t,
        re.I,
    )
    if m:
        return re.sub(r"\s+", " ", m.group(0)).strip()
    m = re.search(r"\d[\d,.]*\s?(?:-|–|to)\s?\d[\d,.]*\s?(?:lpa|lakhs?|lacs?|per annum|p\.?a\.?|ctc)", t, re.I)
    if m:
        return re.sub(r"\s+", " ", m.group(0)).strip()
    m = re.search(r"\d[\d,.]*\s?(?:lpa|lakhs?|lacs?|per annum|ctc)\b", t, re.I)
    if m:
        return re.sub(r"\s+", " ", m.group(0)).strip()
    if re.search(r"\b(negotiable|as per industry|industry standard|competitive|market rate)\b", t, re.I):
        return "Negotiable"
    return ""


def extract_skills(text: str):
    """Return (skills, by_category) merging the shared taxonomy with detected skill phrases."""
    taxonomy_skills, by_category = _filter_taxonomy(text)
    merged = {s.lower(): s for s in taxonomy_skills}

    low = (text or "").lower()
    markers = [
        "with", "using", "using:", "knowledge of", "experience in", "experience with",
        "skills", "skills:", "stack", "tech stack", "technologies", "proficient in",
        "expertise in", "familiar with", "worked with",
    ]
    for marker in markers:
        for match in re.finditer(r"\b" + re.escape(marker) + r"\b[:\s]+([^.;\n]{2,120})", low):
            for token in re.split(r"[,/&]|\band\b|\bor\b", match.group(1)):
                token = token.strip().strip("().-•*")
                if not (2 <= len(token) <= 25):
                    continue
                if re.search(r"\d", token):
                    continue
                words = token.split()
                if len(words) > 3 or words[0] in _NOISE_START or token in _STOPWORDS:
                    continue
                if token in _PLACE_SET or not _is_standalone(token, " " + low + " "):
                    continue
                if not token.replace(" ", "").isalpha():
                    continue
                if token not in merged:
                    merged[token] = _canonical(token)
    return list(merged.values()), by_category


def analyze_requirements(text: str) -> dict:
    skills, by_category = extract_skills(text)
    return {
        "job_role": detect_role(text),
        "skills": skills,
        "skills_by_category": by_category,
        "experience": detect_experience(text),
        "education": detect_education(text),
        "location": detect_location(text),
        "employment_type": detect_employment_type(text),
        "salary": detect_salary(text),
    }


# ---------------------------------------------------------------------------
# Candidate profile extraction
# ---------------------------------------------------------------------------

def estimate_experience_years(text: str):
    t = text or ""
    explicit = [int(x) for x in re.findall(r"(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp|work)", t, re.I)]
    if explicit:
        return max(explicit)
    spans = []
    for start, end in re.findall(
        r"\b(19\d{2}|20\d{2})\b\s*(?:-|–|—|to|until)\s*\b(19\d{2}|20\d{2}|present|current|now)\b", t, re.I
    ):
        try:
            ay = int(start)
        except ValueError:
            continue
        if end.lower() in ("present", "current", "now"):
            by = 2026
        else:
            try:
                by = int(end)
            except ValueError:
                by = ay
        if 0 <= by - ay <= 45:
            spans.append((ay, by))
    if spans:
        return max(0, min(45, max(e for _, e in spans) - min(s for s, _ in spans)))
    return None


def extract_profile(text: str) -> dict:
    skills, by_category = _filter_taxonomy(text)
    return {
        "skills": skills,
        "skills_by_category": by_category,
        "job_title": detect_role(text),
        "experience_years": estimate_experience_years(text),
        "education": detect_education(text),
        "degree": detect_degree(text),
        "location": detect_location(text),
        "summary": _preview(text),
    }
