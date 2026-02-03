/**
 * AI Routes
 * Endpoints for AI chat and voice generation
 */

import express from 'express';
import { body } from 'express-validator';
import { askQuestion, generateVoice, getQuestionHistory } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation
const askValidation = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('subjectId').notEmpty().withMessage('Subject ID is required')
];

const voiceValidation = [
  body('text').trim().notEmpty().withMessage('Text is required')
];

// Routes
router.post('/ask', askValidation, askQuestion);
router.post('/voice', voiceValidation, generateVoice);
router.get('/history', getQuestionHistory);

export default router;
