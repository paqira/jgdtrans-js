export class ParameterNotFoundError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "ParameterNotFoundError";
  }
}

export class CorrectionNotFoundError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "CorrectionNotFoundError";
  }
}

export class PointError extends Error {
  cause: Error | undefined = undefined;
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "PointError";
    if (options?.cause != undefined) {
      this.cause = options?.cause;
    }
  }
}

export class ParseParError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "ParseParError";
  }
}

export class ValueError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "ValueError";
  }
}

export class OverflowError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "OverflowError";
  }
}

export class UnitError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "UnitError";
  }
}

export class CellError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(message?: string, options?: { cause?: Error }) {
    super(message);
    this.name = "CellError";
  }
}
