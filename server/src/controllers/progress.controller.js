/**
 * Progress Controller
 * Tracks and reports student learning progress
 */

import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/progress
 * @desc    Get student's overall progress
 * @access  Private
 */
export const getStudentProgress = async (req, res, next) => {
  try {
    const studentId = req.student.id;

    const progressData = await prisma.progress.findMany({
      where: { studentId },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        lastPracticed: 'desc'
      }
    });

    // Calculate overall stats
    const totalQuestions = progressData.reduce((sum, p) => sum + p.questionsAsked, 0);
    const totalCorrect = progressData.reduce((sum, p) => sum + p.correctAnswers, 0);
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    res.status(200).json({
      status: 'success',
      data: {
        progress: progressData,
        summary: {
          totalQuestions,
          totalCorrect,
          overallAccuracy: overallAccuracy.toFixed(2),
          subjectsPracticed: progressData.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/progress/:subjectId
 * @desc    Get progress for specific subject
 * @access  Private
 */
export const getSubjectProgress = async (req, res, next) => {
  try {
    const studentId = req.student.id;
    const { subjectId } = req.params;

    const progress = await prisma.progress.findUnique({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId
        }
      },
      include: {
        subject: true
      }
    });

    if (!progress) {
      return res.status(200).json({
        status: 'success',
        data: {
          progress: null,
          message: 'No progress recorded for this subject yet'
        }
      });
    }

    // Get recent questions for this subject
    const recentQuestions = await prisma.question.findMany({
      where: {
        studentId,
        subjectId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    res.status(200).json({
      status: 'success',
      data: {
        progress,
        recentQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/progress/feedback
 * @desc    Submit feedback on answer accuracy
 * @access  Private
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const studentId = req.student.id;
    const { questionId, isCorrect } = req.body;

    if (typeof isCorrect !== 'boolean') {
      return next(new AppError('isCorrect must be a boolean', 400));
    }

    // Verify question belongs to student
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        studentId
      }
    });

    if (!question) {
      return next(new AppError('Question not found', 404));
    }

    // Update question
    await prisma.question.update({
      where: { id: questionId },
      data: { isCorrect }
    });

    // Update progress
    const progress = await prisma.progress.findUnique({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId: question.subjectId
        }
      }
    });

    if (progress) {
      const newCorrect = isCorrect 
        ? progress.correctAnswers + 1 
        : progress.correctAnswers;
      const newAccuracy = (newCorrect / progress.questionsAsked) * 100;

      await prisma.progress.update({
        where: { id: progress.id },
        data: {
          correctAnswers: newCorrect,
          accuracyScore: newAccuracy
        }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/progress/stats
 * @desc    Get detailed statistics and insights
 * @access  Private
 */
export const getDetailedStats = async (req, res, next) => {
  try {
    const studentId = req.student.id;

    // Get all progress
    const progress = await prisma.progress.findMany({
      where: { studentId },
      include: {
        subject: true
      }
    });

    // Get recent activity
    const recentQuestions = await prisma.question.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    // Calculate streaks and patterns
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const questionsThisWeek = await prisma.question.count({
      where: {
        studentId,
        createdAt: {
          gte: weekAgo
        }
      }
    });

    // Most practiced subject
    const mostPracticed = progress.reduce((max, p) => 
      p.questionsAsked > (max?.questionsAsked || 0) ? p : max
    , null);

    res.status(200).json({
      status: 'success',
      data: {
        progress,
        recentQuestions,
        insights: {
          questionsThisWeek,
          mostPracticedSubject: mostPracticed?.subject.name,
          totalSubjects: progress.length,
          averageAccuracy: progress.reduce((sum, p) => sum + p.accuracyScore, 0) / progress.length || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
