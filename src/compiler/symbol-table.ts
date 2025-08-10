export interface TableEntry {
  // 変数・関数名
  name: string;
  // 定義レベル
  level: number;
  // parameter, variableの時はstack上の相対アドレス. Functionの場合は実行コードのアドレス
  addr: number;
}

// 関数
export class FuncEntry implements TableEntry {
  constructor(
    public name: string,
    public level: number,
    public addr: number,
    public paramCount: number,
  ) {}
}

// 関数パラメーター
export class ParamEntry implements TableEntry {
  constructor(
    public name: string,
    public level: number,
    // StackFrameからマイナスのアドレスに引数が積まれている
    public addr: number,
  ) {}
}

// 変数
export class VarEntry implements TableEntry {
  constructor(
    public name: string,
    public level: number,
    public addr: number,
  ) {}
}

export class SymbolTable {
  readonly store = new Map<string, TableEntry>();

  constructor(public outer: SymbolTable | null = null) {}

  set(name: string, entry: TableEntry) {
    this.store.set(name, entry);
  }

  get(name: string): TableEntry | null {
    const entry = this.store.get(name);
    if (entry) return entry;
    if (this.outer == null) return null;
    return this.outer.get(name);
  }
}
