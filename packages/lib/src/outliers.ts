import { quantileSeq } from "mathjs";

/**
 * Removes outliers from a list of items based on the Tukey Fence method.
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

  const { min, max } = getThresholds(values);

  return data.filter((x) => {
    const value = valueOf(x);
    return min <= value && value <= max;
  });
}

export function getOutliersFromSeq<T>(
  data: T[],
  valueOf: (_: T) => number,
): T[] {
  if (data.length === 0) {
    return [];
  }

  const values = data.map((x: T) => valueOf(x));

  const { min, max } = getThresholds(values);
  return data.filter((x) => {
    const value = valueOf(x);
    return value < min || value > max;
  });
}

const getThresholds = (values: number[]) => {
  const [q25, q75] = quantileSeq(values, [0.25, 0.75]) as [number, number];
  const iqr = q75 - q25;
  const cutoff = iqr * 1.5;

  return {
    min: q25 - cutoff,
    max: q75 + cutoff,
  };
};
