export interface Instruction {
  toString(): string;
}

export class Lit implements Instruction {
  constructor(public readonly value: number) {}

  toString(): string {
    return `lit ${this.value}`;
  }
}

export class Pop implements Instruction {
  toString(): string {
    return 'pop';
  }
}

export class Lod implements Instruction {
  constructor(
    public readonly level: number,
    public readonly localAddr: number,
  ) {}

  toString(): string {
    return `lod ${this.level} ${this.localAddr}`;
  }
}

export class Sto implements Instruction {
  constructor(
    public readonly level: number,
    public readonly localAddr: number,
  ) {}

  toString(): string {
    return `sto ${this.level} ${this.localAddr}`;
  }
}

// Jump
export class Jmp implements Instruction {
  constructor(public value: number = 0) {}

  toString(): string {
    return `jmp ${this.value}`;
  }
}

// Conditional Jump
export class Jpc implements Instruction {
  constructor(public value: number = 0) {}

  toString(): string {
    return `jpc ${this.value}`;
  }
}

export class Neg implements Instruction {
  toString(): string {
    return 'neg';
  }
}

export class Add implements Instruction {
  toString(): string {
    return 'add';
  }
}

export class Sub implements Instruction {
  toString(): string {
    return 'sub';
  }
}

export class Mul implements Instruction {
  toString(): string {
    return 'mul';
  }
}

export class Div implements Instruction {
  toString(): string {
    return 'div';
  }
}

export class Eq implements Instruction {
  toString(): string {
    return 'eq';
  }
}

export class NotEq implements Instruction {
  toString(): string {
    return 'neq';
  }
}

export class Lss implements Instruction {
  toString(): string {
    return 'lss';
  }
}

export class LssEq implements Instruction {
  toString(): string {
    return 'leq';
  }
}

export class Grt implements Instruction {
  toString(): string {
    return 'grt';
  }
}

export class GrtEq implements Instruction {
  toString(): string {
    return 'geq';
  }
}

export class And implements Instruction {
  toString(): string {
    return 'and';
  }
}

export class Or implements Instruction {
  toString(): string {
    return 'or';
  }
}

export class Not implements Instruction {
  toString(): string {
    return 'not';
  }
}

export class Cal implements Instruction {
  constructor(
    // 呼び出す関数の定義レベル
    public readonly level: number,
    public addr: number,
  ) {}

  toString(): string {
    return `cal ${this.level} ${this.addr}`;
  }
}

export class Ret implements Instruction {
  constructor(
    // returnを実行するコードのレベル
    public readonly level: number,
    public readonly paramCount: number,
  ) {}

  toString(): string {
    return `ret ${this.level} ${this.paramCount}`;
  }
}

export class Pri implements Instruction {
  toString(): string {
    return 'pri';
  }
}
