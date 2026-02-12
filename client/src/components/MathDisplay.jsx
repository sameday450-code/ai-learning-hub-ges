/**
 * Math Display Component
 * Renders mathematical expressions using KaTeX for professional display
 * 
 * @author AI Learning Hub
 * @version 1.0.0
 */

import { useEffect, useRef, memo } from 'react';
import katex from 'katex';

/**
 * Render LaTeX inline using KaTeX
 */
export const InlineMath = memo(({ latex, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: false,
          output: 'html'
        });
      } catch (error) {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex]);

  return <span ref={containerRef} className={`inline-math ${className}`} />;
});

InlineMath.displayName = 'InlineMath';

/**
 * Render LaTeX block using KaTeX (centered, larger)
 */
export const BlockMath = memo(({ latex, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: true,
          output: 'html'
        });
      } catch (error) {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex]);

  return (
    <div 
      ref={containerRef} 
      className={`block-math my-3 flex justify-center ${className}`} 
    />
  );
});

BlockMath.displayName = 'BlockMath';

/**
 * Fraction Display Component
 * Renders a fraction with vertical bar
 */
export const FractionDisplay = ({ numerator, denominator, className = '' }) => {
  const latex = denominator === 1 
    ? `${numerator}` 
    : `\\frac{${numerator}}{${denominator}}`;
  
  return <InlineMath latex={latex} className={className} />;
};

/**
 * Math Step Component
 * Displays a single step in a solution
 */
export const MathStep = ({ stepNumber, text, latex, isLast = false }) => {
  return (
    <div className={`math-step ${!isLast ? 'mb-4' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Step number badge */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
          {stepNumber}
        </div>
        
        {/* Step content */}
        <div className="flex-1">
          <p className="text-gray-700 text-sm mb-2">{text}</p>
          {latex && (
            <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
              <BlockMath latex={latex} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Math Solution Card
 * Displays complete solution with all steps
 */
export const MathSolutionCard = ({ mathData }) => {
  if (!mathData || !mathData.data) return null;

  const { question, steps, answer } = mathData.data;

  return (
    <div className="math-solution-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
        <span className="text-white font-medium text-sm">Step-by-Step Solution</span>
      </div>

      {/* Question */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Problem</div>
        <div className="text-gray-800 font-medium">
          {question.latex ? (
            <BlockMath latex={question.latex} />
          ) : (
            question.text
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 py-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Solution Steps</div>
        {steps.map((step, index) => (
          <MathStep
            key={index}
            stepNumber={step.number}
            text={step.text}
            latex={step.latex}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Answer */}
      <div className="px-4 py-4 bg-green-50 border-t border-green-100">
        <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Answer</div>
        <div className="text-green-800 font-semibold text-lg">
          {answer.latex ? (
            <BlockMath latex={answer.latex} />
          ) : (
            answer.text
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple Fraction Input Helper
 * Parses and displays fraction input
 */
export const FractionInput = ({ value, onChange, placeholder = "e.g., 2/3" }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  // Parse the current value to show preview
  const parseFraction = (str) => {
    const match = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (match) {
      return { numerator: parseInt(match[1]), denominator: parseInt(match[2]) };
    }
    return null;
  };

  const fraction = parseFraction(value);

  return (
    <div className="fraction-input flex items-center gap-3">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {fraction && (
        <div className="preview bg-gray-50 px-3 py-2 rounded-lg">
          <FractionDisplay 
            numerator={fraction.numerator} 
            denominator={fraction.denominator} 
          />
        </div>
      )}
    </div>
  );
};

/**
 * Math Expression Preview
 * Shows live preview of math expressions as user types
 */
export const MathPreview = ({ expression, className = '' }) => {
  if (!expression) return null;

  // Convert common patterns to LaTeX
  const toLatex = (expr) => {
    let latex = expr;
    
    // Replace fractions
    latex = latex.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
    
    // Replace multiplication
    latex = latex.replace(/\*/g, '\\times ');
    
    // Replace variables with italics (already default in KaTeX)
    
    return latex;
  };

  return (
    <div className={`math-preview p-3 bg-gray-50 rounded-lg ${className}`}>
      <BlockMath latex={toLatex(expression)} />
    </div>
  );
};

/**
 * Export all components
 */
export default {
  InlineMath,
  BlockMath,
  FractionDisplay,
  MathStep,
  MathSolutionCard,
  FractionInput,
  MathPreview
};
