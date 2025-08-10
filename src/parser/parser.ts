import {
  AssignmentStatement,
  BlockStatement,
  BooleanLiteral,
  CallExpression,
  EmptyExpression,
  EmptyStatement,
  ExpressionStatement,
  ForStatement,
  FunctionStatement,
  Identifier,
  IfStatement,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  Node,
  PostfixExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
} from './ast';
import { Token, TokenType } from '../lexer/token';
import { Lexer } from '../lexer/lexer';

enum Precedence {
  LOWEST = 0,
  ASSIGNMENT, // = += -= *= /= %= <<= >>= >>>= &= ^= |=
  LOGICAL_OR, // ||
  LOGICAL_AND, // &&
  EQUALS, // == != === !==
  COMPARE, // < > <= >= instanceof in
  SUM, // + -
  PRODUCT, // * / %
  PREFIX, // ! ~ + - typeof void delete
  POSTFIX, // ++ -- () [] .
}

// Infixの場所にある演算子の優先順位
const precedences: { [key in TokenType]?: Precedence } = {
  [TokenType.ASSIGN]: Precedence.ASSIGNMENT,
  [TokenType.LOGICAL_AND]: Precedence.LOGICAL_AND,
  [TokenType.LOGICAL_OR]: Precedence.LOGICAL_OR,
  [TokenType.EQ]: Precedence.EQUALS,
  [TokenType.NOT_EQ]: Precedence.EQUALS,
  [TokenType.LT]: Precedence.COMPARE,
  [TokenType.LTE]: Precedence.COMPARE,
  [TokenType.GT]: Precedence.COMPARE,
  [TokenType.GTE]: Precedence.COMPARE,
  [TokenType.PLUS]: Precedence.SUM,
  [TokenType.MINUS]: Precedence.SUM,
  [TokenType.SLASH]: Precedence.PRODUCT,
  [TokenType.ASTERISK]: Precedence.PRODUCT,
  // 必要?
  [TokenType.LPAREN]: Precedence.POSTFIX,
  [TokenType.INC]: Precedence.POSTFIX,
  [TokenType.DEC]: Precedence.POSTFIX,
};

export class Parser {
  private curToken: Token;
  private peekToken: Token;

  /* 生成する構文を切り替えるために1Token先読みをする */
  constructor(private readonly lexer: Lexer) {
    this.readToken();
    this.readToken();
  }

