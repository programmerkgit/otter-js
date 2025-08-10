import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import {
  BlockStatement,
  CallExpression,
  EmptyStatement,
  ExpressionStatement,
  ForStatement,
  FunctionStatement,
  IfStatement,
  InfixExpression,
  LetStatement,
  PostfixExpression,
  ReturnStatement,
} from './ast';

describe('Parser', () => {
  function parse(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    return parser.parseProgram();
  }

  describe('statements', () => {
    it('should parse a let statement', () => {
      const input = `let a = 1;`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(LetStatement);
      expect(statement.toString()).toBe('let a = 1');
    });

    it('should parse a function statement', () => {
      const input = `function add(x, y) { return x + y; };`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(FunctionStatement);
      expect(statement.toString()).toBe(
        `function add(x, y) {\n` + `  return (x + y)\n` + '}',
      );
    });

    it('should parse a return statement', () => {
      const input = `return 1;`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(ReturnStatement);
      expect(statement.toString()).toBe('return 1');
    });

    describe('if statement', () => {
      it('should parse if statement', () => {
        const input = `if(1 < 2) { return 1; }`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(IfStatement);
        expect((statement as IfStatement).alternative).toBeNull();
      });

      it('should parse if else statement', () => {
        const input = `if(1 < 2) { return 1; } else { return 2; }`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(IfStatement);
        expect((statement as IfStatement).alternative).toBeInstanceOf(
          BlockStatement,
        );
        expect(statement.toString()).toBe(
          `if((1 < 2)) {\n` +
            `  return 1\n` +
            '} else {\n' +
            `  return 2\n` +
            '}',
        );
      });

      it('should parse if-else-if statement', () => {
        const input = `if(1 < 2) { return 1; } else if(1 < 3) { return 2; }`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(IfStatement);
        expect((statement as IfStatement).alternative).toBeInstanceOf(
          IfStatement,
        );
      });
    });

    it('should parse for statement', () => {
      const input = `for(let i = 0; i < 10; i++) { return i; }`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0] as ForStatement;
      expect(statement).toBeInstanceOf(ForStatement);
      expect(statement.init).toBeInstanceOf(LetStatement);
      expect(statement.condition).toBeInstanceOf(InfixExpression);
      expect(statement.after).toBeInstanceOf(ExpressionStatement);
      expect(statement.toString()).toBe(
        `for(let i = 0; (i < 10); (i++)) {\n` + `  return i\n` + '}',
      );
    });

    it('should parse block statement', () => {
      const input = `{ return 1; }`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(BlockStatement);
      expect(statement.toString()).toBe(`{\n` + `  return 1\n` + '}');
    });

    it('should parse empty statement', () => {
      const input = `;`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(EmptyStatement);
      expect(statement.toString()).toBe('');
    });

    it('should parse expression statement', () => {
      const input = `1;`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(ExpressionStatement);
      expect(statement.toString()).toBe('1');
    });
  });
  describe('expressions', () => {
    describe('prefix expression', () => {
      it('should parse !', () => {
        const input = `!true;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.toString()).toBe('(!true)');
      });

      it('should parse -', () => {
        const input = `-1;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.toString()).toBe('(-1)');
      });
    });

    describe('infix expression', () => {
      it('should parse +', () => {
        const input = `1 + 1;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(1 + 1)');
      });

      it('should parse -', () => {
        const input = `1 - 1;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(1 - 1)');
      });

      it('should parse *', () => {
        const input = `2 * 3;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(2 * 3)');
      });

      it('should parse /', () => {
        const input = `6 / 2;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(6 / 2)');
      });

      it('should parse <', () => {
        const input = `1 < 2;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(1 < 2)');
      });

      it('should parse <=', () => {
        const input = `1 <= 2;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(1 <= 2)');
      });

      it('should parse >', () => {
        const input = `2 > 1;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(2 > 1)');
      });

      it('should parse >=', () => {
        const input = `2 >= 1;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(2 >= 1)');
      });

      it('should parse &&', () => {
        const input = `true && false;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(true && false)');
      });

      it('should parse ||', () => {
        const input = `true || false;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(true || false)');
      });

      it('should parse ==', () => {
        const input = `1 == 1;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(InfixExpression);
        expect(statement.toString()).toBe('(1 == 1)');
      });
    });

    describe('operator expression priority', () => {
      it('should parse arithmetic operator expression', () => {
        const input = `1 + 2 * 3 + -4`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.toString()).toBe('((1 + (2 * 3)) + (-4))');
      });

      it('should parse arithmetic and logical operator expression', () => {
        const input = `!true && false || true || 1 + 2 && 1 < 2 + 1`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0];
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.toString()).toBe(
          '((((!true) && false) || true) || ((1 + 2) && (1 < (2 + 1))))',
        );
      });
    });

    describe('postfix expression', () => {
      it('should parse ++', () => {
        const input = `a++;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(PostfixExpression);
        expect(statement.toString()).toBe('(a++)');
      });
      it('should parse --', () => {
        const input = `a--;`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement.expression).toBeInstanceOf(PostfixExpression);
        expect(statement.toString()).toBe('(a--)');
      });
    });

    describe('function call expression', () => {
      it('should parse function call expression', () => {
        const input = `add(1, 2);`;
        const program = parse(input);
        expect(program.statements.length).toBe(1);
        const statement = program.statements[0] as ExpressionStatement;
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(CallExpression);
        expect(statement.toString()).toBe('add(1, 2)');
      });
    });

    it('should parse grouped expression', () => {
      const input = `(1 + 1) * 2`;
      const program = parse(input);
      expect(program.statements.length).toBe(1);
      const statement = program.statements[0];
      expect(statement).toBeInstanceOf(ExpressionStatement);
      expect(statement.toString()).toBe('((1 + 1) * 2)');
    });
  });
});
