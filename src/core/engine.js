import { evaluateExpression } from '../parser/index.js';
import { CalculatorException, createError } from '../errors/CalculatorError.js';
import { roundResult } from '../utils/number.js';
import { installScientificFunctions } from '../scientific/index.js';

// Matches a trailing number segment at the end of an expression string,
// e.g. "12+3.5" -> "3.5", used by clearEntry().
const TRAILING_NUMBER_RE = /(\d+\.?\d*|\.\d+)$/;

const DEFAULT_OPTIONS = {
  precision: 10, // max decimal places kept in results, avoids float artifacts
  angleMode: 'deg' // 'deg' | 'rad' — used by sin/cos/tan
};

/**
 * CalculatorEngine — stateful, framework-agnostic calculation engine.
 *
 * Holds the current input expression as a plain string (what the user has
 * typed so far) and delegates actual math to the stateless parser/evaluator.
 * Has no knowledge of the DOM; the DOM binding layer (Phase 4) wraps this.
 *
 * `engine.context.functions` / `engine.context.constants` are public,
 * mutable registries. The scientific module (Phase 3) populates them
 * (e.g. `engine.context.functions.sin = ...`) — this engine works
 * correctly with zero scientific functions registered, it just won't
 * recognize their names yet.
 */
export class CalculatorEngine {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.context = { functions: {}, constants: {} };
    this.reset();
    installScientificFunctions(this, { angleMode: this.options.angleMode });
  }

  reset() {
    this.expression = '';
    this.result = 0;
    this.lastError = null;
    this._freshResult = false; // true right after calculate(), enables continuous calculation
  }

  /** Appends a raw fragment (digit, decimal point, operator symbol, parenthesis, etc). */
  input(value) {
    const isOperator = /^[+\-*/^%]$/.test(value);

    if (this._freshResult) {
      if (isOperator) {
        // Continuous calculation: chain the next operation from the previous result.
        this.expression = this._formatNumber(this.result) + value;
      } else {
        // Any non-operator input after "=" starts a brand new expression.
        this.expression = value;
      }
      this._freshResult = false;
    } else {
      this.expression += value;
    }

    this.lastError = null;
    return this.expression;
  }

  /** Removes the last character of the current expression. */
  backspace() {
    if (this._freshResult) {
      // Backspacing right after a result clears it, rather than editing the old expression.
      this.reset();
      return this.expression;
    }
    this.expression = this.expression.slice(0, -1);
    this.lastError = null;
    return this.expression;
  }

  /** Full reset — equivalent to the "C" button. */
  clear() {
    this.reset();
    return this.expression;
  }

  /**
   * Clears only the number currently being typed, leaving the rest of the
   * pending expression intact (e.g. "12+3" -> "12+"). Equivalent to "CE".
   * Falls back to a full clear if there's no trailing number to remove.
   */
  clearEntry() {
    if (this._freshResult) {
      this.reset();
      return this.expression;
    }
    if (TRAILING_NUMBER_RE.test(this.expression)) {
      this.expression = this.expression.replace(TRAILING_NUMBER_RE, '');
    } else {
      this.expression = '';
    }
    this.lastError = null;
    return this.expression;
  }

  /**
   * Toggles the sign of the number currently being typed (±).
   * Operates on the trailing number segment, matching how physical/software
   * calculators apply ± to "the number on screen right now".
   */
  toggleSign() {
    if (this._freshResult) {
      this.result = -this.result;
      this.expression = this._formatNumber(this.result);
      return this.expression;
    }

    const match = this.expression.match(TRAILING_NUMBER_RE);
    if (!match) return this.expression;

    const start = match.index;
    const numberStr = match[0];
    const before = this.expression.slice(0, start);

    if (before.endsWith('-') && !before.endsWith('--')) {
      // A leading "-" immediately before this number: remove it (negative -> positive).
      this.expression = before.slice(0, -1) + numberStr;
    } else {
      this.expression = before + '-' + numberStr;
    }
    return this.expression;
  }

  /**
   * Parses and evaluates the current expression.
   * @returns {number|import('../errors/CalculatorError.js').CalculatorError}
   */
  calculate() {
    try {
      const raw = evaluateExpression(this.expression, this.context);
      const rounded = roundResult(raw, this.options.precision);
      this.result = rounded;
      this.expression = this._formatNumber(rounded);
      this._freshResult = true;
      this.lastError = null;
      return rounded;
    } catch (err) {
      if (err instanceof CalculatorException) {
        const error = createError(err.code, err.message, err.details);
        this.lastError = error;
        return error;
      }
      throw err; // unexpected, non-calculator error — do not swallow
    }
  }

  getResult() {
    return this.result;
  }

  getExpression() {
    return this.expression;
  }

  getDisplayValue() {
    return this.expression === '' ? '0' : this.expression;
  }

  /** Registers a named function (e.g. "sin") for use inside expressions, e.g. sin(30). */
  registerFunction(name, fn) {
    this.context.functions[name] = fn;
  }

  /** Registers a named constant (e.g. "pi") for use inside expressions. */
  registerConstant(name, value) {
    this.context.constants[name] = value;
  }

  /** Sets the angle mode ('deg' | 'rad') used by sin/cos/tan. Takes effect immediately. */
  setAngleMode(mode) {
    this._angleMode.set(mode);
  }

  getAngleMode() {
    return this._angleMode.get();
  }

  _formatNumber(value) {
    if (Number.isInteger(value)) return String(value);
    return String(roundResult(value, this.options.precision));
  }
}
