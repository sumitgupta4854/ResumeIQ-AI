# ResumeIQ AI — Next-Generation AI Resume Analyzer

Monorepo: `client/` (React+Vite JS), `server/` (Express+MongoDB), `ai-service/` (FastAPI rule-based AI).

## Prerequisites
- Node.js 18+, Python 3.11+, MongoDB (local or Atlas)

## 1) MongoDB setup
**Local:** install MongoDB Community, start `mongod`, use `MONGODB_URI=mongodb://127.0.0.1:27017/ai_resume_analyzer`.
**Atlas:** create free cluster → Database Access user → Network Access allow IP → Connect → copy string like `mongodb+srv://USER:PASS@cluster0.xxx.mongodb.net/ai_resume_analyzer` → paste into `server/.env` as `MONGODB_URI`. Never commit `.env`. See `server/.env.example`.

## 2) AI service
```bash
cd ai-service
pip install -r requirements.txt
copy .env.example .env   # windows | cp .env.example .env
python -m uvicorn app.main:app --port 8001
# health: http://localhost:8001/health
```
No virtual environment required — the service runs on your normal system Python.

## Deployment Tips

### 1) Backend (Node.js) - Vercel
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Output Directory:** `dist` (if applicable) or leave empty for Express.
- **Environment Variables:** `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `PYTHON_AI_URL`.

### 2) AI Service (Python) - Render / Railway
- **Root Directory:** `ai-service`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:** `LLM_API_KEY` (if using one), `PORT`.

### 3) Client (React) - Vercel / Netlify
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** `VITE_API_URL` (points to your deployed Backend).


## API docs (selected)
Auth: POST /api/auth/register {name,email,password}, POST /api/auth/login, GET /api/auth/me (Bearer).
Resumes: POST /api/resumes/upload (multipart `resume`), GET /api/resumes, GET/DELETE /api/resumes/:id.
Analysis: POST /api/analysis/:resumeId, GET /api/analysis/:id, GET /api/analysis/history.
Jobs: POST /api/jobs/match {resumeId,jobTitle,jobDescription}, GET /api/jobs/matches.
Improve: POST /api/improve/summary|bullet|resume. Dashboard: GET /api/dashboard/stats. Health: GET /api/health.

## Testing
```bash
# ai-service
pytest -q
# server (requires MONGO for integration; unit validation runs offline)
npm test
```
Postman: register → copy token → Authorization: Bearer TOKEN → upload file → analyze → match.

## Troubleshooting
- Mongo fail: check MONGODB_URI, IP allowlist, `mongod` running; server logs exact error.
- AI 503: start uvicorn on 8001, set PYTHON_AI_URL.
- 422 empty text: scanned PDF — use text-based export.
- CORS: FRONTEND_URL must match Vite URL.

## Production
Set NODE_ENV=production, strong JWT_SECRET, Atlas URI, restrict CORS, run behind HTTPS, `npm run build` for client, `uvicorn app.main:app --host 0.0.0.0`.
