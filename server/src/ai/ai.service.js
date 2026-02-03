/**
 * AI Service - OpenAI Integration
 * Syllabus-aware homework solver with step-by-step explanations
 */

import axios from 'axios';
import { GES_SYLLABUS, EXAM_GUIDELINES } from './syllabus.config.js';

/**
 * Build system prompt based on student level and subject
 */
const buildSystemPrompt = (className, subject) => {
  // Determine if JHS or SHS
  const level = className.includes('JHS') ? 'JHS' : 'SHS';
  const examType = level === 'JHS' ? 'BECE' : 'WASSCE';
  
  // Get syllabus information
  const subjectKey = subject.toUpperCase().replace(/\s+/g, '_');
  const syllabusInfo = GES_SYLLABUS[level]?.[subjectKey];
  const examInfo = EXAM_GUIDELINES[examType];

  const systemPrompt = `You are an expert AI tutor for Ghanaian ${level} students, strictly aligned to the Ghana Education Service (GES) syllabus.

STUDENT CONTEXT:
- Level: ${className}
- Subject: ${subject}
- Exam: ${examInfo?.name || examType}
- Syllabus Topics: ${syllabusInfo?.topics.join(', ') || 'General curriculum'}

YOUR ROLE:
1. Provide step-by-step explanations suitable for ${level} students
2. Use simple, clear language appropriate for young learners
3. Relate concepts to Ghanaian context and real-life examples
4. Ensure all answers align with GES syllabus requirements
5. Prepare students for ${examType} examination format

RESPONSE GUIDELINES:
- Always show step-by-step working
- Explain WHY each step is taken
- Use encouraging, supportive language
- Highlight key concepts and formulas
- Provide exam tips when relevant
- Keep explanations concise but comprehensive
- Use Ghanaian examples (cedis, local scenarios, etc.)

STYLE:
- Friendly and patient teacher
- Age-appropriate vocabulary
- Clear formatting with numbered steps
- Highlight important points
- End with a practice tip or encouragement

Remember: You're helping Ghanaian students succeed in their education journey!`;

  return systemPrompt;
};

/**
 * Generate AI response for homework question
 */
export const generateAIResponse = async (question, subject, className) => {
  try {
    const systemPrompt = buildSystemPrompt(className, subject);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    return {
      success: true,
      response: response.data.choices[0].message.content,
      metadata: {
        model: response.data.model,
        tokens: response.data.usage.total_tokens
      }
    };
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    
    // Fallback response if API fails
    return {
      success: false,
      response: "I'm having trouble connecting right now. Please try again in a moment, or rephrase your question.",
      error: error.message
    };
  }
};

/**
 * Analyze question complexity and suggest difficulty level
 */
export const analyzeQuestionDifficulty = (question, subject, className) => {
  const level = className.includes('JHS') ? 'JHS' : 'SHS';
  const questionLower = question.toLowerCase();
  
  // Keywords indicating difficulty
  const easyKeywords = ['what is', 'define', 'list', 'name', 'identify'];
  const mediumKeywords = ['explain', 'describe', 'compare', 'calculate', 'solve'];
  const hardKeywords = ['analyze', 'evaluate', 'prove', 'derive', 'justify'];
  
  if (hardKeywords.some(keyword => questionLower.includes(keyword))) {
    return 'hard';
  } else if (mediumKeywords.some(keyword => questionLower.includes(keyword))) {
    return 'medium';
  } else {
    return 'easy';
  }
};

/**
 * Generate follow-up questions to reinforce learning
 */
export const generateFollowUpQuestions = (subject, topic) => {
  const followUps = {
    MATHEMATICS: [
      'Can you try a similar problem with different numbers?',
      'What would happen if we changed this variable?',
      'Can you explain this concept in your own words?'
    ],
    ENGLISH: [
      'Can you use this word in a different sentence?',
      'What are other examples of this grammar rule?',
      'How would you explain this to a classmate?'
    ],
    SCIENCE: [
      'What real-world examples can you think of?',
      'How does this relate to what you learned before?',
      'Can you predict what would happen if we changed this?'
    ],
    SOCIAL_STUDIES: [
      'How does this relate to Ghana today?',
      'Can you think of a current example?',
      'Why is this important to understand?'
    ]
  };

  const subjectKey = subject.toUpperCase().replace(/\s+/g, '_');
  const questions = followUps[subjectKey] || followUps.MATHEMATICS;
  
  return questions[Math.floor(Math.random() * questions.length)];
};
