import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobTitle: { type: String, default: '', maxlength: 140 },
  jobDescriptionHash: { type: String, default: '' },
  // Privacy-conscious: store truncated JD unless user opts in via retain flag
  jobDescriptionExcerpt: { type: String, default: '', maxlength: 2000 },
  matchScore: { type: Number, required: true, min: 0, max: 100 },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  missingKeywords: { type: [String], default: [] },
  recommendations: { type: [String], default: [] }
}, { timestamps: true });

jobMatchSchema.index({ userId: 1, createdAt: -1 });

export const JobMatch = mongoose.model('JobMatch', jobMatchSchema);
