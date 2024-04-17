// TODO: need better logic
import { Format, Parameter, Transformer } from "./transformer.js";

/** @internal */
const meshcodeRegex = /^\d{8}$/;
/** @internal */
const parameterRegex = /^[+-]?\d+\.\d+$/;

/** @internal */
const isMeshcodeString = (text: string): boolean => {
  return meshcodeRegex.test(text);
};

/** @internal */
const isParameterString = (
  text: string,
): text is `${"" | "-"}${number}.${number}` => {
  return parameterRegex.test(text);
};

/** @internal */
type Range = {
  start: number;
  stop: number;
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
    const lines = text.split("\n");

    const header = lines.slice(0, this.#header).join("\n");

    const m = new Map<number, Parameter>();

    let substring: string;
    let meshcode: number;
    let latitude: number;
    let longitude: number;
    let altitude: number;
    for (const line of lines.slice(this.#header, lines.length)) {
      if (10 < line.length) {
        // throw
      }

      substring = line
        .substring(this.#meshcode.start, this.#meshcode.stop)
        .trim();
      if (!isMeshcodeString(substring)) {
        // throw
      }
      meshcode = Number.parseInt(substring);

      if (this.#latitude != null) {
        substring = line
          .substring(this.#latitude.start, this.#latitude.stop)
          .trim();
        if (!isParameterString(substring)) {
          // throw
        }
        latitude = Number.parseFloat(substring);
      } else {
        latitude = 0.0;
      }

      if (this.#longitude != null) {
        substring = line
          .substring(this.#longitude.start, this.#longitude.stop)
          .trim();
        if (!isParameterString(substring)) {
          // throw
        }
        longitude = Number.parseFloat(substring);
      } else {
        longitude = 0.0;
      }

      if (this.#altitude != null) {
        substring = line
          .substring(this.#altitude.start, this.#altitude.stop)
          .trim();
        if (!isParameterString(substring)) {
          // throw
        }
        altitude = Number.parseFloat(substring);
      } else {
        altitude = 0.0;
      }

      m.set(meshcode, new Parameter(latitude, longitude, altitude));
    }

    return new Transformer(this.#format, m, description ?? header);
  };
}
