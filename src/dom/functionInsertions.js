/**
 * Maps a `data-function` value to what gets inserted into the expression.
 *
 * Functions that take an argument (sin, cos, tan, sqrt, log, ln) insert an
 * opening call, e.g. "sin(" — the user types the argument and closes the
 * parenthesis themselves (or it's closed implicitly if they hit "=").
 *
 * "square" and "power" reuse the `^` operator already in the parser
 * (x² is `x^2`, xʸ is `x^`) rather than being separate grammar — see
 * scientific/index.js for the full rationale. "factorial" reuses postfix `!`.
 * "pi" and "e" insert the literal identifier so the evaluator resolves it
 * against the registered constants.
 */
export const FUNCTION_INSERTIONS = Object.freeze({
  sin: 'sin(',
  cos: 'cos(',
  tan: 'tan(',
  sqrt: 'sqrt(',
  log: 'log(',
  ln: 'ln(',
  square: '^2',
  power: '^',
  factorial: '!',
  pi: 'pi',
  e: 'e'
});
