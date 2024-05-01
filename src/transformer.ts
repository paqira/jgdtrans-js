import {
  CorrectionNotFoundError,
  ParameterNotFoundError,
  PointError,
  ValueError,
} from "./error.js";
import { MeshCell, MeshUnit } from "./mesh.js";
import { Format, isFormat, Parser } from "./par.js";
import { Point } from "./point.js";
import {
  eqNumber,
  isBoolean,
  isMap,
  isNumber,
  isPoint,
  isString,
  isUndefined,
} from "./internal.js";

/** @internal */
const bilinearInterpolation = (
  sw: number,
  se: number,
  nw: number,
  ne: number,
  latitude: number,
  longitude: number,
): number => {
  return (
    sw * (1.0 - longitude) * (1.0 - latitude) +
    se * longitude * (1.0 - latitude) +
    nw * (1.0 - longitude) * latitude +
    ne * longitude * latitude
  );
};

export const meshUnit = (format: Format): MeshUnit => {
  if (!isString(format)) {
    throw new TypeError("format");
  }

  switch (format) {
    case "TKY2JGD":
    case "PatchJGD":
    case "PatchJGD_H":
    case "PatchJGD_HV":
    case "HyokoRev":
      return 1;
    case "SemiDynaEXE":
    case "geonetF3":
    case "ITRF2014":
      return 5;
    default:
      throw new ValueError("format");
  }
};

/**
 * The parameter triplet.
 *
 *  We emphasize that the unit of latitude and longitude is \[sec\], not \[deg\].
 *
 * It should fill with `0.0` instead of `Number.NAN`
 * if the parameter does not exist, as parsers does.
 *
 * @example
 * ```
 * const parameter = new Parameter(1., 2., 3.);
 * console.log(parameter.latitude);  // prints 1.
 * console.log(parameter.longitude);  // prints 2.
 * console.log(parameter.altitude);  // prints 3.
 * ```
 */
export class Parameter {
  #latitude: number;
  #longitude: number;
  #altitude: number;

  /**
   * The latitude parameter \[sec\].
   * @example
   * ```
   * const param = new Parameter(1., 2., 3.);
   * console.log(param.latitude);  // Prints 1.0
   * ```
   */
  get latitude(): number {
    return this.#latitude;
  }

  /**
   * The latitude parameter \[sec\].
   * @example
   * ```
   * const param = new Parameter(1., 2., 3.);
   * console.log(param.longitude);  // Prints 2.0
   * ```
   */
  get longitude(): number {
    return this.#longitude;
  }

  /**
   * The altitude parameter \[m\].
   * @example
   * ```
   * const param = new Parameter(1., 2., 3.);
   * console.log(param.altitude);  // Prints 3.0
   * ```
   */
  get altitude(): number {
    return this.#altitude;
  }

