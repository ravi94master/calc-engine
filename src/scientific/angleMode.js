import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

const VALID_MODES = new Set(['deg', 'rad']);

/**
 * Holds the current angle mode ('deg' | 'rad') and converts between the two.
 * A single mutable instance is shared with the trig functions so that
 * changing the mode at runtime (Calculator.setAngleMode) takes effect on
 * the very next calculation, without re-registering any functions.
 */
export class AngleMode {
  constructor(mode = 'deg') {
    this.set(mode);
  }

  set(mode) {
    if (!VALID_MODES.has(mode)) {
      throw new CalculatorException(
        ErrorCodes.INVALID_CONFIG,
        `Invalid angle mode "${mode}". Expected "deg" or "rad".`
      );
    }
    this.mode = mode;
  }

  get() {
    return this.mode;
  }

  /** Converts a value in the *current* mode into radians, for use with Math.* trig fns. */
  toRadians(value) {
    return this.mode === 'deg' ? (value * Math.PI) / 180 : value;
  }

  /** Converts a value in radians back into the *current* mode. */
  fromRadians(value) {
    return this.mode === 'deg' ? (value * 180) / Math.PI : value;
  }
}
