import re

SKILL_TAXONOMY = {
    "Programming": ["python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php", "kotlin", "swift", "scala"],
    "Frontend": ["react", "angular", "vue", "html", "css", "next.js", "redux", "tailwind"],
    "Backend": ["node.js", "express", "django", "flask", "fastapi", "spring", "spring boot", ".net", "laravel", "graphql", "rest api"],
    "Data & AI": ["sql", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "machine learning", "deep learning", "nlp", "data analysis", "tableau", "power bi", "excel"],
    "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "linux", "git", "github actions"],
    "Databases": ["mongodb", "postgresql", "mysql", "redis", "elasticsearch", "sqlite", "oracle"],
    "Mobile": ["flutter", "react native", "android", "ios"],
    "Testing": ["jest", "pytest", "selenium", "cypress", "junit"],
    "Soft Skills": ["communication", "leadership", "teamwork", "problem solving", "time management", "adaptability", "collaboration", "mentoring", "agile", "scrum"],
    "Tools": ["jira", "figma", "postman", "vs code", "notion", "slack"],
}

ACTION_VERBS = ["led", "built", "developed", "designed", "implemented", "launched", "improved", "increased", "reduced", "automated", "optimized", "created", "delivered", "drove", "owned", "migrated", "scaled", "mentored", "collaborated", "architected", "shipped"]

WEAK_WORDS = ["responsible for", "helped with", "worked on", "various", "etc", "hardworking", "ninja", "guru", "rockstar"]

def tokenize(text: str):
    return re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-]*", (text or "").lower())

def find_skills(text: str):
    low = " " + (text or "").lower().replace("\n", " ") + " "
    found = {}
    for cat, skills in SKILL_TAXONOMY.items():
        hits = [s for s in skills if s.lower() in low]
        if hits:
            found[cat] = sorted(set(hits))
    flat = sorted({s for v in found.values() for s in v})
    return flat, found

def keywords(text: str, top_n: int = 40):
    from sklearn.feature_extraction.text import TfidfVectorizer
    try:
        vec = TfidfVectorizer(stop_words="english", max_features=top_n, ngram_range=(1, 2))
        vec.fit_transform([text or ""])
        return list(vec.get_feature_names_out())
    except Exception:
        toks = [t for t in tokenize(text) if len(t) > 3]
        freq = {}
        for t in toks:
            freq[t] = freq.get(t, 0) + 1
        return [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:top_n]]
