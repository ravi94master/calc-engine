import { parse } from '../src/parser/parser.js';
import { CalculatorException } from '../src/errors/CalculatorError.js';

describe('parser', () => {
  test('parses a simple binary expression', () => {
    const ast = parse('2+3');
    expect(ast).toEqual({
      type: 'Binary',
      operator: '+',
      left: { type: 'Number', value: 2 },
      right: { type: 'Number', value: 3 }
    });
  });

  test('respects * / over + - precedence', () => {
    const ast = parse('2+3*4');
    expect(ast.type).toBe('Binary');
    expect(ast.operator).toBe('+');
    expect(ast.right).toEqual({
      type: 'Binary',
      operator: '*',
      left: { type: 'Number', value: 3 },
      right: { type: 'Number', value: 4 }
    });
  });

  test('parentheses override default precedence', () => {
    const ast = parse('(2+3)*4');
    expect(ast.operator).toBe('*');
    expect(ast.left.type).toBe('Group');
  });

  test('power (^) is right-associative and binds tighter than * /', () => {
    const ast = parse('2^3^2');
    expect(ast).toEqual({
      type: 'Binary',
      operator: '^',
      left: { type: 'Number', value: 2 },
      right: {
        type: 'Binary',
        operator: '^',
        left: { type: 'Number', value: 3 },
        right: { type: 'Number', value: 2 }
      }
    });
  });

  test('parses postfix factorial and percent, chainable', () => {
    const factorial = parse('5!');
    expect(factorial).toEqual({ type: 'Postfix', operator: '!', operand: { type: 'Number', value: 5 } });

    const percent = parse('50%');
    expect(percent).toEqual({ type: 'Postfix', operator: '%', operand: { type: 'Number', value: 50 } });
  });

  test('parses unary minus/plus', () => {
    const ast = parse('-5+3');
    expect(ast.left).toEqual({ type: 'Unary', operator: '-', operand: { type: 'Number', value: 5 } });
  });

  test('parses function calls with arguments', () => {
    const ast = parse('sin(30)');
    expect(ast).toEqual({
      type: 'Call',
      name: 'sin',
      args: [{ type: 'Number', value: 30 }]
    });
  });

  test('parses bare identifiers as constants', () => {
    const ast = parse('pi');
    expect(ast).toEqual({ type: 'Identifier', name: 'pi' });
  });

  test('parses nested parentheses', () => {
    const ast = parse('((1+2))');
    expect(ast.type).toBe('Group');
    expect(ast.expression.type).toBe('Group');
  });

  test('throws INVALID_PARENTHESES on unbalanced parens', () => {
    expect(() => parse('(1+2')).toThrow(CalculatorException);
    try {
      parse('(1+2');
    } catch (err) {
      expect(err.code).toBe('INVALID_PARENTHESES');
    }
  });

  test('throws INVALID_PARENTHESES on an unexpected closing paren', () => {
    try {
      parse('1+2)');
    } catch (err) {
      expect(err.code).toBe('INVALID_PARENTHESES');
    }
  });

  test('throws EMPTY_EXPRESSION on an incomplete expression', () => {
    try {
      parse('2+');
    } catch (err) {
      expect(err.code).toBe('EMPTY_EXPRESSION');
    }
  });

  test('throws INVALID_EXPRESSION on trailing garbage tokens', () => {
    try {
      parse('2 3');
    } catch (err) {
      expect(err.code).toBe('INVALID_EXPRESSION');
    }
  });
});
