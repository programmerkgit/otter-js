export interface Node {
  // デバグを容易にするために文字列で構造を見られるようにする
  toString(): string;
}

// Program全体
export class Program implements Node {
  public statements: Node[] = [];

  toString(): string {
    return this.statements.map((stmt) => stmt.toString()).join('\n');
  }
}

// Nodeには大元のProgramを除くと大きく分けてExpressionとStatementが存在する
// Expressionは評価値がStackに置かれるNodeで、Statementは評価値を持たないNode
export class LetStatement implements Node {
  constructor(
    public ident: Identifier,
    public right: Node,
  ) {}

  toString(): string {
    return `let ${this.ident.toString()} = ${this.right.toString()}`;
  }
}

export class AssignmentStatement implements Node {
  constructor(
    public left: Identifier,
    public right: Node,
  ) {}

  toString(): string {
    return `${this.left.toString()} = ${this.right.toString()}`;
  }
}

export class FunctionStatement implements Node {
  constructor(
    public name: string,
    public parameters: Identifier[],
    public body: BlockStatement,
  ) {}

  toString(): string {
    const params = this.parameters.map((p) => p.toString()).join(', ');
    return `function ${this.name}(${params}) ${this.body.toString()}`;
  }
}

export class ReturnStatement implements Node {
  constructor(public value: Node | null) {}

  toString(): string {
    return `return ${this.value?.toString() ?? ''}`;
  }
}

export class IfStatement implements Node {
  constructor(
    public condition: Node,
    public consequence: BlockStatement,
    public alternative?: BlockStatement | IfStatement | null,
  ) {}

  toString(): string {
    let str = `if(${this.condition.toString()}) ${this.consequence.toString()}`;
    if (this.alternative) {
      str += ` else ${this.alternative.toString()}`;
    }
    return str;
  }
}

export class ForStatement implements Node {
  constructor(
    public init: Node,
    public condition: Node,
    public after: Node,
    public body: BlockStatement,
  ) {}

  toString(): string {
    return `for(${this.init.toString()}; ${this.condition.toString()}; ${this.after.toString()}) ${this.body.toString()}`;
  }
}

export class BlockStatement implements Node {
  constructor(public statements: Node[]) {}

  toString(): string {
    const INDENT = '  ';
    let str = '{\n';
    str += this.statements
      .flatMap((stmt) => {
        return stmt.toString().split('\n');
      })
      .map((line) => INDENT + line + '\n') // 全ての行にインデントをつける
      .join('');
    str += '}';
    return str;
  }
}

export class EmptyStatement implements Node {
  toString(): string {
    return '';
  }
}

export class ExpressionStatement implements Node {
  constructor(public expression: Node) {}

  toString(): string {
    return this.expression.toString();
  }
}

export class Identifier implements Node {
  constructor(public value: string) {}

  toString(): string {
    return this.value.toString();
  }
}

export class IntegerLiteral implements Node {
  constructor(public value: number) {}

  toString(): string {
    return this.value.toString();
  }
}

export class BooleanLiteral implements Node {
  constructor(public value: boolean) {}

  toString(): string {
    return this.value ? 'true' : 'false';
  }
}

export class PrefixExpression implements Node {
  constructor(
    public operator: string,
    public right: Node,
  ) {}

  toString(): string {
    return `(${this.operator}${this.right.toString()})`;
  }
}

export class PostfixExpression implements Node {
  constructor(
    public operator: string,
    public left: Node,
  ) {}

  toString(): string {
    return `(${this.left.toString()}${this.operator})`;
  }
}

export class InfixExpression implements Node {
  constructor(
    public left: Node,
    public operator: string,
    public right: Node,
  ) {}

  toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
  }
}

export class CallExpression implements Node {
  constructor(
    public func: Identifier,
    public args: Node[],
  ) {}

  toString(): string {
    const args = this.args.map((arg) => arg.toString()).join(', ');
    return `${this.func.toString()}(${args})`;
  }
}

export class EmptyExpression implements Node {
  toString(): string {
    return '';
  }
}
