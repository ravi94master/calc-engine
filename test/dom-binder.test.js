import { CalculatorEngine } from '../src/core/engine.js';
import { DOMBinder } from '../src/dom/binder.js';

/** Builds a minimal calculator UI in jsdom and returns handles to its pieces. */
function buildCalculatorDOM() {
  document.body.innerHTML = `
    <div id="display"></div>
    <button id="equals"></button>
    <button id="clear"></button>
    <button id="backspace"></button>
    <button data-value="7"></button>
    <button data-value="+"></button>
    <button data-value="3"></button>
    <button data-function="sin"></button>
    <button data-function="square"></button>
    <button data-action="clear-entry"></button>
  `;
  return {
    display: document.getElementById('display'),
    equals: document.getElementById('equals'),
    clear: document.getElementById('clear'),
    backspace: document.getElementById('backspace'),
    value7: document.querySelector('[data-value="7"]'),
    valuePlus: document.querySelector('[data-value="+"]'),
    value3: document.querySelector('[data-value="3"]'),
    sinBtn: document.querySelector('[data-function="sin"]'),
    squareBtn: document.querySelector('[data-function="square"]'),
    ceBtn: document.querySelector('[data-action="clear-entry"]')
  };
}

describe('DOMBinder', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('wires up value buttons and updates the display on every click', () => {
    const { display, value7, valuePlus, value3, equals } = buildCalculatorDOM();
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    value7.click();
    valuePlus.click();
    value3.click();
    expect(display.textContent).toBe('7+3');

    equals.click();
    expect(display.textContent).toBe('10');
  });

  test('data-function="sin" inserts a function call', () => {
    const { sinBtn, value7 } = buildCalculatorDOM();
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    sinBtn.click();
    value7.click();
    expect(engine.getExpression()).toBe('sin(7');
  });

  test('data-function="square" appends the ^2 operator', () => {
    const { value7, squareBtn } = buildCalculatorDOM();
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    value7.click();
    squareBtn.click();
    expect(engine.getExpression()).toBe('7^2');
  });

  test('id="clear" and id="backspace" work', () => {
    const { display, value7, valuePlus, value3, clear, backspace } = buildCalculatorDOM();
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    value7.click();
    valuePlus.click();
    value3.click();
    backspace.click();
    expect(display.textContent).toBe('7+');

    clear.click();
    expect(display.textContent).toBe('0');
  });

  test('data-action="clear-entry" clears only the trailing number', () => {
    const { value7, valuePlus, value3, ceBtn, display } = buildCalculatorDOM();
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    value7.click();
    valuePlus.click();
    value3.click();
    ceBtn.click();
    expect(display.textContent).toBe('7+');
  });

  test('shows the error message on display when calculate() fails', () => {
    document.body.innerHTML = `<div id="display"></div><button id="equals"></button><button data-value="/"></button>`;
    const display = document.getElementById('display');
    const equals = document.getElementById('equals');
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    engine.input('5/0');
    equals.click();
    expect(display.textContent).toMatch(/divide/i);
  });

  test('init() returns warnings for missing elements instead of throwing', () => {
    document.body.innerHTML = ''; // nothing exists
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    const { warnings } = binder.init();

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.every((w) => w.code === 'MISSING_ELEMENT')).toBe(true);
  });

  test('destroy() removes all listeners so further clicks do nothing', () => {
    const { display, value7 } = buildCalculatorDOM();
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    binder.destroy();
    value7.click();
    expect(display.textContent).toBe(''); // never updated after destroy
  });

  test('an id and a matching data-action on the same element only fire once', () => {
    document.body.innerHTML = `
      <div id="display"></div>
      <button id="equals" data-action="equals"></button>
      <button data-value="4"></button>
    `;
    const display = document.getElementById('display');
    const equals = document.getElementById('equals');
    const value4 = document.querySelector('[data-value="4"]');
    const engine = new CalculatorEngine();
    const binder = new DOMBinder(engine, { root: document });
    binder.init();

    value4.click();
    value4.click(); // "44"
    equals.click();
    expect(display.textContent).toBe('44'); // not double-evaluated / no errors
  });
});
