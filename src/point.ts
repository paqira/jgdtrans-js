import { MeshCell, MeshNode, MeshUnit } from "./mesh.js";
import { Correction } from "./transformer.js";
import { eqNumber, isNumber } from "./utils.js";

/** @internal */
const isMeshNode = (x: unknown): x is MeshNode => {
  return x instanceof MeshNode;
};

/** @internal */
const isCorrection = (x: unknown): x is Correction => {
  return x instanceof Correction;
};

/** @internal */
const normalizeLatitude = (degree: number): number => {
  if (Number.isNaN(degree) || (-90.0 <= degree && degree <= 90.0)) {
    return degree;
  }

  const s = degree % 360.0;
  if (s < -270.0) {
    return s + 360.0;
  } else if (270.0 < s) {
    return s - 360.0;
  } else if (s < -90.0) {
    return -180.0 - s;
  } else if (90.0 < s) {
    return 180.0 - s;
  } else {
    return s;
  }
};

/** @internal */
const normalizeLongitude = (degree: number): number => {
  if (Number.isNaN(degree) || (-180.0 <= degree && degree <= 180.0)) {
    return degree;
  }

  const s = degree % 360.0;
  if (s < -180.0) {
    return s + 360.0;
  } else if (180.0 < s) {
    return s - 360.0;
  } else {
    return s;
  }
};

/**
 * Represents a position on the Earth, a triplet latitude, longitude and altitude.
 *
 * @example
 * ```
 * const point = new Point(35.0, 145.0, 5.0);
 *
 * console.log(point.latitude);  // Prints 35.0
 * console.log(point.longitude);  // Prints 145.0
 * console.log(point.altitude);  // Prints 5.0
 *
 * // Prints Point(latitude=35.0, longitude=145.0, altitude=5.0)
 * console.log(point.toString());
 * ```
 */
export class Point {
  #latitude: number;
  #longitude: number;
  #altitude: number;

  /**
   * The latitude \[deg\] of the point.
   *
   * @example
   * ```
   * const point = new Point(35.0, 145.0, 5.0);
   * console.log(point.latitude);  // Prints 35.0
   * ```
   */
  get latitude(): number {
    return this.#latitude;
  }

  /**
   * The longitude \[deg\] of the point.
   *
   * @example
   * ```
   * const point = new Point(35.0, 145.0, 5.0);
   * console.log(point.longitude);  // Prints 145.0
   * ```
   */
  get longitude(): number {
    return this.#longitude;
  }

  /**
   * The altitude \[m\] of the point.
   *
   * @example
   * ```
   * const point = new Point(35.0, 145.0, 5.0);
   * console.log(point.altitude);  // Prints 5.0
   * ```
   */
  get altitude(): number {
    return this.#altitude;
  }

  /**
   * Makes a {@link Point}.
   *
   * @param latitude The latitude \[deg\] of the point.
   * @param longitude The longitude \[deg\] of the point.
   * @param altitude The altitude \[m\] of the point.
   *
   * @example
   * ```
   * const point = new Point(35.0, 145.0, 5.0);
   *
   * console.log(point.latitude);  // Prints 35.0
   * console.log(point.longitude);  // Prints 145.0
   * console.log(point.altitude);  // Prints 5.0
   * ```
   */
  constructor(latitude: number, longitude: number, altitude: number = 0.0) {
    if (!isNumber(latitude)) {
      throw new TypeError("latitude");
    }
    if (!isNumber(longitude)) {
      throw new TypeError("longitude");
    }
    if (!isNumber(altitude)) {
      throw new TypeError("altitude");
    }

    this.#latitude = latitude;
    this.#longitude = longitude;
    this.#altitude = altitude;
  }

  /**
   * Makes a {@link Point} where a node, represented by meshcode `code`, locates.
   *
   * The resulting altitude is 0.0.
   *
   * @param meshcode The meshcode.
   * @example
   * ```
   * const point = Point.fromMeshcode(54401027);
   *
   * console.log(point.latitude);  // prints 36.1
   * console.log(point.longitude);  // prints 140.0875
   * console.log(point.altitude);  // prints 0.0
   * ```
   */
  static fromMeshcode = (meshcode: number): Point => {
    const node = MeshNode.fromMeshcode(meshcode);
    return this.fromMeshNode(node);
  };

  /**
   * Makes a {@link Point} where the `node` locates.
   *
   * The resulting altitude is 0.0.
   *
   * @param node
   * @example
   * ```
   * const node = MeshNode.fromMeshcode(54401027);
   * const point = Point.fromMeshNode(node);
   *
   * console.log(point.latitude);  // prints 36.1
   * console.log(point.longitude);  // prints 140.0875
   * console.log(point.altitude);  // prints 0.0
   * ```
   */
  static fromMeshNode = (node: MeshNode): Point => {
    if (!isMeshNode(node)) {
      throw new TypeError("node");
    }

    return new Point(
      node.latitude.toLatitude(),
      node.longitude.toLongitude(),
      0.0,
    );
  };

