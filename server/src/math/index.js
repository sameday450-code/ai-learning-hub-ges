/**
 * Math Engine - Main Entry Point
 * Professional symbolic mathematics engine
 * 
 * @author AI Learning Hub
 * @version 1.0.0
 */

export { Fraction, gcd, lcm, frac } from './fraction.js';
export { 
  Lexer, 
  Parser, 
  Token, 
  TokenType, 
  parse, 
  parseFraction,
  isEquation,
  isFractionExpression,
  isArithmeticExpression,
  detectExpressionType
} from './parser.js';
export {
  solve,
  simplifyFraction,
  evaluateArithmetic,
  solveLinearEquation,
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
  canSolve
} from './solver.js';

import { Fraction, frac } from './fraction.js';
import { solve, canSolve, simplifyFraction } from './solver.js';
import { detectExpressionType, parseFraction } from './parser.js';

/**
 * MathEngine - Main class for symbolic math operations
 */
export class MathEngine {
  /**
   * Solve any mathematical expression or equation
   * @param {string} input - Mathematical input
   * @returns {object} Solution with steps
   */
  static solve(input) {
    return solve(input);
  }

  /**
   * Check if input can be solved
   * @param {string} input - User input
   * @returns {boolean}
   */
  static canSolve(input) {
    return canSolve(input);
  }

  /**
   * Create a fraction
   * @param {number} numerator 
   * @param {number} denominator 
   * @returns {Fraction}
   */
  static fraction(numerator, denominator = 1) {
    return new Fraction(numerator, denominator);
  }

  /**
   * Parse a fraction from string
   * @param {string} input 
   * @returns {Fraction}
   */
  static parseFraction(input) {
    return parseFraction(input);
  }

  /**
   * Simplify a fraction
   * @param {string|Fraction} input 
   * @returns {object}
   */
  static simplify(input) {
    return simplifyFraction(input);
  }

  /**
   * Detect expression type
   * @param {string} input 
   * @returns {string}
   */
  static detectType(input) {
    return detectExpressionType(input);
  }

  /**
   * Format solution for display
   * @param {object} solution - Solution from solve()
   * @returns {object} Formatted response
   */
  static formatForDisplay(solution) {
    return {
      question: solution.question,
      steps: solution.steps.map(step => ({
        text: step.description,
        latex: step.latex
      })),
      answer: solution.result.value,
      answerLatex: solution.result.latex
    };
  }

  /**
   * Format solution for chat response
   * @param {object} solution - Solution from solve()
   * @returns {object} Chat-friendly response
   */
  static formatForChat(solution) {
    const stepsText = solution.steps.map((step, i) => 
      `Step ${i + 1}: ${step.description}`
    ).join('\n');

    return {
      type: 'math',
      question: solution.question,
      steps: solution.steps,
      result: solution.result,
      textResponse: `${solution.question}\n\n${stepsText}\n\nAnswer: ${solution.result.value}`
    };
  }
}

export default MathEngine;
