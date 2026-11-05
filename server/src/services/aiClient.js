import { env } from '../config/env.js';

export async function aiFetch(path, { method = 'POST', body = null, timeoutMs = 60000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${env.pythonAiUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.detail || data?.error?.message || `AI service error (${res.status})`);
      err.status = res.status < 500 ? res.status : 502;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('AI service timed out. Please try again.');
      err.status = 504;
      throw err;
    }
    if (e.code === 'ECONNREFUSED' || /fetch failed/i.test(e.message || '')) {
      const err = new Error('AI service is unavailable. Start ai-service (uvicorn app.main:app) and set PYTHON_AI_URL.');
      err.status = 503;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}
