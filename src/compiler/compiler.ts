import {
  FuncEntry,
  ParamEntry,
  SymbolTable,
  TableEntry,
  VarEntry,
} from './symbol-table';
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
} from './instructions';
import {
  AssignmentStatement,
  BlockStatement,
  BooleanLiteral,
  CallExpression,
  ExpressionStatement,
  ForStatement,
  FunctionStatement,
  Identifier,
  IfStatement,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  Node,
  PostfixExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
} from '../parser/ast';

export class Compiler {
  private insts: Instruction[] = [];
  private symbolTable = new SymbolTable();

  private level = 0;
  private localAddr = 0;
  private levelAddress: { [key: number]: number } = {
    [0]: 0,
  };

  constructor(private readonly program: Program) {}

  compile(): Instruction[] {
    this.definePrintFunction();
    for (const statement of this.program.statements) {
      this.compileStatement(statement);
    }
    return this.insts;
  }

  private compileStatement(stmt: Node, func: FuncEntry | null = null): void {
    if (stmt instanceof LetStatement) {
      this.compileLetStatement(stmt);
    } else if (stmt instanceof AssignmentStatement) {
      this.compileAssignmentStatement(stmt);
    } else if (stmt instanceof FunctionStatement) {
      this.compileFunctionStatement(stmt);
    } else if (stmt instanceof ReturnStatement) {
      this.compileReturnStatement(stmt, func);
    } else if (stmt instanceof IfStatement) {
      this.compileIfStatement(stmt, func);
    } else if (stmt instanceof ForStatement) {
      this.compileForStatement(stmt, func);
    } else if (stmt instanceof BlockStatement) {
      this.compileBlockStatement(stmt, func);
    } else if (stmt instanceof ExpressionStatement) {
      this.compileExpressionStatement(stmt);
    } else {
      throw new Error(`Not implemented ${stmt.toString()}`);
    }
  }

  private compileLetStatement(statement: LetStatement): void {
    const varEntry = new VarEntry(
      statement.ident.value,
      this.level,
      this.localAddr++,
    );
    this.addEntry(varEntry);
    this.compileExpression(statement.right);
    this.insts.push(new Sto(varEntry.level, varEntry.addr));
  }

  private compileAssignmentStatement(stmt: AssignmentStatement) {
    const entry = this.symbolTable.get(stmt.left.value)!;
    this.compileExpression(stmt.right);
    this.insts.push(new Sto(entry.level, entry.addr));
  }

  private compileFunctionStatement(fe: FunctionStatement) {
    // 宣言時は関数内のコードをスキップ
    const jmp = this.skipStart();
    const funcEntry = new FuncEntry(
      fe.name,
      this.level,
      // 関数が呼び出された時のアドレス
      this.insts.length,
      fe.parameters.length,
    );
    this.addEntry(funcEntry);
    // 関数内部のコード開始
    this.blockBegin();
    // パラメーターをシンボルテーブルにセット
    for (let i = 0; i < fe.parameters.length; i++) {
      const param = fe.parameters[i];
      this.addEntry(
        new ParamEntry(param.value, this.level, i - funcEntry.paramCount),
      );
    }
    for (const stmt of fe.body.statements) {
      this.compileStatement(stmt, funcEntry);
    }
    // statementにreturnが含まれていなかった場合に備えて ゼロ値(0)をreturnする
    this.insts.push(new Lit(0));
    this.insts.push(new Ret(this.level, funcEntry.paramCount));
    // 関数の終了
    this.blockEnd();
    // 関数のコードが終了した場所へバックパッチ
    this.skipEnd(jmp);
  }

  private compileReturnStatement(
    statement: ReturnStatement,
    // Func内のTOPレベルで呼ばれる場合はfuncを引数に渡す
    func: FuncEntry | null = null,
  ) {
    if (statement.value) {
      this.compileExpression(statement.value);
    } else {
      this.insts.push(new Lit(0));
    }
    this.insts.push(new Ret(this.level, func?.paramCount ?? 0));
  }

  private compileIfStatement(stmt: IfStatement, func: FuncEntry | null = null) {
    this.compileExpression(stmt.condition);
    // 条件を満たしていない場合は次のelseへjmp
    this.insts.push(new Not());
    const jmpElse = new Jpc(0); // バックパッチでアドレスを修正する;
    this.insts.push(jmpElse);
    this.compileBlockStatement(stmt.consequence, func);
    // ifの条件を満たしたPathではelseはスキップ
    const jmpEnd = new Jmp(0);
    this.insts.push(jmpEnd);
    jmpElse.value = this.insts.length;
    if (stmt.alternative) {
      this.compileStatement(stmt.alternative, func);
    }
    // バックパッチ
    jmpEnd.value = this.insts.length;
  }

