import { parse } from './parser.js';
import { evaluate } from './evaluator.js';
import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

/**
 * Parses and evaluates a math expression string in one step.
 * Throws CalculatorException on any failure — callers (core/engine.js)
 * are responsible for catching this at the API boundary and converting
 * it into a plain CalculatorError object.
 *
 * @param {string} expression
 * @param {{ functions?: Record<string, Function>, constants?: Record<string, number> }} [context]
 * @returns {number}
 */
export function evaluateExpression(expression, context = {}) {
  if (typeof expression !== 'string' || expression.trim() === '') {
    throw new CalculatorException(ErrorCodes.EMPTY_EXPRESSION);
  }

  const ast = parse(expression);
  const result = evaluate(ast, context);

  if (Number.isNaN(result)) {
    throw new CalculatorException(ErrorCodes.RESULT_NAN);
  }
  if (!Number.isFinite(result)) {
    throw new CalculatorException(ErrorCodes.RESULT_INFINITY);
  }

  return result;
}

export { parse } from './parser.js';
export { evaluate } from './evaluator.js';
export { tokenize } from './tokenizer.js';
