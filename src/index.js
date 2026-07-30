/**
 * calc-engine — public entry point
 *
 * Provides two ways to use the library:
 *
 * 1. Singleton convenience API (`Calculator.init()`, `Calculator.calculate()`,
 *    etc.) — for plain HTML + <script> tag usage where the developer never
 *    writes any JS at all beyond loading the script and calling init().
 *    This delegates to one lazily-created default CalculatorInstance.
 *
 * 2. `Calculator.create(config)` / `new Calculator.CalculatorInstance(config)`
 *    — for React/Vue/Angular components or any page that needs more than
 *    one independent calculator. Each instance has fully isolated state,
 *    DOM scope, and keyboard listeners.
 *
 * Both sit on top of the same framework-agnostic core (engine + parser),
 * which has zero DOM dependency and works identically everywhere.
 */

import { CalculatorEngine } from './core/engine.js';
import { CalculatorInstance } from './instance.js';
import { evaluateExpression } from './parser/index.js';
import { installScientificFunctions } from './scientific/index.js';
import { DOMBinder } from './dom/binder.js';
import { createKeyboardHandler } from './keyboard/keyboardHandler.js';
import { copyToClipboard } from './clipboard/clipboard.js';

const VERSION = '1.0.0';

let _defaultInstance = null;

function ensureDefaultInstance() {
  if (!_defaultInstance) {
    // autoInit: false — calling e.g. Calculator.calculate('2+2') before
    // Calculator.init() should work as pure calculation logic without
    // silently trying (and failing) to bind to DOM elements that may not
    // exist yet, or may not be wanted at all in a headless/SSR context.
    _defaultInstance = new CalculatorInstance({ autoInit: false });
  }
  return _defaultInstance;
}

const Calculator = {
  version: VERSION,

  // Lower-level building blocks — each independently usable/testable,
  // and useful for advanced integrations that don't want the singleton API.
  CalculatorEngine,
  CalculatorInstance,
  evaluateExpression,
  installScientificFunctions,
  DOMBinder,
  createKeyboardHandler,
  copyToClipboard,

  /** Creates an independent calculator instance (for multi-instance / framework use). */
  create(config) {
    return new CalculatorInstance(config);
  },

  // --- Singleton convenience API ------------------------------------------

  /**
   * Wires the default calculator to the DOM (or re-wires it, if destroy()
   * was called). See docs/developer.md for the full config reference.
   * @returns {{ warnings: import('./errors/CalculatorError.js').CalculatorError[] }}
   */
  init(config = {}) {
    if (_defaultInstance) _defaultInstance.destroy();
    _defaultInstance = new CalculatorInstance(config);
    return { warnings: _defaultInstance._warnings };
  },

  destroy() {
    if (_defaultInstance) {
      _defaultInstance.destroy();
      _defaultInstance = null;
    }
  },

  calculate(expression) {
    return ensureDefaultInstance().calculate(expression);
  },

  clear() {
    return ensureDefaultInstance().clear();
  },

  clearEntry() {
    return ensureDefaultInstance().clearEntry();
  },

  backspace() {
    return ensureDefaultInstance().backspace();
  },

  input(value) {
    return ensureDefaultInstance().input(value);
  },

  toggleSign() {
    return ensureDefaultInstance().toggleSign();
  },

  getResult() {
    return ensureDefaultInstance().getResult();
  },

  getExpression() {
    return ensureDefaultInstance().getExpression();
  },

  copyResult() {
    return ensureDefaultInstance().copyResult();
  },

  setAngleMode(mode) {
    return ensureDefaultInstance().setAngleMode(mode);
  },

  getAngleMode() {
    return ensureDefaultInstance().getAngleMode();
  },

  enableKeyboard() {
    return ensureDefaultInstance().enableKeyboard();
  },

  disableKeyboard() {
    return ensureDefaultInstance().disableKeyboard();
  },

  registerFunction(name, fn) {
    return ensureDefaultInstance().registerFunction(name, fn);
  },

  registerConstant(name, value) {
    return ensureDefaultInstance().registerConstant(name, value);
  }
};

export default Calculator;
export {
  CalculatorEngine,
  CalculatorInstance,
  evaluateExpression,
  installScientificFunctions,
  DOMBinder,
  createKeyboardHandler,
  copyToClipboard
};
