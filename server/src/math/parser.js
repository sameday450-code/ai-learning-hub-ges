/**
 * Math Parser - Expression Tokenizer and Parser
 * Converts natural language and mathematical expressions to structured tokens
 * 
 * @author AI Learning Hub
 * @version 1.0.0
 */

import { Fraction } from './fraction.js';

/**
 * Token types for mathematical expressions
 */
export const TokenType = {
  NUMBER: 'NUMBER',
  FRACTION: 'FRACTION',
  VARIABLE: 'VARIABLE',
  OPERATOR: 'OPERATOR',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EQUALS: 'EQUALS',
  POWER: 'POWER',
  EOF: 'EOF'
};

/**
 * Operator definitions with precedence and associativity
 */
export const Operators = {
  '+': { precedence: 1, associativity: 'left', fn: 'add' },
  '-': { precedence: 1, associativity: 'left', fn: 'subtract' },
  '*': { precedence: 2, associativity: 'left', fn: 'multiply' },
  '×': { precedence: 2, associativity: 'left', fn: 'multiply' },
  '/': { precedence: 2, associativity: 'left', fn: 'divide' },
  '÷': { precedence: 2, associativity: 'left', fn: 'divide' },
  '^': { precedence: 3, associativity: 'right', fn: 'pow' }
};

/**
 * Token class representing a single token
 */
export class Token {
  constructor(type, value, raw = null) {
    this.type = type;
    this.value = value;
    this.raw = raw || value;
  }
}

/**
 * Lexer class - tokenizes mathematical expressions
 */
export class Lexer {
  constructor(input) {
    this.input = input.trim();
    this.pos = 0;
    this.tokens = [];
  }

  /**
   * Get current character
   */
  current() {
    return this.input[this.pos];
  }

  /**
   * Peek ahead
   */
  peek(offset = 1) {
    return this.input[this.pos + offset];
  }

  /**
   * Advance position
   */
  advance() {
    return this.input[this.pos++];
  }

  /**
   * Skip whitespace
   */
  skipWhitespace() {
    while (this.pos < this.input.length && /\s/.test(this.current())) {
      this.advance();
    }
  }

  /**
   * Read a number (integer or decimal)
   */
  readNumber() {
    let num = '';
    while (this.pos < this.input.length && /[\d.]/.test(this.current())) {
      num += this.advance();
    }
    return parseFloat(num);
  }

  /**
   * Read a variable name
   */
  readVariable() {
    let name = '';
    while (this.pos < this.input.length && /[a-zA-Z_]/.test(this.current())) {
      name += this.advance();
    }
    return name;
  }

