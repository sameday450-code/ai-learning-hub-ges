/**
 * Math Engine Unit Tests
 * Run with: node --experimental-vm-modules server/src/math/test.js
 */

import { 
  Fraction, 
  frac, 
  gcd, 
  lcm,
  solve, 
  simplifyFraction, 
  addFractions,
  solveLinearEquation,
  parseFraction,
  detectExpressionType
} from './index.js';

// Test helper
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    return false;
  }
  console.log(`✅ PASS: ${message}`);
  return true;
};

console.log('\n=== FRACTION CLASS TESTS ===\n');

// Test GCD
assert(gcd(6, 8) === 2, 'gcd(6, 8) = 2');
assert(gcd(12, 15) === 3, 'gcd(12, 15) = 3');
assert(gcd(7, 11) === 1, 'gcd(7, 11) = 1 (coprime)');

// Test LCM
assert(lcm(4, 6) === 12, 'lcm(4, 6) = 12');
assert(lcm(3, 5) === 15, 'lcm(3, 5) = 15');

// Test Fraction creation and simplification
const f1 = new Fraction(2, 2);
assert(f1.numerator === 1 && f1.denominator === 1, '2/2 simplifies to 1/1');

const f2 = new Fraction(6, 8);
assert(f2.numerator === 3 && f2.denominator === 4, '6/8 simplifies to 3/4');

const f3 = new Fraction(15, 25);
assert(f3.numerator === 3 && f3.denominator === 5, '15/25 simplifies to 3/5');

// Test Fraction arithmetic - NO DECIMALS
console.log('\n=== FRACTION ARITHMETIC TESTS ===\n');

const oneThird = frac(1, 3);
const anotherThird = frac(1, 3);
const sum = oneThird.add(anotherThird);
assert(sum.numerator === 2 && sum.denominator === 3, '1/3 + 1/3 = 2/3 (not 0.666...)');

const half = frac(1, 2);
const quarter = frac(1, 4);
const sumHQ = half.add(quarter);
assert(sumHQ.numerator === 3 && sumHQ.denominator === 4, '1/2 + 1/4 = 3/4');

const twoThirds = frac(2, 3);
const product = half.multiply(twoThirds);
assert(product.numerator === 1 && product.denominator === 3, '1/2 × 2/3 = 1/3');

const quotient = half.divide(quarter);
assert(quotient.numerator === 2 && quotient.denominator === 1, '1/2 ÷ 1/4 = 2');

// Test subtraction
const diff = twoThirds.subtract(oneThird);
assert(diff.numerator === 1 && diff.denominator === 3, '2/3 - 1/3 = 1/3');

// Test LaTeX output
console.log('\n=== LATEX OUTPUT TESTS ===\n');
const fracForLatex = frac(3, 4);
assert(fracForLatex.toLatex() === '\\frac{3}{4}', '3/4 toLatex = \\frac{3}{4}');

const intFrac = frac(5, 1);
assert(intFrac.toLatex() === '5', '5/1 toLatex = 5');

console.log('\n=== PARSER TESTS ===\n');

// Test fraction parsing
const parsed1 = parseFraction('2/3');
assert(parsed1.numerator === 2 && parsed1.denominator === 3, 'Parse "2/3"');

const parsed2 = parseFraction('2 over 3');
assert(parsed2.numerator === 2 && parsed2.denominator === 3, 'Parse "2 over 3"');

const parsed3 = parseFraction('3 bar 4');
assert(parsed3.numerator === 3 && parsed3.denominator === 4, 'Parse "3 bar 4"');

// Test expression type detection
assert(detectExpressionType('2/3 + 1/4') === 'arithmetic', 'Detect arithmetic');
assert(detectExpressionType('2x + 1 = 5') === 'algebraic_equation', 'Detect algebraic equation');
assert(detectExpressionType('3/4') === 'fraction', 'Detect fraction');

console.log('\n=== SOLVER TESTS ===\n');

// Test fraction simplification
const simplifyResult = simplifyFraction('6/8');
assert(simplifyResult.result.value === '3/4', 'Simplify 6/8 = 3/4');
console.log('Steps for 6/8:', simplifyResult.steps.map(s => s.description));

// Test 2/2
const simplify22 = simplifyFraction('2/2');
assert(simplify22.result.value === '1', 'Simplify 2/2 = 1');
console.log('Steps for 2/2:', simplify22.steps.map(s => s.description));

// Test fraction addition
const addResult = addFractions('1/3', '1/3');
assert(addResult.result.value === '2/3', '1/3 + 1/3 = 2/3');
console.log('Steps for 1/3 + 1/3:', addResult.steps.map(s => s.description));

// Test linear equation solving
const eqResult = solveLinearEquation('2x + 1 = 5');
assert(eqResult.result.value === 'x = 2', 'Solve 2x + 1 = 5 => x = 2');
console.log('Steps for 2x + 1 = 5:', eqResult.steps.map(s => s.description));

// Test solve function auto-detection
console.log('\n=== AUTO-DETECT SOLVE TESTS ===\n');

const autoFrac = solve('4/8');
assert(autoFrac.result.value === '1/2', 'Auto solve 4/8 = 1/2');

const autoArith = solve('1/2 + 1/4');
console.log('Result of 1/2 + 1/4:', autoArith.result.value);
assert(autoArith.result.value === '3/4', 'Auto solve 1/2 + 1/4 = 3/4');

const autoEq = solve('3x - 6 = 0');
console.log('Result of 3x - 6 = 0:', autoEq.result.value);
assert(autoEq.result.value === 'x = 2', 'Auto solve 3x - 6 = 0 => x = 2');

console.log('\n=== ALL TESTS COMPLETE ===\n');
