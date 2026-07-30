import { tokenize, TokenType } from './tokenizer.js';
import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

/**
 * Grammar (highest to lowest precedence, as parsed bottom-up):
 *
 *   expression → term (('+' | '-') term)*
 *   term       → power (('*' | '/') power)*
 *   power      → unary ('^' power)?              // right-associative
 *   unary      → ('-' | '+') unary | postfix
 *   postfix    → primary ('!' | '%')*             // left-associative, chainable (e.g. 5%%)
 *   primary    → NUMBER
 *              | IDENTIFIER '(' arguments ')'      // function call, e.g. sin(30)
 *              | IDENTIFIER                        // constant, e.g. pi, e
 *              | '(' expression ')'
 *   arguments  → expression (',' expression)* | ε
 *
 * This never uses eval()/new Function() — it walks tokens by hand and
 * builds a plain-object AST that evaluator.js interprets separately.
 */
export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  static parse(expression) {
    const tokens = tokenize(expression);
    const parser = new Parser(tokens);
    const ast = parser.parseExpression();
    parser.expect(TokenType.EOF, ErrorCodes.INVALID_EXPRESSION, 'Unexpected trailing input.');
    return ast;
  }

  peek() {
    return this.tokens[this.pos];
  }

  advance() {
    const token = this.tokens[this.pos];
    if (token.type !== TokenType.EOF) this.pos++;
    return token;
  }

  check(type) {
    return this.peek().type === type;
  }

  expect(type, errorCode, message) {
    if (!this.check(type)) {
      throw new CalculatorException(errorCode || ErrorCodes.INVALID_EXPRESSION, message);
    }
    return this.advance();
  }

  parseExpression() {
    let node = this.parseTerm();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const operator = this.advance().type === TokenType.PLUS ? '+' : '-';
      const right = this.parseTerm();
      node = { type: 'Binary', operator, left: node, right };
    }
    return node;
  }

  parseTerm() {
    let node = this.parsePower();
    while (this.check(TokenType.MULTIPLY) || this.check(TokenType.DIVIDE)) {
      const operator = this.advance().type === TokenType.MULTIPLY ? '*' : '/';
      const right = this.parsePower();
      node = { type: 'Binary', operator, left: node, right };
    }
    return node;
  }

  parsePower() {
    const node = this.parseUnary();
    if (this.check(TokenType.POWER)) {
      this.advance();
      const right = this.parsePower(); // right-associative: 2^3^2 === 2^(3^2)
      return { type: 'Binary', operator: '^', left: node, right };
    }
    return node;
  }

  parseUnary() {
    if (this.check(TokenType.MINUS) || this.check(TokenType.PLUS)) {
      const operator = this.advance().type === TokenType.MINUS ? '-' : '+';
      const operand = this.parseUnary();
      return { type: 'Unary', operator, operand };
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let node = this.parsePrimary();
    while (this.check(TokenType.FACTORIAL) || this.check(TokenType.PERCENT)) {
      const operator = this.advance().type === TokenType.FACTORIAL ? '!' : '%';
      node = { type: 'Postfix', operator, operand: node };
    }
    return node;
  }

  parsePrimary() {
    const token = this.peek();

    if (token.type === TokenType.NUMBER) {
      this.advance();
      return { type: 'Number', value: token.value };
    }

    if (token.type === TokenType.LPAREN) {
      this.advance();
      const node = this.parseExpression();
      this.expect(
        TokenType.RPAREN,
        ErrorCodes.INVALID_PARENTHESES,
        'Missing closing parenthesis ")".'
      );
      return { type: 'Group', expression: node };
    }

    if (token.type === TokenType.IDENTIFIER) {
      const name = token.value;
      this.advance();
      if (this.check(TokenType.LPAREN)) {
        this.advance();
        const args = [];
        if (!this.check(TokenType.RPAREN)) {
          args.push(this.parseExpression());
          while (this.check(TokenType.COMMA)) {
            this.advance();
            args.push(this.parseExpression());
          }
        }
        this.expect(
          TokenType.RPAREN,
          ErrorCodes.INVALID_PARENTHESES,
          `Missing closing parenthesis ")" after arguments to "${name}".`
        );
        return { type: 'Call', name, args };
      }
      return { type: 'Identifier', name };
    }

    if (token.type === TokenType.RPAREN) {
      throw new CalculatorException(
        ErrorCodes.INVALID_PARENTHESES,
        'Unexpected closing parenthesis ")".'
      );
    }

    if (token.type === TokenType.EOF) {
      throw new CalculatorException(ErrorCodes.EMPTY_EXPRESSION, 'Expression is incomplete.');
    }

    throw new CalculatorException(
      ErrorCodes.INVALID_EXPRESSION,
      `Unexpected token "${token.value}".`
    );
  }
}

export function parse(expression) {
  return Parser.parse(expression);
}
