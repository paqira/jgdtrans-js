/** @internal */
export const isBoolean = (x: unknown): x is boolean => {
  return "boolean" === typeof x;
};

/** @internal */
export const isUndefined = (x: unknown): x is undefined => {
  return "undefined" === typeof x;
};

/** @internal */
export const isNumber = (x: unknown): x is number => {
  return "number" === typeof x;
};

/** @internal */
export const isString = (x: unknown): x is string => {
  return "string" === typeof x;
};

/** @internal */
export const isMap = (x: unknown): x is Map<unknown, unknown> => {
  return x instanceof Map;
};

/** @internal */
export const isOddBits = (x: number): boolean => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, x, false);
  return view.getUint8(7) % 2 != 0;
};

/** @internal */
export const eqNumber = (x: number, y: number): boolean => {
  return x === y || (Number.isNaN(x) && Number.isNaN(y));
};

/**
 * Returns next up f64.
 *
 * Does not returns subnominal numbres.
 *
 * From Rust f64::next_up
 * @param {number} x
 * @returns {number} next up `number` of x
 * @internal
 */
export const nextUp = (x: number): number => {
  if (Number.isNaN(x) || x === Number.POSITIVE_INFINITY) {
    return x;
  } else if (x === Number.MAX_VALUE) {
    return Number.POSITIVE_INFINITY;
  }

  const U32_MIN = 0x0;
  const U32_MAX = 0xffff_ffff;
  const F64_SIGN_MASK = 0x7fffffff;
  const F64_BYTES = 8;
  const ORIGIN = 0;
  const OFFSET = 4;
  const LITTLE_ENDIAN = false;

  // make view
  const buffer = new ArrayBuffer(F64_BYTES);
  const view = new DataView(buffer);
  view.setFloat64(ORIGIN, x, LITTLE_ENDIAN);

  const upper = view.getUint32(ORIGIN, LITTLE_ENDIAN);
  const lower = view.getUint32(OFFSET, LITTLE_ENDIAN);

  const abs = upper & F64_SIGN_MASK;

  if (abs === 0 && lower === 0) {
    // case +-0, returns most tity normal number
    // clear
    view.setFloat64(ORIGIN, 0.0, LITTLE_ENDIAN);
    // set most tity normal number
    view.setUint8(F64_BYTES - 1, 1);
  } else if (upper === abs) {
    // case positive
    if (lower === U32_MAX) {
      view.setUint32(ORIGIN, upper + 1, LITTLE_ENDIAN);
      view.setUint32(OFFSET, U32_MIN, LITTLE_ENDIAN);
    } else {
      view.setUint32(OFFSET, lower + 1, LITTLE_ENDIAN);
    }
  } else {
    // case negative
    if (lower === U32_MIN) {
      view.setUint32(ORIGIN, upper - 1, LITTLE_ENDIAN);
      view.setUint32(OFFSET, U32_MAX, LITTLE_ENDIAN);
    } else {
      view.setUint32(OFFSET, lower - 1, LITTLE_ENDIAN);
    }
  }

  return view.getFloat64(ORIGIN);
};
