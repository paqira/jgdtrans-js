import { OverflowError, CellError, UnitError, ValueError } from "./error.js";
import { Point } from "./point.js";
import {
  isFirst,
  isMeshCoord,
  isMeshNode,
  isMeshUnit,
  isNumber,
  isOddBits,
  isPoint,
  isSecond,
  isThird,
  nextUp,
} from "./internal.js";

/** The first digits of {@link MeshCoord}, `0` to `99`. */
export type First =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99;
/** The second digit of {@link MeshCoord}, `0` to `7`. */
export type Second = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** The third digit of {@link MeshCoord}, `0` to `9`. */
export type Third = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * The mesh unit, or approximate length of cell's edge.
 *
 * `1` for `1` [km] and `5` for `5` [km].
 */
export type MeshUnit = 1 | 5;

/**
 * Represents mesh coordinate, namely, discrete latitude and/or longitude.
 *
 * This supports total ordering, and non-negative latitude and/or longitude only.
 *
 * The coordinate has three digits, `first`, `second` and `third`, the
 * `first` values `0` to `9`, the `second` does `0` to `7` and the
 * `third` does `0` to `99` inclusive.
 *
 * We note that the third digit takes either `0` or `5` only on the mesh with {@link MeshUnit}.
 *
 * @example
 *
 * ```
 * const coord = new MeshCoord(1, 2, 3);
 *
 * console.log(coord.first);  // Prints 1
 * console.log(coord.second);  // Prints 2
 * console.log(coord.third);  // Prints 3
 *
 * // Prints MeshCoord(first=1, second=2, third=3)
 * console.log(coord.toString());
 * ```
 */
export class MeshCoord {
  #first: First;
  #second: Second;
  #third: Third;

  /**
   * The first digit of `this`, `0` to `99`.
   * @example
   * ```
   * const coord = new MeshCoord(1, 2, 3);
   * console.log(coord.first);  // Prints 1
   * ```
   */
  get first(): First {
    return this.#first;
  }

  /**
   * The second digit of `this`, `0` to `7`.
   * @example
   * ```
   * const coord = new MeshCoord(1, 2, 3);
   * console.log(coord.second);  // Prints 2
   * ```
   */
  get second(): Second {
    return this.#second;
  }

  /**
   * The third digit of `this`, `0` to `9`.
   * @example
   * ```
   * const coord = new MeshCoord(1, 2, 3);
   * console.log(coord.third);  // Prints 3
   * ```
   */
  get third(): Third {
    return this.#third;
  }

  /** Smallest `first` value. */
  static get FIRST_MIN(): 0 {
    return 0;
  }

  /** Largest `first` value. */
  static get FIRST_MAX(): 99 {
    return 99;
  }

  /** Smallest `second` value. */
  static get SECOND_MIN(): 0 {
    return 0;
  }

  /** Largest `second` value. */
  static get SECOND_MAX(): 7 {
    return 7;
  }
  /** Smallest `third` value. */
  static get THIRD_MIN(): 0 {
    return 0;
  }

  /** Largest `third` value. */
  static get THIRD_MAX(): 9 {
    return 9;
  }

  /**
   * Makes a {@link MeshCoord}.
   * @example
   * ```
   * const coord = new MeshCoord(1, 2, 3);
   * console.log(coord.first);  // Prints 1
   * console.log(coord.second);  // Prints 2
   * console.log(coord.third);  // Prints 3
   * ```
   *
   * @see {@link MeshCoord.first}
   * @see {@link MeshCoord.second}
   * @see {@link MeshCoord.third}
   */
  constructor(first: First, second: Second, third: Third) {
    if (!isNumber(first)) {
      throw new TypeError("first");
    } else if (!Number.isSafeInteger(first) || !isFirst(first)) {
      throw new ValueError("first");
    } else if (!isNumber(second)) {
      throw new TypeError("second");
    } else if (!Number.isSafeInteger(second) || !isSecond(second)) {
      throw new ValueError("second");
    } else if (!isNumber(third)) {
      throw new TypeError("third");
    } else if (!Number.isSafeInteger(third) || !isThird(third)) {
      throw new ValueError("third");
    }

    this.#first = first;
    this.#second = second;
    this.#third = third;
  }

