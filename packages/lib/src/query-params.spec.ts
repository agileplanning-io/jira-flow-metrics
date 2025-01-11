import { qsParse, qsStringify } from "./query-params";

describe("qsParse", () => {
  it("parses nested params", () => {
    expect(qsParse("foo.bar[0]=baz")).toEqual({ foo: { bar: ["baz"] } });
  });

  it("parses objects in arrays", () => {
    expect(qsParse("foo.bar[0].baz=qux")).toEqual({
      foo: { bar: [{ baz: "qux" }] },
    });
  });

  it("parses booleans", () => {
    expect(qsParse("foo=true")).toEqual({ foo: true });
  });
});

describe("qsStringify", () => {
  it("stringifies objects as params", () => {
    const params = {
      foo: { bar: ["baz"] },
    };
    expect(decodeURIComponent(qsStringify(params))).toEqual("foo.bar[0]=baz");
  });

  it("stringifies objects in arrays", () => {
    const params = {
      foo: { bar: [{ baz: "qux" }] },
    };
    expect(decodeURIComponent(qsStringify(params))).toEqual(
      "foo.bar[0].baz=qux",
    );
  });

  it("formats dates", () => {
    const params = {
      foo: new Date(2024, 2, 3),
    };
    expect(decodeURIComponent(qsStringify(params))).toEqual("foo=2024-03-03");
  });
});