  /**
   * for(init, cond, fater) {
   *   statements
   * }
   * => 以下のようなブロック構造であると考えて評価する
   * {
   *  init
   *  cond
   *  {
   *    statements
   *  }
   *  after
   * }
   *
   * */
  private compileForStatement(forStmt: ForStatement, func: FuncEntry | null) {
    // Blockに入る
    const jpc = this.enterBlockStatement(func);
    // init文の実行
    this.compileStatement(forStmt.init, func);
    // ------------------Loop開始------------------
    const spc = this.insts.length; // Loopの開始位置を保存
    // condition
    this.compileExpression(forStmt.condition);
    // conditionがfalseならLoopを抜ける
    this.insts.push(new Not());
    const leaveJmp = new Jpc(0);
    this.insts.push(leaveJmp);
    // body
    this.compileBlockStatement(forStmt.body);
    // after
    this.compileStatement(forStmt.after);
    this.insts.push(new Jmp(spc));
    leaveJmp.value = this.insts.length;
    // ------------------Loop終了------------------
    // Blockを抜ける
    this.leaveBlockStatement(jpc);
  }

  private compileBlockStatement(
    statement: BlockStatement,
    func: FuncEntry | null = null,
  ) {
    // Blockに入る
    const jpc = this.enterBlockStatement(func);
    // ブロック内の各文を順にコンパイル
    for (const stmt of statement.statements) {
      this.compileStatement(stmt);
    }
    // Blockを抜ける
    this.leaveBlockStatement(jpc);
  }

  private compileExpressionStatement(statement: ExpressionStatement) {
    this.compileExpression(statement.expression);
    this.insts.push(new Pop());
  }

  private compileExpression(expression: Node): void {
    if (expression instanceof Identifier) {
      this.compileIdentifier(expression);
    } else if (expression instanceof IntegerLiteral) {
      this.compileInteger(expression);
    } else if (expression instanceof BooleanLiteral) {
      this.compileBooleanLiteral(expression);
    } else if (expression instanceof PrefixExpression) {
      this.compilePrefixExpression(expression);
    } else if (expression instanceof InfixExpression) {
      this.compileInfixExpression(expression);
    } else if (expression instanceof PostfixExpression) {
      this.compilePostfixExpression(expression);
    } else if (expression instanceof CallExpression) {
      this.compileCallExpression(expression);
    }
  }

  private compileIdentifier(expression: Identifier) {
    const entry = this.symbolTable.get(expression.value)!;
    if (entry instanceof ParamEntry || entry instanceof VarEntry) {
      this.insts.push(new Lod(entry.level, entry.addr));
    } else {
      throw new Error(`Not implemented entry`);
    }
  }

  private compileInteger(expression: IntegerLiteral) {
    this.insts.push(new Lit(expression.value));
  }

  private compileBooleanLiteral(expression: BooleanLiteral) {
    // true, falseは内部では1と0のalias
    if (expression.value) {
      this.insts.push(new Lit(1));
    } else {
      this.insts.push(new Lit(0));
    }
  }

  private compilePrefixExpression(expression: PrefixExpression) {
    if (expression.operator === '!') {
      this.compileExpression(expression.right);
      this.insts.push(new Not());
    } else if (expression.operator === '-') {
      this.compileExpression(expression.right);
      this.insts.push(new Neg());
    } else if (expression.operator === '+') {
      this.compileExpression(expression.right);
    }
  }

  private compileInfixExpression(expression: InfixExpression) {
    this.compileExpression(expression.left);
    this.compileExpression(expression.right);
    if (expression.operator === '+') {
      this.insts.push(new Add());
    } else if (expression.operator === '-') {
      this.insts.push(new Sub());
    } else if (expression.operator === '*') {
      this.insts.push(new Mul());
    } else if (expression.operator === '/') {
      this.insts.push(new Div());
    } else if (expression.operator === '==') {
      this.insts.push(new Eq());
    } else if (expression.operator === '!=') {
      this.insts.push(new NotEq());
    } else if (expression.operator === '<') {
      this.insts.push(new Lss());
    } else if (expression.operator === '<=') {
      this.insts.push(new LssEq());
    } else if (expression.operator === '>') {
      this.insts.push(new Grt());
    } else if (expression.operator === '>=') {
      this.insts.push(new GrtEq());
    } else if (expression.operator === '&&') {
      this.insts.push(new And());
    } else if (expression.operator === '||') {
      this.insts.push(new Or());
    } else {
      throw new Error(`Not implemented ${expression.operator}`);
    }
  }

  private compilePostfixExpression(expression: PostfixExpression) {
    if (expression.operator === '++') {
      this.compileIncExpression(expression);
    } else if (expression.operator === '--') {
      this.compileDecExpression(expression);
    }
  }

  private compileIncExpression(expression: PostfixExpression) {
    if (!(expression.left instanceof Identifier)) {
      throw new Error(`Not implemented ${expression.left.toString()}`);
    }
    this.compileExpression(expression.left);
    const entry = this.symbolTable.get(expression.left.value) as VarEntry;
    this.insts.push(new Lod(entry.level, entry.addr)); // incrementする値を計算する分
    this.insts.push(new Lit(1));
    this.insts.push(new Add());
    this.insts.push(new Sto(entry.level, entry.addr));
  }

