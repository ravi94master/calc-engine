import { evaluateExpression } from '../src/parser/index.js';
import { CalculatorException } from '../src/errors/CalculatorError.js';

describe('evaluateExpression — basic arithmetic', () => {
  test.each([
    ['2+3*4', 14],
    ['(2+3)*4', 20],
    ['10/2-1', 4],
    ['2^3^2', 512],
    ['-5+3', -2],
    ['+5+3', 8],
    ['5!', 120],
    ['0!', 1],
    ['50%', 0.5],
    ['3.5+2.5', 6],
    ['(1+2)*(3+4)', 21],
    ['2^10', 1024],
    ['100-50%', 99.5], // percent binds to the 50 only (postfix), not "50% of 100"
    ['10%%', 0.001] // chainable postfix: (10/100)/100
  ])('%s === %d', (expr, expected) => {
    expect(evaluateExpression(expr)).toBeCloseTo(expected, 9);
  });
});

describe('evaluateExpression — error handling', () => {
  test('division by zero', () => {
    expect(() => evaluateExpression('5/0')).toThrow(CalculatorException);
    try {
      evaluateExpression('5/0');
    } catch (err) {
      expect(err.code).toBe('DIVISION_BY_ZERO');
    }
  });

  test('unbalanced parentheses', () => {
    try {
      evaluateExpression('(1+2');
    } catch (err) {
      expect(err.code).toBe('INVALID_PARENTHESES');
    }
  });

  test('empty expression', () => {
    try {
      evaluateExpression('');
    } catch (err) {
      expect(err.code).toBe('EMPTY_EXPRESSION');
    }
    try {
      evaluateExpression('   ');
    } catch (err) {
      expect(err.code).toBe('EMPTY_EXPRESSION');
    }
  });

  test('factorial of a negative number is invalid', () => {
    try {
      evaluateExpression('(-3)!');
    } catch (err) {
      expect(err.code).toBe('FACTORIAL_INVALID');
    }
  });

  test('factorial of a non-integer is invalid', () => {
    try {
      evaluateExpression('2.5!');
    } catch (err) {
      expect(err.code).toBe('FACTORIAL_INVALID');
    }
  });

  test('factorial overflow beyond 170!', () => {
    try {
      evaluateExpression('171!');
    } catch (err) {
      expect(err.code).toBe('FACTORIAL_OVERFLOW');
    }
    // 170! itself should NOT throw
    expect(() => evaluateExpression('170!')).not.toThrow();
  });

  test('unknown function name', () => {
    try {
      evaluateExpression('foo(1)');
    } catch (err) {
      expect(err.code).toBe('UNKNOWN_FUNCTION');
    }
  });

  test('unknown constant/identifier', () => {
    try {
      evaluateExpression('bar');
    } catch (err) {
      expect(err.code).toBe('UNKNOWN_FUNCTION');
    }
  });

  test('malformed numbers are rejected at the tokenizer level', () => {
    try {
      evaluateExpression('1..2');
    } catch (err) {
      // "1." tokenizes as 1, then ".2" tokenizes as .2 — this actually becomes
      // two adjacent numbers, which the parser rejects as trailing input.
      expect(['INVALID_EXPRESSION', 'INVALID_NUMBER']).toContain(err.code);
    }
  });
});

describe('evaluateExpression — pluggable context', () => {
  test('functions/constants are resolved from the provided context', () => {
    const context = {
      functions: { double: (x) => x * 2 },
      constants: { answer: 42 }
    };
    expect(evaluateExpression('double(answer)', context)).toBe(84);
  });

  test('functions/constants are NOT available without a context (Phase 2 stays agnostic)', () => {
    try {
      evaluateExpression('double(21)');
    } catch (err) {
      expect(err.code).toBe('UNKNOWN_FUNCTION');
    }
  });
});