  /**
   * Read a word (for natural language parsing)
   */
  readWord() {
    let word = '';
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.current())) {
      word += this.advance();
    }
    return word.toLowerCase();
  }

  /**
   * Tokenize the input
   */
  tokenize() {
    this.tokens = [];
    
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      
      if (this.pos >= this.input.length) break;
      
      const char = this.current();

      // Numbers
      if (/\d/.test(char)) {
        const num = this.readNumber();
        
        // Check for fraction notation (number/number)
        this.skipWhitespace();
        if (this.current() === '/') {
          this.advance();
          this.skipWhitespace();
          if (/\d/.test(this.current())) {
            const denom = this.readNumber();
            this.tokens.push(new Token(TokenType.FRACTION, new Fraction(num, denom), `${num}/${denom}`));
            continue;
          } else {
            // It's division, put number and operator
            this.tokens.push(new Token(TokenType.NUMBER, new Fraction(num, 1), num.toString()));
            this.tokens.push(new Token(TokenType.OPERATOR, '/', '/'));
            continue;
          }
        }
        
        this.tokens.push(new Token(TokenType.NUMBER, new Fraction(num, 1), num.toString()));
        continue;
      }

      // Variables and keywords
      if (/[a-zA-Z]/.test(char)) {
        const word = this.readWord();
        
        // Natural language fraction patterns
        if (word === 'over' || word === 'bar' || word === 'divided') {
          // Check if we need to handle "divided by"
          if (word === 'divided') {
            this.skipWhitespace();
            const nextWord = this.readWord();
            if (nextWord === 'by') {
              this.tokens.push(new Token(TokenType.OPERATOR, '/', 'divided by'));
              continue;
            }
          }
          this.tokens.push(new Token(TokenType.OPERATOR, '/', word));
          continue;
        }
        
        // Math keywords
        if (word === 'plus') {
          this.tokens.push(new Token(TokenType.OPERATOR, '+', 'plus'));
          continue;
        }
        if (word === 'minus') {
          this.tokens.push(new Token(TokenType.OPERATOR, '-', 'minus'));
          continue;
        }
        if (word === 'times' || word === 'multiplied') {
          if (word === 'multiplied') {
            this.skipWhitespace();
            const byWord = this.readWord();
            // Skip "by" if present
          }
          this.tokens.push(new Token(TokenType.OPERATOR, '*', word));
          continue;
        }
        if (word === 'equals' || word === 'is') {
          this.tokens.push(new Token(TokenType.EQUALS, '=', word));
          continue;
        }
        if (word === 'squared') {
          this.tokens.push(new Token(TokenType.OPERATOR, '^', '^'));
          this.tokens.push(new Token(TokenType.NUMBER, new Fraction(2, 1), '2'));
          continue;
        }
        if (word === 'cubed') {
          this.tokens.push(new Token(TokenType.OPERATOR, '^', '^'));
          this.tokens.push(new Token(TokenType.NUMBER, new Fraction(3, 1), '3'));
          continue;
        }
        
        // Single letter variables
        if (word.length === 1) {
          this.tokens.push(new Token(TokenType.VARIABLE, word, word));
          continue;
        }
        
        // Multi-letter variable
        this.tokens.push(new Token(TokenType.VARIABLE, word, word));
        continue;
      }

      // Operators and symbols
      if (char === '+') {
        this.advance();
        this.tokens.push(new Token(TokenType.OPERATOR, '+', '+'));
        continue;
      }
      if (char === '-') {
        this.advance();
        this.tokens.push(new Token(TokenType.OPERATOR, '-', '-'));
        continue;
      }
      if (char === '*' || char === '×' || char === '·') {
        this.advance();
        this.tokens.push(new Token(TokenType.OPERATOR, '*', char));
        continue;
      }
      if (char === '÷') {
        this.advance();
        this.tokens.push(new Token(TokenType.OPERATOR, '/', char));
        continue;
      }
      if (char === '/') {
        this.advance();
        this.tokens.push(new Token(TokenType.OPERATOR, '/', '/'));
        continue;
      }
      if (char === '^') {
        this.advance();
        this.tokens.push(new Token(TokenType.POWER, '^', '^'));
        continue;
      }
      if (char === '=') {
        this.advance();
        this.tokens.push(new Token(TokenType.EQUALS, '=', '='));
        continue;
      }
      if (char === '(') {
        this.advance();
        this.tokens.push(new Token(TokenType.LPAREN, '(', '('));
        continue;
      }
      if (char === ')') {
        this.advance();
        this.tokens.push(new Token(TokenType.RPAREN, ')', ')'));
        continue;
      }

      // Skip unknown characters
      this.advance();
    }

    this.tokens.push(new Token(TokenType.EOF, null, ''));
    return this.tokens;
  }
}

/**
 * Parser class - builds AST from tokens
 */
