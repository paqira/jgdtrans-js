import { First, MeshCoord, MeshNode, MeshUnit, Second, Third } from "./mesh.js";
import { Point } from "./point.js";
import { Correction, Format } from "./transformer.js";

//
// primitive
//

/** @internal */
export const isUndefined = (x: unknown): x is undefined => {
  return "undefined" === typeof x;
};

/** @internal */
export const isNull = (x: unknown): x is null => {
  return null === x;
};

/** @internal */
export const isBoolean = (x: unknown): x is boolean => {
  return "boolean" === typeof x;
};

/** @internal */
export const isNumber = (x: unknown): x is number => {
  return "number" === typeof x;
};

/** @internal */
export const isString = (x: unknown): x is string => {
  return "string" === typeof x;
};

//
// std
//

/** @internal */
export const isMap = (x: unknown): x is Map<unknown, unknown> => {
  return x instanceof Map;
};

//
// type
//

/** @internal */
export const isFirst = (x: number): x is First => {
  return 0 <= x && x <= 99;
};

/** @internal */
export const isSecond = (x: number): x is Second => {
  return 0 <= x && x <= 7;
};

/** @internal */
export const isThird = (x: number): x is Third => {
  return 0 <= x && x <= 9;
};

//
// class
//

/** @internal */
export const isMeshUnit = (x: unknown): x is MeshUnit => {
  return x === 1 || x === 5;
};

/** @internal */
export const isMeshCoord = (x: unknown): x is MeshCoord => {
  return x instanceof MeshCoord;
};

/** @internal */
export const isMeshNode = (x: unknown): x is MeshNode => {
  return x instanceof MeshNode;
};

/** @internal */
export const isPoint = (x: unknown): x is Point => {
  return x instanceof Point;
};

/** @internal */
export const isCorrection = (x: unknown): x is Correction => {
  return x instanceof Correction;
};

//
// utils
//

/** @internal */
export const eqNumber = (x: number, y: number): boolean => {
  return x === y || (Number.isNaN(x) && Number.isNaN(y));
};

/** @internal */
export const isOddBits = (x: number): boolean => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, x, false);
  return view.getUint8(7) % 2 != 0;
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
