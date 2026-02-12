/**
 * Math Service - Integrates symbolic math engine with AI tutoring
 * Handles mathematical questions with exact symbolic computation
 * 
 * @author AI Learning Hub
 * @version 1.0.0
 */

import { MathEngine, canSolve, detectExpressionType, solve } from '../math/index.js';

/**
 * Keywords that indicate a math-related question
 */
const MATH_KEYWORDS = [
  'solve', 'calculate', 'simplify', 'evaluate',
  'fraction', 'add', 'subtract', 'multiply', 'divide',
  'equation', 'algebra', 'what is', 'compute',
  '+', '-', '*', '/', '=', 'plus', 'minus', 'times',
  'over', 'bar', 'divided by'
];

/**
 * Check if a question is primarily mathematical
 * @param {string} question - User's question
 * @param {string} subject - Subject name
 * @returns {boolean}
 */
export const isMathQuestion = (question, subject = '') => {
  const subjectLower = subject.toLowerCase();
  const questionLower = question.toLowerCase();
  
  // If it's a math subject, check if we can solve the expression
  if (subjectLower.includes('math') || subjectLower.includes('mathematics')) {
    // Check if the question contains a solvable expression
    if (canSolve(question)) {
      return true;
    }
    
    // Check for math keywords
    if (MATH_KEYWORDS.some(keyword => questionLower.includes(keyword))) {
      // Extract potential math expression from the question
      const mathExpression = extractMathExpression(question);
      if (mathExpression && canSolve(mathExpression)) {
        return true;
      }
    }
  }
  
  // Direct math expression check
  if (canSolve(question)) {
    return true;
  }
  
  return false;
};

/**
 * Extract mathematical expression from a sentence
 * @param {string} text - Input text
 * @returns {string|null} Extracted expression
 */
export const extractMathExpression = (text) => {
  // Remove common question prefixes
  const prefixes = [
    /^(?:what is|calculate|solve|simplify|evaluate|find|compute)\s*/i,
    /^(?:can you|please|help me)\s+(?:solve|calculate|simplify|evaluate)\s*/i,
  ];
  
  let expression = text.trim();
  
  for (const prefix of prefixes) {
    expression = expression.replace(prefix, '');
  }
  
  // Remove trailing question marks and periods
  expression = expression.replace(/[?.!]+$/, '').trim();
  
  // Check if what remains is a valid expression
  if (canSolve(expression)) {
    return expression;
  }
  
  // Try to find math patterns in the text
  const patterns = [
    /(\d+\s*\/\s*\d+\s*[+\-*/]\s*\d+\s*\/\s*\d+)/,  // fractions with operations
    /(\d+\s*\/\s*\d+)/,                              // simple fractions
    /(\d+\s*[+\-*/]\s*\d+(?:\s*[+\-*/]\s*\d+)*)/,   // arithmetic
    /(\d*[a-zA-Z]\s*[+\-]\s*\d+\s*=\s*\d+)/,        // linear equations
    /(\d+\s+(?:over|bar)\s+\d+)/i,                   // natural language fractions
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && canSolve(match[1])) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Solve a math question with step-by-step explanation
 * @param {string} question - User's question
 * @returns {object} Solution result
 */
export const solveMathQuestion = (question) => {
  // First try to solve the question directly
  if (canSolve(question)) {
    const solution = solve(question);
    return {
      success: true,
      type: 'symbolic',
      expressionType: detectExpressionType(question),
      solution: MathEngine.formatForDisplay(solution),
      raw: solution
    };
  }
  
  // Try to extract a math expression
  const expression = extractMathExpression(question);
  
  if (expression) {
    const solution = solve(expression);
    return {
      success: true,
      type: 'symbolic',
      expressionType: detectExpressionType(expression),
      originalQuestion: question,
      extractedExpression: expression,
      solution: MathEngine.formatForDisplay(solution),
      raw: solution
    };
  }
  
  return {
    success: false,
    type: 'unknown',
    message: 'Could not parse mathematical expression'
  };
};

/**
 * Generate math response for chat
 * @param {string} question - User's question
 * @param {string} className - Student's class
 * @returns {object} Response object
 */
export const generateMathResponse = (question, className = 'JHS 1') => {
  const result = solveMathQuestion(question);
  
  if (!result.success) {
    return {
      success: false,
      response: null,
      needsAI: true // Fall back to AI for complex questions
    };
  }
  
  const { solution } = result;
  const level = className.includes('SHS') ? 'SHS' : 'JHS';
  
  // Build response text
  let responseText = '';
  
  // Add encouraging intro based on level
  if (level === 'JHS') {
    responseText += "Let's solve this step by step! 📚\n\n";
  } else {
    responseText += "Here's the solution with detailed steps:\n\n";
  }
  
  // Add the question/expression
  responseText += `**Problem:** ${solution.question}\n\n`;
  
  // Add steps
  responseText += '**Solution:**\n';
  solution.steps.forEach((step, index) => {
    responseText += `Step ${index + 1}: ${step.text}\n`;
  });
  
  // Add answer
  responseText += `\n**Answer:** ${solution.answer}\n`;
  
  // Add encouragement
  if (level === 'JHS') {
    responseText += '\nGreat job working through this! 🌟';
  }
  
  return {
    success: true,
    response: responseText,
    mathData: {
      question: solution.question,
      steps: solution.steps,
      answer: solution.answer,
      answerLatex: solution.answerLatex,
      expressionType: result.expressionType
    },
    needsAI: false
  };
};

/**
 * Format math solution for rich display (with LaTeX)
 * @param {object} mathData - Math data from generateMathResponse
 * @returns {object} Rich display data
 */
export const formatForRichDisplay = (mathData) => {
  return {
    type: 'math-solution',
    data: {
      question: {
        text: mathData.question,
        latex: mathData.question
      },
      steps: mathData.steps.map((step, index) => ({
        number: index + 1,
        text: step.text,
        latex: step.latex || step.text
      })),
      answer: {
        text: mathData.answer,
        latex: mathData.answerLatex
      }
    }
  };
};

export default {
  isMathQuestion,
  extractMathExpression,
  solveMathQuestion,
  generateMathResponse,
  formatForRichDisplay
};
