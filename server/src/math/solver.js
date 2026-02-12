/**
 * Math Solver Engine
 * Symbolic mathematics solver with step-by-step explanations
 * 
 * @author AI Learning Hub
 * @version 1.0.0
 */

import { Fraction, gcd } from './fraction.js';
import { parse, parseFraction, detectExpressionType, Lexer, Parser } from './parser.js';

/**
 * Step-by-step solution builder
 */
class StepBuilder {
  constructor(question) {
    this.question = question;
    this.steps = [];
  }

  addStep(description, latex = null) {
    this.steps.push({
      description,
      latex,
      stepNumber: this.steps.length + 1
    });
    return this;
  }

  build(result, resultLatex = null) {
    return {
      question: this.question,
      steps: this.steps,
      result: {
        value: result,
        latex: resultLatex || result
      }
    };
  }
}

/**
 * Evaluate an AST node with exact fraction arithmetic
 * @param {object} node - AST node
 * @param {object} variables - Variable bindings
 * @returns {Fraction} Result
 */
const evaluateNode = (node, variables = {}) => {
  switch (node.type) {
    case 'Number':
      return node.value instanceof Fraction ? node.value : Fraction.from(node.value);

    case 'Variable':
      if (node.name in variables) {
        return variables[node.name] instanceof Fraction 
          ? variables[node.name] 
          : Fraction.from(variables[node.name]);
      }
      throw new Error(`Unknown variable: ${node.name}`);

    case 'UnaryOp':
      const operand = evaluateNode(node.operand, variables);
      if (node.operator === '-') {
        return operand.negate();
      }
      return operand;

    case 'BinaryOp':
      const left = evaluateNode(node.left, variables);
      const right = evaluateNode(node.right, variables);
      
      switch (node.operator) {
        case '+': return left.add(right);
        case '-': return left.subtract(right);
        case '*': return left.multiply(right);
        case '/': return left.divide(right);
        case '^': return left.pow(right.toDecimal());
        default:
          throw new Error(`Unknown operator: ${node.operator}`);
      }

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
};

/**
 * Convert AST node to LaTeX string
 * @param {object} node - AST node
 * @returns {string} LaTeX representation
 */
const astToLatex = (node) => {
  switch (node.type) {
    case 'Number':
      return node.value instanceof Fraction ? node.value.toLatex() : node.value.toString();
    
    case 'Variable':
      return node.name;
    
    case 'UnaryOp':
      if (node.operator === '-') {
        return `-${astToLatex(node.operand)}`;
      }
      return astToLatex(node.operand);
    
    case 'BinaryOp':
      const leftLatex = astToLatex(node.left);
      const rightLatex = astToLatex(node.right);
      
      switch (node.operator) {
        case '+':
          return `${leftLatex} + ${rightLatex}`;
        case '-':
          return `${leftLatex} - ${rightLatex}`;
        case '*':
          // Check for implicit multiplication
          if (node.left.type === 'Number' && node.right.type === 'Variable') {
            return `${leftLatex}${rightLatex}`;
          }
          return `${leftLatex} \\times ${rightLatex}`;
        case '/':
          return `\\frac{${leftLatex}}{${rightLatex}}`;
        case '^':
          return `{${leftLatex}}^{${rightLatex}}`;
        default:
          return `${leftLatex} ${node.operator} ${rightLatex}`;
      }
    
    case 'Equation':
      return `${astToLatex(node.left)} = ${astToLatex(node.right)}`;
    
    default:
      return '';
  }
};

/**
 * Simplify a fraction with step-by-step explanation
 * @param {string|Fraction} input - Fraction to simplify
 * @returns {object} Solution with steps
 */
export const simplifyFraction = (input) => {
  const steps = new StepBuilder(typeof input === 'string' ? input : input.toString());
  
  // Parse input if string
  const frac = input instanceof Fraction ? input.clone() : parseFraction(input);
  const originalNum = frac.numerator;
  const originalDenom = frac.denominator;
  
  steps.addStep(
    `Create Fraction(${originalNum}, ${originalDenom})`,
    `\\frac{${originalNum}}{${originalDenom}}`
  );
  
  // Calculate GCD
  const divisor = gcd(Math.abs(originalNum), originalDenom);
  
  if (divisor === 1) {
    steps.addStep(
      `gcd(${Math.abs(originalNum)}, ${originalDenom}) = 1`,
      `\\gcd(${Math.abs(originalNum)}, ${originalDenom}) = 1`
    );
    steps.addStep('Fraction is already in lowest terms');
    
    const result = frac.toString();
    return steps.build(result, frac.toLatex());
  }
  
  steps.addStep(
    `gcd(${Math.abs(originalNum)}, ${originalDenom}) = ${divisor}`,
    `\\gcd(${Math.abs(originalNum)}, ${originalDenom}) = ${divisor}`
  );
  
  const simplifiedNum = originalNum / divisor;
  const simplifiedDenom = originalDenom / divisor;
  
  steps.addStep(
    `Divide numerator and denominator by ${divisor}`,
    `\\frac{${originalNum} \\div ${divisor}}{${originalDenom} \\div ${divisor}} = \\frac{${simplifiedNum}}{${simplifiedDenom}}`
  );
  
  const simplified = new Fraction(simplifiedNum, simplifiedDenom);
  
  if (simplifiedDenom === 1) {
    steps.addStep(`Simplified to ${simplifiedNum}`, simplifiedNum.toString());
    return steps.build(simplifiedNum.toString(), simplifiedNum.toString());
  }
  
  steps.addStep(
    `Simplified to ${simplified.toString()}`,
    simplified.toLatex()
  );
  
  return steps.build(simplified.toString(), simplified.toLatex());
};

/**
 * Evaluate arithmetic expression with step-by-step explanation
 * @param {string} input - Arithmetic expression
 * @returns {object} Solution with steps
 */
export const evaluateArithmetic = (input) => {
  const steps = new StepBuilder(input);
  
  try {
    const ast = parse(input);
    
    steps.addStep('Parse expression', astToLatex(ast));
    
    // If it's just a fraction, simplify it
    if (ast.type === 'Number' && ast.value instanceof Fraction) {
      const frac = ast.value;
      if (frac.denominator !== 1) {
        const simplifyResult = simplifyFraction(frac);
        return simplifyResult;
      }
      return steps.build(frac.toString(), frac.toLatex());
    }
    
    // Evaluate with detailed steps
    const evaluateWithSteps = (node, depth = 0) => {
      if (node.type === 'Number') {
        return node.value instanceof Fraction ? node.value : Fraction.from(node.value);
      }
      
      if (node.type === 'BinaryOp') {
        const left = evaluateWithSteps(node.left, depth + 1);
        const right = evaluateWithSteps(node.right, depth + 1);
        
        let result;
        let opName;
        
        switch (node.operator) {
          case '+':
            opName = 'Add';
            result = left.add(right);
            break;
          case '-':
            opName = 'Subtract';
            result = left.subtract(right);
            break;
          case '*':
            opName = 'Multiply';
            result = left.multiply(right);
            break;
          case '/':
            opName = 'Divide';
            result = left.divide(right);
            break;
          case '^':
            opName = 'Power';
            result = left.pow(right.toDecimal());
            break;
        }
        
        const stepLatex = `${left.toLatex()} ${getOpSymbol(node.operator)} ${right.toLatex()} = ${result.toLatex()}`;
        steps.addStep(`${opName}: ${left.toString()} ${node.operator} ${right.toString()} = ${result.toString()}`, stepLatex);
        
        return result;
      }
      
      if (node.type === 'UnaryOp' && node.operator === '-') {
        const operand = evaluateWithSteps(node.operand, depth + 1);
        return operand.negate();
      }
      
      throw new Error(`Cannot evaluate node type: ${node.type}`);
    };
    
    const result = evaluateWithSteps(ast);
    
    // Simplify final result if needed
    const finalSimplified = new Fraction(result.numerator, result.denominator);
    
    return steps.build(finalSimplified.toString(), finalSimplified.toLatex());
    
  } catch (error) {
    steps.addStep(`Error: ${error.message}`);
    return steps.build('Error', 'Error');
  }
};

const getOpSymbol = (op) => {
  switch (op) {
    case '+': return '+';
    case '-': return '-';
    case '*': return '\\times';
    case '/': return '\\div';
    case '^': return '^';
    default: return op;
  }
};

/**
 * Collect terms from an algebraic expression
 * Returns { variable: coefficient } mapping
 */
const collectTerms = (node) => {
  const terms = { constant: new Fraction(0, 1) };
  
  const collectFromNode = (n, sign = 1) => {
    if (n.type === 'Number') {
      const val = n.value instanceof Fraction ? n.value : Fraction.from(n.value);
      terms.constant = terms.constant.add(val.multiply(new Fraction(sign, 1)));
    } 
    else if (n.type === 'Variable') {
      if (!terms[n.name]) {
        terms[n.name] = new Fraction(0, 1);
      }
      terms[n.name] = terms[n.name].add(new Fraction(sign, 1));
    }
    else if (n.type === 'BinaryOp') {
      if (n.operator === '+') {
        collectFromNode(n.left, sign);
        collectFromNode(n.right, sign);
      }
      else if (n.operator === '-') {
        collectFromNode(n.left, sign);
        collectFromNode(n.right, -sign);
      }
      else if (n.operator === '*') {
        // Handle coefficient * variable
        if (n.left.type === 'Number' && n.right.type === 'Variable') {
          const coef = n.left.value instanceof Fraction ? n.left.value : Fraction.from(n.left.value);
          if (!terms[n.right.name]) {
            terms[n.right.name] = new Fraction(0, 1);
          }
          terms[n.right.name] = terms[n.right.name].add(coef.multiply(new Fraction(sign, 1)));
        }
        else if (n.right.type === 'Number' && n.left.type === 'Variable') {
          const coef = n.right.value instanceof Fraction ? n.right.value : Fraction.from(n.right.value);
          if (!terms[n.left.name]) {
            terms[n.left.name] = new Fraction(0, 1);
          }
          terms[n.left.name] = terms[n.left.name].add(coef.multiply(new Fraction(sign, 1)));
        }
        else {
          // Try to evaluate as constant
          try {
            const val = evaluateNode(n);
            terms.constant = terms.constant.add(val.multiply(new Fraction(sign, 1)));
          } catch (e) {
            // Contains variables we can't handle
          }
        }
      }
      else {
        // Try to evaluate
        try {
          const val = evaluateNode(n);
          terms.constant = terms.constant.add(val.multiply(new Fraction(sign, 1)));
        } catch (e) {
          // Contains variables
        }
      }
    }
    else if (n.type === 'UnaryOp' && n.operator === '-') {
      collectFromNode(n.operand, -sign);
    }
  };
  
  collectFromNode(node);
  return terms;
};

/**
 * Solve a linear equation
 * @param {string} input - Equation string (e.g., "2x + 1 = 5")
 * @returns {object} Solution with steps
 */
export const solveLinearEquation = (input) => {
  const steps = new StepBuilder(input);
  
  try {
    const ast = parse(input);
    
    if (ast.type !== 'Equation') {
      throw new Error('Input is not an equation');
    }
    
    steps.addStep('Parse equation', astToLatex(ast));
    
    // Collect terms from both sides
    const leftTerms = collectTerms(ast.left);
    const rightTerms = collectTerms(ast.right);
    
    // Find the variable
    const allVars = new Set([
      ...Object.keys(leftTerms).filter(k => k !== 'constant'),
      ...Object.keys(rightTerms).filter(k => k !== 'constant')
    ]);
    
    if (allVars.size === 0) {
      throw new Error('No variable found in equation');
    }
    if (allVars.size > 1) {
      throw new Error('Multiple variables found - only single variable equations supported');
    }
    
    const variable = [...allVars][0];
    
    // Get coefficients
    const leftCoef = leftTerms[variable] || new Fraction(0, 1);
    const rightCoef = rightTerms[variable] || new Fraction(0, 1);
    const leftConst = leftTerms.constant;
    const rightConst = rightTerms.constant;
    
    // Move all variable terms to left, constants to right
    // ax + b = cx + d  =>  ax - cx = d - b  =>  (a-c)x = d - b
    
    const varCoef = leftCoef.subtract(rightCoef);
    const constTerm = rightConst.subtract(leftConst);
    
    if (!rightCoef.isZero()) {
      steps.addStep(
        `Subtract ${rightCoef.toString()}${variable} from both sides`,
        `${leftCoef.toLatex()}${variable} - ${rightCoef.toLatex()}${variable} = ${constTerm.add(leftConst).toLatex()}`
      );
    }
    
    if (!leftConst.isZero()) {
      steps.addStep(
        `Subtract ${leftConst.toString()} from both sides`,
        `${varCoef.toLatex()}${variable} = ${constTerm.toLatex()}`
      );
    } else if (rightCoef.isZero() && !leftConst.isZero()) {
      steps.addStep(
        `Subtract ${leftConst.toString()} from both sides`,
        `${varCoef.toLatex()}${variable} = ${rightConst.toLatex()} - ${leftConst.toLatex()}`
      );
      steps.addStep(
        `Simplify right side`,
        `${varCoef.toLatex()}${variable} = ${constTerm.toLatex()}`
      );
    }
    
    if (varCoef.isZero()) {
      if (constTerm.isZero()) {
        steps.addStep('Equation is always true (infinite solutions)');
        return steps.build('infinite solutions', '\\infty \\text{ solutions}');
      } else {
        steps.addStep('Equation has no solution');
        return steps.build('no solution', '\\text{no solution}');
      }
    }
    
    // Solve for variable: x = constTerm / varCoef
    const solution = constTerm.divide(varCoef);
    
    if (!varCoef.isOne()) {
      steps.addStep(
        `Divide both sides by ${varCoef.toString()}`,
        `${variable} = \\frac{${constTerm.toLatex()}}{${varCoef.toLatex()}}`
      );
    }
    
    steps.addStep(
      `Solution: ${variable} = ${solution.toString()}`,
      `${variable} = ${solution.toLatex()}`
    );
    
    return {
      ...steps.build(`${variable} = ${solution.toString()}`, `${variable} = ${solution.toLatex()}`),
      variable,
      solution: solution.toJSON()
    };
    
  } catch (error) {
    steps.addStep(`Error: ${error.message}`);
    return steps.build('Error', 'Error');
  }
};

/**
 * Main solver function - detects expression type and solves appropriately
 * @param {string} input - Mathematical expression or equation
 * @returns {object} Solution with steps
 */
export const solve = (input) => {
  const expressionType = detectExpressionType(input);
  
  switch (expressionType) {
    case 'fraction':
      return simplifyFraction(input);
    
    case 'arithmetic':
    case 'arithmetic_equation':
      return evaluateArithmetic(input);
    
    case 'algebraic_equation':
      return solveLinearEquation(input);
    
    case 'algebraic_expression':
      // For expressions without equals, try to simplify
      return evaluateArithmetic(input);
    
    default:
      return {
        question: input,
        steps: [{ description: 'Could not parse expression', stepNumber: 1 }],
        result: { value: 'Unknown', latex: '?' }
      };
  }
};

/**
 * Add two fractions with step-by-step explanation
 * @param {string|Fraction} a - First fraction
 * @param {string|Fraction} b - Second fraction
 * @returns {object} Solution with steps
 */
export const addFractions = (a, b) => {
  const fracA = a instanceof Fraction ? a : parseFraction(a);
  const fracB = b instanceof Fraction ? b : parseFraction(b);
  
  const steps = new StepBuilder(`${fracA.toString()} + ${fracB.toString()}`);
  
  steps.addStep(
    `Add fractions: ${fracA.toString()} + ${fracB.toString()}`,
    `${fracA.toLatex()} + ${fracB.toLatex()}`
  );
  
  if (fracA.denominator === fracB.denominator) {
    steps.addStep(
      `Denominators are the same (${fracA.denominator}), add numerators`,
      `\\frac{${fracA.numerator} + ${fracB.numerator}}{${fracA.denominator}}`
    );
  } else {
    const lcmVal = (fracA.denominator * fracB.denominator) / gcd(fracA.denominator, fracB.denominator);
    const multA = lcmVal / fracA.denominator;
    const multB = lcmVal / fracB.denominator;
    
    steps.addStep(
      `Find common denominator: LCD(${fracA.denominator}, ${fracB.denominator}) = ${lcmVal}`,
      `\\text{LCD} = ${lcmVal}`
    );
    
    steps.addStep(
      `Convert fractions to common denominator`,
      `\\frac{${fracA.numerator} \\times ${multA}}{${lcmVal}} + \\frac{${fracB.numerator} \\times ${multB}}{${lcmVal}}`
    );
    
    const newNumA = fracA.numerator * multA;
    const newNumB = fracB.numerator * multB;
    
    steps.addStep(
      `Simplify numerators`,
      `\\frac{${newNumA}}{${lcmVal}} + \\frac{${newNumB}}{${lcmVal}}`
    );
    
    steps.addStep(
      `Add numerators`,
      `\\frac{${newNumA} + ${newNumB}}{${lcmVal}} = \\frac{${newNumA + newNumB}}{${lcmVal}}`
    );
  }
  
  const result = fracA.add(fracB);
  
  // Check if simplification needed
  const beforeSimplify = new Fraction(
    fracA.numerator * (result.denominator / fracA.denominator) + 
    fracB.numerator * (result.denominator / fracB.denominator),
    result.denominator,
    false
  );
  
  if (beforeSimplify.numerator !== result.numerator || beforeSimplify.denominator !== result.denominator) {
    const divisor = gcd(Math.abs(beforeSimplify.numerator), beforeSimplify.denominator);
    steps.addStep(
      `Simplify: divide by gcd(${Math.abs(beforeSimplify.numerator)}, ${beforeSimplify.denominator}) = ${divisor}`,
      `\\frac{${beforeSimplify.numerator}}{${beforeSimplify.denominator}} = ${result.toLatex()}`
    );
  }
  
  steps.addStep(`Result: ${result.toString()}`, result.toLatex());
  
  return steps.build(result.toString(), result.toLatex());
};

/**
 * Subtract two fractions with step-by-step explanation
 */
export const subtractFractions = (a, b) => {
  const fracA = a instanceof Fraction ? a : parseFraction(a);
  const fracB = b instanceof Fraction ? b : parseFraction(b);
  
  const steps = new StepBuilder(`${fracA.toString()} - ${fracB.toString()}`);
  
  steps.addStep(
    `Subtract fractions: ${fracA.toString()} - ${fracB.toString()}`,
    `${fracA.toLatex()} - ${fracB.toLatex()}`
  );
  
  const result = fracA.subtract(fracB);
  
  steps.addStep(`Result: ${result.toString()}`, result.toLatex());
  
  return steps.build(result.toString(), result.toLatex());
};

/**
 * Multiply two fractions with step-by-step explanation
 */
export const multiplyFractions = (a, b) => {
  const fracA = a instanceof Fraction ? a : parseFraction(a);
  const fracB = b instanceof Fraction ? b : parseFraction(b);
  
  const steps = new StepBuilder(`${fracA.toString()} × ${fracB.toString()}`);
  
  steps.addStep(
    `Multiply fractions`,
    `${fracA.toLatex()} \\times ${fracB.toLatex()}`
  );
  
  steps.addStep(
    `Multiply numerators and denominators`,
    `\\frac{${fracA.numerator} \\times ${fracB.numerator}}{${fracA.denominator} \\times ${fracB.denominator}}`
  );
  
  const unsimplified = new Fraction(
    fracA.numerator * fracB.numerator,
    fracA.denominator * fracB.denominator,
    false
  );
  
  steps.addStep(
    `Calculate`,
    `\\frac{${unsimplified.numerator}}{${unsimplified.denominator}}`
  );
  
  const result = fracA.multiply(fracB);
  
  if (unsimplified.numerator !== result.numerator || unsimplified.denominator !== result.denominator) {
    const divisor = gcd(Math.abs(unsimplified.numerator), unsimplified.denominator);
    steps.addStep(
      `Simplify: divide by gcd = ${divisor}`,
      `= ${result.toLatex()}`
    );
  }
  
  steps.addStep(`Result: ${result.toString()}`, result.toLatex());
  
  return steps.build(result.toString(), result.toLatex());
};

/**
 * Divide two fractions with step-by-step explanation
 */
export const divideFractions = (a, b) => {
  const fracA = a instanceof Fraction ? a : parseFraction(a);
  const fracB = b instanceof Fraction ? b : parseFraction(b);
  
  const steps = new StepBuilder(`${fracA.toString()} ÷ ${fracB.toString()}`);
  
  steps.addStep(
    `Divide fractions`,
    `${fracA.toLatex()} \\div ${fracB.toLatex()}`
  );
  
  steps.addStep(
    `Multiply by reciprocal`,
    `${fracA.toLatex()} \\times \\frac{${fracB.denominator}}{${fracB.numerator}}`
  );
  
  const result = fracA.divide(fracB);
  
  steps.addStep(`Result: ${result.toString()}`, result.toLatex());
  
  return steps.build(result.toString(), result.toLatex());
};

/**
 * Check if input is a math expression that can be solved
 * @param {string} input - User input
 * @returns {boolean}
 */
export const canSolve = (input) => {
  const type = detectExpressionType(input);
  return type !== 'unknown';
};

export default {
  solve,
  simplifyFraction,
  evaluateArithmetic,
  solveLinearEquation,
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
  canSolve,
  Fraction
};
