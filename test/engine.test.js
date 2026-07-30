import { CalculatorEngine } from '../src/core/engine.js';

describe('CalculatorEngine — basic calculator behavior', () => {
  test('builds an expression via input() and evaluates it', () => {
    const engine = new CalculatorEngine();
    engine.input('1');
    engine.input('2');
    engine.input('+');
    engine.input('8');
    expect(engine.getExpression()).toBe('12+8');
    expect(engine.calculate()).toBe(20);
  });

  test('decimal input works', () => {
    const engine = new CalculatorEngine();
    engine.input('3');
    engine.input('.');
    engine.input('5');
    engine.input('+');
    engine.input('1');
    engine.input('.');
    engine.input('5');
    expect(engine.calculate()).toBe(5);
  });

  test('backspace removes the last character', () => {
    const engine = new CalculatorEngine();
    engine.input('12');
    engine.input('3');
    engine.backspace();
    expect(engine.getExpression()).toBe('12');
  });

  test('backspace right after a result clears the display instead of editing stale text', () => {
    const engine = new CalculatorEngine();
    engine.input('5+5');
    engine.calculate();
    engine.backspace();
    expect(engine.getExpression()).toBe('');
    expect(engine.getResult()).toBe(0);
  });

  test('clear() fully resets state', () => {
    const engine = new CalculatorEngine();
    engine.input('99+1');
    engine.calculate();
    engine.clear();
    expect(engine.getExpression()).toBe('');
    expect(engine.getResult()).toBe(0);
    expect(engine.lastError).toBeNull();
  });

  test('clearEntry() removes only the trailing number, keeping the pending expression', () => {
    const engine = new CalculatorEngine();
    engine.input('12+35');
    engine.clearEntry();
    expect(engine.getExpression()).toBe('12+');
  });

  test('clearEntry() with nothing trailing falls back to clearing everything typed so far', () => {
    const engine = new CalculatorEngine();
    engine.input('12+');
    engine.clearEntry();
    expect(engine.getExpression()).toBe('');
  });

  test('continuous calculation: typing an operator after "=" chains from the result', () => {
    const engine = new CalculatorEngine();
    engine.input('12+3');
    expect(engine.calculate()).toBe(15);
    engine.input('+');
    engine.input('5');
    expect(engine.getExpression()).toBe('15+5');
    expect(engine.calculate()).toBe(20);
  });

  test('continuous calculation: typing a digit after "=" starts a fresh expression', () => {
    const engine = new CalculatorEngine();
    engine.input('2+2');
    engine.calculate();
    engine.input('9');
    expect(engine.getExpression()).toBe('9');
  });

  test('toggleSign() negates the number currently being typed', () => {
    const engine = new CalculatorEngine();
    engine.input('45');
    engine.toggleSign();
    expect(engine.getExpression()).toBe('-45');
    engine.toggleSign();
    expect(engine.getExpression()).toBe('45');
  });

  test('toggleSign() only affects the trailing number in a longer expression', () => {
    const engine = new CalculatorEngine();
    engine.input('10+5');
    engine.toggleSign();
    expect(engine.getExpression()).toBe('10+-5');
  });

  test('toggleSign() right after a fresh result negates the result itself', () => {
    const engine = new CalculatorEngine();
    engine.input('4+4');
    engine.calculate();
    engine.toggleSign();
    expect(engine.getExpression()).toBe('-8');
  });

  test('getDisplayValue() shows "0" for an empty expression', () => {
    const engine = new CalculatorEngine();
    expect(engine.getDisplayValue()).toBe('0');
  });
});

describe('CalculatorEngine — error handling returns typed errors, never throws', () => {
  test('calculate() returns a CalculatorError object on failure instead of throwing', () => {
    const engine = new CalculatorEngine();
    engine.input('5/0');
    const result = engine.calculate();
    expect(result).toMatchObject({ code: 'DIVISION_BY_ZERO' });
    expect(engine.lastError).toMatchObject({ code: 'DIVISION_BY_ZERO' });
  });

  test('a subsequent successful calculation clears lastError', () => {
    const engine = new CalculatorEngine();
    engine.input('5/0');
    engine.calculate();
    engine.clear();
    engine.input('2+2');
    expect(engine.calculate()).toBe(4);
    expect(engine.lastError).toBeNull();
  });
});

describe('CalculatorEngine — extensibility', () => {
  test('registerFunction() adds a callable function usable in expressions', () => {
    const engine = new CalculatorEngine();
    engine.registerFunction('double', (x) => x * 2);
    engine.input('double(21)');
    expect(engine.calculate()).toBe(42);
  });

  test('registerConstant() adds a resolvable identifier', () => {
    const engine = new CalculatorEngine();
    engine.registerConstant('answer', 42);
    engine.input('answer');
    expect(engine.calculate()).toBe(42);
  });
});
