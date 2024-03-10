import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { z } from "zod";
import { useParams } from "./params";
import { renderHook } from "@testing-library/react-hooks";
import { ReactNode } from "react";

describe("useParams", () => {
  const withRouter =
    (initialEntries: string[]) =>
    ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={children} />
        </Routes>
      </MemoryRouter>
    );

  it("parses params", () => {
    const wrapper = withRouter(["/?foo=foo&bar=123&baz=true"]);

    const schema = z.object({
      foo: z.string(),
      bar: z.number(),
      baz: z.boolean(),
    });

    const { result } = renderHook(() => useParams(schema), { wrapper });
    const [params] = result.current;

    expect(params).toMatchObject({
      foo: "foo",
      bar: 123,
      baz: true,
    });
  });
});
