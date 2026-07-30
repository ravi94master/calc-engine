import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

export function sqrt(x) {
  if (x < 0) {
    throw new CalculatorException(ErrorCodes.INVALID_SQRT);
  }
  return Math.sqrt(x);
}

/** Base-10 logarithm — this is what a calculator's "log" button means. */
export function log10(x) {
  if (x <= 0) {
    throw new CalculatorException(ErrorCodes.INVALID_LOG);
  }
  return Math.log10(x);
}

/** Natural logarithm (base e) — the calculator's "ln" button. */
export function ln(x) {
  if (x <= 0) {
    throw new CalculatorException(ErrorCodes.INVALID_LOG);
  }
  return Math.log(x);
}
