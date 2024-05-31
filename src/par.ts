import { ParseParError } from "./error.js";
import { Parameter, Transformer } from "./transformer.js";
import { isNull } from "./internal.js";

/**
 * Format of par file
 *
 * @remark
 *
 * The format `"PatchJGD_HV"` is for the same event, e.g. `touhokutaiheiyouoki2011.par`
 * and `touhokutaiheiyouoki2011_h.par`.
 * We note that transformation works fine with such data,
 * and GIAJ does not distribute such file.
 *
 * It should fill by zero for the parameters of remaining transformation
 * in areas where it supports only part of the transformation as a result of composition
 * in order to support whole area of each parameter,
 * e.g. altitude of Chubu (<span lang="ja">中部地方</span>) on the composition of
 * `touhokutaiheiyouoki2011.par` and `touhokutaiheiyouoki2011_h.par`.
 *
 * The composite data should be in the same format as SemiDynaEXE.
 *
 * @example
 *
 * ```
 * const format: Format = "TKY2JGD";
 * console.log(unit(format))  // Prints 1
 * ```
 */
export type Format =
  | "TKY2JGD"
  | "PatchJGD"
  | "PatchJGD_H"
  | "PatchJGD_HV"
  | "HyokoRev"
  | "SemiDynaEXE"
  | "geonetF3"
  | "ITRF2014";

/**
 * Returns `true` when `format` is valid.
 *
 * @param x a test value
 * @returns `true` when `format` is valid.
 * @example
 * ```
 * console.log(isFormat("TKY2JGD"));  // prints ture
 * console.log(isFormat("SemiDynaEXE"));  // prints ture
 * console.log(isFormat("Hi!"));  // prints false
 * ```
 */
export const isFormat = (format: unknown): format is Format => {
  return (
    "TKY2JGD" === format ||
    "PatchJGD" === format ||
    "PatchJGD_H" === format ||
    "HyokoRev" === format ||
    "PatchJGD_HV" === format ||
    "SemiDynaEXE" === format ||
    "geonetF3" === format ||
    "ITRF2014" === format
  );
};

/** @internal */
const isMeshcodeString = (text: string): boolean => {
  return /^\d{8}$/.test(text);
};

/** @internal */
const isParameterString = (
  text: string,
): text is `${"" | "-"}${number}.${number}` => {
  return /^-?\d+\.\d+$/.test(text);
};

/** @internal */
type Range = {
  start: number;
  stop: number;
};

/** @internal */
const parse_meshcode = (
  line: string,
  start: number,
  stop: number,
  lineno: number,
): number => {
  let substring = line.substring(start, stop).trim();
  if (substring.length == stop - start) {
    substring = substring.trim();
    if (isMeshcodeString(substring)) {
      return Number.parseInt(substring);
    }
  }
  throw new ParseParError(`parse error: meshcode l${lineno}:${start}:${stop}`);
};

/** @internal */
const parse_parameter = (
  line: string,
  start: number,
  stop: number,
  name: string,
  lineno: number,
): number => {
  let substring = line.substring(start, stop);
  if (substring.length == stop - start) {
    substring = substring.trim();
    if (isParameterString(substring)) {
      return Number.parseFloat(substring);
    }
  }
  throw new ParseParError(`parse error: ${name} l${lineno}:${start}:${stop}`);
};

/** @internal */
export class Parser {
  #format: Format;
  #header: number;
  #meshcode: Range;
  #latitude: Range | null;
  #longitude: Range | null;
  #altitude: Range | null;

  constructor(
    format: Format,
    header: number,
    meshcode: Range,
    latitude: Range | null,
    longitude: Range | null,
    altitude: Range | null,
  ) {
    this.#format = format;
    this.#header = header;
    this.#meshcode = meshcode;
    this.#latitude = latitude;
    this.#longitude = longitude;
    this.#altitude = altitude;
  }

  static fromFormat = (format: Format) => {
    switch (format) {
      case "TKY2JGD":
        return new Parser(
          format,
          2,
          { start: 0, stop: 8 },
          { start: 9, stop: 18 },
          { start: 19, stop: 28 },
          null,
        );
      case "PatchJGD":
        return new Parser(
          format,
          16,
          { start: 0, stop: 8 },
          { start: 9, stop: 18 },
          { start: 19, stop: 28 },
          null,
        );
      case "PatchJGD_H":
        return new Parser(format, 16, { start: 0, stop: 8 }, null, null, {
          start: 9,
          stop: 18,
        });
      case "PatchJGD_HV":
      case "SemiDynaEXE":
        return new Parser(
          format,
          16,
          { start: 0, stop: 8 },
          { start: 9, stop: 18 },
          { start: 19, stop: 28 },
          { start: 29, stop: 38 },
        );
      case "HyokoRev":
        return new Parser(format, 16, { start: 0, stop: 8 }, null, null, {
          start: 12,
          stop: 21,
        });
      case "geonetF3":
      case "ITRF2014":
        return new Parser(
          format,
          18,
          { start: 0, stop: 8 },
          { start: 12, stop: 21 },
          { start: 22, stop: 31 },
          { start: 32, stop: 41 },
        );
    }
  };

  parse = (text: string, description?: string): Transformer => {
    // drop ending "\n"
    const lines = (
      text.endsWith("\n") ? text.substring(0, text.length - 1) : text
    ).split("\n");

    const temp = lines.slice(0, this.#header);
    if (temp.length != this.#header) {
      throw new ParseParError("header too short");
    }
    const header = description ?? temp.join("\n") + "\n";

    const m = new Map<number, Parameter>();

    let meshcode: number;
    let latitude: number;
    let longitude: number;
    let altitude: number;

    let lineno = this.#header + 1;
    const endOfLine = Math.max(
      this.#meshcode.stop,
      this.#latitude?.stop ?? Number.MIN_SAFE_INTEGER,
      this.#longitude?.stop ?? Number.MIN_SAFE_INTEGER,
      this.#altitude?.stop ?? Number.MIN_SAFE_INTEGER,
    );

    for (const line of lines.slice(this.#header, lines.length)) {
      if (endOfLine < line.length) {
        throw new ParseParError(`invalid line: l${lineno}`);
      }

      meshcode = parse_meshcode(
        line,
        this.#meshcode.start,
        this.#meshcode.stop,
        lineno,
      );

      latitude = isNull(this.#latitude)
        ? 0.0
        : parse_parameter(
            line,
            this.#latitude.start,
            this.#latitude.stop,
            "latitude",
            lineno,
          );

      longitude = isNull(this.#longitude)
        ? 0.0
        : parse_parameter(
            line,
            this.#longitude.start,
            this.#longitude.stop,
            "longitude",
            lineno,
          );

      altitude = isNull(this.#altitude)
        ? 0.0
        : parse_parameter(
            line,
            this.#altitude.start,
            this.#altitude.stop,
            "altitude",
            lineno,
          );

      m.set(meshcode, new Parameter(latitude, longitude, altitude));
      lineno += 1;
    }

    return new Transformer(this.#format, m, header);
  };
}
