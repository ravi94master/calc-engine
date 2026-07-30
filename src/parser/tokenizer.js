import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

export const TokenType = Object.freeze({
  NUMBER: 'NUMBER',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  POWER: 'POWER',
  PERCENT: 'PERCENT',
  FACTORIAL: 'FACTORIAL',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  IDENTIFIER: 'IDENTIFIER', // function names and constants, e.g. sin, pi, e
  EOF: 'EOF'
});

const SINGLE_CHAR_TOKENS = {
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.MULTIPLY,
  '/': TokenType.DIVIDE,
  '^': TokenType.POWER,
  '%': TokenType.PERCENT,
  '!': TokenType.FACTORIAL,
  '(': TokenType.LPAREN,
  ')': TokenType.RPAREN,
  ',': TokenType.COMMA
};

// √ is supported as a literal prefix symbol in addition to the word "sqrt",
// since the UI spec allows a data-value of "√".
const SYMBOL_ALIASES = {
  '√': 'sqrt',
  π: 'pi'
};

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

function isIdentifierStart(ch) {
  return /[a-zA-Z]/.test(ch);
}

function isIdentifierPart(ch) {
  return /[a-zA-Z0-9_]/.test(ch);
}

/**
 * Converts a raw expression string into a flat array of tokens.
 * Never uses eval() or Function() — this is pure string scanning.
 */
export function tokenize(input) {
  if (typeof input !== 'string') {
    throw new CalculatorException(ErrorCodes.INVALID_EXPRESSION, 'Expression must be a string.');
  }

  const tokens = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    // Skip whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      i++;
      continue;
    }

    // Numbers (supports decimals like "3.14", ".5", "10.")
    if (isDigit(ch) || (ch === '.' && isDigit(input[i + 1]))) {
      let start = i;
      let sawDot = false;
      while (i < len && (isDigit(input[i]) || (input[i] === '.' && !sawDot))) {
        if (input[i] === '.') sawDot = true;
        i++;
      }
      const raw = input.slice(start, i);
      const value = Number(raw);
      if (Number.isNaN(value)) {
        throw new CalculatorException(ErrorCodes.INVALID_NUMBER, `Malformed number: "${raw}"`);
      }
      tokens.push({ type: TokenType.NUMBER, value, raw });
      continue;
    }

    // Symbol aliases (√, π) — map to identifier tokens
    if (SYMBOL_ALIASES[ch]) {
      tokens.push({ type: TokenType.IDENTIFIER, value: SYMBOL_ALIASES[ch] });
      i++;
      continue;
    }

    // Identifiers: function names (sin, cos, log, ln, sqrt) and constants (pi, e)
    if (isIdentifierStart(ch)) {
      let start = i;
      while (i < len && isIdentifierPart(input[i])) i++;
      const name = input.slice(start, i);
      tokens.push({ type: TokenType.IDENTIFIER, value: name.toLowerCase() });
      continue;
    }

    // Single-character operators / punctuation
    if (SINGLE_CHAR_TOKENS[ch]) {
      tokens.push({ type: SINGLE_CHAR_TOKENS[ch], value: ch });
      i++;
      continue;
    }

    throw new CalculatorException(
      ErrorCodes.INVALID_CHARACTER,
      `Unsupported character "${ch}" at position ${i}.`,
      { position: i, character: ch }
    );
  }

  tokens.push({ type: TokenType.EOF, value: null });
  return tokens;
}