  /**
   * Returns `Math.hypot(this.latitude, this.longitude)`.
   * @example
   * ```
   * const param = new Parameter(1., 1., 0.);
   * console.log(param.horizontal());  // Prints 1.4142135623730951
   * ```
   */
  horizontal = (): number => {
    return Math.hypot(this.#latitude, this.#longitude);
  };

  /**
   * Makes a {@link Parameter}.
   *
   * @param latitude The latitude parameter \[sec\].
   * @param longitude The latitude parameter \[sec\].
   * @param altitude The altitude parameter \[m\].
   * @example
   * ```
   * const parameter = new Parameter(1., 2., 3.);
   * console.log(parameter.latitude);  // prints 1.
   * console.log(parameter.longitude);  // prints 2.
   * console.log(parameter.altitude);  // prints 3.
   * ```
   */
  constructor(latitude: number, longitude: number, altitude: number) {
    if (!isNumber(latitude)) {
      throw new TypeError("latitude");
    } else if (!isNumber(longitude)) {
      throw new TypeError("longitude");
    } else if (!isNumber(altitude)) {
      throw new TypeError("altitude");
    }

    this.#latitude = latitude;
    this.#longitude = longitude;
    this.#altitude = altitude;
  }

  /**
   * Returns `true` is `other` is equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const param = new Parameter(0., 0., 1.);
   * console.log(param.eq(new Parameter(0., 0., 1.)));  // Prints true
   * console.log(param.eq(new Parameter(0., 0., 0.)));  // Prints false
   * ```
   */
  eq = (other: unknown): other is Parameter => {
    return (
      other instanceof Parameter &&
      eqNumber(this.#latitude, other.latitude) &&
      eqNumber(this.#longitude, other.longitude) &&
      eqNumber(this.#altitude, other.altitude)
    );
  };

  /**
   * Returns `true` is `other` is not equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const param = new Parameter(0., 0., 1.);
   * console.log(param.ne(new Parameter(0., 0., 1.)));  // Prints false
   * console.log(param.ne(new Parameter(0., 0., 0.)));  // Prints true
   * ```
   */
  ne = (other: unknown): boolean => !this.eq(other);

  /** @override */
  toString = () => {
    return `Parameter(latitude=${this.#latitude}, longitude=${this.#longitude}, altitude=${this.#altitude})`;
  };
}

/**
 * The transformation correction.
 *
 * It should fill with `0.0` instead of `Number.NAN`
 * if the parameter does not exist, as parsers does.
 *
 * @example
 *
 * ```
 * const correction = new Correction(1., 2., 3.);
 * console.log(correction.latitude);  // prints 1.0
 * console.log(correction.longitude);  // prints 2.0
 * console.log(correction.altitude);  // prints 3.0
 * ```
 */
export class Correction {
  #latitude: number;
  #longitude: number;
  #altitude: number;

  /**
   * The latitude correction \[deg\].
   * @example
   * ```
   * const corr = new Correction(1., 2., 3.);
   * console.log(corr.latitude);  // Prints 1.0
   * ```
   */
  get latitude(): number {
    return this.#latitude;
  }

  /**
   * The longitude correction \[deg\].
   * @example
   * ```
   * const corr = new Correction(1., 2., 3.);
   * console.log(corr.longitude);  // Prints 2.0
   * ```
   */
  get longitude(): number {
    return this.#longitude;
  }

  /**
   * The altitude correction \[m\].
   * @example
   * ```
   * const corr = new Correction(1., 2., 3.);
   * console.log(corr.altitude);  // Prints 3.0
   * ```
   */
  get altitude(): number {
    return this.#altitude;
  }

  /**
   * Returns `Math.hypot(this.latitude, this.longitude)`.
   * @example
   * ```
   * const corr = new Correction(1., 1., 0.);
   * console.log(corr.horizontal());  // Prints 1.4142135623730951
   * ```
   */
  horizontal = (): number => {
    return Math.hypot(this.#latitude, this.#longitude);
  };

  /**
   * Makes a {@link Correction}.
   *
   * @param latitude The latitude correction \[deg\].
   * @param longitude The latitude correction \[deg\].
   * @param altitude The altitude correction \[m\].
   * @example
   * ```
   * const correction = new Correction(1., 2., 3.);
   * console.log(correction.latitude);  // prints 1.0
   * console.log(correction.longitude);  // prints 2.0
   * console.log(correction.altitude);  // prints 3.0
   * ```
   */
  constructor(latitude: number, longitude: number, altitude: number) {
    if (!isNumber(latitude)) {
      throw new TypeError("latitude");
    } else if (!isNumber(longitude)) {
      throw new TypeError("longitude");
    } else if (!isNumber(altitude)) {
      throw new TypeError("altitude");
    }

    this.#latitude = latitude;
    this.#longitude = longitude;
    this.#altitude = altitude;
  }

  /**
   * Returns `true` is `other` is equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const corr = new Correction(0., 0., 1.);
   * console.log(corr.eq(new Correction(0., 0., 1.)));  // Prints true
   * console.log(corr.eq(new Correction(0., 0., 0.)));  // Prints false
   * ```
   */
  eq = (other: unknown): other is Correction => {
    return (
      other instanceof Correction &&
      eqNumber(this.#latitude, other.latitude) &&
      eqNumber(this.#longitude, other.longitude) &&
      eqNumber(this.#altitude, other.altitude)
    );
  };

  /**
   * Returns `true` is `other` is not equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const corr = new Correction(0., 0., 1.);
   * console.log(corr.ne(new Correction(0., 0., 1.)));  // Prints false
   * console.log(corr.ne(new Correction(0., 0., 0.)));  // Prints true
   * ```
   */
  ne = (other: unknown): boolean => !this.eq(other);

  /** @override */
  toString = () => {
    return `Correction(latitude=${this.#latitude}, longitude=${this.#longitude}, altitude=${this.#altitude})`;
  };
}

/**
 * The coordinate Transformer, and represents a deserializing result of par-formatted data.
 *
 * If the parameters is zero, such as the unsupported components,
 * the transformations are identity transformation on such components.
 * For example, the transformation by the TKY2JGD and the PatchJGD par is
 * identity transformation on altitude, and by the PatchJGD(H) par is
 * so on latitude and longitude.
 *
 * @example
 * ```
 * // Contents of SemiDyna2023.par
 * const contents = "...";
 * const tf = Transformer.fromString(contents, "SemiDynaEXE");
 *
 * // Geospatial Information Authority of Japan
 * const origin = new Point(36.10377479, 140.087855041, 2.34);
 *
 * // forward transformation
 * const result = tf.forward(origin);
 * // prints Point(latitude=36.103773017086695, longitude=140.08785924333452, altitude=2.4363138578103)
 * console.log(result.toString());
 *
 * // verified backward transformation
 * const q = tf.backwardCompat(result);
 * // prints Point(latitude=36.10377479, longitude=140.087855041, altitude=2.34)
 * console.log(q.toString());
 *
 * // backward transformation compatible to GIAJ web app/APIs
 * const p = tf.backward(result);
 * // prints Point(latitude=36.10377479000002, longitude=140.087855041, altitude=2.339999999578243)
 * console.log(p.toString());
 *
 * ```
 */
export class Transformer {
  #format: Format;
  #parameter: Map<number, Parameter>;
  #description: string | undefined;

  /**
   * Max error of {@link Transformer.backward} and {@link Transformer.backwardCorrection}.
   *
   * Equals to `5e-14`.
   */
  static get ERROR_MAX(): number {
    return 5e-14;
  }

  /**
   * The format of par file.
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *    ]),
   *    "my SemiDynaEXE"
   * );
   *
   * // prints "SemiDynaEXE"
   * console.log(tf.format);
   * ```
   * */
  get format(): Format {
    return this.#format;
  }

  /**
   * Returns the meshUnit of the format.
   * @returns The meshUnit of the format.
   * @example
   * ```
   * // Prints 1
   * console.log(new Transformer("TKY2JGD", new Map()).unit());
   * // Prints 5
   * console.log(new Transformer("SemiDynaEXE", new Map()).unit());
   * ```
   */
  meshUnit = (): MeshUnit => {
    return meshUnit(this.#format);
  };

  /**
   * The transformation parameter.
   *
   * The entry represents single line of par-formatted file's parameter section,
   * the key is meshcode, and the value parameter.
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *    ]),
   *    "my SemiDynaEXE"
   * );
   *
   * // prints Map(2) { 54401005 => Parameter { ... }, 54401055 => Parameter { ... }}
   * console.log(tf.parameter);
   * ```
   */
  get parameter(): Map<number, Parameter> {
    return this.#parameter;
  }

  /**
   * The description, or the header of par-formatted data.
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *    ]),
   *    "my SemiDynaEXE"
   * );
   *
   * // prints "my SemiDynaEXE"
   * console.log(tf.description);
   * ```
   * */
  get description(): string | undefined {
    return this.#description;
  }

  /**
   * Makes a {@link Transformer}.
   * @param format The format of par file
   * @param parameter The transformation parameter
   * @param description The description
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *    ]),
   * );
   *
   * // prints "SemiDynaEXE"
   * console.log(tf.format);
   * // prints 5
   * console.log(tf.unit());
   * // prints Map(2) { 54401005 => Parameter { ... }, 54401055 => Parameter { ... }}
   * console.log(tf.parameter);
   * // prints undefined
   * console.log(tf.description);
   * ```
   */
  constructor(
    format: Format,
    parameter: Map<number, Parameter>,
    description?: string,
  ) {
    if (!isString(format)) {
      throw new TypeError("format");
    } else if (!isFormat(format)) {
      throw new ValueError("format");
    } else if (!isMap(parameter)) {
      throw new TypeError("parameter");
    } else if (!isString(description) && !isUndefined(description)) {
      throw new TypeError("description");
    }

    this.#format = format;
    this.#parameter = parameter;
    this.#description = description;
  }

  /**
   * Deserialize par-formatted `string` into a {@link Transformer}.
   *
   * This fills by `0.0` for altitude parameter when `"TKY2JGD"` or `"PatchJGD"` given,
   * and for latitude and longitude when `"PatchJGD_H"` or `"HyokoRev"` given.
   *
   *
   * @param text The par formatted text
   * @param format The format of the text
   * @throws {@link error.ParseParError}
   * @example
   * ```
   * // Contents of SemiDyna2023.par
   * const contents = "...";
   * const tf = Transformer.fromString(contents, "SemiDynaEXE");
   *
   * // prints "SemiDynaEXE"
   * console.log(tf.format);
   * // prints all parameters
   * console.log(tf.parameter);
   * // prints first 16 lines
   * console.log(tf.description);
   *
   * const point = new Point(35.0, 135.0);
   * const result = tf.forward(point);
   * ```
   */
  static fromString = (text: string, format: Format, description?: string) => {
    if (!isString(text)) {
      throw new TypeError("text");
    } else if (!isString(format)) {
      throw new TypeError("format");
    } else if (!isFormat(format)) {
      throw new ValueError("format");
    } else if (!isString(description) && !isUndefined(description)) {
      throw new TypeError("description");
    }

    return Parser.fromFormat(format).parse(text, description);
  };

  /**
   * Returns the transformed position.
   *
   * @param point The origin.
   * @param backward If `true`, this performs backward transformation
   * @returns The transformed point.
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @see {@link Transformer.forward}
   * @see {@link Transformer.backward}
   */
  transform = (point: Point, backward: boolean = false): Point => {
    if (!isBoolean(backward)) {
      throw new TypeError("backward");
    }

    const func = backward ? this.forward : this.backward;
    return func(point);
  };

  /**
   * Returns the forward-transformed position from `point`.
   *
   * @param point The origin
   * @returns The forwardly transformed point
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *      [54401055, new Parameter(-0.00663, 0.01492, 0.10374)],
   *      [54401055, new Parameter(-0.00664, 0.01506, 0.10087)],
   *    ]),
   * );
   *
   * const origin = new Point(36.10377479, 140.087855041, 2.34);
   * const result = tf.forward(origin);
   *
   * console.log(result.latitude);  // Prints 36.103773017086695
   * console.log(result.longitude);  // Prints 140.08785924333452
   * console.log(result.altitude);  // Prints 2.4363138578103
   * ```
   *
   * @see {@link Transformer.forwardCorrection}
   */
  forward = (point: Point): Point => {
    const corr = this.forwardCorrection(point);
    return point.add(corr);
  };

  /**
   * Returns the backward-transformed position compatible to GIAJ web app/APIs.
   *
   * This is compatible to GIAJ web app/APIs,
   * and is **not** exact as the original as.
   *
   * @param point The origin
   * @returns The backwardly transformed point
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *      [54401055, new Parameter(-0.00663, 0.01492, 0.10374)],
   *      [54401055, new Parameter(-0.00664, 0.01506, 0.10087)],
   *    ]),
   * );
   *
   * const origin = new Point(36.103773017086695, 140.08785924333452, 2.4363138578103);
   * const result = tf.backwardCompat(origin);
   *
   * console.log(result.latitude);  // Prints 36.10377479000002, exact: 36.10377479
   * console.log(result.longitude);  // Prints 140.087855041, exact: 140.087855041
   * console.log(result.altitude);  // Prints 2.339999999578243, exact: 2.34
   * ```
   *
   * @see {@link Transformer.backwardCompatCorrection}
   */
  backwardCompat = (point: Point): Point => {
    const corr = this.backwardCompatCorrection(point);
    return point.add(corr);
  };

  /**
   * Returns the backward-transformed position.
   *
   * The result's error from an exact solution is suppressed under {@link Transformer.ERROR_MAX}.
   *
   * Notes, the error is less than 1e-9 \[deg\], which is
   * error of GIAJ latitude and longitude parameter.
   * This implies that altitude's error is less than 1e-5 \[m\],
   * which is error of the GIAJ altitude parameter.
   *
   * This is not compatible to GIAJ web app/APIs (but more accurate).
   *
   * @param point The origin
   * @returns The backwardly transformed point
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @throws {@link error.CorrectionNotFoundError}
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *      [54401055, new Parameter(-0.00663, 0.01492, 0.10374)],
   *      [54401055, new Parameter(-0.00664, 0.01506, 0.10087)],
   *    ]),
   * );
   *
   * const origin = new Point(36.103773017086695, 140.08785924333452, 2.4363138578103);
   * const result = tf.backward(origin);
   *
   * // In this case, no error remains.
   * console.log(result.latitude);  // Prints 36.10377479, exact: 36.10377479
   * console.log(result.longitude);  // Prints 140.087855041, exact: 140.087855041
   * console.log(result.altitude);  // Prints 2.34, exact: 2.34
   * ```
   *
   * @see {@link Transformer.backwardCorrection}
   */
  backward = (point: Point): Point => {
    const corr = this.backwardCorrection(point);
    return point.add(corr);
  };

  /** @internal */
  parameterQuadruple = (cell: MeshCell) => {
    let meshcode;

    meshcode = cell.southWest.toMeshcode();
    const sw = this.#parameter.get(meshcode);
    if (isUndefined(sw)) {
      throw new ParameterNotFoundError("south west");
    }

    meshcode = cell.southEast.toMeshcode();
    const se = this.#parameter.get(meshcode);
    if (isUndefined(se)) {
      throw new ParameterNotFoundError("south east");
    }

    meshcode = cell.northWest.toMeshcode();
    const nw = this.#parameter.get(meshcode);
    if (isUndefined(nw)) {
      throw new ParameterNotFoundError("north west");
    }

    meshcode = cell.northEast.toMeshcode();
    const ne = this.#parameter.get(meshcode);
    if (isUndefined(ne)) {
      throw new ParameterNotFoundError("north east");
    }

    return [sw, se, nw, ne];
  };

  /**
   * Return the correction on forward-transformation.
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *      [54401055, new Parameter(-0.00663, 0.01492, 0.10374)],
   *      [54401055, new Parameter(-0.00664, 0.01506, 0.10087)],
   *    ]),
   * );
   *
   * const origin = new Point(36.10377479, 140.087855041, 0.0);
   * const corr = tf.forwardCorrection(origin);
   *
   * console.log(corr.latitude);  // Prints -1.7729133100878255e-6
   * console.log(corr.longitude);  // Prints 4.202334510058886e-6
   * console.log(corr.altitude);  // Prints 0.09631385781030007
   * ```
   *
   * @see {@link Transformer.forward}
   */
  forwardCorrection = (point: Point): Correction => {
    if (!isPoint(point)) {
      throw new TypeError("point");
    }

    let cell: MeshCell;
    try {
      cell = MeshCell.fromPoint(point, this.meshUnit());
    } catch (e) {
      if (e instanceof Error) {
        throw new PointError("point is out-of-bounds", { cause: e });
      } else {
        throw e;
      }
    }

    const [sw, se, nw, ne] = this.parameterQuadruple(cell);
    const [y, x] = cell.position(point);

    const SCALE = 3600.0;

    const latitude =
      bilinearInterpolation(
        sw.latitude,
        se.latitude,
        nw.latitude,
        ne.latitude,
        y,
        x,
      ) / SCALE;

    const longitude =
      bilinearInterpolation(
        sw.longitude,
        se.longitude,
        nw.longitude,
        ne.longitude,
        y,
        x,
      ) / SCALE;

    const altitude = bilinearInterpolation(
      sw.altitude,
      se.altitude,
      nw.altitude,
      ne.altitude,
      y,
      x,
    );

    return new Correction(latitude, longitude, altitude);
  };

  /**
   * Return the correction on backward-transformation.
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *      [54401055, new Parameter(-0.00663, 0.01492, 0.10374)],
   *      [54401055, new Parameter(-0.00664, 0.01506, 0.10087)],
   *    ]),
   * );
   *
   * const origin = new Point(36.103773017086695, 140.08785924333452, 0.0);
   * const corr = tf.backwardCompatCorrection(origin);
   *
   * console.log(corr.latitude);  // Prints 1.7729133219831587e-6
   * console.log(corr.longitude);  // Prints -4.202334509042613e-6
   * console.log(corr.altitude);  // Prints -0.0963138582320569
   * ```
   *
   * @see {@link Transformer.backwardCompat}
   */
  backwardCompatCorrection = (point: Point): Correction => {
    if (!isPoint(point)) {
      throw new TypeError("point");
    }

    const DELTA = 1.0 / 300.0;

    const temporal = new Point(
      point.latitude - DELTA,
      point.longitude + DELTA,
      point.altitude,
    );
    let corr = this.forwardCorrection(temporal);

    const reference = new Point(
      point.latitude - corr.latitude,
      point.longitude - corr.longitude,
      point.altitude - corr.altitude,
    );

    // actual correction
    corr = this.forwardCorrection(reference);
    return new Correction(-corr.latitude, -corr.longitude, -corr.altitude);
  };

  /**
   * Return the verified correction on backward-transformation.
   * @throws {@link error.PointError}
   * @throws {@link error.ParameterNotFoundError}
   * @throws {@link error.CorrectionNotFoundError}
   * @example
   * ```
   * const tf = new Transformer(
   *    "SemiDynaEXE",
   *    new Map([
   *      [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
   *      [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
   *      [54401055, new Parameter(-0.00663, 0.01492, 0.10374)],
   *      [54401055, new Parameter(-0.00664, 0.01506, 0.10087)],
   *    ]),
   * );
   *
   * const origin = new Point(36.103773017086695, 140.08785924333452, 0.0);
   * const corr = tf.backwardCorrection(origin);
   *
   * console.log(corr.latitude);  // Prints 1.7729133100878255e-6
   * console.log(corr.longitude);  // Prints -4.202334510058886e-6
   * console.log(corr.altitude);  // Prints -0.09631385781030007
   * ```
   *
   * @see {@link Transformer.backward}
   */
  backwardCorrection = (point: Point): Correction => {
    if (!isPoint(point)) {
      throw new TypeError("point");
    }

    const SCALE = 3600.0;
    const ITERATION = 4;

    let xn = point.longitude;
    let yn = point.latitude;

    for (let i = 0; i < ITERATION; i++) {
      const current = new Point(yn, xn, 0.0);

      let cell: MeshCell;
      try {
        cell = MeshCell.fromPoint(point, this.meshUnit());
      } catch (e) {
        if (e instanceof Error) {
          throw new PointError("point is out-of-bounds", { cause: e });
        } else {
          throw e;
        }
      }

      const [sw, se, nw, ne] = this.parameterQuadruple(cell);
      const [y, x] = cell.position(current);

      const corr_x =
        bilinearInterpolation(
          sw.longitude,
          se.longitude,
          nw.longitude,
          ne.longitude,
          y,
          x,
        ) / SCALE;
      const corr_y =
        bilinearInterpolation(
          sw.latitude,
          se.latitude,
          nw.latitude,
          ne.latitude,
          y,
          x,
        ) / SCALE;

      const fx = point.longitude - (xn + corr_x);
      const fy = point.latitude - (yn + corr_y);

      // fx_x, fx_y, fy_x, fy_y

      let a1;
      let a2;

      a1 = se.longitude - sw.longitude;
      a2 = ne.longitude - nw.longitude;
      const fx_x = -1.0 - (a1 * (1.0 - yn) + a2 * yn) / SCALE;

      a1 = nw.longitude - sw.longitude;
      a2 = ne.longitude - se.longitude;
      const fx_y = -(a1 * (1.0 - xn) + a2 * xn) / SCALE;

      a1 = se.latitude - sw.latitude;
      a2 = ne.latitude - nw.latitude;
      const fy_x = -(a1 * (1.0 - yn) + a2 * yn) / SCALE;

      a1 = nw.latitude - sw.latitude;
      a2 = ne.latitude - se.latitude;
      const fy_y = -1.0 - (a1 * (1.0 - xn) + a2 * xn) / SCALE;

      // det
      const det = fx_x * fy_y - fx_y * fy_x;

      xn -= (fy_y * fx - fx_y * fy) / det;
      yn -= (fx_x * fy - fy_x * fx) / det;

      // verify
      const corr = this.forwardCorrection(new Point(yn, xn, 0.0));

      const delta_x = point.longitude - (xn + corr.longitude);
      const delta_y = point.latitude - (yn + corr.latitude);

      if (
        Math.abs(delta_x) < Transformer.ERROR_MAX &&
        Math.abs(delta_y) < Transformer.ERROR_MAX
      ) {
        return new Correction(-corr.latitude, -corr.longitude, -corr.altitude);
      }
    }

    throw new CorrectionNotFoundError();
  };

  /** @override */
  toString = () => {
    let desc;
    if (isUndefined(this.#description)) {
      desc = this.#description;
    } else {
      desc = (
        10 + 3 < this.#description.length
          ? this.#description.substring(0, 10) + "..."
          : this.#description
      ).replace("\n", "\\n");
    }

    return `Transformer(format=${this.#format}, paramter=Map[${this.#parameter.size} entries], description="${desc}")`;
  };
}
