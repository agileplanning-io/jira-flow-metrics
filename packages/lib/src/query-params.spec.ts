import { qsParse, qsStringify } from "./query-params";

describe("qsParse", () => {
  it("parses params", () => {
    expect(qsParse("foo.bar[0]=baz")).toEqual({ foo: { bar: ["baz"] } });
  });

  it("parses dates", () => {
    expect(qsParse("foo=2021-03-02")).toEqual({ foo: new Date(2021, 2, 2) });
  });

  it("parses booleans", () => {
    expect(qsParse("foo=true&bar=false")).toEqual({ foo: true, bar: false });
  });

  it("doesn't parse values in arrays", () => {
    expect(qsParse("foo[]=true&foo[]=2021-02-02")).toEqual({
      foo: ["true", "2021-02-02"],
    });
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
