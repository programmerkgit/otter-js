/**
 * 関数の静的スコープを実現するためのディスプレイクラス
 * 各レキシカルレベルのフレームポインタを管理する
 */
export class Display {
  /**
   * 各レベルのフレームポインタを保持するマップ
   * キー: レキシカルレベル (0: グローバル, 1: 1段目の関数, ...)
   * 値: そのレベルのスタック位置
   */
  private frames = new Map<number, number>();

  constructor() {
    // グローバル領域（レベル0）の初期化
    this.frames.set(0, 0);
  }

  /**
   * 指定されたレベルのフレームポインタを取得
   * @param level - レキシカルレベル
   * @returns スタック上のフレーム開始位置（未定義の場合は0）
   */
  get(level: number): number {
    return this.frames.get(level) ?? 0;
  }

  /**
   * 指定されたレベルのフレームポインタを設定
   * @param level - レキシカルレベル
   * @param sp - スタック上の位置
   */
  set(level: number, sp: number): void {
    this.frames.set(level, sp);
  }
}
