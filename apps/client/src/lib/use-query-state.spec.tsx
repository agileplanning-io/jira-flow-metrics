import { assert, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQueryState } from "./use-query-state";
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
});

const mockQuery = (query: string) => {
  const params = new URLSearchParams(query);
  const setParams = vi.fn<Parameters<SetURLSearchParams>>();
  vi.mocked(useSearchParams).mockReturnValue([params, setParams]);
  return setParams;
};