  private compileDecExpression(expression: PostfixExpression) {
    if (!(expression.left instanceof Identifier)) {
      throw new Error(`Not implemented ${expression.left.toString()}`);
    }
    this.compileExpression(expression.left);
    const entry = this.symbolTable.get(expression.left.value) as VarEntry;
    this.insts.push(new Lod(entry.level, entry.addr)); // expressionの評価値分
    this.insts.push(new Lit(-1));
    this.insts.push(new Add());
    this.insts.push(new Sto(entry.level, entry.addr));
  }

  private compileCallExpression(expression: CallExpression) {
    expression.args.forEach((arg) => {
      this.compileExpression(arg);
    });
    const funcEntry = this.symbolTable.get(expression.func.value) as FuncEntry;
    this.insts.push(new Cal(funcEntry.level, funcEntry.addr));
  }

  // 組み込み関数を定義
  private definePrintFunction() {
    // 宣言時は関数内のコードをスキップ
    const jmp = this.skipStart();
    const funcEntry = new FuncEntry(
      'print',
      this.level,
      // 関数が呼び出された時のアドレス
      this.insts.length,
      1,
    );
    this.addEntry(funcEntry);
    // 関数内部のコード開始
    this.blockBegin();
    // parameterの変数領域を確保
    this.insts.push(new Lod(this.level, -1));
    this.insts.push(new Pri());
    // 関数の終了
    // statementにreturnが含まれていなかった場合に備えて ゼロ値(0)をreturnする
    this.insts.push(new Lit(0));
    this.insts.push(new Ret(this.level, funcEntry.paramCount));
    this.blockEnd();
    // 関数のコードが終了した場所へバックパッチ
    this.skipEnd(jmp);
  }

  private skipStart(): Jmp {
    /* BackPatchで関数終了時のCodeへ修正 */
    const jmp = new Jmp(0);
    this.insts.push(jmp);
    return jmp;
  }

  private skipEnd(jmp: Jmp): void {
    jmp.value = this.insts.length;
  }

  // for, {}, ifなどの関数を伴わないBlockStatementに入る時の処理
  private enterBlockStatement(func: FuncEntry | null = null): Jpc {
    this.pushBlockFlag(); // BlockをReturnで抜けたか実行を終えて抜けるかのフラグを管理する領域を確保する
    // RBlock終了処理をskipしてBLockのbody実行へ
    const call = new Cal(this.level, 0);
    this.insts.push(call);
    // Returnを使ってBlockを抜けた場合は再度Return。そうでなければBlock終了位置へJump。
    this.insts.push(new Lod(this.level, this.localAddr - 1)); // 実行終了フラグを読み込む
    const jpc = new Jpc(0); // Returnせずに抜けていた場合Jump
    this.insts.push(jpc);
    // Functionスコープを抜けるために再度Return
    this.insts.push(new Ret(this.level, func?.paramCount ?? 0));
    // Block開始
    call.addr = this.insts.length;
    this.blockBegin();
    return jpc;
  }

  /**
   * for, {}, ifなどの関数を伴わないBlockStatementから抜ける処理
   * @param jpc enterBlockの戻り値。
   * */
  private leaveBlockStatement(jpc: Jpc) {
    // ブロック正常終了時の処理
    // Returnを使わずにブロックを抜けたことを示すFlagをセット
    this.insts.push(new Lit(1));
    this.insts.push(new Sto(this.level, -1));
    // リターン値として0をプッシュ
    this.insts.push(new Lit(0));
    // ブロックからのreturn
    this.insts.push(new Ret(this.level, 0));
    // ブロックスコープの終了
    this.blockEnd();
    // 条件分岐命令のジャンプ先を現在の命令位置に設定（バックパッチ）
    jpc.value = this.insts.length;
    // ブロック実行後の後処理
    // リターン値の破棄
    this.insts.push(new Pop());
    this.popBlockFlag();
  }

  // Compilerの状態管理: Block開始
  // return先のアドレスとdisplayの情報を保持するために2個初期アドレスがずれている
  private blockBegin() {
    // Block開始前の情報を退避
    this.levelAddress[this.level] = this.localAddr;
    // Block開始
    this.level++;
    this.localAddr = 2; // Stackのトップ2つはDisplayとPCの退避のスペース
    this.symbolTable = new SymbolTable(this.symbolTable);
  }

  // Compilerの状態管理: Block終了
  private blockEnd() {
    this.level--;
    this.localAddr = this.levelAddress[this.level];
    this.symbolTable = this.symbolTable.outer!;
  }

  // 名前表に登録
  private addEntry(entry: TableEntry): void {
    this.symbolTable.set(entry.name, entry);
    // Stack上に変数用の領域を確保
    if (entry instanceof VarEntry) {
      this.insts.push(new Lit(0));
    }
  }

  // BlockをReturnせずに抜けたかどうかのフラグ領域を確保
  private pushBlockFlag() {
    this.insts.push(new Lit(0));
    this.localAddr++;
  }

  // Flag領域を破棄
  private popBlockFlag() {
    this.insts.push(new Pop());
    this.localAddr--;
  }
}
