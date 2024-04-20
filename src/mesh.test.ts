import { describe, expect, test } from "@jest/globals";
import {
  First,
  MeshCell,
  MeshCoord,
  MeshNode,
  Second,
  Third,
  isMeshcode,
} from "./mesh.js";
import { OverflowError, UnitError, ValueError } from "./error.js";

describe("isMeshcode", () => {
  test("isMeshcode", () => {
    expect(isMeshcode(54401027)).toBe(true);
    expect(isMeshcode(800000)).toBe(true);

    expect(isMeshcode(-1)).toBe(false);
    expect(isMeshcode(100000000)).toBe(false);
    expect(isMeshcode(10810000)).toBe(false);
    expect(isMeshcode(10000800)).toBe(false);
    expect(isMeshcode(null)).toBe(false);
    expect(isMeshcode("54401027")).toBe(false);
  });
});

describe("MeshCoord", () => {
  test("type check", () => {
    // constructor
    // @ts-expect-error type test
    expect(() => new MeshCoord(null, 2, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new MeshCoord(1, null, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new MeshCoord(1, null, 3)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCoord.fromLatitude(null, 1)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCoord.fromLatitude(0, null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCoord.fromLongitude(null, 1)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCoord.fromLongitude(0, null)).toThrow(TypeError);

    // methods
    const coord = new MeshCoord(1, 2, 3);
    // @ts-expect-error type test
    expect(() => coord.isMeshUnit(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => coord.nextUp(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => coord.nextDown(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => coord.lt(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => coord.le(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => coord.gt(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => coord.ge(null)).toThrow(TypeError);
  });

  test("constructor", () => {
    expect(() => new MeshCoord(99, 7, 9)).not.toThrow(Error);
    // @ts-expect-error for test
    expect(() => new MeshCoord(0, 0, 10)).toThrow(ValueError);
    // @ts-expect-error for test
    expect(() => new MeshCoord(0, 8, 0)).toThrow(ValueError);
    // @ts-expect-error for test
    expect(() => new MeshCoord(100, 0, 0)).toThrow(ValueError);

    // @ts-expect-error for test
    expect(() => new MeshCoord(0, 0, -1)).toThrow(ValueError);
    // @ts-expect-error for test
    expect(() => new MeshCoord(0, -1, 0)).toThrow(ValueError);
    // @ts-expect-error for test
    expect(() => new MeshCoord(-1, 0, 0)).toThrow(ValueError);
  });

  test("cmp", () => {
    const coord = new MeshCoord(0, 0, 1);

    expect(coord.eq(new MeshCoord(0, 0, 2))).toBe(false);
    expect(coord.eq(new MeshCoord(0, 0, 1))).toBe(true);
    expect(coord.eq(new MeshCoord(0, 0, 0))).toBe(false);

    expect(coord.ne(new MeshCoord(0, 0, 2))).toBe(true);
    expect(coord.ne(new MeshCoord(0, 0, 1))).toBe(false);
    expect(coord.ne(new MeshCoord(0, 0, 0))).toBe(true);

    expect(coord.lt(new MeshCoord(0, 0, 2))).toBe(true);
    expect(coord.lt(new MeshCoord(0, 0, 1))).toBe(false);
    expect(coord.lt(new MeshCoord(0, 0, 0))).toBe(false);

    expect(coord.le(new MeshCoord(0, 0, 2))).toBe(true);
    expect(coord.le(new MeshCoord(0, 0, 1))).toBe(true);
    expect(coord.le(new MeshCoord(0, 0, 0))).toBe(false);

    expect(coord.gt(new MeshCoord(0, 0, 2))).toBe(false);
    expect(coord.gt(new MeshCoord(0, 0, 1))).toBe(false);
    expect(coord.gt(new MeshCoord(0, 0, 0))).toBe(true);

    expect(coord.ge(new MeshCoord(0, 0, 2))).toBe(false);
    expect(coord.ge(new MeshCoord(0, 0, 1))).toBe(true);
    expect(coord.ge(new MeshCoord(0, 0, 0))).toBe(true);
  });

  test("nextUp", () => {
    expect(() => new MeshCoord(0, 0, 1).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 2).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 3).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 4).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 6).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 7).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 8).nextUp(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 9).nextUp(5)).toThrow(UnitError);

    expect(() => new MeshCoord(99, 7, 9).nextUp(1)).toThrow(OverflowError);
    expect(() => new MeshCoord(99, 7, 5).nextUp(5)).toThrow(OverflowError);
  });

  test("nextDown", () => {
    expect(() => new MeshCoord(0, 0, 1).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 2).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 3).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 4).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 6).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 7).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 8).nextDown(5)).toThrow(UnitError);
    expect(() => new MeshCoord(0, 0, 9).nextDown(5)).toThrow(UnitError);

    expect(() => new MeshCoord(0, 0, 0).nextDown(1)).toThrow(OverflowError);
    expect(() => new MeshCoord(0, 0, 0).nextDown(5)).toThrow(OverflowError);
  });

  test("identity", () => {
    for (let first = 0; first < 100; first++) {
      for (let second = 0; second < 8; second++) {
        for (let third = 0; third < 10; third++) {
          const coord = new MeshCoord(
            first as First,
            second as Second,
            third as Third,
          );
          const actual = MeshCoord.fromLatitude(coord.toLatitude(), 1);

          expect(actual.first).toBe(coord.first);
          expect(actual.second).toBe(coord.second);
          expect(actual.third).toBe(coord.third);
        }
      }
    }

    for (let first = 0; first < 80; first++) {
      for (let second = 0; second < 8; second++) {
        for (let third = 0; third < 10; third++) {
          const coord = new MeshCoord(
            first as First,
            second as Second,
            third as Third,
          );
          const actual = MeshCoord.fromLongitude(coord.toLongitude(), 1);

          expect(actual.first).toBe(coord.first);
          expect(actual.second).toBe(coord.second);
          expect(actual.third).toBe(coord.third);
        }
      }
    }

    const coord = new MeshCoord(80, 0, 0);
    const actual = MeshCoord.fromLongitude(coord.toLongitude(), 1);

    expect(actual.first).toBe(coord.first);
    expect(actual.second).toBe(coord.second);
    expect(actual.third).toBe(coord.third);
  });
});

