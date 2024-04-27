import { qsParse, qsStringify } from "./query-params";

describe("qsParse", () => {
  it("parses params", () => {
    expect(qsParse("foo.bar[0]=baz")).toEqual({ foo: { bar: ["baz"] } });
  });
});

describe("qsStringify", () => {
  it("stringifies objects as params", () => {
    const params = {
      foo: { bar: ["baz"] },
    };
    expect(decodeURIComponent(qsStringify(params))).toEqual("foo.bar[]=baz");
  });

  it("formats dates", () => {
    const params = {
      foo: new Date(2024, 2, 3),
    };
    expect(decodeURIComponent(qsStringify(params))).toEqual("foo=2024-03-03");
  });
});
