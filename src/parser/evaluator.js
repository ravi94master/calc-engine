import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

const MAX_FACTORIAL = 170; // 171! overflows a double-precision float

function factorial(n) {
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
    throw new CalculatorException(
      ErrorCodes.FACTORIAL_INVALID,
      'Factorial is only defined for non-negative integers.'
    );
  }
  if (n > MAX_FACTORIAL) {
    throw new CalculatorException(
      ErrorCodes.FACTORIAL_OVERFLOW,
      `Factorial of ${n} is too large to compute.`
    );
  }
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function applyBinary(operator, left, right) {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      if (right === 0) {
        throw new CalculatorException(ErrorCodes.DIVISION_BY_ZERO);
      }
      return left / right;
    case '^':
      return Math.pow(left, right);
    default:
      throw new CalculatorException(
        ErrorCodes.INVALID_EXPRESSION,
        `Unknown binary operator "${operator}".`
      );
  }
}

function applyUnary(operator, value) {
  return operator === '-' ? -value : value;
}

function applyPostfix(operator, value) {
  if (operator === '%') return value / 100;
  if (operator === '!') return factorial(value);
  throw new CalculatorException(
    ErrorCodes.INVALID_EXPRESSION,
    `Unknown postfix operator "${operator}".`
  );
}

/**
 * Evaluates an AST node produced by parser.js.
 *
 * `context.functions` and `context.constants` are pluggable registries —
 * empty by default. The scientific module (Phase 3) registers entries like
 * `functions.sin`, `constants.pi` into these maps; the evaluator itself
 * stays agnostic to what functions exist.
 */
export function evaluate(node, context = {}) {
  const functions = context.functions || {};
  const constants = context.constants || {};

  switch (node.type) {
    case 'Number':
      return node.value;

    case 'Group':
      return evaluate(node.expression, context);

    case 'Binary': {
      const left = evaluate(node.left, context);
      const right = evaluate(node.right, context);
      return applyBinary(node.operator, left, right);
    }

    case 'Unary': {
      const value = evaluate(node.operand, context);
      return applyUnary(node.operator, value);
    }

    case 'Postfix': {
      const value = evaluate(node.operand, context);
      return applyPostfix(node.operator, value);
    }

    case 'Identifier': {
      if (Object.prototype.hasOwnProperty.call(constants, node.name)) {
        return constants[node.name];
      }
      throw new CalculatorException(
        ErrorCodes.UNKNOWN_FUNCTION,
        `Unknown constant "${node.name}".`
      );
    }

    case 'Call': {
      const fn = functions[node.name];
      if (typeof fn !== 'function') {
        throw new CalculatorException(
          ErrorCodes.UNKNOWN_FUNCTION,
          `Unknown function "${node.name}".`
        );
      }
      const args = node.args.map((argNode) => evaluate(argNode, context));
      return fn(...args);
    }

    default:
      throw new CalculatorException(
        ErrorCodes.INVALID_EXPRESSION,
        `Unrecognized AST node type "${node.type}".`
      );
  }
}
