import { CalculatorEngine } from '../src/core/engine.js';

function calc(expr) {
  const engine = new CalculatorEngine();
  engine.input(expr);
  return engine.calculate();
}

describe('edge cases — Infinity and NaN', () => {
  test('a result that overflows to Infinity is reported as RESULT_INFINITY, not silently returned', () => {
    expect(calc('10^400')).toMatchObject({ code: 'RESULT_INFINITY' });
  });

  test('an operation that produces NaN is reported as RESULT_NAN', () => {
    // Math.pow(-1, 0.5) is NaN in JS (no real square root of a negative base)
    expect(calc('(-1)^0.5')).toMatchObject({ code: 'RESULT_NAN' });
  });
});

describe('edge cases — empty / whitespace input', () => {
  test('calculating with nothing typed yet returns EMPTY_EXPRESSION', () => {
    const engine = new CalculatorEngine();
    expect(engine.calculate()).toMatchObject({ code: 'EMPTY_EXPRESSION' });
  });

  test('an expression of only whitespace is also EMPTY_EXPRESSION', () => {
    expect(calc('   ')).toMatchObject({ code: 'EMPTY_EXPRESSION' });
  });
});

describe('edge cases — deep nesting and long chains', () => {
  test('deeply nested parentheses evaluate correctly', () => {
    expect(calc('((((1+1)*2)+2)*2)')).toBe(12);
  });

  test('a long chain of continuous calculations compounds correctly', () => {
    const engine = new CalculatorEngine();
    engine.input('1+1');
    engine.calculate(); // 2
    for (let i = 0; i < 5; i++) {
      engine.input('+'); // separate calls, matching real per-button-click granularity
      engine.input('1');
      engine.calculate();
    }
    expect(engine.getResult()).toBe(7);
  });

  test('mixed function + operator nesting evaluates in the correct order', () => {
    expect(calc('sqrt(sqrt(16))')).toBe(2);
    expect(calc('sin(cos(0)*90)')).toBeCloseTo(1, 9); // sin(1*90) = sin(90) = 1
  });
});

describe('edge cases — floating point precision', () => {
  test('0.1 + 0.2 does not show floating-point artifacts', () => {
    expect(calc('0.1+0.2')).toBe(0.3);
  });

  test('precision option controls how aggressively results are rounded', () => {
    const highPrecision = new CalculatorEngine({ precision: 15 });
    highPrecision.input('1/3');
    const lowPrecision = new CalculatorEngine({ precision: 2 });
    lowPrecision.input('1/3');
    expect(highPrecision.calculate()).not.toBe(lowPrecision.calculate());
    expect(lowPrecision.calculate()).toBe(0.33);
  });
});

describe('edge cases — repeated clear/backspace on empty state', () => {
  test('backspace on an already-empty expression does not throw', () => {
    const engine = new CalculatorEngine();
    expect(() => engine.backspace()).not.toThrow();
    expect(engine.getExpression()).toBe('');
  });

  test('clearEntry on an already-empty expression does not throw', () => {
    const engine = new CalculatorEngine();
    expect(() => engine.clearEntry()).not.toThrow();
  });

  test('toggleSign on an empty expression does not throw and leaves it empty', () => {
    const engine = new CalculatorEngine();
    expect(() => engine.toggleSign()).not.toThrow();
    expect(engine.getExpression()).toBe('');
  });
});
