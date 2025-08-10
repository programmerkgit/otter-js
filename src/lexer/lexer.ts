import { keywords, Token, TokenType } from './token';

export class Lexer {
  /** 現在の文字の位置を指すポインタ */
  private p = 0;

  constructor(private readonly input: string) {}

  // Tokenを読み返す
  nextToken(): Token {
    this.skipWhitespace(); // 不要な空白を読み進めます
    let input = '';
    switch (this.peekChar()) {
      // Assignment
      case '=': {
        input += this.peekAndRead();
        if (this.peekChar() === '=') {
          input += this.peekAndRead();
          return new Token(TokenType.EQ, input);
        }
        return new Token(TokenType.ASSIGN, input);
      }
      // Arithmetic operators
      case '+': {
        input += this.peekAndRead();
        if (this.peekChar() == '+') {
          input += this.peekAndRead();
          return new Token(TokenType.INC, input);
        }
        return new Token(TokenType.PLUS, input);
      }
      case '-': {
        input += this.peekAndRead();
        if (this.peekChar() == '-') {
          input += this.peekAndRead();
          return new Token(TokenType.DEC, input);
        }
        return new Token(TokenType.MINUS, input);
      }
      case '*': {
        input += this.peekAndRead();
        return new Token(TokenType.ASTERISK, input);
      }
      case '/': {
        input += this.peekAndRead();
        return new Token(TokenType.SLASH, input);
      }

      // Comparison operators
      case '!': {
        input += this.peekAndRead();
        if (this.peekChar() === '=') {
          input += this.peekAndRead();
          return new Token(TokenType.NOT_EQ, input);
        }
        return new Token(TokenType.BANG, input);
      }
      case '&': {
        input += this.peekAndRead();
        if (this.peekChar() === '&') {
          input += this.peekAndRead();
          return new Token(TokenType.LOGICAL_AND, input);
        }
        return new Token(TokenType.ILLEGAL, input);
      }
      case '|': {
        input += this.peekAndRead();
        if (this.peekChar() === '|') {
          input += this.peekAndRead();
          return new Token(TokenType.LOGICAL_OR, input);
        }
        return new Token(TokenType.ILLEGAL, input);
      }
      case '<': {
        input += this.peekAndRead();
        if (this.peekChar() === '=') {
          input += this.peekAndRead();
          return new Token(TokenType.LTE, input);
        }
        return new Token(TokenType.LT, input);
      }
      case '>': {
        input += this.peekAndRead();
        if (this.peekChar() === '=') {
          input += this.peekAndRead();
          return new Token(TokenType.GTE, input);
        }
        return new Token(TokenType.GT, input);
      }

      // Delimiters
      case ',': {
        input += this.peekAndRead();
        return new Token(TokenType.COMMA, input);
      }
      case ';': {
        input += this.peekAndRead();
        return new Token(TokenType.SEMICOLON, input);
      }
      // Parentheses and braces
      case '(': {
        input += this.peekAndRead();
        return new Token(TokenType.LPAREN, input);
      }
      case ')': {
        input += this.peekAndRead();
        return new Token(TokenType.RPAREN, input);
      }
      case '{': {
        input += this.peekAndRead();
        return new Token(TokenType.LBRACE, input);
      }
      case '}': {
        input += this.peekAndRead();
        return new Token(TokenType.RBRACE, input);
      }
      // Special tokens
      case null: {
        return new Token(TokenType.EOF, '');
      }
      default: {
        if (this.isLetter(this.peekChar())) {
          // Identifiers, Keywords
          input += this.peekAndRead();
          while (
            this.isLetter(this.peekChar()) ||
            this.isDigit(this.peekChar())
          ) {
            input += this.peekAndRead();
          }
          const type = keywords[input] || TokenType.IDENT;
          return new Token(type, input);
        } else if (this.isDigit(this.peekChar())) {
          // Numeric literals
          input += this.peekAndRead();
          while (this.isDigit(this.peekChar())) {
            input += this.peekAndRead();
          }
          return new Token(TokenType.INTEGER, input);
        } else {
          // Special tokens
          return new Token(TokenType.ILLEGAL, this.peekAndRead()!);
        }
      }
    }
  }

  // 1文字進める。EOF（入力の終端）に達している場合は位置を進めない
  private readChar(): void {
    if (this.p < this.input.length) {
      this.p++;
    }
  }

  // 次の1文字を返し、その後一文字進む
  private peekAndRead() {
    const ch = this.peekChar();
    this.readChar();
    return ch;
  }

  // 入力を進めずに次の1文字を返す。
  private peekChar(): string | null {
    if (this.p >= this.input.length) {
      return null;
    }
    return this.input[this.p];
  }

  // 不要なホワイトスペース、改行タブなどを取り除く
  private skipWhitespace(): void {
    let ch = this.peekChar();
    while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      this.readChar();
      ch = this.peekChar();
    }
  }

  // 識別子に利用可能な文字列かどうかを判定
  private isLetter(ch: string | null): ch is string {
    if (ch === null) return false;
    return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch === '_';
  }

  // 数字かどうかを判定
  private isDigit(ch: string | null): ch is string {
    if (ch === null) return false;
    return '0' <= ch && ch <= '9';
  }
}
