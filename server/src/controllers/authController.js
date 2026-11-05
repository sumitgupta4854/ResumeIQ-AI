import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, error: { message: 'Email already registered' } });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: role || 'job_seeker' });
    const token = signToken(user._id);
    res.status(201).json({ success: true, data: { user: user.toSafeJSON(), token } });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });
    const token = signToken(user._id);
    const safe = await User.findById(user._id);
    res.json({ success: true, data: { user: safe.toSafeJSON(), token } });
  } catch (e) { next(e); }
}

export async function me(req, res) {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
}

export async function logout(req, res) {
  // Token is stateless; client discards it. Clear cookie if ever used.
  res.clearCookie('accessToken');
  res.json({ success: true, data: { message: 'Logged out. Discard token on client.' } });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, preferences } = req.body;
    if (name) req.user.name = name;
    if (preferences) req.user.preferences = { ...req.user.preferences.toObject(), ...preferences };
    await req.user.save();
    res.json({ success: true, data: { user: req.user.toSafeJSON() } });
  } catch (e) { next(e); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ success: false, error: { message: 'Current password is incorrect' } });
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    res.json({ success: true, data: { message: 'Password updated' } });
  } catch (e) { next(e); }
}

export async function deleteAccount(req, res, next) {
  try {
    const { Resume } = await import('../models/Resume.js');
    const { Analysis } = await import('../models/Analysis.js');
    const { JobMatch } = await import('../models/JobMatch.js');
    await Resume.deleteMany({ userId: req.user._id });
    await Analysis.deleteMany({ userId: req.user._id });
    await JobMatch.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('accessToken');
    res.json({ success: true, data: { message: 'Account and all data deleted' } });
  } catch (e) { next(e); }
}
