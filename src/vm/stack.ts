export class Stack {
  // dummyのpc, levelの保持
  private stack: number[] = [];

  resize(size: number) {
    this.stack = this.stack.slice(0, size);
  }

  push(v: number) {
    this.stack.push(v);
  }

  size() {
    return this.stack.length;
  }

  pop(): number {
    const v = this.stack.pop();
    if (v === undefined) {
      throw new Error('stack underflow');
    }
    return v;
  }

  getAt(sp: number): number {
    return this.stack[sp];
  }

  setAt(sp: number, v: number) {
    this.stack[sp] = v;
  }
}
