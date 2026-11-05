import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  categoryScores: { type: Map, of: Number, default: {} },
  skills: { type: [String], default: [] },
  skillsByCategory: { type: Map, of: [String], default: {} },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
  atsFindings: { type: mongoose.Schema.Types.Mixed, default: {} },
  sectionFeedback: { type: mongoose.Schema.Types.Mixed, default: {} },
  keywordCoverage: { type: mongoose.Schema.Types.Mixed, default: {} },
  analysisMethod: { type: String, default: 'rule-based-local' }
}, { timestamps: true });

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ resumeId: 1, createdAt: -1 });

export const Analysis = mongoose.model('Analysis', analysisSchema);
