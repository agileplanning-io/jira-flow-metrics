import { beforeEach, describe, expect, it } from "vitest";
import { SearchParamsBuilder } from "./search-params-builder";

describe("SearchParamsBuilder", () => {
  let params: URLSearchParams;
  let builder: SearchParamsBuilder;

  beforeEach(() => {
    params = new URLSearchParams();
    builder = new SearchParamsBuilder(params);
  });

  describe("set", () => {
    it("sets string values", () => {
      builder.set("foo", "bar");
      expect(params.get("foo")).toEqual("bar");
    });

    it("sets number values", () => {
      builder.set("foo", 123);
      expect(params.get("foo")).toEqual("123");
    });

    it("sets boolean values", () => {
      builder.set("foo", true);
      expect(params.get("foo")).toEqual("true");
    });

    it("sets date values", () => {
      builder.set("foo", new Date(2024, 2, 2));
      expect(params.get("foo")).toEqual("2024-03-02");
    });
  });

  it("sets the builder changed state", () => {
    expect(builder.getChanged()).toEqual(false);
    builder.set("foo", "bar");
    expect(builder.getChanged()).toEqual(true);
  });

  describe("setAll", () => {
    it("sets array values if the array is non-empty", () => {
      expect(builder.getChanged()).toEqual(false);

      builder.setAll("foo", ["bar", "baz"]);

      expect(Array.from(params.entries())).toEqual([
        ["foo", "bar"],
        ["foo", "baz"],
      ]);
      expect(builder.getChanged()).toEqual(true);
    });

    it("does not update the params if the array is empty", () => {
      expect(builder.getChanged()).toEqual(false);

      builder.setAll("foo", []);

      expect(Array.from(params.entries())).toEqual([]);
      expect(builder.getChanged()).toEqual(false);
    });
  });
});
