import { mapLimit } from "async";
import { range } from "remeda";

type Page = {
  maxResults?: number;
  total?: number;
};

type GetData<T extends Page> = (startAt?: number) => Promise<T>;

export const getAllPages = async <T extends Page>(
  getData: GetData<T>,
): Promise<T[]> => {
  const firstPage = await getData();

  const { total, maxResults } = firstPage;

  if (total === undefined || maxResults === undefined) {
    throw new Error(
      `Response missing fields: total=${total}, maxResults: ${maxResults}`,
    );
  }

  const pageCount = Math.ceil(total / maxResults);

  if (pageCount <= 1) {
    return [firstPage];
  }

  const remainingPages = await mapLimit(
    range(1, pageCount),
    5,
    async (pageIndex: number) => getData(pageIndex * maxResults),
  );

  return [firstPage, ...remainingPages];
};
