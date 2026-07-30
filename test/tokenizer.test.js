import { tokenize, TokenType } from '../src/parser/tokenizer.js';
import { CalculatorException } from '../src/errors/CalculatorError.js';

describe('tokenizer', () => {
  test('tokenizes integers and decimals', () => {
    const tokens = tokenize('12 + 3.5');
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.NUMBER,
      TokenType.PLUS,
      TokenType.NUMBER,
      TokenType.EOF
    ]);
    expect(tokens[0].value).toBe(12);
    expect(tokens[2].value).toBe(3.5);
  });

  test('tokenizes a leading-dot decimal like ".5"', () => {
    const tokens = tokenize('.5');
    expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: 0.5 });
  });

  test('tokenizes all single-character operators and punctuation', () => {
    const tokens = tokenize('+-*/^%!(),');
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.MULTIPLY,
      TokenType.DIVIDE,
      TokenType.POWER,
      TokenType.PERCENT,
      TokenType.FACTORIAL,
      TokenType.LPAREN,
      TokenType.RPAREN,
      TokenType.COMMA,
      TokenType.EOF
    ]);
  });

  test('tokenizes identifiers (function names / constants) as lowercase', () => {
    const tokens = tokenize('SIN(PI)');
    expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'sin' });
    expect(tokens[2]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'pi' });
  });

  test('maps the √ symbol to the "sqrt" identifier', () => {
    const tokens = tokenize('√(16)');
    expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'sqrt' });
  });

  test('maps the π symbol to the "pi" identifier', () => {
    const tokens = tokenize('2*π');
    expect(tokens[2]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'pi' });
  });

  test('skips whitespace', () => {
    const tokens = tokenize('  1   +   2  ');
    expect(tokens.map((t) => t.type)).toEqual([TokenType.NUMBER, TokenType.PLUS, TokenType.NUMBER, TokenType.EOF]);
  });

  test('throws INVALID_CHARACTER on unsupported characters', () => {
    expect(() => tokenize('2 & 3')).toThrow(CalculatorException);
    try {
      tokenize('2 & 3');
    } catch (err) {
      expect(err.code).toBe('INVALID_CHARACTER');
    }
  });

  test('throws INVALID_EXPRESSION when input is not a string', () => {
    expect(() => tokenize(42)).toThrow(CalculatorException);
  });
});
