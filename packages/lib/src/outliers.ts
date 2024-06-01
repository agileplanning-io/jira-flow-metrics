import { quantileSeq } from "mathjs";

/**
 * Removes outliers from a list of items based on Tukey's Fence method.
 * @param data the list of items to consider
 * @param valueOf a function which returns the value for the given item
 */
export function excludeOutliersFromSeq<T>(
  data: T[],
  valueOf: (_: T) => number,
): T[] {
  if (data.length === 0) {
    return [];
  }

  const values = data.map((x: T) => valueOf(x));

  const [q25, q75] = quantileSeq(values, [0.25, 0.75]) as [number, number];
  const iqr = q75 - q25;
  const cutoff = iqr * 1.5;

  return data.filter((x) => {
    const value = valueOf(x);
    return q25 - cutoff <= value && value <= q75 + cutoff;
  });
}
