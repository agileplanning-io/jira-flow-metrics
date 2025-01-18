import { getAllPages } from "./page-utils";

describe("getAllPages", () => {
  const makeStubbedDataFunction =
    ({ total, maxResults }: { total: number; maxResults: number }) =>
    async (startAt = 0) =>
      Promise.resolve({ startAt, total, maxResults });

  it("fetches the first page", async () => {
    const total = 5;
    const maxResults = 5;
    const getData = makeStubbedDataFunction({ total, maxResults });

    const results = await getAllPages(getData);

    expect(results).toEqual([
      {
        maxResults,
        total,
        startAt: 0,
      },
    ]);
  });

  it("fetches all pages", async () => {
    const total = 15;
    const maxResults = 5;
    const getData = makeStubbedDataFunction({ total, maxResults });

    const results = await getAllPages(getData);

    expect(results).toEqual([
      {
        maxResults,
        total,
        startAt: 0,
      },
      {
        maxResults,
        total,
        startAt: 5,
      },
      {
        maxResults,
        total,
        startAt: 10,
      },
    ]);
  });
});
