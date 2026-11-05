import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('job_seeker', 'recruiter').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    retainResumeText: Joi.boolean().optional()
  }).optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required()
});

export const jobMatchSchema = Joi.object({
  resumeId: Joi.string().required(),
  jobTitle: Joi.string().max(140).allow('', null).optional(),
  jobDescription: Joi.string().min(50).max(20000).required()
});

export const candidateSearchSchema = Joi.object({
  requirements: Joi.string().min(10).max(20000).required()
});

export const improveSummarySchema = Joi.object({
  summary: Joi.string().min(20).max(5000).required(),
  jobDescription: Joi.string().max(20000).allow('', null).optional()
});

export const improveBulletSchema = Joi.object({
  bullet: Joi.string().min(10).max(2000).required(),
  jobDescription: Joi.string().max(20000).allow('', null).optional()
});

export const improveResumeSchema = Joi.object({
  resumeId: Joi.string().optional(),
  resumeText: Joi.string().min(50).max(20000).optional(),
  jobDescription: Joi.string().max(20000).allow('', null).optional()
}).or('resumeId', 'resumeText');
