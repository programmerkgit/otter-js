import { Compiler } from './compiler';
import { Add, Jmp, Lit, Lod, Ret, Sto } from './instructions';
import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';

describe('Compiler', () => {
  function compile(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const compiler = new Compiler(program);
    return compiler;
  }

  it('should compile a let statement', () => {
    const compiler = compile(`let a = 1;`);
    const codes = compiler.compile();
    expect(codes.length).toBe(3 + 5);
    expect(codes[5]).toEqual(new Lit(0));
    expect(codes[6]).toEqual(new Lit(1));
    expect(codes[7]).toEqual(new Sto(0, 0));
  });

  it('should compile an assign statement', () => {
    const compiler = compile(`let a = 1; a = 3`);
    const codes = compiler.compile();
    expect(codes.length).toBe(5 + 5);
    expect(codes[5]).toEqual(new Lit(0));
    expect(codes[6]).toEqual(new Lit(1));
    expect(codes[7]).toEqual(new Sto(0, 0));
    expect(codes[8]).toEqual(new Lit(3));
    expect(codes[9]).toEqual(new Sto(0, 0));
  });

  it('should compile an function statement', () => {
    const compiler = compile(`function add(x, y) { return x + y; };`);
    const codes = compiler.compile();
    expect(codes.length).toBe(7 + 5);
    expect(codes[5]).toEqual(new Jmp(12));
    expect(codes[6]).toEqual(new Lod(1, -2));
    expect(codes[7]).toEqual(new Lod(1, -1));
    expect(codes[8]).toEqual(new Add());
    expect(codes[9]).toEqual(new Ret(1, 2));
    expect(codes[10]).toEqual(new Lit(0));
    expect(codes[11]).toEqual(new Ret(1, 2));
  });
});
