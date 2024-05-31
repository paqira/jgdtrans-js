import { describe, expect, test } from "@jest/globals";
import { Parser, isFormat } from "./par.js";
import { ParseParError } from "./error.js";

describe("isFormat", () => {
  test("isFormat", () => {
    expect(isFormat("TKY2JGD")).toBe(true);
    expect(isFormat("SemiDynaEXE")).toBe(true);

    expect(isFormat(-1)).toBe(false);
    expect(isFormat("Hi!")).toBe(false);
    expect(isFormat(null)).toBe(false);
  });
});

describe("Parser error", () => {
  test("less header", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    expect(() => parser.parse("\n")).toThrow(ParseParError);
  });

  test("invalid value", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    expect(() => parser.parse("\n\n1234567a   0.00001   0.00002")).toThrow(
      ParseParError,
    );
    expect(() => parser.parse("\n\n12345678   0.0000a   0.00002")).toThrow(
      ParseParError,
    );
    expect(() => parser.parse("\n\n12345678   0.00001   0.0000a")).toThrow(
      ParseParError,
    );
  });

  test("less value line", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    expect(() => parser.parse("\n\n1234567")).toThrow(ParseParError);
    expect(() => parser.parse("\n\n12345678   0.0000")).toThrow(ParseParError);
    expect(() => parser.parse("\n\n12345678   0.00001   0.0000")).toThrow(
      ParseParError,
    );
  });
});

describe("Parser", () => {
  test("TKY2JGD simple", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    const tf = parser.parse("\n\n12345678   0.00001   0.00002");

    expect(tf.description).toBe("\n\n");
    expect(tf.meshUnit()).toBe(1);
    tf.parameter.forEach((value, key) => {
      expect(key).toBe(12345678);
      expect(value.latitude).toBeCloseTo(0.00001);
      expect(value.longitude).toBeCloseTo(0.00002);
      expect(value.altitude).toBeCloseTo(0.0);
    });
  });

  test("TKY2JGD ends with newline", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    const tf = parser.parse("\n\n12345678   0.00001   0.00002\n");

    expect(tf.description).toBe("\n\n");
    expect(tf.meshUnit()).toBe(1);
    tf.parameter.forEach((value, key) => {
      expect(key).toBe(12345678);
      expect(value.latitude).toBeCloseTo(0.00001);
      expect(value.longitude).toBeCloseTo(0.00002);
      expect(value.altitude).toBeCloseTo(0.0);
    });
  });

  test("TKY2JGD multi newline", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    const tf = parser.parse(
      "\n\n12345678   0.00001   0.00002\n10000000 -10.00001 -10.00002",
    );

    expect(tf.description).toBe("\n\n");
    expect(tf.meshUnit()).toBe(1);
    tf.parameter.forEach((value, key) => {
      if (key == 12345678) {
        expect(key).toBe(12345678);
        expect(value.latitude).toBeCloseTo(0.00001);
        expect(value.longitude).toBeCloseTo(0.00002);
        expect(value.altitude).toBeCloseTo(0.0);
      } else if (key == 10000000) {
        expect(key).toBe(10000000);
        expect(value.latitude).toBeCloseTo(-10.00001);
        expect(value.longitude).toBeCloseTo(-10.00002);
        expect(value.altitude).toBeCloseTo(0.0);
      }
    });
  });

  test("TKY2JGD desctiption", () => {
    const parser = Parser.fromFormat("TKY2JGD");
    const tf = parser.parse("\n\n12345678   0.00001   0.00002\n", "hi!");

    expect(tf.description).toBe("hi!");
    expect(tf.meshUnit()).toBe(1);
    tf.parameter.forEach((value, key) => {
      expect(key).toBe(12345678);
      expect(value.latitude).toBeCloseTo(0.00001);
      expect(value.longitude).toBeCloseTo(0.00002);
      expect(value.altitude).toBeCloseTo(0.0);
    });
  });
});
