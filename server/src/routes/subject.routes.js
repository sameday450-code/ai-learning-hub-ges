/**
 * Subject Routes
 * Endpoints for subject management
 */

import express from 'express';
import { getAllSubjects, getSubjectById, seedSubjects } from '../controllers/subject.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);

// Admin route for seeding
router.post('/seed', seedSubjects);

export default router;
