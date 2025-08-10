import {
  Add,
  And,
  Cal,
  Div,
  Eq,
  Grt,
  GrtEq,
  Instruction,
  Jmp,
  Jpc,
  Lit,
  Lod,
  Lss,
  LssEq,
  Mul,
  Neg,
  Not,
  NotEq,
  Or,
  Pop,
  Pri,
  Ret,
  Sto,
  Sub,
} from '../compiler/instructions';
import { Display } from './display';
import { Stack } from './stack';

export class VM {
  private pc = 0; // プログラムカウンター
  private display = new Display();

  constructor(
    private readonly insts: Instruction[],
    private stack = new Stack(),
  ) {}

  print() {
    this.insts.forEach((ins) => {
      console.log(ins.toString());
    });
  }
  run() {
    while (this.pc < this.insts.length) {
      const ins = this.insts[this.pc];
      this.pc++;
      if (ins instanceof Lit) {
        this.stack.push(ins.value);
      } else if (ins instanceof Pop) {
        this.stack.pop();
      } else if (ins instanceof Lod) {
        this.stack.push(this.stack.getAt(this.varAddr(ins)));
      } else if (ins instanceof Sto) {
        const value = this.stack.pop();
        this.stack.setAt(this.varAddr(ins), value);
      } else if (ins instanceof Neg) {
        this.stack.push(-this.stack.pop());
      } else if (ins instanceof Add) {
        this.stack.push(this.stack.pop() + this.stack.pop());
      } else if (ins instanceof Sub) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a - b);
      } else if (ins instanceof Mul) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a * b);
      } else if (ins instanceof Div) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a / b);
      } else if (ins instanceof Eq) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a === b ? 1 : 0);
      } else if (ins instanceof NotEq) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a !== b ? 1 : 0);
      } else if (ins instanceof Lss) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a < b ? 1 : 0);
      } else if (ins instanceof LssEq) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a <= b ? 1 : 0);
      } else if (ins instanceof Grt) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a > b ? 1 : 0);
      } else if (ins instanceof GrtEq) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a >= b ? 1 : 0);
      } else if (ins instanceof And) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a && b ? 1 : 0);
      } else if (ins instanceof Or) {
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a || b ? 1 : 0);
      } else if (ins instanceof Not) {
        this.stack.push(!this.stack.pop() ? 1 : 0);
      } else if (ins instanceof Jmp) {
        this.pc = ins.value;
      } else if (ins instanceof Jpc) {
        if (this.stack.pop()) this.pc = ins.value;
      } else if (ins instanceof Cal) {
        // 呼び出されるlevelの情報を退避しておく
        const backup = this.display.get(ins.level + 1);
        // 呼び出されるlevelのframe位置を記録
        this.display.set(ins.level + 1, this.stack.size());
        this.stack.push(backup);
        // 呼び出し元のコードアドレスを退避
        this.stack.push(this.pc);
        // 関数内部へ移動
        this.pc = ins.addr;
      } else if (ins instanceof Ret) {
        const ret = this.stack.pop();
        // 関数呼び出し前の状態を復元
        // if () {}, for () {} なども抜ける
        const framePointer = this.framePointer(ins.level);
        const bkdisplay = this.stack.getAt(framePointer);
        const bkpc = this.stack.getAt(framePointer + 1);
        this.display.set(ins.level, bkdisplay);
        // Frame開始位置から引数の分を引いた分へstackサイズを減らす
        this.stack.resize(framePointer - ins.paramCount);
        this.pc = bkpc;
        // returnした値をstackへ積む
        this.stack.push(ret);
      } else if (ins instanceof Pri) {
        console.log(this.stack.pop());
      }
    }

    return;
  }

  // 指定したレベルのFramePointer
  private framePointer(level: number): number {
    return this.display.get(level);
  }

  private varAddr(instruction: { level: number; localAddr: number }): number {
    return this.display.get(instruction.level) + instruction.localAddr;
  }
}
