/**
 * AI Controller
 * Handles AI chat requests and voice generation
 */

import prisma from '../utils/prisma.js';
import { generateAIResponse, analyzeQuestionDifficulty } from '../ai/ai.service.js';
import { textToSpeech, optimizeTextForSpeech } from '../ai/voice.service.js';
import { isMathQuestion, generateMathResponse, formatForRichDisplay } from '../ai/math.service.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   POST /api/ai/ask
 * @desc    Get AI response for homework question
 * @access  Private
 */
export const askQuestion = async (req, res, next) => {
  try {
    const { question, subjectId, isVoiceEnabled } = req.body;
    const studentId = req.student.id;

    // Validate input
    if (!question || !subjectId) {
      return next(new AppError('Question and subject are required', 400));
    }

    // Get subject and student info
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    let aiResult;
    let mathData = null;

    // Check if this is a math question that can be solved symbolically
    if (isMathQuestion(question, subject.name)) {
      const mathResult = generateMathResponse(question, student.className);
      
      if (mathResult.success && !mathResult.needsAI) {
        // Use symbolic math engine result
        aiResult = {
          success: true,
          response: mathResult.response,
          metadata: {
            model: 'symbolic-math-engine',
            tokens: 0
          }
        };
        mathData = formatForRichDisplay(mathResult.mathData);
      } else {
        // Fall back to AI for complex questions
        aiResult = await generateAIResponse(
          question,
          subject.name,
          student.className
        );
      }
    } else {
      // Generate AI response for non-math questions
      aiResult = await generateAIResponse(
        question,
        subject.name,
        student.className
      );
    }

    if (!aiResult.success) {
      return next(new AppError('Failed to generate AI response', 500));
    }

    // Analyze difficulty
    const difficulty = analyzeQuestionDifficulty(
      question,
      subject.name,
      student.className
    );

    // Generate voice if requested
    let audioUrl = null;
    if (isVoiceEnabled) {
      const optimizedText = optimizeTextForSpeech(aiResult.response);
      const voiceResult = await textToSpeech(optimizedText);
      
      if (voiceResult.success) {
        // In production, you'd upload to S3/Cloud Storage
        // For now, we'll send base64 encoded audio
        audioUrl = `data:audio/mpeg;base64,${voiceResult.audio.toString('base64')}`;
      }
    }

    // Save question to database
    const savedQuestion = await prisma.question.create({
      data: {
        studentId,
        subjectId,
        questionText: question,
        aiResponse: aiResult.response,
        isVoiceEnabled: isVoiceEnabled || false,
        audioUrl,
        difficulty
      }
    });

    // Update progress
    await updateStudentProgress(studentId, subjectId);

    res.status(200).json({
      status: 'success',
      data: {
        questionId: savedQuestion.id,
        question,
        response: aiResult.response,
        audioUrl,
        difficulty,
        subject: subject.name,
        metadata: aiResult.metadata,
        // Include rich math data for frontend rendering
        mathData: mathData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/voice
 * @desc    Generate voice for existing response
 * @access  Private
 */
export const generateVoice = async (req, res, next) => {
  try {
    const { questionId, text } = req.body;
    const studentId = req.student.id;

    let textToSpeak = text;

    // If questionId is provided, fetch the AI response text from the database
    if (questionId) {
      const question = await prisma.question.findFirst({
        where: {
          id: questionId,
          studentId
        }
      });

      if (!question) {
        return next(new AppError('Question not found', 404));
      }

      // Use the AI response as the text to speak
      textToSpeak = question.aiResponse;
    }

    if (!textToSpeak) {
      return next(new AppError('Text is required', 400));
    }

    // Generate voice
    const optimizedText = optimizeTextForSpeech(textToSpeak);
    const voiceResult = await textToSpeech(optimizedText);

    if (!voiceResult.success) {
      return next(new AppError('Failed to generate voice', 500));
    }

    // Update question with audio URL if questionId provided
    if (questionId) {
      const audioUrl = `data:audio/mpeg;base64,${voiceResult.audio.toString('base64')}`;
      await prisma.question.update({
        where: { id: questionId },
        data: {
          audioUrl,
          isVoiceEnabled: true
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        audioUrl: `data:audio/mpeg;base64,${voiceResult.audio.toString('base64')}`,
        format: voiceResult.format
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ai/history
 * @desc    Get student's question history
 * @access  Private
 */
export const getQuestionHistory = async (req, res, next) => {
  try {
    const studentId = req.student.id;
    const { limit = 20, subjectId } = req.query;

    const where = {
      studentId,
      ...(subjectId && { subjectId })
    };

    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: { questions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update student progress
 */
async function updateStudentProgress(studentId, subjectId) {
  const progress = await prisma.progress.findUnique({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId
      }
    }
  });

  if (progress) {
    // Update existing progress
    await prisma.progress.update({
      where: { id: progress.id },
      data: {
        questionsAsked: { increment: 1 },
        lastPracticed: new Date()
      }
    });
  } else {
    // Create new progress entry
    await prisma.progress.create({
      data: {
        studentId,
        subjectId,
        questionsAsked: 1,
        lastPracticed: new Date()
      }
    });
  }
}
