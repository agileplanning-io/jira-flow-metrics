import seedrandom from "seedrandom";

export function selectValue(
  values: number[],
  generator: RandomGenerator,
): number {
  const index = generator.rand(values.length);
  return values[index];
}

export interface RandomGenerator {
  /**
   * Returns a random integer in the range [0-k).
   */
  rand: (k: number) => number;
}

export class SeedRandomGenerator implements RandomGenerator {
  private generator: seedrandom.PRNG;

  constructor(seed?: number) {
    this.generator = seed ? seedrandom(seed.toString()) : seedrandom();
  }

  rand(k: number): number {
    return Math.floor(this.generator() * k);
  }
}
