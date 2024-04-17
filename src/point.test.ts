import { describe, expect, test } from "@jest/globals";
import { Point } from "./point.js";

const toBePoint = (actual: Point, expected: Point) => {
  expect(actual.latitude).toBe(expected.latitude);
  expect(actual.longitude).toBe(expected.longitude);
  expect(actual.altitude).toBe(expected.altitude);
};

describe("Point", () => {
  test("type check", () => {
    // constructor
    // @ts-expect-error type test
    expect(() => new Point(null, 2, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Point(1, null, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new Point(1, null, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => Point.fromMeshcode(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => Point.fromMeshNode(null)).toThrow(TypeError);

    // methods
    const p = new Point(1, 2, 3);
    // @ts-expect-error type test
    expect(() => p.toMeshcode(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => p.meshNode(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => p.meshCell(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => p.add(null)).toThrow(TypeError);
  });

  test("normalize", () => {
    toBePoint(new Point(0, 0, 0).normalize(), new Point(0, 0, 0));
    toBePoint(new Point(0.0, 0.0, 0.0).normalize(), new Point(0.0, 0.0, 0.0));
    toBePoint(new Point(-0.0, 0.0, 0.0).normalize(), new Point(-0.0, 0.0, 0.0));
    toBePoint(new Point(20.0, 0.0, 0.0).normalize(), new Point(20.0, 0.0, 0.0));
    toBePoint(
      new Point(-20.0, 0.0, 0.0).normalize(),
      new Point(-20.0, 0.0, 0.0),
    );
    toBePoint(new Point(360.0, 0.0, 0.0).normalize(), new Point(0.0, 0.0, 0.0));
    toBePoint(
      new Point(270.0, 0.0, 0.0).normalize(),
      new Point(-90.0, 0.0, 0.0),
    );
    toBePoint(new Point(180.0, 0.0, 0.0).normalize(), new Point(0.0, 0.0, 0.0));
    toBePoint(new Point(90.0, 0.0, 0.0).normalize(), new Point(90.0, 0.0, 0.0));
    toBePoint(
      new Point(-360.0, 0.0, 0.0).normalize(),
      new Point(-0.0, 0.0, 0.0),
    );
    toBePoint(
      new Point(-270.0, 0.0, 0.0).normalize(),
      new Point(90.0, 0.0, 0.0),
    );
    toBePoint(
      new Point(-180.0, 0.0, 0.0).normalize(),
      new Point(0.0, 0.0, 0.0),
    );
    //   toBePoint(
    //     new Point(-180.0, 0.0, 0.0).normalize(),
    //     new Point(-0.0, 0.0, 0.0)
    //   );
    toBePoint(
      new Point(-90.0, 0.0, 0.0).normalize(),
      new Point(-90.0, 0.0, 0.0),
    );
    toBePoint(new Point(380, 0.0, 0.0).normalize(), new Point(20, 0.0, 0.0));
    toBePoint(new Point(290, 0.0, 0.0).normalize(), new Point(-70, 0.0, 0.0));
    toBePoint(new Point(200, 0.0, 0.0).normalize(), new Point(-20, 0.0, 0.0));
    toBePoint(new Point(110, 0.0, 0.0).normalize(), new Point(70, 0.0, 0.0));
    toBePoint(new Point(-380, 0.0, 0.0).normalize(), new Point(-20, 0.0, 0.0));
    toBePoint(new Point(-290, 0.0, 0.0).normalize(), new Point(70, 0.0, 0.0));
    toBePoint(new Point(-200, 0.0, 0.0).normalize(), new Point(20, 0.0, 0.0));
    toBePoint(new Point(-110, 0.0, 0.0).normalize(), new Point(-70, 0.0, 0.0));

    toBePoint(new Point(0.0, 0.0, 0.0).normalize(), new Point(0.0, 0.0, 0.0));
    toBePoint(new Point(0.0, -0.0, 0.0).normalize(), new Point(0.0, -0.0, 0.0));
    toBePoint(new Point(0.0, 20.0, 0.0).normalize(), new Point(0.0, 20.0, 0.0));
    toBePoint(
      new Point(0.0, -20.0, 0.0).normalize(),
      new Point(0.0, -20.0, 0.0),
    );
    toBePoint(new Point(0.0, 360.0, 0.0).normalize(), new Point(0.0, 0.0, 0.0));
    toBePoint(
      new Point(0.0, 270.0, 0.0).normalize(),
      new Point(0.0, -90.0, 0.0),
    );
    toBePoint(
      new Point(0.0, 180.0, 0.0).normalize(),
      new Point(0.0, 180.0, 0.0),
    );
    toBePoint(new Point(0.0, 90.0, 0.0).normalize(), new Point(0.0, 90.0, 0.0));
    toBePoint(
      new Point(0.0, -360.0, 0.0).normalize(),
      new Point(0.0, -0.0, 0.0),
    );
    toBePoint(
      new Point(0.0, -270.0, 0.0).normalize(),
      new Point(0.0, 90.0, 0.0),
    );
    toBePoint(
      new Point(0.0, -180.0, 0.0).normalize(),
      new Point(0.0, -180.0, 0.0),
    );
    toBePoint(
      new Point(0.0, -90.0, 0.0).normalize(),
      new Point(0.0, -90.0, 0.0),
    );
    toBePoint(new Point(0.0, 380, 0.0).normalize(), new Point(0.0, 20.0, 0.0));
    toBePoint(new Point(0.0, 290, 0.0).normalize(), new Point(0.0, -70.0, 0.0));
    toBePoint(
      new Point(0.0, 200, 0.0).normalize(),
      new Point(0.0, -160.0, 0.0),
    );
    toBePoint(new Point(0.0, 110, 0.0).normalize(), new Point(0.0, 110.0, 0.0));
    toBePoint(
      new Point(0.0, -380, 0.0).normalize(),
      new Point(0.0, -20.0, 0.0),
    );
    toBePoint(new Point(0.0, -290, 0.0).normalize(), new Point(0.0, 70.0, 0.0));
    toBePoint(
      new Point(0.0, -200, 0.0).normalize(),
      new Point(0.0, 160.0, 0.0),
    );
    toBePoint(
      new Point(0.0, -110, 0.0).normalize(),
      new Point(0.0, -110.0, 0.0),
    );
  });
});
