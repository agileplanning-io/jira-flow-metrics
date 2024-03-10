import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { z } from "zod";
import { useParams } from "./params";
import { renderHook } from "@testing-library/react-hooks";
import { ReactNode } from "react";

describe("useParams", () => {
  it("parses params", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/?foo=bar"]}>
        <Routes>
          <Route path="/" element={children} />
        </Routes>
      </MemoryRouter>
    );

    const paramSchema = z.object({
      foo: z.string(),
    });

    const { result } = renderHook(() => useParams(paramSchema), { wrapper });
    const [params] = result.current;

    expect(params.foo).toEqual("bar");
  });
});
