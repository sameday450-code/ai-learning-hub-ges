/**
 * Fraction Class - Symbolic Math Engine
 * Maintains exact fraction arithmetic without floating point conversion
 * 
 * @author AI Learning Hub
 * @version 1.0.0
 */

/**
 * Calculate Greatest Common Divisor using Euclidean algorithm
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} GCD of a and b
 */
export const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

/**
 * Calculate Least Common Multiple
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} LCM of a and b
 */
export const lcm = (a, b) => {
  return Math.abs(a * b) / gcd(a, b);
};

/**
 * Fraction Class
 * Represents a fraction with numerator and denominator
 * Automatically simplifies to lowest terms
 */
export class Fraction {
  /**
   * Create a Fraction
   * @param {number} numerator - The numerator
   * @param {number} denominator - The denominator (cannot be 0)
   * @param {boolean} autoSimplify - Whether to auto-simplify (default: true)
   */
  constructor(numerator, denominator = 1, autoSimplify = true) {
    if (denominator === 0) {
      throw new Error('Division by zero: denominator cannot be 0');
    }

    // Ensure integers
    this.numerator = Math.round(numerator);
    this.denominator = Math.round(denominator);

    // Handle negative denominators - move sign to numerator
    if (this.denominator < 0) {
      this.numerator = -this.numerator;
      this.denominator = -this.denominator;
    }

    // Auto-simplify by default
    if (autoSimplify) {
      this._simplify();
    }
  }

  /**
   * Simplify the fraction to lowest terms
   * @private
   */
  _simplify() {
    const divisor = gcd(Math.abs(this.numerator), this.denominator);
    this.numerator = this.numerator / divisor;
    this.denominator = this.denominator / divisor;
  }

  /**
   * Get simplification steps for this fraction
   * @returns {object} Steps object with original, gcd, and simplified values
   */
  getSimplificationSteps() {
    const original = { numerator: this.numerator, denominator: this.denominator };
    const divisor = gcd(Math.abs(this.numerator), this.denominator);
    
    return {
      original,
      gcd: divisor,
      simplified: {
        numerator: this.numerator / divisor,
        denominator: this.denominator / divisor
      }
    };
  }

  /**
   * Create a Fraction from various input types
   * @param {number|string|Fraction|object} value - Input value
   * @returns {Fraction} New Fraction instance
   */
  static from(value) {
    if (value instanceof Fraction) {
      return new Fraction(value.numerator, value.denominator);
    }

    if (typeof value === 'number') {
      // Handle integers
      if (Number.isInteger(value)) {
        return new Fraction(value, 1);
      }
      // Handle decimals by converting to fraction
      const decimalStr = value.toString();
      const decimalPlaces = decimalStr.includes('.') 
        ? decimalStr.split('.')[1].length 
        : 0;
      const multiplier = Math.pow(10, decimalPlaces);
      return new Fraction(Math.round(value * multiplier), multiplier);
    }

    if (typeof value === 'object' && 'numerator' in value && 'denominator' in value) {
      return new Fraction(value.numerator, value.denominator);
    }

    throw new Error(`Cannot create Fraction from: ${value}`);
  }

  /**
   * Check if fraction equals zero
   * @returns {boolean}
   */
  isZero() {
    return this.numerator === 0;
  }

  /**
   * Check if fraction equals one
   * @returns {boolean}
   */
  isOne() {
    return this.numerator === this.denominator;
  }

  /**
   * Check if fraction is an integer
   * @returns {boolean}
   */
  isInteger() {
    return this.denominator === 1;
  }

  /**
   * Check if fraction is negative
   * @returns {boolean}
   */
  isNegative() {
    return this.numerator < 0;
  }

  /**
   * Check if fraction is positive
   * @returns {boolean}
   */
  isPositive() {
    return this.numerator > 0;
  }

  /**
   * Get the absolute value
   * @returns {Fraction}
   */
  abs() {
    return new Fraction(Math.abs(this.numerator), this.denominator);
  }

  /**
   * Negate the fraction
   * @returns {Fraction}
   */
  negate() {
    return new Fraction(-this.numerator, this.denominator);
  }

  /**
   * Get reciprocal (flip numerator and denominator)
   * @returns {Fraction}
   */
  reciprocal() {
    if (this.numerator === 0) {
      throw new Error('Cannot get reciprocal of zero');
    }
    return new Fraction(this.denominator, this.numerator);
  }

  /**
   * Add another fraction
   * @param {Fraction|number} other - Fraction to add
   * @returns {Fraction} Result
   */
  add(other) {
    const otherFrac = other instanceof Fraction ? other : Fraction.from(other);
    const commonDenom = lcm(this.denominator, otherFrac.denominator);
    const thisMultiplier = commonDenom / this.denominator;
    const otherMultiplier = commonDenom / otherFrac.denominator;
    
    return new Fraction(
      this.numerator * thisMultiplier + otherFrac.numerator * otherMultiplier,
      commonDenom
    );
  }

