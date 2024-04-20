import { describe, expect, test } from "@jest/globals";
import { Parser, isFormat } from "./par.js";

describe("isFormat", () => {
  test("isFormat", () => {
    expect(isFormat("TKY2JGD")).toBe(true);
    expect(isFormat("SemiDynaEXE")).toBe(true);

    expect(isFormat(-1)).toBe(false);
    expect(isFormat("Hi!")).toBe(false);
    expect(isFormat(null)).toBe(false);
  });
});

describe("Parser", () => {
  test("TKY2JGD", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    const tf = parser.parse("\n\n12345678   0.00001   0.00002");

    expect(tf.description).toBe("\n");
    expect(tf.meshUnit()).toBe(1);
    tf.parameter.forEach((value, key) => {
      expect(key).toBe(12345678);
      expect(value.latitude).toBeCloseTo(0.00001);
      expect(value.longitude).toBeCloseTo(0.00002);
      expect(value.altitude).toBeCloseTo(0.0);
    });
  });
});
