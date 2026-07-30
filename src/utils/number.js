/**
 * Rounds a number to `precision` significant decimal places while avoiding
 * common floating-point artifacts (e.g. 0.1 + 0.2 === 0.30000000000000004).
 *
 * @param {number} value
 * @param {number} precision - max decimal places, default 10
 */
export function roundResult(value, precision = 10) {
  if (!Number.isFinite(value)) return value;
  const factor = Math.pow(10, precision);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
