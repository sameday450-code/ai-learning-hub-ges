/**
 * Subject Controller
 * Manages subjects and GES syllabus data
 */

import prisma from '../utils/prisma.js';
import { GES_SYLLABUS } from '../ai/syllabus.config.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects
 * @access  Public
 */
export const getAllSubjects = async (req, res, next) => {
  try {
    const { level } = req.query; // JHS or SHS

    const where = level ? { level: level.toUpperCase() } : {};

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: subjects.length,
      data: { subjects }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/subjects/:id
 * @desc    Get subject by ID
 * @access  Public
 */
export const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { subject }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/subjects/seed
 * @desc    Seed database with GES syllabus subjects (Admin only)
 * @access  Private
 */
export const seedSubjects = async (req, res, next) => {
  try {
    const subjectsToSeed = [];

    // Process JHS subjects
    for (const [subjectKey, subjectData] of Object.entries(GES_SYLLABUS.JHS)) {
      subjectsToSeed.push({
        name: subjectKey.replace(/_/g, ' '),
        code: subjectData.code,
        level: 'JHS',
        description: `${subjectKey.replace(/_/g, ' ')} for Junior High School`,
        syllabus: {
          topics: subjectData.topics,
          difficulty: subjectData.difficulty
        }
      });
    }

    // Process SHS subjects
    for (const [subjectKey, subjectData] of Object.entries(GES_SYLLABUS.SHS)) {
      subjectsToSeed.push({
        name: subjectKey.replace(/_/g, ' '),
        code: subjectData.code,
        level: 'SHS',
        description: `${subjectKey.replace(/_/g, ' ')} for Senior High School`,
        syllabus: {
          topics: subjectData.topics,
          difficulty: subjectData.difficulty
        }
      });
    }

    // Create subjects (skip duplicates)
    const results = [];
    for (const subject of subjectsToSeed) {
      try {
        const created = await prisma.subject.create({
          data: subject
        });
        results.push(created);
      } catch (error) {
        // Skip if already exists
        if (error.code === 'P2002') {
          console.log(`Subject ${subject.name} already exists`);
        }
      }
    }

    res.status(201).json({
      status: 'success',
      message: `Seeded ${results.length} subjects`,
      data: { subjects: results }
    });
  } catch (error) {
    next(error);
  }
};
