import { CalculatorEngine } from './core/engine.js';
import { DOMBinder } from './dom/binder.js';
import { createKeyboardHandler } from './keyboard/keyboardHandler.js';
import { copyToClipboard } from './clipboard/clipboard.js';
import { normalizeConfig } from './utils/config.js';

/**
 * CalculatorInstance — one independent, self-contained calculator.
 *
 * This is what powers the `Calculator.init()`-style singleton API in
 * index.js, but it's also exported directly so that framework code
 * (React/Vue/Angular components, or a page with multiple calculators)
 * can create as many independent, isolated instances as needed — each
 * with its own engine state, its own DOM scope, and its own keyboard
 * listener that won't interfere with any other instance.
 *
 * Works with zero DOM: if `root`/`document` is unavailable (or the
 * relevant elements aren't found), the instance still functions as a
 * pure calculation engine — DOM binding degrades gracefully, it never
 * throws just because the page markup is incomplete or absent.
 */
export class CalculatorInstance {
  constructor(userConfig = {}) {
    // Config errors (bad types, invalid values) ARE thrown — they're
    // programmer mistakes caught at setup time, unlike runtime calculation
    // errors (division by zero, etc.) which calculate() returns, not throws.
    this.config = normalizeConfig(userConfig);

    this.engine = new CalculatorEngine({
      precision: this.config.precision,
      angleMode: this.config.angleMode
    });

    this.binder = null;
    this._keyboard = null;
    this._initialized = false;
    this._warnings = [];

    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * Finds and wires up DOM elements. Safe to call more than once (a repeat
   * call is a no-op that returns the same warnings from the first call —
   * use destroy() first if you actually want to rebind).
   * @returns {{ warnings: import('./errors/CalculatorError.js').CalculatorError[] }}
   */
  init() {
    if (this._initialized) {
      return { warnings: this._warnings };
    }

    this.binder = new DOMBinder(this.engine, {
      root: this.config.root,
      selectors: this.config.selectors,
      attributes: this.config.attributes,
      onUpdate: () => this._notifyUpdate()
    });

    const { warnings } = this.binder.init();
    this._warnings = warnings;
    this._initialized = true;

    if (this.config.keyboardEnabled) {
      this.enableKeyboard();
    }

    return { warnings };
  }

  /** Tears down all DOM/keyboard listeners this instance attached. Idempotent. */
  destroy() {
    if (this.binder) {
      this.binder.destroy();
      this.binder = null;
    }
    if (this._keyboard) {
      this._keyboard.disable();
      this._keyboard = null;
    }
    this._initialized = false;
  }

  // --- Calculation -------------------------------------------------------

  /**
   * @param {string} [expression] - if provided, replaces the current input
   *   before evaluating (lets you call `calculate('2+2')` without touching
   *   input() first). If omitted, evaluates whatever's currently been typed.
   */
  calculate(expression) {
    if (typeof expression === 'string') {
      this.engine.expression = expression;
    }
    const result = this.engine.calculate();
    this._syncDisplay();
    return result;
  }

  clear() {
    const value = this.engine.clear();
    this._syncDisplay();
    return value;
  }

  clearEntry() {
    const value = this.engine.clearEntry();
    this._syncDisplay();
    return value;
  }

  backspace() {
    const value = this.engine.backspace();
    this._syncDisplay();
    return value;
  }

  input(value) {
    const result = this.engine.input(value);
    this._syncDisplay();
    return result;
  }

  toggleSign() {
    const value = this.engine.toggleSign();
    this._syncDisplay();
    return value;
  }

  getResult() {
    return this.engine.getResult();
  }

  getExpression() {
    return this.engine.getExpression();
  }

  getLastError() {
    return this.engine.lastError;
  }

  // --- Scientific ----------------------------------------------------------

  setAngleMode(mode) {
    this.engine.setAngleMode(mode);
  }

  getAngleMode() {
    return this.engine.getAngleMode();
  }

  registerFunction(name, fn) {
    this.engine.registerFunction(name, fn);
  }

  registerConstant(name, value) {
    this.engine.registerConstant(name, value);
  }

  // --- Keyboard ------------------------------------------------------------

  enableKeyboard() {
    if (!this._keyboard) {
      this._keyboard = createKeyboardHandler(this.engine, {
        onUpdate: () => this._syncDisplayAndNotify()
      });
    }
    this._keyboard.enable();
  }

  disableKeyboard() {
    if (this._keyboard) this._keyboard.disable();
  }

  isKeyboardEnabled() {
    return Boolean(this._keyboard && this._keyboard.isEnabled());
  }

  // --- Clipboard -------------------------------------------------------

  /** Copies the current result (or current error message, if any) to the clipboard. */
  async copyResult() {
    const value = this.engine.lastError ? this.engine.lastError.message : String(this.engine.getResult());
    return copyToClipboard(value);
  }

  // --- internal ----------------------------------------------------------

  _syncDisplay() {
    if (this.binder) this.binder.updateDisplay();
  }

  _syncDisplayAndNotify() {
    this._syncDisplay();
    this._notifyUpdate();
  }

  _notifyUpdate() {
    if (typeof this.config.onUpdate === 'function') this.config.onUpdate(this);
  }
}
