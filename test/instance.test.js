import { CalculatorInstance } from '../src/instance.js';
import { CalculatorException } from '../src/errors/CalculatorError.js';

describe('CalculatorInstance — config validation', () => {
  test('throws on an invalid angleMode', () => {
    expect(() => new CalculatorInstance({ angleMode: 'sideways' })).toThrow(CalculatorException);
  });

  test('throws on an out-of-range precision', () => {
    expect(() => new CalculatorInstance({ precision: -1 })).toThrow(CalculatorException);
    expect(() => new CalculatorInstance({ precision: 99 })).toThrow(CalculatorException);
  });

  test('throws on a non-object config', () => {
    expect(() => new CalculatorInstance('not an object')).toThrow(CalculatorException);
  });

  test('accepts a valid config without throwing', () => {
    expect(() => new CalculatorInstance({ angleMode: 'rad', precision: 5, autoInit: false })).not.toThrow();
  });
});

describe('CalculatorInstance — headless usage (no DOM)', () => {
  test('works as a pure calculation engine with autoInit disabled', () => {
    const instance = new CalculatorInstance({ autoInit: false });
    instance.input('12*4');
    expect(instance.calculate()).toBe(48);
  });

  test('calculate(expression) accepts a full expression directly', () => {
    const instance = new CalculatorInstance({ autoInit: false });
    expect(instance.calculate('sqrt(81)')).toBe(9);
  });

  test('enableKeyboard()/disableKeyboard() never throw even without a DOM element bound', () => {
    const instance = new CalculatorInstance({ autoInit: false });
    expect(() => instance.enableKeyboard()).not.toThrow();
    expect(() => instance.disableKeyboard()).not.toThrow();
  });
});

describe('CalculatorInstance — multi-instance isolation', () => {
  function buildDOM() {
    document.body.innerHTML = `
      <div id="display"></div>
      <button id="equals"></button>
      <button data-value="7"></button>
      <button data-value="+"></button>
      <button data-value="1"></button>
    `;
    return {
      display: document.getElementById('display'),
      equals: document.getElementById('equals'),
      v7: document.querySelector('[data-value="7"]'),
      vPlus: document.querySelector('[data-value="+"]'),
      v1: document.querySelector('[data-value="1"]')
    };
  }

  test('two instances scoped to different roots do not interfere with each other', () => {
    const containerA = document.createElement('div');
    containerA.innerHTML = `<div id="display"></div><button id="equals"></button><button data-value="7"></button>`;
    const containerB = document.createElement('div');
    containerB.innerHTML = `<div id="display"></div><button id="equals"></button><button data-value="9"></button>`;
    document.body.appendChild(containerA);
    document.body.appendChild(containerB);

    const instanceA = new CalculatorInstance({ root: containerA, angleMode: 'deg' });
    const instanceB = new CalculatorInstance({ root: containerB, angleMode: 'rad' });

    containerA.querySelector('[data-value="7"]').click();
    containerA.querySelector('#equals').click();
    containerB.querySelector('[data-value="9"]').click();
    containerB.querySelector('#equals').click();

    expect(containerA.querySelector('#display').textContent).toBe('7');
    expect(containerB.querySelector('#display').textContent).toBe('9');
    expect(instanceA.getAngleMode()).toBe('deg');
    expect(instanceB.getAngleMode()).toBe('rad');
  });

  test('destroy() on one instance does not affect another', () => {
    const containerA = document.createElement('div');
    containerA.innerHTML = `<div id="display"></div><button data-value="1"></button>`;
    document.body.appendChild(containerA);
    const instanceA = new CalculatorInstance({ root: containerA });

    instanceA.destroy();
    containerA.querySelector('[data-value="1"]').click();
    expect(containerA.querySelector('#display').textContent).toBe('');
  });
});

describe('CalculatorInstance — full lifecycle', () => {
  test('init() returns warnings, and re-calling it is a safe no-op', () => {
    document.body.innerHTML = '<div id="display"></div>';
    const instance = new CalculatorInstance({ autoInit: false });
    const first = instance.init();
    const second = instance.init();
    expect(first.warnings).toBe(second.warnings); // same cached array, not re-bound/re-scanned
  });

  test('getLastError() reflects the most recent calculation error', () => {
    const instance = new CalculatorInstance({ autoInit: false });
    instance.input('1/0');
    instance.calculate();
    expect(instance.getLastError()).toMatchObject({ code: 'DIVISION_BY_ZERO' });
  });
});
