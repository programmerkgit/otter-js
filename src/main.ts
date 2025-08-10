import { Compiler } from './compiler/compiler';
import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { VM } from './vm/vm';

const input = `
for(let i = 0; i < 10; i++) {
  print(i);
}
`;

// 字句解析
const lexer = new Lexer(input);
// 構文解釈
const parser = new Parser(lexer);
const program = parser.parseProgram();
// バイトコード生成
const compiler = new Compiler(program);
const instructions = compiler.compile();
// コード実行
const vm = new VM(instructions);
vm.run();
// vm.print(); 生成されたバイトコードを表示する.
