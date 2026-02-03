/**
 * Progress Routes
 * Student learning progress tracking and statistics
 */

import express from 'express';
import { body } from 'express-validator';
import { 
  getStudentProgress, 
  getSubjectProgress, 
  submitFeedback, 
  getDetailedStats 
} from '../controllers/progress.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Validation rules
const feedbackValidation = [
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('isCorrect').isBoolean().withMessage('isCorrect must be a boolean')
];

// Routes
router.get('/', getStudentProgress);
router.get('/stats', getDetailedStats);
router.get('/:subjectId', getSubjectProgress);
router.post('/feedback', feedbackValidation, submitFeedback);

export default router;
