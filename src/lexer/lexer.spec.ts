import { Lexer } from './lexer';
import { TokenType } from './token';

describe('Lexer', () => {
  describe('Special tokens', () => {
    it('should tokenize EOF', () => {
      const lexer = new Lexer('');
      expect(lexer.nextToken().type).toBe(TokenType.EOF);
    });

    it('should tokenize ILLEGAL', () => {
      const lexer = new Lexer('@');
      expect(lexer.nextToken().type).toBe(TokenType.ILLEGAL);
    });
  });

  describe('Literals', () => {
    it('should tokenize identifiers', () => {
      const lexer = new Lexer('abc x123 _test');
      expect(lexer.nextToken().type).toBe(TokenType.IDENT);
      expect(lexer.nextToken().type).toBe(TokenType.IDENT);
      expect(lexer.nextToken().type).toBe(TokenType.IDENT);
    });

    it('should tokenize numbers', () => {
      const lexer = new Lexer('123 456 789');
      expect(lexer.nextToken().type).toBe(TokenType.INTEGER);
      expect(lexer.nextToken().type).toBe(TokenType.INTEGER);
      expect(lexer.nextToken().type).toBe(TokenType.INTEGER);
    });
  });

  describe('Keywords', () => {
    it('should tokenize all keywords', () => {
      const input = 'function let if else for return true false';
      const lexer = new Lexer(input);
      const expectedTypes = [
        TokenType.FUNCTION,
        TokenType.LET,
        TokenType.IF,
        TokenType.ELSE,
        TokenType.FOR,
        TokenType.RETURN,
        TokenType.TRUE,
        TokenType.FALSE,
      ];

      expectedTypes.forEach((expected) => {
        expect(lexer.nextToken().type).toBe(expected);
      });
    });
  });

  describe('Operators', () => {
    describe('Assignment operators', () => {
      it('should tokenize assignment', () => {
        const lexer = new Lexer('=');
        expect(lexer.nextToken().type).toBe(TokenType.ASSIGN);
      });
    });

    describe('Arithmetic operators', () => {
      it('should tokenize arithmetic operators', () => {
        const lexer = new Lexer('+ - * /');
        expect(lexer.nextToken().type).toBe(TokenType.PLUS);
        expect(lexer.nextToken().type).toBe(TokenType.MINUS);
        expect(lexer.nextToken().type).toBe(TokenType.ASTERISK);
        expect(lexer.nextToken().type).toBe(TokenType.SLASH);
      });
    });

    describe('Increment/Decrement operators', () => {
      it('should tokenize increment and decrement', () => {
        const lexer = new Lexer('++ --');
        expect(lexer.nextToken().type).toBe(TokenType.INC);
        expect(lexer.nextToken().type).toBe(TokenType.DEC);
      });
    });

    describe('Comparison operators', () => {
      it('should tokenize comparison operators', () => {
        const lexer = new Lexer('== != < <= > >=');
        expect(lexer.nextToken().type).toBe(TokenType.EQ);
        expect(lexer.nextToken().type).toBe(TokenType.NOT_EQ);
        expect(lexer.nextToken().type).toBe(TokenType.LT);
        expect(lexer.nextToken().type).toBe(TokenType.LTE);
        expect(lexer.nextToken().type).toBe(TokenType.GT);
        expect(lexer.nextToken().type).toBe(TokenType.GTE);
      });
    });

    describe('Logical operators', () => {
      it('should tokenize logical operators', () => {
        const lexer = new Lexer('! && ||');
        expect(lexer.nextToken().type).toBe(TokenType.BANG);
        expect(lexer.nextToken().type).toBe(TokenType.LOGICAL_AND);
        expect(lexer.nextToken().type).toBe(TokenType.LOGICAL_OR);
      });
    });
  });

  describe('Delimiters', () => {
    it('should tokenize basic delimiters', () => {
      const lexer = new Lexer(', ;');
      expect(lexer.nextToken().type).toBe(TokenType.COMMA);
      expect(lexer.nextToken().type).toBe(TokenType.SEMICOLON);
    });

    it('should tokenize parentheses and braces', () => {
      const lexer = new Lexer('( ) { }');
      expect(lexer.nextToken().type).toBe(TokenType.LPAREN);
      expect(lexer.nextToken().type).toBe(TokenType.RPAREN);
      expect(lexer.nextToken().type).toBe(TokenType.LBRACE);
      expect(lexer.nextToken().type).toBe(TokenType.RBRACE);
    });
  });
});