describe("MeshNode", () => {
  test("type check", () => {
    // constructor
    // @ts-expect-error type test
    expect(() => new MeshNode(null, new MeshCoord(1, 2, 3))).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => new MeshNode(new MeshCoord(1, 2, 3), null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshNode.fromMeshcode(null)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshNode.fromPoint(null)).toThrow(TypeError);

    // methods
    const node = MeshNode.fromMeshcode(54401027);
    // @ts-expect-error type test
    expect(() => node.isMeshUnit(null)).toThrow(TypeError);
  });

  test("constructor", () => {
    expect(
      () => new MeshNode(new MeshCoord(0, 0, 0), new MeshCoord(80, 0, 0)),
    ).not.toThrow(Error);

    expect(() => {
      new MeshNode(new MeshCoord(0, 0, 0), new MeshCoord(80, 0, 1));
    }).toThrow(ValueError);
    expect(() => {
      new MeshNode(new MeshCoord(0, 0, 0), new MeshCoord(80, 1, 0));
    }).toThrow(ValueError);
    expect(() => {
      new MeshNode(new MeshCoord(0, 0, 0), new MeshCoord(81, 0, 0));
    }).toThrow(ValueError);
  });

  test("fromMeshcode", () => {
    expect(() => MeshNode.fromMeshcode(0)).not.toThrow(Error);

    expect(() => MeshNode.fromMeshcode(-1)).toThrow(ValueError);
    expect(() => MeshNode.fromMeshcode(10000_00_00)).toThrow(ValueError);
  });
});

describe("MeshCell", () => {
  test("type check", () => {
    // constructor
    expect(
      () =>
        new MeshCell(
          // @ts-expect-error type test
          null,
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          1,
        ),
    ).toThrow(TypeError);
    expect(
      () =>
        new MeshCell(
          MeshNode.fromMeshcode(0),
          // @ts-expect-error type test
          null,
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          1,
        ),
    ).toThrow(TypeError);
    expect(
      () =>
        new MeshCell(
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          // @ts-expect-error type test
          null,
          MeshNode.fromMeshcode(0),
          1,
        ),
    ).toThrow(TypeError);
    expect(
      () =>
        new MeshCell(
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          // @ts-expect-error type test
          null,
          1,
        ),
    ).toThrow(TypeError);
    expect(
      () =>
        new MeshCell(
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          MeshNode.fromMeshcode(0),
          // @ts-expect-error type test
          null,
        ),
    ).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCell.fromMeshcode(null, 1)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCell.fromMeshcode(MeshNode.fromMeshcode(0), null)).toThrow(
      TypeError,
    );
    // @ts-expect-error type test
    expect(() => MeshCell.fromMeshNode(null, 1)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCell.fromMeshNode(MeshNode.fromMeshcode(0), null)).toThrow(
      TypeError,
    );
    // @ts-expect-error type test
    expect(() => MeshCell.fromPoint(null, 1)).toThrow(TypeError);
    // @ts-expect-error type test
    expect(() => MeshCell.fromPoint(MeshNode.fromMeshcode(0), null)).toThrow(
      TypeError,
    );

    // methods
    const cell = MeshCell.fromMeshcode(54401027, 1);
    // @ts-expect-error type test
    expect(() => cell.isUnit(null)).toThrow(TypeError);
  });
});
