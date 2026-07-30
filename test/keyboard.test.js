import { CalculatorEngine } from '../src/core/engine.js';
import { createKeyboardHandler } from '../src/keyboard/keyboardHandler.js';

function press(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('keyboard handler', () => {
  test('does nothing before enable() is called', () => {
    const engine = new CalculatorEngine();
    createKeyboardHandler(engine, { target: document });
    press('5');
    expect(engine.getExpression()).toBe('');
  });

  test('digits, operators, and decimal point pass through to input()', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();

    ['7', '.', '5', '+', '2'].forEach(press);
    expect(engine.getExpression()).toBe('7.5+2');
  });

  test('Enter triggers calculate()', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();

    ['1', '0', '+', '5'].forEach(press);
    press('Enter');
    expect(engine.getResult()).toBe(15);
  });

  test('Escape triggers clear()', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();

    ['9', '9'].forEach(press);
    press('Escape');
    expect(engine.getExpression()).toBe('');
  });

  test('Delete triggers clearEntry()', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();

    ['1', '2', '+', '3', '4'].forEach(press);
    press('Delete');
    expect(engine.getExpression()).toBe('12+');
  });

  test('Backspace triggers backspace()', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();

    ['1', '2', '3'].forEach(press);
    press('Backspace');
    expect(engine.getExpression()).toBe('12');
  });

  test('calls onUpdate after every recognized keypress', () => {
    const engine = new CalculatorEngine();
    const onUpdate = jest.fn();
    const kb = createKeyboardHandler(engine, { target: document, onUpdate });
    kb.enable();

    press('5');
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  test('disable() stops handling keys, isEnabled() reflects state', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();
    expect(kb.isEnabled()).toBe(true);

    kb.disable();
    expect(kb.isEnabled()).toBe(false);
    press('5');
    expect(engine.getExpression()).toBe('');
  });

  test('unrecognized keys are ignored without error', () => {
    const engine = new CalculatorEngine();
    const kb = createKeyboardHandler(engine, { target: document });
    kb.enable();
    expect(() => press('F5')).not.toThrow();
    expect(engine.getExpression()).toBe('');
  });
});
