import { Display } from './display';

describe('Display', () => {
  let display: Display;

  beforeEach(() => {
    display = new Display();
  });

  describe('constructor', () => {
    it('グローバル領域(レベル0)が0で初期化されていること', () => {
      expect(display.get(0)).toBe(0);
    });
  });

  describe('get', () => {
    it('設定されていないレベルは0を返すこと', () => {
      expect(display.get(1)).toBe(0);
      expect(display.get(999)).toBe(0);
    });

    it('設定したレベルの値が取得できること', () => {
      display.set(1, 100);
      display.set(2, 200);

      expect(display.get(1)).toBe(100);
      expect(display.get(2)).toBe(200);
    });
  });

  describe('set', () => {
    it('同じレベルに対して値を上書きできること', () => {
      display.set(1, 100);
      expect(display.get(1)).toBe(100);

      display.set(1, 200);
      expect(display.get(1)).toBe(200);
    });

    it('異なるレベルの値は独立していること', () => {
      display.set(1, 100);
      display.set(2, 200);
      display.set(3, 300);

      expect(display.get(1)).toBe(100);
      expect(display.get(2)).toBe(200);
      expect(display.get(3)).toBe(300);
    });

    it('レベル0の値を変更できること', () => {
      display.set(0, 50);
      expect(display.get(0)).toBe(50);
    });
  });

  describe('typical usage', () => {
    it('関数のネストを模した操作ができること', () => {
      // グローバルスコープ
      expect(display.get(0)).toBe(0);

      // 1段目の関数
      display.set(1, 100);
      expect(display.get(1)).toBe(100);

      // 2段目の関数（ネストした関数）
      display.set(2, 200);
      expect(display.get(2)).toBe(200);

      // 1段目の関数に戻る
      display.set(2, 0); // 2段目をクリア
      expect(display.get(1)).toBe(100);
      expect(display.get(2)).toBe(0);
    });
  });
});