  /**
   * Returns a meshcode represents the nearest south-east mesh node of `this`.
   *
   * The result is independent of `altitude`.
   *
   * @param meshUnit The mesh unit
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 50.0);
   *
   * console.log(point.toMeshcode(1)); // prints 54401027
   * console.log(point.toMeshcode(5)); // prints 54401005
   * ```
   */
  toMeshcode = (meshUnit: MeshUnit): number => {
    return this.meshNode(meshUnit).toMeshcode();
  };

  /**
   * Returns the nearest south-east {@link MeshNode} of `this`
   *
   * The result is independent of `altitude`.
   *
   * @param meshUnit The mesh unit
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 5.0);
   *
   * // prints:
   * // MeshNode(
   * //   latitude=MeshCoord(first=54, second=1, third=2),
   * //   longitude=MeshCoord(first=40, second=0, third=7)
   * // )
   * console.log(point.meshNode(1));
   * // prints:
   * // MeshNode(
   * //   latitude=MeshCoord(first=54, second=1, third=0),
   * //   longitude=MeshCoord(first=40, second=0, third=5)
   * // )
   * console.log(point.meshNode(5));
   * ```
   */
  meshNode = (meshUnit: MeshUnit): MeshNode => {
    return MeshNode.fromPoint(this, meshUnit);
  };

  /**
   * Returns a {@link MeshCell} containing `this` in.
   *
   * The result is independent of `altitude`.
   *
   * @param meshUnit The mesh unit
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 5.0);
   *
   * // prints:
   * // MeshCell(
   * //   southWest=MeshNode(
   * //     latitude=MeshCoord(first=54, second=1, third=2),
   * //     longitude=MeshCoord(first=40, second=0, third=7)
   * //   ),
   * //   southEast=MeshNode(
   * //     latitude=MeshCoord(first=54, second=1, third=2),
   * //     longitude=MeshCoord(first=40, second=0, third=8)
   * //   ),
   * //   northWest=MeshNode(
   * //     latitude=MeshCoord(first=54, second=1, third=3),
   * //     longitude=MeshCoord(first=40, second=0, third=7)
   * //   ),
   * //   northEast=MeshNode(
   * //     latitude=MeshCoord(first=54, second=1, third=3),
   * //     longitude=MeshCoord(first=40, second=0, third=8)
   * //   ),
   * //   meshUnit=1
   * // )
   * console.log(point.meshCell(1));
   * ```
   */
  meshCell = (meshUnit: MeshUnit): MeshCell => {
    return MeshCell.fromPoint(this, meshUnit);
  };

  /**
   * Makes a normalized {@link Point} from `this`.
   *
   * The result has normalized `latitude`
   * and `longitude` which value -90.0 <= and <= 90.0,
   * and -180.0 <= and <= 180.0 respectively.
   *
   * @example
   * ```
   * const point = new Point(100.0, 200.0, 5.0).normalize();
   *
   * console.log(point.latitude);  // Prints 80.0
   * console.log(point.longitude);  // Prints -160.0
   * console.log(point.altitude);  // Prints 5.0
   * ```
   */
  normalize = (): Point => {
    return new Point(
      normalizeLatitude(this.#latitude),
      normalizeLongitude(this.#longitude),
      this.#altitude,
    );
  };

  /**
   * Make a {@link Point} by adding {@link Correction}.
   * @param corr
   * @example
   * ```
   * const point = new Point(0.0, 0.0, 0.0);
   *
   * // Prints Point(1.0, 1.0, 1.0)
   * console.log(point.add(new Correction(1.0, 1.0, 1.0)).toString());
   * // This is not in-place,
   * // prints Point(0.0, 0.0, 0.0)
   * console.log(point.toString());
   * ```
   */
  add = (corr: Correction): Point => {
    if (!isCorrection(corr)) {
      throw new TypeError("corr");
    }

    return new Point(
      this.#latitude + corr.latitude,
      this.#longitude + corr.longitude,
      this.#altitude + corr.altitude,
    );
  };

  /**
   * Returns `true` is `other` is equal to `this`.
   * @param other The other point.
   * @returns `ture` if `other` is equal to `this`.
   * @example
   * ```
   * const point = new Point(0., 0., 0.);
   * console.log(point.eq(new Point(0., 0., 0.)));  // Prints true
   * console.log(point.eq(new Point(1., 0., 0.)));  // Prints false
   * ```
   */
  eq = (other: unknown): other is Point => {
    return (
      other instanceof Point &&
      eqNumber(this.#latitude, other.latitude) &&
      eqNumber(this.#longitude, other.longitude) &&
      eqNumber(this.#altitude, other.altitude)
    );
  };

  /**
   * Returns `true` is `other` is not equal to `this`.
   * @param other The other {@link Point}
   * @returns
   * @example
   * ```
   * const point = new Point(0., 0., 0.);
   * console.log(point.ne(new Point(0., 0., 0.)))  // Prints false
   * console.log(point.ne(new Point(1., 0., 0.)))  // Prints true
   * ```
   */
  ne = (other: unknown): boolean => !this.eq(other);

  /** @override */
  toString = () => {
    return `Point(latitude=${this.#latitude}, longitude=${this.#longitude}, altitude=${this.#altitude})`;
  };
}
