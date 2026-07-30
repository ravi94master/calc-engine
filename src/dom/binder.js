import { createError } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';
import { createKeyboardHandler } from '../keyboard/keyboardHandler.js';
import { copyToClipboard } from '../clipboard/clipboard.js';
import { DEFAULT_SELECTORS, DEFAULT_ATTRIBUTES } from './selectors.js';
import { FUNCTION_INSERTIONS } from './functionInsertions.js';

const ACTION_HANDLERS = {
  equals: (engine) => engine.calculate(),
  clear: (engine) => engine.clear(),
  'clear-entry': (engine) => engine.clearEntry(),
  backspace: (engine) => engine.backspace(),
  'toggle-sign': (engine) => engine.toggleSign()
  // 'copy' is handled separately below since it's async and doesn't touch engine state.
};

/**
 * DOMBinder — connects a CalculatorEngine to real DOM elements using only
 * IDs and data-attributes. This is the layer that lets a developer write
 * plain HTML/CSS with no calculator logic of their own.
 *
 * Missing elements are never fatal: a calculator can be used purely
 * programmatically (or partially wired) without the binder throwing.
 * Instead, `init()` returns a list of warnings describing what wasn't found.
 */
export class DOMBinder {
  constructor(engine, config = {}) {
    this.engine = engine;
    this.root = config.root || (typeof document !== 'undefined' ? document : null);
    this.selectors = { ...DEFAULT_SELECTORS, ...(config.selectors || {}) };
    this.attributes = { ...DEFAULT_ATTRIBUTES, ...(config.attributes || {}) };
    this.onUpdate = typeof config.onUpdate === 'function' ? config.onUpdate : () => {};

    this._listeners = []; // [{ element, type, handler }] — for clean destroy()
    this._boundElements = new Set(); // dedupes elements bound via both id and data-action
    this._displayEl = null;
    this._keyboard = null;
  }

  /**
   * Finds elements, attaches listeners, and does an initial display render.
   * @returns {{ warnings: import('../errors/CalculatorError.js').CalculatorError[] }}
   */
  init() {
    if (!this.root) {
      return {
        warnings: [
          createError(
            ErrorCodes.MISSING_ELEMENT,
            'No DOM environment available (document is undefined). Skipping DOM binding.'
          )
        ]
      };
    }

    const warnings = [];

    this._displayEl = this._byId(this.selectors.display);
    if (!this._displayEl) {
      warnings.push(
        createError(
          ErrorCodes.MISSING_ELEMENT,
          `No element found with id="${this.selectors.display}". The calculator will work, but nothing will render its output.`
        )
      );
    }

    // Named single-purpose controls (id="equals", id="clear", id="backspace", ...)
    this._bindNamedControl(this.selectors.equals, 'equals', warnings);
    this._bindNamedControl(this.selectors.clear, 'clear', warnings);
    this._bindNamedControl(this.selectors.clearEntry, 'clear-entry', warnings, true);
    this._bindNamedControl(this.selectors.backspace, 'backspace', warnings);
    this._bindNamedControl(this.selectors.toggleSign, 'toggle-sign', warnings, true);
    this._bindCopyControl(warnings);

    // Generic attribute-driven controls — any number of buttons, no fixed IDs required.
    this._bindValueButtons();
    this._bindActionButtons();
    this._bindFunctionButtons();

    this.updateDisplay();

    return { warnings };
  }

  /** Removes every listener this binder attached. Safe to call multiple times. */
  destroy() {
    for (const { element, type, handler } of this._listeners) {
      element.removeEventListener(type, handler);
    }
    this._listeners = [];
    this._boundElements.clear();
    if (this._keyboard) {
      this._keyboard.disable();
      this._keyboard = null;
    }
  }

  updateDisplay() {
    if (!this._displayEl) return;
    const text = this.engine.lastError ? this.engine.lastError.message : this.engine.getDisplayValue();
    this._displayEl.textContent = text;
  }

