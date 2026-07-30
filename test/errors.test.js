import { CalculatorEngine } from '../src/core/engine.js';
import { normalizeConfig } from '../src/utils/config.js';
import { CalculatorException, createError, isCalculatorError } from '../src/errors/CalculatorError.js';

function calc(expr) {
  const engine = new CalculatorEngine();
  engine.input(expr);
  return engine.calculate();
}

describe('required error scenarios all return typed, developer-friendly errors', () => {
  test('division by zero', () => {
    expect(calc('5/0')).toMatchObject({ code: 'DIVISION_BY_ZERO' });
  });

  test('invalid expression (trailing garbage)', () => {
    expect(calc('2 3')).toMatchObject({ code: 'INVALID_EXPRESSION' });
  });

  test('invalid parentheses (unbalanced, both directions)', () => {
    expect(calc('(1+2')).toMatchObject({ code: 'INVALID_PARENTHESES' });
    expect(calc('1+2)')).toMatchObject({ code: 'INVALID_PARENTHESES' });
  });

  test('invalid logarithm (non-positive input)', () => {
    expect(calc('log(0)')).toMatchObject({ code: 'INVALID_LOG' });
    expect(calc('ln(-5)')).toMatchObject({ code: 'INVALID_LOG' });
  });

  test('invalid square root (negative input)', () => {
    expect(calc('sqrt(-9)')).toMatchObject({ code: 'INVALID_SQRT' });
  });

  test('factorial overflow', () => {
    expect(calc('500!')).toMatchObject({ code: 'FACTORIAL_OVERFLOW' });
  });

  test('every CalculatorError has a human-readable, non-empty message', () => {
    const codes = ['5/0', '(1+2', 'log(0)', 'sqrt(-9)', '500!', '2 3'];
    for (const expr of codes) {
      const err = calc(expr);
      expect(typeof err.message).toBe('string');
      expect(err.message.length).toBeGreaterThan(0);
    }
  });
});

describe('missing HTML elements', () => {
  test('DOMBinder.init() never throws, and reports missing elements as warnings', async () => {
    const { DOMBinder } = await import('../src/dom/binder.js');
    document.body.innerHTML = ''; // nothing present
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    expect(() => binder.init()).not.toThrow();
    const { warnings } = binder.init();
    expect(warnings.some((w) => w.code === 'MISSING_ELEMENT')).toBe(true);
  });
});

describe('invalid configuration', () => {
  test('normalizeConfig throws CalculatorException with INVALID_CONFIG on bad values', () => {
    expect(() => normalizeConfig({ angleMode: 'nope' })).toThrow(CalculatorException);
    expect(() => normalizeConfig({ precision: -5 })).toThrow(CalculatorException);
    expect(() => normalizeConfig({ keyboardEnabled: 'yes' })).toThrow(CalculatorException);
    expect(() => normalizeConfig({ root: 'not-a-dom-node' })).toThrow(CalculatorException);
    expect(() => normalizeConfig(null)).toThrow(CalculatorException);
  });

  test('a valid config passes through with defaults filled in', () => {
    const config = normalizeConfig({ precision: 4 });
    expect(config).toMatchObject({ precision: 4, angleMode: 'deg', keyboardEnabled: true, autoInit: true });
  });
});

describe('CalculatorError / CalculatorException utilities', () => {
  test('createError() produces a plain, serializable object', () => {
    const err = createError('DIVISION_BY_ZERO');
    expect(isCalculatorError(err)).toBe(true);
    expect(JSON.parse(JSON.stringify(err))).toMatchObject({ code: 'DIVISION_BY_ZERO' });
  });

  test('CalculatorException carries the same code and is a real Error', () => {
    const ex = new CalculatorException('INVALID_SQRT');
    expect(ex).toBeInstanceOf(Error);
    expect(ex.code).toBe('INVALID_SQRT');
  });
});