  parseProgram(): Program {
    const program = new Program();

    while (this.curToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.statements.push(stmt);
      }
      this.skipSemicolon();
    }
    return program;
  }

  private readToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private ensureAndRead(tt: TokenType): void {
    if (this.curToken.type !== tt) {
      throw new Error(`expected ${tt} but got ${this.curToken.type}`);
    }
    this.readToken();
  }

  private parseStatement(): Node {
    switch (this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.IDENT:
        // 1つのTokenを見ただけではexpressionStatementと区別が付かないので、1Token先読み
        if (this.peekToken.type === TokenType.ASSIGN) {
          return this.assignStatement();
        }
        return this.parseExpressionStatement();
      case TokenType.FUNCTION:
        return this.parseFunctionStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.FOR:
        return this.parseForStatement();
      case TokenType.LBRACE:
        return this.parseBlockStatement();
      case TokenType.SEMICOLON:
        return this.pareEmptyStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement {
    this.ensureAndRead(TokenType.LET);
    const nameTk = this.curToken;
    this.ensureAndRead(TokenType.IDENT);
    const name = new Identifier(nameTk.literal);
    this.ensureAndRead(TokenType.ASSIGN);
    const expression = this.parseExpression(Precedence.LOWEST);
    return new LetStatement(name, expression);
  }

  private assignStatement(): AssignmentStatement {
    const ident = this.parseIdentifier();
    this.ensureAndRead(TokenType.ASSIGN);
    const expression = this.parseExpression(Precedence.LOWEST);
    return new AssignmentStatement(ident, expression);
  }

  private parseFunctionStatement(): FunctionStatement {
    this.ensureAndRead(TokenType.FUNCTION);
    const ident = this.parseIdentifier();
    const parameters = this.parseParameters();
    const body = this.parseBlockStatement();
    return new FunctionStatement(ident.value, parameters, body);
  }

  private parseParameters() {
    this.ensureAndRead(TokenType.LPAREN);
    const parameters: Identifier[] = [];
    while (!this.curTokenIs(TokenType.RPAREN)) {
      if (parameters.length > 0) {
        this.ensureAndRead(TokenType.COMMA);
      }
      if (this.curTokenIs(TokenType.IDENT)) {
        parameters.push(this.parseIdentifier());
      }
    }
    this.ensureAndRead(TokenType.RPAREN);
    return parameters;
  }

  private parseReturnStatement() {
    this.ensureAndRead(TokenType.RETURN);
    let expression: Node | null = null;
    // returnの後に値がある場合のみexpressionをセット
    if (
      !this.curTokenIs(TokenType.SEMICOLON) &&
      !this.curTokenIs(TokenType.RPAREN)
    ) {
      expression = this.parseExpression(Precedence.LOWEST);
    }
    return new ReturnStatement(expression);
  }

  private parseIfStatement(): IfStatement {
    this.ensureAndRead(TokenType.IF);
    const condition = this.parseCondition();
    const consequence = this.parseBlockStatement();

    let alternative: BlockStatement | IfStatement | null = null;
    if (this.curTokenIs(TokenType.ELSE)) {
      this.ensureAndRead(TokenType.ELSE);
      if (this.curTokenIs(TokenType.IF)) {
        alternative = this.parseIfStatement();
      } else {
        alternative = this.parseBlockStatement();
      }
    }

    return new IfStatement(condition, consequence, alternative);
  }

  private parseCondition(): Node {
    this.ensureAndRead(TokenType.LPAREN);
    const cond = this.parseExpression(Precedence.LOWEST);
    this.ensureAndRead(TokenType.RPAREN);
    return cond;
  }

  private parseForStatement(): Node {
    this.ensureAndRead(TokenType.FOR);
    this.ensureAndRead(TokenType.LPAREN);
    const init = this.parseStatement();
    this.ensureAndRead(TokenType.SEMICOLON);
    const condition = this.parseExpression(Precedence.LOWEST);
    this.ensureAndRead(TokenType.SEMICOLON);
    const after = this.parseStatement();
    this.ensureAndRead(TokenType.RPAREN);
    const body = this.parseBlockStatement();
    return new ForStatement(init, condition, after, body);
  }

  private parseBlockStatement(): BlockStatement {
    this.ensureAndRead(TokenType.LBRACE);
    const statements: Node[] = [];
    while (
      !this.curTokenIs(TokenType.RBRACE) &&
      !this.curTokenIs(TokenType.EOF)
    ) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      this.skipSemicolon();
    }
    this.ensureAndRead(TokenType.RBRACE);
    return new BlockStatement(statements);
  }

  private pareEmptyStatement(): EmptyStatement {
    if (this.curTokenIs(TokenType.SEMICOLON)) {
      return new EmptyStatement();
    } else {
      throw new Error(`expected empty statement but got ${this.curToken.type}`);
    }
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression(Precedence.LOWEST);
    const stmt = new ExpressionStatement(expression);
    return stmt;
  }

  private parseExpression(precedence: Precedence): Node {
    // Parse Prefix Position
    let left = this.parsePrefixPositionExpression();
    // Parse Infix
    while (this.curPrecedence() != null && precedence < this.curPrecedence()!) {
      switch (this.curToken.type) {
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.ASTERISK:
        case TokenType.SLASH:
        case TokenType.EQ:
        case TokenType.NOT_EQ:
        case TokenType.LT:
        case TokenType.LTE:
        case TokenType.GT:
        case TokenType.GTE:
        case TokenType.LOGICAL_AND:
        case TokenType.LOGICAL_OR: {
          left = this.parseInfixExpression(left);
          break;
        }
        case TokenType.DEC:
        case TokenType.INC: {
          left = this.parsePostfixExpression(left);
          break;
        }
        case TokenType.LPAREN:
          if (!(left instanceof Identifier)) {
            throw new Error(`invalid expression ${this.curToken.type}`);
          }
          left = this.parseCallExpression(left);
          break;
        default:
          break;
      }
    }
    return left;
  }

  private parsePrefixPositionExpression(): Node {
    switch (this.curToken.type) {
      case TokenType.IDENT: {
        return this.parseIdentifier();
      }
      case TokenType.INTEGER: {
        return this.parseNumberLiteral();
      }
      case TokenType.TRUE:
      case TokenType.FALSE: {
        return this.parseBoolean();
      }
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.BANG: {
        return this.parsePrefixExpression();
      }
      case TokenType.LPAREN: {
        return this.parseGroupedExpression();
      }
      case TokenType.SEMICOLON:
        return this.pareEmptyExpression();
      default: {
        throw new Error(
          `invalid prefix position expression ${this.curToken.type}`,
        );
      }
    }
  }

  private parseIdentifier(): Identifier {
    const tk = this.curToken;
    this.ensureAndRead(TokenType.IDENT);
    return new Identifier(tk.literal);
  }

  private parseNumberLiteral(): Node {
    const token = this.curToken;
    this.ensureAndRead(TokenType.INTEGER);
    const value = parseInt(token.literal, 10);
    if (isNaN(value)) {
      throw new Error(`invalid number ${token.literal}`);
    }
    return new IntegerLiteral(value);
  }

  private parsePrefixExpression(): Node {
    const operator = this.curToken.literal;
    this.readToken();
    const right = this.parseExpression(Precedence.PREFIX);
    return new PrefixExpression(operator, right);
  }

  private parseBoolean(): Node {
    if (this.curTokenIs(TokenType.FALSE)) {
      return this.parseFalse();
    } else {
      return this.parseTrue();
    }
  }

  private parseGroupedExpression(): Node {
    this.ensureAndRead(TokenType.LPAREN);
    const exp = this.parseExpression(Precedence.LOWEST);
    this.ensureAndRead(TokenType.RPAREN);
    return exp;
  }

  private pareEmptyExpression(): EmptyExpression {
    if (this.curTokenIs(TokenType.SEMICOLON)) {
      return new EmptyExpression();
    } else {
      throw new Error(`expected empty statement but got ${this.curToken.type}`);
    }
  }

  private parsePostfixExpression(left: Node): Node {
    const tk = this.curToken;
    this.readToken();
    return new PostfixExpression(tk.literal, left);
  }

  private parseFalse(): Node {
    this.ensureAndRead(TokenType.FALSE);
    return new BooleanLiteral(false);
  }

  private parseTrue(): Node {
    this.ensureAndRead(TokenType.TRUE);
    return new BooleanLiteral(true);
  }

  private parseInfixExpression(left: Node): Node {
    const operator = this.curToken.literal;
    const precedence = this.curPrecedence();
    this.readToken();
    const right = this.parseExpression(precedence!);
    return new InfixExpression(left, operator, right);
  }

  // (expression-list)
  private parseCallExpression(expression: Identifier): Node {
    this.ensureAndRead(TokenType.LPAREN);
    const args = this.parseExpressionList();
    this.ensureAndRead(TokenType.RPAREN);
    return new CallExpression(expression, args);
  }

  private parseExpressionList(): Node[] {
    const expressions: Node[] = [];
    while (!this.curTokenIs(TokenType.RPAREN)) {
      if (expressions.length > 0) {
        this.ensureAndRead(TokenType.COMMA);
      }
      expressions.push(this.parseExpression(Precedence.LOWEST));
    }
    return expressions;
  }

  private curTokenIs(t: TokenType): boolean {
    return this.curToken.type === t;
  }

  private curPrecedence(): Precedence | null {
    return precedences[this.curToken.type] || null;
  }

  private skipSemicolon() {
    while (this.curTokenIs(TokenType.SEMICOLON)) {
      this.readToken();
    }
  }
}
