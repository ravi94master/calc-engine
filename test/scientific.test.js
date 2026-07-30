import { CalculatorEngine } from '../src/core/engine.js';

function calc(expr, options) {
  const engine = new CalculatorEngine(options);
  engine.input(expr);
  return engine.calculate();
}

describe('scientific — trigonometry (degree mode is the default)', () => {
  test.each([
    ['sin(30)', 0.5],
    ['sin(90)', 1],
    ['cos(60)', 0.5],
    ['cos(0)', 1],
    ['tan(45)', 1]
  ])('%s ≈ %f in degree mode', (expr, expected) => {
    expect(calc(expr)).toBeCloseTo(expected, 9);
  });

  test('tan() throws a clear error at its asymptote instead of returning a huge float', () => {
    const result = calc('tan(90)');
    expect(result).toMatchObject({ code: 'INVALID_EXPRESSION' });
  });

  test('radian mode can be set via the constructor', () => {
    const result = calc(`sin(${Math.PI / 2})`, { angleMode: 'rad' });
    expect(result).toBeCloseTo(1, 9);
  });

  test('setAngleMode() switches mode at runtime and takes effect immediately', () => {
    const engine = new CalculatorEngine(); // deg by default
    engine.input('sin(90)');
    expect(engine.calculate()).toBeCloseTo(1, 9);

    engine.setAngleMode('rad');
    expect(engine.getAngleMode()).toBe('rad');
    engine.clear();
    engine.input(`sin(${Math.PI / 2})`);
    expect(engine.calculate()).toBeCloseTo(1, 9);
  });
});

describe('scientific — roots, logs, constants', () => {
  test.each([
    ['sqrt(16)', 4],
    ['sqrt(2)', Math.SQRT2],
    ['log(100)', 2],
    ['log(1)', 0],
    ['ln(1)', 0],
    ['pi', Math.PI],
    ['e', Math.E],
    ['2*pi', 2 * Math.PI]
  ])('%s ≈ %f', (expr, expected) => {
    expect(calc(expr)).toBeCloseTo(expected, 9);
  });

  test('ln(e) === 1', () => {
    expect(calc('ln(e)')).toBeCloseTo(1, 9);
  });

  test('sqrt of a negative number is a domain error', () => {
    expect(calc('sqrt(-4)')).toMatchObject({ code: 'INVALID_SQRT' });
  });

  test('log of zero or a negative number is a domain error', () => {
    expect(calc('log(0)')).toMatchObject({ code: 'INVALID_LOG' });
    expect(calc('log(-5)')).toMatchObject({ code: 'INVALID_LOG' });
    expect(calc('ln(-1)')).toMatchObject({ code: 'INVALID_LOG' });
  });
});

describe('scientific — x², xʸ, n! reuse existing operators (no separate grammar)', () => {
  test('x² is expressed as x^2', () => {
    expect(calc('5^2')).toBe(25);
  });

  test('xʸ is expressed as x^y', () => {
    expect(calc('2^10')).toBe(1024);
  });

  test('n! is the postfix factorial operator', () => {
    expect(calc('6!')).toBe(720);
  });

  test('functions compose with power/factorial naturally', () => {
    expect(calc('sqrt(2)^2')).toBeCloseTo(2, 9);
  });
});
