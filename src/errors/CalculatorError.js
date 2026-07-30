import { ErrorCodes } from './errorCodes.js';

const DEFAULT_MESSAGES = {
  [ErrorCodes.DIVISION_BY_ZERO]: 'Cannot divide by zero.',
  [ErrorCodes.INVALID_EXPRESSION]: 'The expression could not be understood.',
  [ErrorCodes.INVALID_PARENTHESES]: 'Parentheses are not balanced correctly.',
  [ErrorCodes.INVALID_CHARACTER]: 'The expression contains an unsupported character.',
  [ErrorCodes.INVALID_NUMBER]: 'The expression contains a malformed number.',
  [ErrorCodes.INVALID_LOG]: 'Logarithm is only defined for positive numbers.',
  [ErrorCodes.INVALID_SQRT]: 'Square root is only defined for non-negative numbers.',
  [ErrorCodes.FACTORIAL_OVERFLOW]: 'Factorial result is too large to compute.',
  [ErrorCodes.FACTORIAL_INVALID]: 'Factorial is only defined for non-negative integers.',
  [ErrorCodes.UNKNOWN_FUNCTION]: 'Unknown function used in expression.',
  [ErrorCodes.RESULT_INFINITY]: 'The result is too large to represent (Infinity).',
  [ErrorCodes.RESULT_NAN]: 'The calculation did not produce a valid number.',
  [ErrorCodes.MISSING_ELEMENT]: 'A required HTML element could not be found.',
  [ErrorCodes.INVALID_CONFIG]: 'The provided configuration is invalid.',
  [ErrorCodes.EMPTY_EXPRESSION]: 'The expression is empty.',
  [ErrorCodes.CLIPBOARD_ERROR]: 'Unable to copy the result to the clipboard.',
  [ErrorCodes.NOT_INITIALIZED]: 'Calculator.init() must be called before using this method.'
};

/**
 * CalculatorError — a lightweight, serializable error object.
 * Deliberately NOT a subclass of `Error` by default usage: calc-engine
 * returns these as plain data from `calculate()` rather than throwing,
 * so consuming UIs can display `error.message` without try/catch.
 * Internally, parser/evaluator code throws `CalculatorException` (below),
 * which the engine catches and converts into one of these plain objects.
 */
export class CalculatorError {
  constructor(code, message, details) {
    this.code = code;
    this.message = message || DEFAULT_MESSAGES[code] || 'An unknown error occurred.';
    if (details !== undefined) this.details = details;
  }
}

/** Thrown internally by parser/tokenizer/evaluator; caught at the engine boundary. */
export class CalculatorException extends Error {
  constructor(code, message, details) {
    super(message || DEFAULT_MESSAGES[code] || 'An unknown error occurred.');
    this.name = 'CalculatorException';
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export function createError(code, message, details) {
  return new CalculatorError(code, message, details);
}

export function isCalculatorError(value) {
  return value instanceof CalculatorError;
}
