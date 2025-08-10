import { Stack } from './stack';

describe('Stack', () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
  });

  describe('push', () => {
    it('単一の値をプッシュできること', () => {
      stack.push(42);
      expect(stack.pop()).toBe(42);
    });

    it('複数の値を順番にプッシュできること', () => {
      stack.push(1);
      stack.push(2);
      stack.push(3);

      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
    });
  });

  describe('pop', () => {
    it('プッシュした順序の逆順で値を取り出せること', () => {
      const values = [1, 2, 3, 4, 5];
      values.forEach((v) => stack.push(v));

      const popped: number[] = [];
      for (let i = 0; i < values.length; i++) {
        popped.push(stack.pop());
      }

      expect(popped).toEqual([5, 4, 3, 2, 1]);
    });
  });
});