  /**
   * Returns `true` if `this` is compatible to the `meshUnit`.
   * @param meshUnit the mesh unit, `1` or `5`
   * @returns `true` if `this` is compatible to the `meshUnit`
   * @example
   * ```
   * const coord = new MeshCoord(1, 2, 3);
   * console.log(coord.isMeshUnit(1));  // Prints true
   * console.log(coord.isMeshUnit(5));  // Prints false
   * ```
   */
  isMeshUnit = (meshUnit: MeshUnit): boolean => {
    if (!Number.isSafeInteger(meshUnit)) {
      throw new TypeError("meshUnit");
    }

    switch (meshUnit) {
      case 1:
        return true;
      case 5:
        return this.third % meshUnit == 0;
      default:
        throw new ValueError("meshUnit");
    }
  };

  static #fromDegree = (degree: number, meshUnit: MeshUnit): MeshCoord => {
    const integer = Math.floor(degree);

    const first = (integer % 100) as First;
    const second = (Math.floor(8.0 * degree) - 8 * integer) as Second;
    const third = (Math.floor(80.0 * degree) -
      80 * integer -
      10 * second) as Third;

    // Callee checks unit is not null
    switch (meshUnit) {
      case 1:
        return new MeshCoord(first, second, third);
      case 5:
        return new MeshCoord(first, second, third < 5 ? 0 : 5);
    }
  };

  /**
   * Makes the greatest {@link MeshCoord} instance less than the latitude with `meshUnit`.
   * @example
   * ```
   * let coord = MeshCoord.fromLatitude(36.103774791666666, 1);
   * // Prints MeshCoord(first=54, second=1, third=2)
   * console.log(coord.toString());
   *
   * let coord = MeshCoord.fromLatitude(36.103774791666666, 5);
   * // Prints MeshCoord(first=54, second=1, third=0)
   * console.log(coord.toString());
   * ```
   *
   * @param degree the latitude [deg].
   * @param meshUnit the mesh unit, `1` or `5`.
   */
  static fromLatitude = (degree: number, meshUnit: MeshUnit): MeshCoord => {
    if (!isNumber(degree)) {
      throw new TypeError("degree");
    } else if (!Number.isSafeInteger(meshUnit)) {
      throw new TypeError("meshUnit");
    } else if (!isMeshUnit(meshUnit)) {
      throw new ValueError("meshUnit");
    }

    let value = (3.0 * degree) / 2.0;
    if (isOddBits(degree)) {
      value = nextUp(value);
    }

    if (value < 0.0 || 100.0 <= value) {
      throw new ValueError("degree (latitude)");
    }

    return MeshCoord.#fromDegree(value, meshUnit);
  };

  /**
   * Makes the greatest {@link MeshCoord} instance less than the longitude with `meshUnit`.
   * @example
   * ```
   * let coord = MeshCoord.fromLongitude(140.08785504166664, 1);
   * // Prints MeshCoord(first=40, second=0, third=7)
   * console.log(coord.toString());
   *
   * let coord = MeshCoord.fromLongitude(140.08785504166664, 5);
   * // Prints MeshCoord(first=40, second=0, third=5)
   * console.log(coord).toString();
   * ```
   *
   * @param degree The longitude [deg].
   * @param meshUnit The mesh unit, `1` or `5`.
   * @returns
   */
  static fromLongitude = (degree: number, meshUnit: MeshUnit): MeshCoord => {
    if (!isNumber(degree)) {
      throw new TypeError("degree");
    } else if (!Number.isSafeInteger(meshUnit)) {
      throw new TypeError("meshUnit");
    } else if (!isMeshUnit(meshUnit)) {
      throw new ValueError("meshUnit");
    } else if (degree < 100.0 || 180.0 < degree) {
      throw new ValueError("degree (longitude)");
    }

    return MeshCoord.#fromDegree(degree, meshUnit);
  };

  #toDegree = (): number => {
    return this.#first + this.#second / 8.0 + this.#third / 80.0;
  };

  /**
   * Returns the latitude that `this` converts into.
   * @example
   * ```
   * const latitude = 36.103774791666666;
   *
   * let coord = MeshCoord.fromLatitude(latitude, 1);
   * // Prints 36.1
   * console.log(coord.toLatitude());
   *
   * let coord = MeshCoord.ofLatitude(latitude, 5);
   * // Prints 36.083333333333336
   * console.log(coord.toLatitude());
   * ```
   *
   * @returns The latitude [deg].
   */
  toLatitude = (): number => {
    return (2.0 * this.#toDegree()) / 3.0;
  };

  /**
   * Returns the longitude that `this` converts into.
   * @example
   * ```
   * const longitude = 140.08785504166664;
   *
   * let coord = MeshCoord.fromLongitude(longitude, 1);
   * // Prints 140.0875
   * console.log(coord.toLongitude());
   *
   * let coord = MeshCoord.fromLongitude(longitude, 5);
   * // Prints 140.0625
   * console.log(coord.toLongitude());
   * ```
   *
   * @returns The longitude [deg].
   */
  toLongitude = (): number => {
    return 100.0 + this.#toDegree();
  };

  /**
   * Returns the smallest {@link MeshCoord} instance greater than `this`.
   * @example
   * ```
   * // Prints MeshCoord(first=0, second=0, third=1)
   * console.log(new MeshCoord(0, 0, 0).nextUp(1));
   * // Prints MeshCoord(first=0, second=1, third=0)
   * console.log(new MeshCoord(0, 0, 9).nextUp(1));
   * // Prints MeshCoord(first=1, second=0, third=0)
   * console.log(new MeshCoord(0, 7, 9).nextUp(1));
   *
   * // Prints MeshCoord(first=0, second=0, third=5)
   * console.log(new MeshCoord(0, 0, 0).nextUp(5));
   * // Prints MeshCoord(first=0, second=1, third=0)
   * console.log(new MeshCoord(0, 0, 5).nextUp(5));
   * // Prints MeshCoord(first=1, second=0, third=0)
   * console.log(new MeshCoord(0, 7, 5).nextUp(5));
   * ```
   *
   * @param meshUnit The mesh unit, `1` or `5`.
   * @returns The next up {@link MeshCoord}.
   */
  nextUp = (meshUnit: MeshUnit): MeshCoord => {
    if (!this.isMeshUnit(meshUnit)) {
      throw new UnitError("meshUnit");
    }

    const bound = meshUnit === 1 ? 9 : 5;

    if (this.#third === bound) {
      if (this.#second === MeshCoord.SECOND_MAX) {
        if (this.#first === MeshCoord.FIRST_MAX) {
          throw new OverflowError("nextUp");
        }
        return new MeshCoord(
          (this.#first + 1) as First,
          MeshCoord.SECOND_MIN,
          MeshCoord.THIRD_MIN,
        );
      }
      return new MeshCoord(
        this.#first,
        (this.#second + 1) as Second,
        MeshCoord.THIRD_MIN,
      );
    }
    return new MeshCoord(
      this.#first,
      this.#second,
      (this.#third + meshUnit) as Third,
    );
  };

  /**
   * Returns the greatest {@link MeshCoord} instance less than `this`.
   * @example
   * ```
   * // Prints MeshCoord(first=0, second=0, third=0)
   * console.log(new MeshCoord(0, 0, 1).nextDown(1));
   * // Prints MeshCoord(first=0, second=0, third=9)
   * console.log(new MeshCoord(0, 1, 0).nextDown(1));
   * // Prints MeshCoord(first=0, second=7, third=9)
   * console.log(new MeshCoord(1, 0, 0).nextDown(1));
   *
   * // Prints MeshCoord(first=0, second=0, third=0)
   * console.log(new MeshCoord(0, 0, 5).nextDown(5));
   * // Prints MeshCoord(first=0, second=0, third=5)
   * console.log(new MeshCoord(0, 1, 0).nextDown(5));
   * // Prints MeshCoord(first=0, second=7, third=5)
   * console.log(new MeshCoord(1, 0, 0).nextDown(5));
   * ```
   *
   * @param meshUnit The mesh unit, `1` or `5`.
   * @returns The next down {@link MeshCoord}.
   */
  nextDown = (meshUnit: MeshUnit): MeshCoord => {
    if (!this.isMeshUnit(meshUnit)) {
      throw new UnitError("meshUnit");
    }

    const bound = meshUnit === 1 ? 9 : 5;

    if (this.#third === MeshCoord.THIRD_MIN) {
      if (this.#second === MeshCoord.SECOND_MIN) {
        if (this.#first === MeshCoord.FIRST_MIN) {
          throw new OverflowError("nextDown");
        }
        return new MeshCoord(
          (this.#first - 1) as First,
          MeshCoord.SECOND_MAX,
          bound,
        );
      }
      return new MeshCoord(this.#first, (this.#second - 1) as Second, bound);
    }
    return new MeshCoord(
      this.#first,
      this.#second,
      (this.#third - meshUnit) as Third,
    );
  };

  /**
   * Returns `true` is `other` is equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const coord = new MeshCoord(0, 0, 1);
   * console.log(coord.eq(new MeshCoord(0, 0, 0)));  // Prints true
   * console.log(coord.eq(new MeshCoord(0, 0, 1)));  // Prints false
   * ```
   */
  eq = (other: unknown): other is MeshCoord => {
    return (
      other instanceof MeshCoord &&
      this.#first === other.first &&
      this.#second === other.second &&
      this.#third === other.third
    );
  };

  /**
   * Returns `true` is `other` is not equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const coord = new MeshCoord(0, 0, 0);
   * console.log(coord.ne(new MeshCoord(0, 0, 0)));  // Prints false
   * console.log(coord.ne(new MeshCoord(0, 0, 1)));  // Prints true
   * ```
   */
  ne = (other: unknown): boolean => !this.eq(other);

  /**
   * Tests `this` is less than `other`.
   * @param other
   * @returns
   * @example
   * ```
   * const coord = new MeshCoord(0, 0, 1);
   * console.log(coord.lt(new MeshCoord(0, 0, 0)));  // Prints false
   * console.log(coord.lt(new MeshCoord(0, 0, 1)));  // Prints false
   * console.log(coord.lt(new MeshCoord(0, 0, 2)));  // Prints true
   * ```
   */
  lt = (other: MeshCoord): boolean => {
    if (!isMeshCoord(other)) {
      throw new TypeError("other");
    }

    if (this.#first === other.first) {
      if (this.#second === other.second) {
        return this.#third < other.third;
      }
      return this.#second < other.second;
    }
    return this.first < other.first;
  };

  /**
   * Tests `this` is less than or equal to `other`.
   * @param other
   * @returns
   * @example
   * ```
   * const coord = new MeshCoord(0, 0, 1);
   * console.log(coord.le(new MeshCoord(0, 0, 0)));  // Prints false
   * console.log(coord.le(new MeshCoord(0, 0, 1)));  // Prints true
   * console.log(coord.le(new MeshCoord(0, 0, 2)));  // Prints true
   * ```
   */
  le = (other: MeshCoord): boolean => {
    if (!isMeshCoord(other)) {
      throw new TypeError("other");
    }

    if (this.#first === other.first) {
      if (this.#second === other.second) {
        return this.#third <= other.third;
      }
      return this.#second < other.second;
    }
    return this.#first < other.first;
  };

  /**
   * Tests `this` is greater than `other`.
   * @param other
   * @returns
   * @example
   * ```
   * const coord = new MeshCoord(0, 0, 1);
   * console.log(coord.gt(new MeshCoord(0, 0, 0)));  // Prints true
   * console.log(coord.gt(new MeshCoord(0, 0, 1)));  // Prints false
   * console.log(coord.gt(new MeshCoord(0, 0, 2)));  // Prints false
   * ```
   */
  gt = (other: MeshCoord): boolean => {
    if (!isMeshCoord(other)) {
      throw new TypeError("other");
    }

    if (this.#first == other.first) {
      if (this.#second == other.second) {
        return this.#third > other.third;
      }
      return this.#second > other.second;
    }
    return this.#first > other.first;
  };

  /**
   * Tests `this` is greater than or equal to `other`.
   * @param other
   * @returns
   * @example
   * ```
   * const coord = new MeshCoord(0, 0, 1);
   * console.log(coord.ge(new MeshCoord(0, 0, 0)));  // Prints true
   * console.log(coord.ge(new MeshCoord(0, 0, 1)));  // Prints true
   * console.log(coord.ge(new MeshCoord(0, 0, 2)));  // Prints false
   * ```
   */
  ge = (other: MeshCoord): boolean => {
    if (!isMeshCoord(other)) {
      throw new TypeError("other");
    }

    if (this.#first == other.first) {
      if (this.#second == other.second) {
        return this.#third >= other.third;
      }
      return this.#second > other.second;
    }
    return this.#first > other.first;
  };

  /**
   *
   * @example
   * ```
   * const coord = new MeshCoord(1, 2, 3);
   * // Prints "MeshCoord(first=1, second=2, third=3)"
   * console.log(coord.toString());
   * ```
   *
   * @override
   */
  toString = () => {
    return `MeshCoord(first=${this.#first}, second=${this.#second}, third=${this.#third})`;
  };
}

/**
 * Represents mesh node, a pair of the {@link MeshCoord} instances.
 *
 * We note that this supports non-negative latitude and longitude only, and `longitude`
 * satisfies `MeshCoord(0, 0, 0) <=` and `<= MeshCoord(80, 0, 0)`.
 *
 * @example
 *
 * ```
 * const point = new Point(36.10377479, 140.087855041);
 *
 * let node = MeshNode.ofPoint(point, 1);
 * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=2), longitude=MeshCoord(first=40, second=0, third=7))
 * console.log(node.toString());
 *
 * let node = MeshNode.ofPoint(point, 5);
 * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=0), longitude=MeshCoord(first=40, second=0, third=5))
 * console.log(node.toString());
 * ```
 */
export class MeshNode {
  #latitude: MeshCoord;
  #longitude: MeshCoord;

  /**
   * The latitude of {@link MeshNode}.
   * @example
   * ```
   * const node = new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7));
   * // Prints MeshCoord(first=54, second=1, third=2)
   * console.log(node.latitude.toString());
   * ```
   */
  get latitude(): MeshCoord {
    return this.#latitude;
  }

  /**
   * The longitude of {@link MeshNode}.
   * @example
   * ```
   * const node = new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7));
   * // Prints MeshCoord(first=40, second=0, third=7)
   * console.log(node.longitude.toString());
   * ```
   */
  get longitude(): MeshCoord {
    return this.#longitude;
  }

  //
  // consts
  //
  /** Smallest `latitude` value.
   * Equals to `MeshCoord(0, 0, 0)`.
   */
  static get LATITUDE_MIN(): MeshCoord {
    return new MeshCoord(0, 0, 0);
  }

  /** Largest `latitude` value.
   *
   * Equals to `MeshCoord(99, 7, 9)`.
   */
  static get LATITUDE_MAX(): MeshCoord {
    return new MeshCoord(99, 7, 9);
  }

  /** Smallest `longitude` value.
   *
   * Equals to `MeshCoord(0, 0, 0)`.
   */
  static get LONGITUDE_MIN(): MeshCoord {
    return new MeshCoord(0, 0, 0);
  }

  /** Largest `longitude` value.
   *
   * Equals to `MeshCoord(80, 0, 0)`.
   */
  static get LONGITUDE_MAX(): MeshCoord {
    return new MeshCoord(80, 0, 0);
  }

  /**
   * Returns `true` if `this` is compatible to the `meshUnit`.
   * @param meshUnit the mesh unit, `1` or `5`
   * @returns `true` if `this` is compatible to the `meshUnit`
   * @example
   * ```
   * const node = MeshNode.fromMeshcode(54401027);
   * console.log(node.isMeshUnit(1));  // Prints true
   * console.log(node.isMeshUnit(5));  // Prints false
   * ```
   */
  isMeshUnit = (meshUnit: MeshUnit): boolean => {
    return (
      this.#latitude.isMeshUnit(meshUnit) &&
      this.#longitude.isMeshUnit(meshUnit)
    );
  };

  /**
   * Makes a {@link MeshNode} instance.
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041);
   *
   * let node = MeshNode.ofPoint(point, 1);
   * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=2), longitude=MeshCoord(first=40, second=0, third=7))
   * console.log(node.toString());
   *
   * let node = MeshNode.ofPoint(point, 5);
   * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=0), longitude=MeshCoord(first=40, second=0, third=5))
   * console.log(node.toString());
   * ```
   *
   * @param latitude The mesh coord of latitude.
   * @param longitude The mesh coord of longitude.
   */
  constructor(latitude: MeshCoord, longitude: MeshCoord) {
    if (!isMeshCoord(latitude)) {
      throw new TypeError("latitude");
    } else if (!isMeshCoord(longitude)) {
      throw new TypeError("longitude");
    } else if (MeshNode.LONGITUDE_MAX.lt(longitude)) {
      throw new ValueError("longitude");
    }

    this.#latitude = latitude;
    this.#longitude = longitude;
  }

  /**
   * Makes a {@link MeshNode} obj represented by `meshcode`.
   * @example
   * ```
   * const node = MeshNode.fromMeshcode(54401027);
   * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=2), longitude=MeshCoord(first=40, second=0, third=7))
   * console.log(node.toString());
   * ```
   *
   * @param meshcode The meshcode.
   * @returns A {@link MeshNode} obj.
   */
  static fromMeshcode = (meshcode: number): MeshNode => {
    if (!Number.isSafeInteger(meshcode)) {
      throw new TypeError("meshcode");
    } else if (meshcode < 0 || 10000_00_00 <= meshcode) {
      throw new ValueError("meshcode");
    }

    let rest: number;

    const lat_first = Math.floor(meshcode / 100_00_00) as First;
    rest = meshcode % 100_00_00;
    const lng_first = Math.floor(rest / 100_00) as First;
    rest = rest % 100_00;

    const lat_second = Math.floor(rest / 10_00) as Second;
    rest = rest % 10_00;
    const lng_second = Math.floor(rest / 100) as Second;
    rest = rest % 100;

    const lat_third = Math.floor(rest / 10) as Third;
    const lng_third = (rest % 10) as Third;

    return new MeshNode(
      new MeshCoord(lat_first, lat_second, lat_third),
      new MeshCoord(lng_first, lng_second, lng_third),
    );
  };

  /**
   * Makes the nearest north-west {@link MeshNode} of `point`.
   *
   * @param point The point.
   * @param meshUnit The unit of the mesh, `1` or `5`.
   * @returns A {@link MeshNode} instance.
   * @example
   * ```
   * const point = new Point(36.103774791666666, 140.08785504166664, 10.0);
   *
   * let node = MeshNode.fromPoint(point, 1);
   * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=2), longitude=MeshCoord(first=40, second=0, thrid=7))
   * console.log(node.toString());
   *
   * let node = MeshNode.fromPoint(point, 5);
   * // Prints MeshNode(latitude=MeshCoord(first=54, second=1, third=0), longitude=MeshCoord(first=40, second=0, thrid=5))
   * console.log(node.toString());
   * ```
   */
  static fromPoint = (point: Point, meshUnit: MeshUnit): MeshNode => {
    if (!isPoint(point)) {
      throw new TypeError("point");
    }

    const latitude = MeshCoord.fromLatitude(point.latitude, meshUnit);
    const longitude = MeshCoord.fromLongitude(point.longitude, meshUnit);

    return new MeshNode(latitude, longitude);
  };

  /**
   * Returns a meshcode represents `this`.
   *
   * The result is up to 8 digits.
   *
   * @returns The meshcode.
   * @example
   * ```
   * const node = new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7));
   * console.log(node.toMeshcode());  // Prints 54401027
   * ```
   */
  toMeshcode = (): number => {
    return (
      (this.#latitude.first * 100 + this.#longitude.first) * 10_000 +
      (this.#latitude.second * 10 + this.#longitude.second) * 100 +
      (this.#latitude.third * 10 + this.#longitude.third)
    );
  };

  /**
   * Returns a {@link Point} (latitude and longitude) where `this` locates.
   * @returns The point.
   * @example
   * ```
   * const node = new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7));
   * // Prints Point(latitude=36.1, longitude=140.0875, altitude=0.0)
   * console.log(node.toPoint());
   * ```
   */
  toPoint = (): Point => {
    return Point.fromMeshNode(this);
  };

  /**
   * Returns `true` is `other` is equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const node = new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7));
   * // Prints true
   * console.log(node.eq(new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7))));
   * // Prints false
   * console.log(node.eq(new MeshNode(new MeshCoord(0, 0, 0), new MeshCoord(0, 0, 0))));
   * ```
   */
  eq = (other: unknown): other is MeshNode => {
    return (
      other instanceof MeshNode &&
      this.#latitude.eq(other.latitude) &&
      this.#longitude.eq(other.longitude)
    );
  };

  /**
   * Returns `true` is `other` is not equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const node = new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7));
   * // Prints false
   * console.log(node.ne(new MeshNode(new MeshCoord(54, 1, 2), new MeshCoord(40, 0, 7))));
   * // Prints true
   * console.log(node.ne(new MeshNode(new MeshCoord(0, 0, 0), new MeshCoord(0, 0, 0))));
   * ```
   */
  ne = (other: unknown): boolean => !this.eq(other);

  /** @override */
  toString = () => {
    return `MeshNode(latitude=${this.#latitude}, longitude=${this.#longitude})`;
  };
}

/**
 * Represents the unit mesh cell (mesh cell or cell shortly).
 *
 * This is a quadruplet of the mesh nodes (and mesh unit), and has no other {@link MeshNode} inside
 * `this` in the `meshUnit`.
 *
 * The cell is, roughly, a square with `meshUnit` [km] length edges.
 *
 * @example
 *
 * ```
 * const point = new Point(36.10377479, 140.087855041);
 *
 * const cell = MeshCell.ofPoint(point, 1);
 * // Prints true
 * console.log(cell.eq(
 *     MeshNode.ofMeshcode(54401027),
 *     MeshNode.ofMeshcode(54401028),
 *     MeshNode.ofMeshcode(54401037),
 *     MeshNode.ofMeshcode(54401038),
 *     1
 * ));
 * ```
 */
export class MeshCell {
  #southWest: MeshNode;
  #southEast: MeshNode;
  #northWest: MeshNode;
  #northEast: MeshNode;
  #meshUnit: MeshUnit;

  /**
   * Returns the south-east node of the cell.
   * @example
   * ```
   * const point = Point(36.10377479, 140.087855041, 10.0);
   *
   * const cell = MeshCell.ofPoint(point, 1);
   * // Prints true
   * console.log(cell.southEast.equals(MeshNode.ofMeshcode(54401028)));
   * ```
   */
  get southWest(): MeshNode {
    return this.#southWest;
  }

  /**
   * Returns the north-west node of the cell.
   * @example
   * ```
   * const point = Point(36.10377479, 140.087855041, 10.0);
   *
   * const cell = MeshCell.ofPoint(point, 1);
   * // Prints true
   * console.log(cell.northWest.eq(MeshNode.ofMeshcode(54401037)));
   * ```
   */
  get southEast(): MeshNode {
    return this.#southEast;
  }

  /**
   * Returns the north-east node of the cell.
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 10.0)
   *
   * const cell = MeshCell.ofPoint(point, 1);
   * // Prints true
   * console.log(cell.northWest.eq(MeshNode.ofMeshcode(54401037)));
   * ```
   */
  get northWest(): MeshNode {
    return this.#northWest;
  }

  /**
   * Returns the north-east node of the cell.
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 10.0);
   *
   * const cell = MeshCell.ofPoint(point, 1);
   * // Prints true
   * console.log(cell.northEast.equals(MeshNode.ofMeshcode(54401038)));
   * ```
   */
  get northEast(): MeshNode {
    return this.#northEast;
  }

  /**
   * Returns the mesh unit.
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 10.0);
   *
   * let cell = MeshCell.ofPoint(point, 1);
   * console.log(cell.meshUnit === 1);  // Prints true
   *
   * let cell = MeshCell.ofPoint(point, 5);
   * console.log(cell.meshUnit === 5);  // Prints true
   * ```
   */
  get meshUnit(): MeshUnit {
    return this.#meshUnit;
  }

  /**
   * Makes as {@link MeshCell}.
   * @param southWest
   * @param southEast
   * @param northWest
   * @param northEast
   * @param meshUnit
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041);
   *
   * const cell = MeshCell.ofPoint(point, 1);
   * // Prints true
   * console.log(cell.eq(
   *     MeshNode.ofMeshcode(54401027),
   *     MeshNode.ofMeshcode(54401028),
   *     MeshNode.ofMeshcode(54401037),
   *     MeshNode.ofMeshcode(54401038),
   *     1
   * ));
   * ```
   */
  constructor(
    southWest: MeshNode,
    southEast: MeshNode,
    northWest: MeshNode,
    northEast: MeshNode,
    meshUnit: MeshUnit,
  ) {
    if (!isMeshNode(southWest)) {
      throw new TypeError("southWest");
    } else if (!isMeshNode(southEast)) {
      throw new TypeError("southEast");
    } else if (!isMeshNode(northWest)) {
      throw new TypeError("northWest");
    } else if (!isMeshNode(northEast)) {
      throw new TypeError("northEast");
    }

    if (!southWest.isMeshUnit(meshUnit)) {
      throw new UnitError("southWest");
    } else if (!southEast.isMeshUnit(meshUnit)) {
      throw new UnitError("southEast");
    } else if (!northWest.isMeshUnit(meshUnit)) {
      throw new UnitError("northWest");
    } else if (!northEast.isMeshUnit(meshUnit)) {
      throw new UnitError("northEast");
    }

    const nextLatitude = southWest.latitude.nextUp(meshUnit);
    const nextLongitude = southWest.longitude.nextUp(meshUnit);
    if (
      northWest.latitude.ne(nextLatitude) ||
      northWest.longitude.ne(southWest.longitude)
    ) {
      throw new CellError();
    }
    if (
      southEast.latitude.ne(southWest.latitude) ||
      southEast.longitude.ne(nextLongitude)
    ) {
      throw new CellError();
    }
    if (
      northEast.latitude.ne(nextLatitude) ||
      northEast.longitude.ne(nextLongitude)
    ) {
      throw new CellError();
    }

    this.#southWest = southWest;
    this.#southEast = southEast;
    this.#northWest = northWest;
    this.#northEast = northEast;
    this.#meshUnit = meshUnit;
  }

  /**
   * Return the unit cell which has `node` as a south-east node.
   * @param meshcode The meshcode
   * @param meshUnit The unit of the mesh
   * @returns The meth cell
   * @example
   * ```
   * const cell = MeshCell.fromMeshcode(54401027, 1);
   * // Prints true
   * console.log(cell.eq(
   *     new MeshCell(
   *         MeshNode.ofMeshcode(54401027),
   *         MeshNode.ofMeshcode(54401028),
   *         MeshNode.ofMeshcode(54401037),
   *         MeshNode.ofMeshcode(54401038),
   *         1
   *     )
   * ));
   * ```
   */
  static fromMeshcode = (meshcode: number, meshUnit: MeshUnit): MeshCell => {
    const node = MeshNode.fromMeshcode(meshcode);
    return this.fromMeshNode(node, meshUnit);
  };

  /**
   * Return the unit cell which has `node` as a south-east node.
   * @param node The south-west mesh node of the resulting cell
   * @param meshUnit The unit of the mesh
   * @returns The meth cell
   * @example
   * ```
   * const cell = MeshCell.fromMeshNode(MeshNode.ofMeshcode(54401027), 1);
   * // Prints true
   * console.log(cell.eq(
   *     new MeshCell(
   *         MeshNode.ofMeshcode(54401027),
   *         MeshNode.ofMeshcode(54401028),
   *         MeshNode.ofMeshcode(54401037),
   *         MeshNode.ofMeshcode(54401038),
   *         1
   *     )
   * ));
   * ```
   */
  static fromMeshNode = (node: MeshNode, meshUnit: MeshUnit): MeshCell => {
    if (!isMeshNode(node)) {
      throw new TypeError("node");
    }

    const nextLatitude = node.latitude.nextUp(meshUnit);
    const nextLongitude = node.longitude.nextUp(meshUnit);

    const se = new MeshNode(node.latitude, nextLongitude);
    const nw = new MeshNode(nextLatitude, node.longitude);
    const ne = new MeshNode(nextLatitude, nextLongitude);

    return new MeshCell(node, se, nw, ne, meshUnit);
  };

  /**
   * Makes a {@link MeshCell} which contains the {@link Point}.
   *
   * We note that the result does not depend on {@link Point.altitude}.
   *
   * @param point The point
   * @param meshUnit The unit of the mesh
   * @returns The mesh cell
   * @see {@link Point.meshCell}
   * @example
   * ```
   * const point = new Point(36.10377479, 140.087855041, 10.0);
   *
   * let cell = MeshCell.fromPoint(point, 1);
   * console.log(cell.equals(
   *     new MeshCell(
   *         MeshNode.ofMeshcode(54401027),
   *         MeshNode.ofMeshcode(54401028),
   *         MeshNode.ofMeshcode(54401037),
   *         MeshNode.ofMeshcode(54401038),
   *         1
   *     )
   * ));
   *
   * let cell = MeshCell.fromPoint(point, 5);
   * console.log(cell.equals(
   *     new MeshCell(
   *         MeshNode.ofMeshcode(54401005),
   *         MeshNode.ofMeshcode(54401100),
   *         MeshNode.ofMeshcode(54401055),
   *         MeshNode.ofMeshcode(54401150),
   *         5
   *     )
   * ));
   * ```
   */
  static fromPoint = (point: Point, meshUnit: MeshUnit): MeshCell => {
    const meshNode = MeshNode.fromPoint(point, meshUnit);
    return this.fromMeshNode(meshNode, meshUnit);
  };

  /** @internal */
  position = (point: Point): [number, number] => {
    const latitude = point.latitude - this.#southWest.latitude.toLatitude();
    const longitude = point.longitude - this.#southWest.longitude.toLongitude();

    switch (this.#meshUnit) {
      case 1:
        return [80.0 * longitude, 120.0 * latitude];
      case 5:
        return [16.0 * longitude, 24.0 * latitude];
    }
  };

  /**
   * Returns `true` when `other` is equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const cell = MeshCell.fromMeshcode(54401027, 1);
   * // Prints true
   * console.log(cell.eq(MeshCell.fromMeshcode(54401027, 1)));
   * // Prints false
   * console.log(cell.eq(MeshCell.fromMeshcode(0, 1)));
   * ```
   */
  eq = (other: unknown): other is MeshCell => {
    return (
      other instanceof MeshCell &&
      this.#southWest.eq(other.southWest) &&
      this.#southEast.eq(other.southEast) &&
      this.#northWest.eq(other.northWest) &&
      this.#northEast.eq(other.northEast) &&
      this.#meshUnit === other.meshUnit
    );
  };

  /**
   * Returns `true` is `other` is not equal to `this`.
   * @param other
   * @returns
   * @example
   * ```
   * const cell = MeshCell.fromMeshcode(54401027, 1);
   * // Prints false
   * console.log(cell.ne(MeshCell.fromMeshcode(54401027, 1)));
   * // Prints true
   * console.log(cell.ne(MeshCell.fromMeshcode(0, 1)));
   * ```
   */
  ne = (other: unknown): boolean => !this.eq(other);

  /**
   * @override
   */
  toString = () => {
    return `MeshCell(southWest=${this.#southWest}, southEast=${this.#southEast}, northWest=${this.#northWest}, northEast=${this.#northEast}, unit=${this.#meshUnit})`;
  };
}
