import { VM } from './vm';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { Compiler } from '../compiler/compiler';

describe('VM', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // console.logをスパイする
    consoleSpy = jest.spyOn(console, 'log');
  });

  afterEach(() => {
    // テスト後にスパイをリストア
    consoleSpy.mockRestore();
  });

  function run(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const compiler = new Compiler(program);
    const vm = new VM(compiler.compile());
    vm.run();
    return vm;
  }

  it('should run let statement', () => {
    run('let a = 10;print(a);');
    expect(consoleSpy).toHaveBeenCalledWith(10);
  });

  it('should run assignment statement', () => {
    run('let a = 10; print(a); { a = 20; } print(a); a = 30; print(a);');
    expect(consoleSpy).toHaveBeenNthCalledWith(1, 10);
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 20);
    expect(consoleSpy).toHaveBeenNthCalledWith(3, 30);
  });

  it('should run function statement', () => {
    run('function add(x, y) { return x + y; };print(add(1, 2));');
    expect(consoleSpy).toHaveBeenCalledWith(3);
  });

  it('should run for statement', () => {
    run('for(let i = 0; i < 10; i++) { print(i); }');
    for (let i = 0; i < 10; i++) {
      expect(consoleSpy).toHaveBeenNthCalledWith(i + 1, i);
    }
  });

  it('should run recursive function', () => {
    run(
      'function fib(n) { if(n < 2) { return n; } else { return fib(n-1) + fib(n-2); } } print(fib(7));',
    );
    expect(consoleSpy).toHaveBeenCalledWith(13);
  });

  it('should run block scope', () => {
    run('let a = 10; print(a); { let a = 20; print(a); } {} print(a);');
    expect(consoleSpy).toHaveBeenNthCalledWith(1, 10);
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 20);
    expect(consoleSpy).toHaveBeenNthCalledWith(3, 10);
  });
});
