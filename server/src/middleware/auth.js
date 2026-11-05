import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function authRequired(req, res, next) {
  try {
    let token = null;
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) token = header.slice(7);
    if (!token && req.cookies?.accessToken) token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, error: { message: 'User no longer exists' } });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired token. Please log in again.' } });
  }
}
