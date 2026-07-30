import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

const DEFAULT_CONFIG = {
  angleMode: 'deg', // 'deg' | 'rad'
  keyboardEnabled: true,
  autoInit: true, // if true, a new CalculatorInstance wires itself to the DOM immediately
  precision: 10, // decimal places kept in results
  root: null, // DOM scope to search within; defaults to `document` inside DOMBinder
  selectors: {}, // overrides for DEFAULT_SELECTORS (see dom/selectors.js)
  attributes: {}, // overrides for DEFAULT_ATTRIBUTES (see dom/selectors.js)
  onUpdate: null // optional callback fired after every state-changing action
};

/**
 * Merges user config with defaults and validates it. Throws a
 * CalculatorException (INVALID_CONFIG) synchronously on bad input —
 * configuration mistakes are programmer errors caught at setup time,
 * unlike runtime calculation errors which are returned, not thrown.
 */
export function normalizeConfig(userConfig = {}) {
  if (userConfig === null || typeof userConfig !== 'object' || Array.isArray(userConfig)) {
    throw new CalculatorException(ErrorCodes.INVALID_CONFIG, 'Configuration must be a plain object.');
  }

  const config = { ...DEFAULT_CONFIG, ...userConfig };

  if (config.angleMode !== 'deg' && config.angleMode !== 'rad') {
    throw new CalculatorException(
      ErrorCodes.INVALID_CONFIG,
      `"angleMode" must be "deg" or "rad", got ${JSON.stringify(config.angleMode)}.`
    );
  }
  if (typeof config.keyboardEnabled !== 'boolean') {
    throw new CalculatorException(ErrorCodes.INVALID_CONFIG, '"keyboardEnabled" must be a boolean.');
  }
  if (typeof config.autoInit !== 'boolean') {
    throw new CalculatorException(ErrorCodes.INVALID_CONFIG, '"autoInit" must be a boolean.');
  }
  if (!Number.isInteger(config.precision) || config.precision < 0 || config.precision > 15) {
    throw new CalculatorException(
      ErrorCodes.INVALID_CONFIG,
      '"precision" must be an integer between 0 and 15.'
    );
  }
  if (config.onUpdate !== null && typeof config.onUpdate !== 'function') {
    throw new CalculatorException(ErrorCodes.INVALID_CONFIG, '"onUpdate" must be a function.');
  }
  if (
    config.root !== null &&
    (typeof config.root !== 'object' || typeof config.root.querySelectorAll !== 'function')
  ) {
    throw new CalculatorException(
      ErrorCodes.INVALID_CONFIG,
      '"root" must be a DOM-like object exposing querySelectorAll (e.g. document, or an element).'
    );
  }
  if (typeof config.selectors !== 'object' || config.selectors === null) {
    throw new CalculatorException(ErrorCodes.INVALID_CONFIG, '"selectors" must be an object.');
  }
  if (typeof config.attributes !== 'object' || config.attributes === null) {
    throw new CalculatorException(ErrorCodes.INVALID_CONFIG, '"attributes" must be an object.');
  }

  return config;
}
