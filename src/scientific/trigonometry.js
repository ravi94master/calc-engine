// Values below this are treated as zero when deciding whether tan() is
// approaching an asymptote (e.g. 90°, 270°). Floating-point conversion of
// degrees -> radians means Math.cos(radians for 90deg) is never *exactly*
// zero, so without this guard tan(90) would silently return a huge finite
// number instead of a clear error.
import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

const TAN_ASYMPTOTE_EPSILON = 1e-10;

/**
 * Creates sin/cos/tan functions bound to a shared AngleMode instance.
 * Because they read `angleMode.mode` on every call (not just at creation),
 * calling engine.setAngleMode('rad') later affects the very next calculation.
 */
export function createTrigFunctions(angleMode) {
  return {
    sin(x) {
      return Math.sin(angleMode.toRadians(x));
    },
    cos(x) {
      return Math.cos(angleMode.toRadians(x));
    },
    tan(x) {
      const radians = angleMode.toRadians(x);
      if (Math.abs(Math.cos(radians)) < TAN_ASYMPTOTE_EPSILON) {
        throw new CalculatorException(
          ErrorCodes.INVALID_EXPRESSION,
          'Tangent is undefined at this angle.'
        );
      }
      return Math.tan(radians);
    }
  };
}
