import { assert, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { qsParse, qsStringify, useQueryState } from "./use-query-state";

import { SetURLSearchParams, useSearchParams } from "react-router-dom";

vi.mock("react-router-dom");

describe("useQueryState", () => {
  it("parses params", () => {
    mockQuery("filter.hierarchyLevel=Story");
    const { result } = renderHook(() => useQueryState("filter"));
    expect(result.current[0]).toEqual({ hierarchyLevel: "Story" });
  });

  it("parses nested objects", () => {
    mockQuery("policy.epics.type=status&policy.epics.includeWaitTime=true");
    const { result } = renderHook(() => useQueryState("policy"));
    expect(result.current[0]).toEqual({
      epics: {
        type: "status",
        includeWaitTime: true,
      },
    });
  });

  it("parses arrays", () => {
    mockQuery(
      "policy.epics.type=status&policy.epics.labels[]=foo&policy.epics.labels[]=bar",
    );
    const { result } = renderHook(() => useQueryState("policy"));
    expect(result.current[0]).toEqual({
      epics: {
        type: "status",
        labels: ["foo", "bar"],
      },
    });
  });

  it("updates params", () => {
    // arrange
    const setParams = mockQuery("");
    const { result } = renderHook(() => useQueryState("filter"));
    const [, setQuery] = result.current;

    // act
    setQuery({ hierarchyLevel: "Story" });

    // assert
    expect(setParams).toHaveBeenCalled();
    const fn = setParams.mock.lastCall?.[0];
    assert(typeof fn === "function");
    const prev = new URLSearchParams("policy.epics.type=status");
    const next = fn(prev);
    expect(next.toString()).toEqual(
      "policy.epics.type=status&filter.hierarchyLevel=Story",
    );
  });

  it("deep merges params", () => {
    // arrange
    const setParams = mockQuery("");
    const { result } = renderHook(() => useQueryState("filter"));
    const [, setQuery] = result.current;

    // act
    setQuery({ hierarchyLevel: "Story" });

    // assert
    expect(setParams).toHaveBeenCalled();
    const fn = setParams.mock.lastCall?.[0];
    assert(typeof fn === "function");
    const prev = new URLSearchParams("filter.labels[]=foo");
    const next = fn(prev);
    expect(decodeURIComponent(next.toString())).toEqual(
      "filter.labels[]=foo&filter.hierarchyLevel=Story",
    );
  });
});

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

const mockQuery = (query: string) => {
  const params = new URLSearchParams(query);
  const setParams = vi.fn<Parameters<SetURLSearchParams>>();
  vi.mocked(useSearchParams).mockReturnValue([params, setParams]);
  return setParams;
};
