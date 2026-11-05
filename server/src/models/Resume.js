import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  originalFilename: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx'], required: true },
  fileSize: { type: Number, required: true },
  extractedText: { type: String, default: '', maxlength: 100000 },
  textRetained: { type: Boolean, default: true }
}, { timestamps: true });

resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model('Resume', resumeSchema);
