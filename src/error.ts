export class ParameterNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParameterNotFoundError";
  }
}

export class CorrectionNotFoundError extends Error {
  constructor() {
    super();
    this.name = "CorrectionNotFoundError";
  }
}

export class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueError";
  }
}

export class OverflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OverflowError";
  }
}

export class UnitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnitError";
  }
}

export class CellError extends Error {
  constructor() {
    super();
    this.name = "CellError";
  }
}
