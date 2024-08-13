import { describe, expect, test } from "@jest/globals";
import { Parameter, Transformer, Correction } from "./transformer.js";
import { Point } from "./point.js";
import { ParameterNotFoundError, PointError } from "./error.js";

describe("Parameter", () => {
  test("type check", () => {
    // @ts-expect-error type test
    expect(() => new Parameter(null, 2, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Parameter(1, null, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Parameter(1, null, 3)).toThrow(TypeError);
  });

  test("eq", () => {
    const NAN = Number.NaN;

    expect(new Parameter(1, 2, 3).eq(new Parameter(1, 2, 3))).toBe(true);

    expect(new Parameter(NAN, 2, 3).eq(new Parameter(NAN, 2, 3))).toBe(true);
    expect(new Parameter(1, NAN, 3).eq(new Parameter(1, NAN, 3))).toBe(true);
    expect(new Parameter(1, 2, NAN).eq(new Parameter(1, 2, NAN))).toBe(true);

    expect(new Parameter(NAN, 2, 3).eq(new Parameter(1, 2, 3))).toBe(false);
    expect(new Parameter(1, NAN, 3).eq(new Parameter(1, 2, 3))).toBe(false);
    expect(new Parameter(1, 2, NAN).eq(new Parameter(1, 2, 3))).toBe(false);
  });
});

describe("Correction", () => {
  test("type check", () => {
    // @ts-expect-error type test
    expect(() => new Correction(null, 2, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Correction(1, null, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Correction(1, null, 3)).toThrow(TypeError);
  });
});

describe("Transformer", () => {
  test("type check", () => {
    // constructor
    // @ts-expect-error type test
    expect(() => new Transformer(null, new Map())).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Transformer("TKY2JGD", null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Transformer("TKY2JGD", new Map(), null)).toThrow(
      TypeError,
    );

    // methods
    const tf = new Transformer("SemiDynaEXE", new Map());

    const p = new Point(36.103774791666666, 140.08785504166664, 0.0);
    // @ts-expect-error type test
    expect(() => tf.transform(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.transform(p, null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.forward(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.backward(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.backwardSafe(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.forwardCorrection(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.backwardCorrection(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => tf.backwardSafeCorrection(null)).toThrow(TypeError);
  });

  test("error", () => {
    const tf = new Transformer("TKY2JGD", new Map());
    expect(() => tf.forward(new Point(-1, 0, 0))).toThrow(PointError);
    expect(() => tf.forward(new Point(0, 100, 0))).toThrow(
      ParameterNotFoundError,
    );
    expect(() => tf.backward(new Point(-1, 0, 0))).toThrow(PointError);
    expect(() => tf.backward(new Point(2, 100, 0))).toThrow(
      ParameterNotFoundError,
    );
  });

  test("TKY2JGD web", () => {
    const tf = new Transformer(
      "TKY2JGD",
      new Map([
        // forward
        [54401027, new Parameter(11.49105, -11.80078, 0.0)],
        [54401037, new Parameter(11.48732, -11.80198, 0.0)],
        [54401028, new Parameter(11.49096, -11.80476, 0.0)],
        [54401038, new Parameter(11.48769, -11.80555, 0.0)],
        // backward
        [54401047, new Parameter(11.48373, -11.80318, 0.0)],
        [54401048, new Parameter(11.48438, -11.80689, 0.0)],
      ]),
    );

    let origin = new Point(36.103774791666666, 140.08785504166664, 0.0);
    let actual = tf.forward(origin);
    expect(actual.latitude).toBeCloseTo(36.106966281, 0.00000001);
    expect(actual.longitude).toBeCloseTo(140.084576867, 0.00000001);
    expect(actual.altitude).toBe(0.0);

    origin = new Point(36.10696628160147, 140.08457686629436, 0.0);
    actual = tf.backwardCompat(origin);
    expect(actual.latitude).toBeCloseTo(36.103774792, 0.00000001);
    expect(actual.longitude).toBeCloseTo(140.087855042, 0.00000001);
    expect(actual.altitude).toBe(0.0);
  });

  test("PatchJGD web", () => {
    const tf = new Transformer(
      "PatchJGD",
      new Map([
        // forward
        [57413454, new Parameter(-0.05984, 0.22393, -1.25445)],
        [57413464, new Parameter(-0.06011, 0.22417, -1.24845)],
        [57413455, new Parameter(-0.0604, 0.2252, -1.29)],
        [57413465, new Parameter(-0.06064, 0.22523, -1.27667)],
        // backward
        [57413474, new Parameter(-0.06037, 0.22424, -0.35308)],
        [57413475, new Parameter(-0.06089, 0.22524, 0.0)],
      ]),
    );

    let origin = new Point(38.2985120586605, 141.5559006163195, 0);
    let actual = tf.forward(origin);
    expect(actual.latitude).toBeCloseTo(38.298495306, 0.00000001);
    expect(actual.longitude).toBeCloseTo(141.555963019, 0.00000001);
    expect(actual.altitude).toBeCloseTo(-1.263, 0.001);

    origin = new Point(38.29849530463122, 141.55596301776936, 0.0);
    actual = tf.backwardCompat(origin);
    expect(actual.latitude).toBeCloseTo(38.298512058, 0.00000001);
    expect(actual.longitude).toBeCloseTo(141.555900614, 0.00000001);
    expect(actual.altitude).toBeCloseTo(1.264, 0.001);
  });

  test("SemiDynaEXE web", () => {
    const tf = new Transformer(
      "SemiDynaEXE",
      new Map([
        [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
        [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
        [54401100, new Parameter(-0.00663, 0.01492, 0.10374)],
        [54401150, new Parameter(-0.00664, 0.01506, 0.10087)],
      ]),
    );

    let origin = new Point(36.103774791666666, 140.08785504166664, 0);
    let actual = tf.forward(origin);
    expect(actual.latitude).toBeCloseTo(36.103773019, 0.00000001);
    expect(actual.longitude).toBeCloseTo(140.087859244, 0.00000001);
    expect(actual.altitude).toBeCloseTo(0.096, 0.001);

    origin = new Point(36.10377301875336, 140.08785924400115, 0);
    actual = tf.backwardCompat(origin);
    expect(actual.latitude).toBeCloseTo(36.103774792, 0.00000001);
    expect(actual.longitude).toBeCloseTo(140.087855042, 0.00000001);
    expect(actual.altitude).toBeCloseTo(-0.096, 0.001);
  });

  test("SemiDynaEXE exact", () => {
    const tf = new Transformer(
      "SemiDynaEXE",
      new Map([
        [54401005, new Parameter(-0.00622, 0.01516, 0.0946)],
        [54401055, new Parameter(-0.0062, 0.01529, 0.08972)],
        [54401100, new Parameter(-0.00663, 0.01492, 0.10374)],
        [54401150, new Parameter(-0.00664, 0.01506, 0.10087)],
      ]),
    );

    const origin = new Point(36.103774791666666, 140.08785504166664, 0.0);
    let actual = tf.forward(origin);
    expect(actual.latitude).toBeCloseTo(36.10377301875335, 0.0000000000001);
    expect(actual.longitude).toBeCloseTo(140.08785924400115, 0.0000000000001);
    expect(actual.altitude).toBeCloseTo(0.09631385775572238, 0.0000000000001);

    actual = tf.backward(origin);
    expect(actual.latitude).toBeCloseTo(36.10377479166668, 0.0000000000001);
    expect(actual.longitude).toBeCloseTo(140.08785504166664, 0.0000000000001);
    expect(actual.altitude).toBeCloseTo(
      // eslint-disable-next-line no-loss-of-precision
      -4.2175864502150125955e-10,
      0.0000000000001,
    );
  });
});
