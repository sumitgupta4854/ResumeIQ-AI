import express from 'express';
import { register, login, logout, me, updateProfile, changePassword, deleteAccount } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../utils/validators.js';

const router = express.Router();
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authRequired, me);
router.patch('/me', authRequired, validate(updateProfileSchema), updateProfile);
router.post('/change-password', authRequired, validate(changePasswordSchema), changePassword);
router.delete('/account', authRequired, deleteAccount);
export default router;