  /**
   * Subtract another fraction
   * @param {Fraction|number} other - Fraction to subtract
   * @returns {Fraction} Result
   */
  subtract(other) {
    const otherFrac = other instanceof Fraction ? other : Fraction.from(other);
    return this.add(otherFrac.negate());
  }

  /**
   * Multiply by another fraction
   * @param {Fraction|number} other - Fraction to multiply by
   * @returns {Fraction} Result
   */
  multiply(other) {
    const otherFrac = other instanceof Fraction ? other : Fraction.from(other);
    return new Fraction(
      this.numerator * otherFrac.numerator,
      this.denominator * otherFrac.denominator
    );
  }

  /**
   * Divide by another fraction
   * @param {Fraction|number} other - Fraction to divide by
   * @returns {Fraction} Result
   */
  divide(other) {
    const otherFrac = other instanceof Fraction ? other : Fraction.from(other);
    if (otherFrac.isZero()) {
      throw new Error('Division by zero');
    }
    return this.multiply(otherFrac.reciprocal());
  }

  /**
   * Raise to an integer power
   * @param {number} exponent - Integer exponent
   * @returns {Fraction} Result
   */
  pow(exponent) {
    if (!Number.isInteger(exponent)) {
      throw new Error('Exponent must be an integer');
    }
    
    if (exponent === 0) {
      return new Fraction(1, 1);
    }
    
    if (exponent < 0) {
      return this.reciprocal().pow(-exponent);
    }
    
    return new Fraction(
      Math.pow(this.numerator, exponent),
      Math.pow(this.denominator, exponent)
    );
  }

  /**
   * Check equality with another fraction
   * @param {Fraction|number} other - Fraction to compare
   * @returns {boolean}
   */
  equals(other) {
    const otherFrac = other instanceof Fraction ? other : Fraction.from(other);
    return this.numerator === otherFrac.numerator && 
           this.denominator === otherFrac.denominator;
  }

  /**
   * Compare with another fraction
   * @param {Fraction|number} other - Fraction to compare
   * @returns {number} -1 if less, 0 if equal, 1 if greater
   */
  compare(other) {
    const otherFrac = other instanceof Fraction ? other : Fraction.from(other);
    const diff = this.subtract(otherFrac);
    if (diff.isZero()) return 0;
    return diff.isPositive() ? 1 : -1;
  }

  /**
   * Convert to decimal (only when explicitly needed)
   * @returns {number}
   */
  toDecimal() {
    return this.numerator / this.denominator;
  }

  /**
   * Convert to string representation
   * @returns {string}
   */
  toString() {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * Convert to LaTeX representation for KaTeX/MathJax
   * @returns {string}
   */
  toLatex() {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    if (this.numerator < 0) {
      return `-\\frac{${Math.abs(this.numerator)}}{${this.denominator}}`;
    }
    return `\\frac{${this.numerator}}{${this.denominator}}`;
  }

  /**
   * Convert to mixed number string (e.g., 7/4 -> "1 3/4")
   * @returns {string}
   */
  toMixedNumber() {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    
    const absNum = Math.abs(this.numerator);
    const whole = Math.floor(absNum / this.denominator);
    const remainder = absNum % this.denominator;
    const sign = this.numerator < 0 ? '-' : '';
    
    if (whole === 0) {
      return `${sign}${remainder}/${this.denominator}`;
    }
    if (remainder === 0) {
      return `${sign}${whole}`;
    }
    return `${sign}${whole} ${remainder}/${this.denominator}`;
  }

  /**
   * Convert to mixed number LaTeX
   * @returns {string}
   */
  toMixedLatex() {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    
    const absNum = Math.abs(this.numerator);
    const whole = Math.floor(absNum / this.denominator);
    const remainder = absNum % this.denominator;
    const sign = this.numerator < 0 ? '-' : '';
    
    if (whole === 0) {
      return `${sign}\\frac{${remainder}}{${this.denominator}}`;
    }
    if (remainder === 0) {
      return `${sign}${whole}`;
    }
    return `${sign}${whole}\\frac{${remainder}}{${this.denominator}}`;
  }

  /**
   * Create JSON representation
   * @returns {object}
   */
  toJSON() {
    return {
      numerator: this.numerator,
      denominator: this.denominator,
      string: this.toString(),
      latex: this.toLatex()
    };
  }

  /**
   * Clone this fraction
   * @returns {Fraction}
   */
  clone() {
    return new Fraction(this.numerator, this.denominator);
  }
}

/**
 * Helper function to create a fraction
 * @param {number} num - Numerator
 * @param {number} denom - Denominator
 * @returns {Fraction}
 */
export const frac = (num, denom = 1) => new Fraction(num, denom);

export default Fraction;
