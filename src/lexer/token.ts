export enum TokenType {
  // Special tokens
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',

  // Literals
  IDENT = 'IDENT', // Identifiers
  INTEGER = 'INTEGER', // Integer Literal

  // Keywords
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  IF = 'IF',
  ELSE = 'ELSE',
  FOR = 'FOR',
  RETURN = 'RETURN',
  TRUE = 'TRUE',
  FALSE = 'FALSE',

  // Operators
  // Assignment
  ASSIGN = '=',

  // Arithmetic operators
  PLUS = '+',
  MINUS = '-',
  ASTERISK = '*',
  SLASH = '/',

  // Increment/Decrement
  INC = '++',
  DEC = '--',

  // Comparison operators
  EQ = '==',
  NOT_EQ = '!=',
  LT = '<',
  LTE = '<=',
  GT = '>',
  GTE = '>=',

  // Logical operators
  BANG = '!',
  LOGICAL_AND = '&&',
  LOGICAL_OR = '||',

  // Delimiters
  COMMA = ',',
  SEMICOLON = ';',

  // Parentheses and braces
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
}

export class Token {
  constructor(
    // Tokenの種類
    public type: TokenType,
    // 該当の文字列をを保存
    public literal: string,
  ) {}
}

export const keywords: { [key: string]: TokenType } = {
  function: TokenType.FUNCTION,
  let: TokenType.LET,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  if: TokenType.IF,
  else: TokenType.ELSE,
  return: TokenType.RETURN,
  for: TokenType.FOR,
};
