import { ParseParError } from "./error.js";
import { Format, Parameter, Transformer } from "./transformer.js";
import { isNull } from "./internal.js";

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
  const substring = line.substring(start, stop).trim();
  if (isMeshcodeString(substring)) {
    return Number.parseInt(substring);
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
  const substring = line.substring(start, stop).trim();
  if (isParameterString(substring)) {
    return Number.parseFloat(substring);
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
    const lines = text.split("\n");

    const header = lines.slice(0, this.#header).join("\n");

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

    return new Transformer(this.#format, m, description ?? header);
  };
}
