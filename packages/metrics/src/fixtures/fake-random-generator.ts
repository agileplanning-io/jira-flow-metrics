import { RandomGenerator } from "../forecast/simulation/select";

export class FakeRandomGenerator implements RandomGenerator {
  private values: number[];
  private index = 0;

  constructor(values: number[]) {
    this.values = values;
  }

  rand(): number {
    return this.values[this.index++];
  }
}
