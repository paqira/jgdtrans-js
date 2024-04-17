import { describe, expect, test } from "@jest/globals";
import { isOddBits, nextUp } from "./utils.js";

describe("nextUp", () => {
  test("nextUp", () => {
    const MIN_VALUE = Math.pow(2, -1022);

    expect(nextUp(Number.NaN)).toBe(Number.NaN);
    expect(nextUp(-Number.NaN)).toBe(-Number.NaN);
    expect(nextUp(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
    expect(nextUp(Number.NEGATIVE_INFINITY)).toBe(-Number.MAX_VALUE);
    expect(nextUp(Number.MAX_VALUE)).toBe(Number.POSITIVE_INFINITY);
    expect(nextUp(-Number.MAX_VALUE)).toBe(-1.7976931348623155e308);
    expect(nextUp(1.0)).toBe(1.0000000000000002);
    expect(nextUp(-1.0)).toBe(-0.9999999999999999);
    expect(nextUp(MIN_VALUE)).toBe(+2.225073858507202e-308);
    expect(nextUp(-MIN_VALUE)).toBe(-2.225073858507201e-308);
    expect(nextUp(0.0)).toBe(Number.MIN_VALUE);
    expect(nextUp(-0.0)).toBe(Number.MIN_VALUE);
  });
});

describe("isOddBits", () => {
  test("isOddBits", () => {
    const view = new DataView(new ArrayBuffer(8));

    view.setFloat64(0, 0.0, false);
    expect(isOddBits(view.getFloat64(0, false))).toBe(false);

    view.setUint8(7, 0);
    expect(isOddBits(view.getFloat64(0, false))).toBe(false);

    view.setUint8(7, 1);
    expect(isOddBits(view.getFloat64(0, false))).toBe(true);
  });
});