  enableKeyboard() {
    if (!this._keyboard) {
      this._keyboard = createKeyboardHandler(this.engine, {
        onUpdate: () => {
          this.updateDisplay();
          this.onUpdate();
        }
      });
    }
    this._keyboard.enable();
  }

  disableKeyboard() {
    if (this._keyboard) this._keyboard.disable();
  }

  async copyResult() {
    const value = this.engine.lastError ? this.engine.lastError.message : String(this.engine.getResult());
    return copyToClipboard(value);
  }

  // --- internal helpers -------------------------------------------------

  _byId(id) {
    if (!this.root || typeof this.root.querySelector !== 'function') return null;
    // Use an attribute selector, not root.getElementById(id) — that method only
    // exists on `document`. Scoped multi-instance usage passes an arbitrary
    // container Element as root (see CalculatorInstance/multi-instance docs),
    // and Element has no getElementById, only querySelector.
    return this.root.querySelector(`[id="${id}"]`);
  }

  _listen(element, type, handler) {
    if (this._boundElements.has(element)) return; // already wired (e.g. id + data-action both present)
    element.addEventListener(type, handler);
    this._listeners.push({ element, type, handler });
    this._boundElements.add(element);
  }

  _afterAction() {
    this.updateDisplay();
    this.onUpdate();
  }

  _bindNamedControl(id, actionName, warnings, optional = false) {
    const el = this._byId(id);
    if (!el) {
      if (!optional) {
        warnings.push(
          createError(
            ErrorCodes.MISSING_ELEMENT,
            `No element found with id="${id}" for the "${actionName}" action.`
          )
        );
      }
      return;
    }
    const handler = ACTION_HANDLERS[actionName];
    this._listen(el, 'click', () => {
      handler(this.engine);
      this._afterAction();
    });
  }

  _bindCopyControl(warnings) {
    const el = this._byId(this.selectors.copy);
    if (!el) return; // copy control is entirely optional
    this._listen(el, 'click', () => {
      this.copyResult().catch(() => {
        // copyResult() rejects with a CalculatorException on total failure;
        // surface it the same way calculate() surfaces errors, via lastError.
        this.engine.lastError = createError(
          ErrorCodes.CLIPBOARD_ERROR,
          'Unable to copy the result to the clipboard.'
        );
        this._afterAction();
      });
    });
  }

  _bindValueButtons() {
    const attr = this.attributes.value;
    const elements = this.root.querySelectorAll ? this.root.querySelectorAll(`[${attr}]`) : [];
    elements.forEach((el) => {
      this._listen(el, 'click', () => {
        this.engine.input(el.getAttribute(attr));
        this._afterAction();
      });
    });
  }

  _bindActionButtons() {
    const attr = this.attributes.action;
    const elements = this.root.querySelectorAll ? this.root.querySelectorAll(`[${attr}]`) : [];
    elements.forEach((el) => {
      const actionName = el.getAttribute(attr);
      if (actionName === 'copy') {
        this._listen(el, 'click', () => {
          this.copyResult().catch(() => {
            this.engine.lastError = createError(ErrorCodes.CLIPBOARD_ERROR);
            this._afterAction();
          });
        });
        return;
      }
      const handler = ACTION_HANDLERS[actionName];
      if (!handler) {
        console.warn(`[calc-engine] Unknown data-action "${actionName}" — ignoring.`);
        return;
      }
      this._listen(el, 'click', () => {
        handler(this.engine);
        this._afterAction();
      });
    });
  }

  _bindFunctionButtons() {
    const attr = this.attributes.function;
    const elements = this.root.querySelectorAll ? this.root.querySelectorAll(`[${attr}]`) : [];
    elements.forEach((el) => {
      const name = el.getAttribute(attr);
      const insertion = FUNCTION_INSERTIONS[name];
      if (insertion === undefined) {
        console.warn(`[calc-engine] Unknown data-function "${name}" — ignoring.`);
        return;
      }
      this._listen(el, 'click', () => {
        this.engine.input(insertion);
        this._afterAction();
      });
    });
  }
}
