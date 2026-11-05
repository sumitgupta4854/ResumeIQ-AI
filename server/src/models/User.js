import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const preferencesSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  retainResumeText: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['job_seeker', 'recruiter'], default: 'job_seeker' },
  shortlistedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  preferences: { type: preferencesSchema, default: () => ({}) }
}, { timestamps: true });

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

userSchema.methods.toSafeJSON = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role, shortlistedCandidates: this.shortlistedCandidates, preferences: this.preferences, createdAt: this.createdAt, updatedAt: this.updatedAt };
};

export const User = mongoose.model('User', userSchema);