export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  current() {
    return this.tokens[this.pos];
  }

  advance() {
    return this.tokens[this.pos++];
  }

  expect(type) {
    if (this.current().type !== type) {
      throw new Error(`Expected ${type} but got ${this.current().type}`);
    }
    return this.advance();
  }

  /**
   * Parse an equation (expression = expression)
   */
  parseEquation() {
    const left = this.parseExpression();
    
    if (this.current().type === TokenType.EQUALS) {
      this.advance();
      const right = this.parseExpression();
      return { type: 'Equation', left, right };
    }
    
    return left;
  }

  /**
   * Parse expression (handles + and -)
   */
  parseExpression() {
    let left = this.parseTerm();

    while (this.current().type === TokenType.OPERATOR && 
           (this.current().value === '+' || this.current().value === '-')) {
      const op = this.advance().value;
      const right = this.parseTerm();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  /**
   * Parse term (handles * and /)
   */
  parseTerm() {
    let left = this.parseFactor();

    while (this.current().type === TokenType.OPERATOR && 
           (this.current().value === '*' || this.current().value === '/')) {
      const op = this.advance().value;
      const right = this.parseFactor();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  /**
   * Parse factor (handles ^ and implicit multiplication)
   */
  parseFactor() {
    let left = this.parsePrimary();

    // Handle power
    if (this.current().type === TokenType.POWER) {
      this.advance();
      const right = this.parseFactor();
      left = { type: 'BinaryOp', operator: '^', left, right };
    }

    // Handle implicit multiplication (2x, xy, 3(2+1))
    while ((this.current().type === TokenType.VARIABLE) ||
           (this.current().type === TokenType.NUMBER && left.type === 'Variable') ||
           (this.current().type === TokenType.LPAREN)) {
      const right = this.parsePrimary();
      left = { type: 'BinaryOp', operator: '*', left, right };
    }

    return left;
  }

  /**
   * Parse primary (numbers, variables, fractions, parentheses)
   */
  parsePrimary() {
    const token = this.current();

    // Handle negative numbers/expressions
    if (token.type === TokenType.OPERATOR && token.value === '-') {
      this.advance();
      const expr = this.parsePrimary();
      return { type: 'UnaryOp', operator: '-', operand: expr };
    }

    if (token.type === TokenType.NUMBER || token.type === TokenType.FRACTION) {
      this.advance();
      return { type: 'Number', value: token.value };
    }

    if (token.type === TokenType.VARIABLE) {
      this.advance();
      return { type: 'Variable', name: token.value };
    }

    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    throw new Error(`Unexpected token: ${token.type}`);
  }

  parse() {
    return this.parseEquation();
  }
}

/**
 * Parse a mathematical expression string
 * @param {string} input - Mathematical expression
 * @returns {object} AST representation
 */
export const parse = (input) => {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
};

/**
 * Parse fraction notation from various formats
 * @param {string} input - Fraction string
 * @returns {Fraction} Parsed fraction
 */
export const parseFraction = (input) => {
  const str = input.trim();
  
  // Standard fraction: "2/3"
  const slashMatch = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (slashMatch) {
    return new Fraction(parseInt(slashMatch[1]), parseInt(slashMatch[2]));
  }
  
  // Natural language: "2 over 3", "2 bar 3"
  const naturalMatch = str.match(/^(-?\d+)\s+(?:over|bar)\s+(\d+)$/i);
  if (naturalMatch) {
    return new Fraction(parseInt(naturalMatch[1]), parseInt(naturalMatch[2]));
  }
  
  // Mixed number: "1 2/3" -> 5/3
  const mixedMatch = str.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const num = parseInt(mixedMatch[2]);
    const denom = parseInt(mixedMatch[3]);
    const sign = whole < 0 ? -1 : 1;
    return new Fraction(sign * (Math.abs(whole) * denom + num), denom);
  }
  
  // Integer
  const intMatch = str.match(/^(-?\d+)$/);
  if (intMatch) {
    return new Fraction(parseInt(intMatch[1]), 1);
  }
  
  throw new Error(`Cannot parse fraction from: "${input}"`);
};

/**
 * Detect if input is a mathematical equation
 * @param {string} input - Input string
 * @returns {boolean}
 */
export const isEquation = (input) => {
  return /[=]/.test(input) || 
         /\bequals?\b/i.test(input) ||
         /\bis\b.*\d/i.test(input);
};

/**
 * Detect if input is a fraction expression
 * @param {string} input - Input string
 * @returns {boolean}
 */
export const isFractionExpression = (input) => {
  return /\d+\s*\/\s*\d+/.test(input) ||
         /\d+\s+(?:over|bar)\s+\d+/i.test(input) ||
         /\d+\s+\d+\s*\/\s*\d+/.test(input);
};

/**
 * Detect if input is a simple arithmetic expression
 * @param {string} input - Input string
 * @returns {boolean}
 */
export const isArithmeticExpression = (input) => {
  return /[\d\s+\-*×÷/^()]+/.test(input) ||
         /\d+\s*(?:plus|minus|times|divided|over|bar)\s*\d+/i.test(input);
};

/**
 * Detect the type of mathematical expression
 * @param {string} input - Input string
 * @returns {string} Type: 'equation', 'fraction', 'arithmetic', 'unknown'
 */
export const detectExpressionType = (input) => {
  const trimmed = input.trim();
  
  if (isEquation(trimmed)) {
    // Check if it's an algebraic equation (has variables)
    if (/[a-zA-Z]/.test(trimmed.replace(/(?:plus|minus|times|divided|over|bar|equals?|is)/gi, ''))) {
      return 'algebraic_equation';
    }
    return 'arithmetic_equation';
  }
  
  if (isFractionExpression(trimmed)) {
    return 'fraction';
  }
  
  if (isArithmeticExpression(trimmed)) {
    // Check if it contains variables
    if (/[a-zA-Z]/.test(trimmed.replace(/(?:plus|minus|times|divided|over|bar)/gi, ''))) {
      return 'algebraic_expression';
    }
    return 'arithmetic';
  }
  
  return 'unknown';
};

export default {
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
};
