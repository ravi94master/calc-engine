import Calculator, { CalculatorInstance, evaluateExpression } from '../src/index.js';

describe('Calculator — package exports', () => {
  test('exposes the expected named exports and static members', () => {
    expect(typeof Calculator.version).toBe('string');
    expect(typeof Calculator.CalculatorEngine).toBe('function');
    expect(typeof Calculator.CalculatorInstance).toBe('function');
    expect(typeof Calculator.evaluateExpression).toBe('function');
    expect(typeof Calculator.create).toBe('function');
    expect(evaluateExpression('2+2')).toBe(4);
    expect(CalculatorInstance).toBe(Calculator.CalculatorInstance);
  });
});

describe('Calculator — singleton convenience API', () => {
  afterEach(() => {
    Calculator.destroy();
  });

  test('works headless — calculate() without ever calling init()', () => {
    expect(Calculator.calculate('12*4')).toBe(48);
    expect(Calculator.getResult()).toBe(48);
  });

  test('clear/backspace/input/toggleSign all delegate correctly', () => {
    Calculator.input('45');
    Calculator.toggleSign();
    expect(Calculator.getExpression()).toBe('-45');
    Calculator.backspace();
    expect(Calculator.getExpression()).toBe('-4');
    Calculator.clear();
    expect(Calculator.getExpression()).toBe('');
  });

  test('setAngleMode/getAngleMode delegate correctly', () => {
    Calculator.setAngleMode('rad');
    expect(Calculator.getAngleMode()).toBe('rad');
  });

  test('registerFunction/registerConstant delegate correctly', () => {
    Calculator.registerFunction('triple', (x) => x * 3);
    Calculator.registerConstant('twelve', 12);
    Calculator.input('triple(twelve)');
    expect(Calculator.calculate()).toBe(36);
  });

  test('init() with a real DOM wires up the singleton to it', () => {
    document.body.innerHTML = `
      <div id="display"></div>
      <button id="equals"></button>
      <button data-value="6"></button>
    `;
    const { warnings } = Calculator.init({ root: document });
    expect(warnings).toEqual([]);
    document.querySelector('[data-value="6"]').click();
    expect(document.getElementById('display').textContent).toBe('6');
  });

  test('destroy() tears down the singleton so a later call re-creates it fresh', () => {
    Calculator.input('99');
    Calculator.destroy();
    expect(Calculator.getExpression()).toBe(''); // brand-new instance underneath
  });
});

describe('Calculator.create() — independent instances', () => {
  test('returns a real CalculatorInstance, independent of the singleton', () => {
    const instance = Calculator.create({ autoInit: false });
    expect(instance).toBeInstanceOf(CalculatorInstance);

    instance.input('7');
    Calculator.input('3'); // singleton's own state
    expect(instance.getExpression()).toBe('7');
    expect(Calculator.getExpression()).toBe('3');
    Calculator.destroy();
  });
});
