import fs from 'node:fs/promises';

export async function safeUnlink(path) {
  if (!path) return;
  try { await fs.unlink(path); } catch { /* ignore */ }
}
