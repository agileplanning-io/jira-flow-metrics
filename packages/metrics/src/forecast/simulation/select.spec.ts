import { FakeRandomGenerator } from "../../fixtures/fake-random-generator";
import { SeedRandomGenerator, selectValue } from "./select";

describe("newGenerator", () => {
  it("returns a random number generator", () => {
    const generator = new SeedRandomGenerator(123);

    expect(generator.rand(10)).toEqual(9);
    expect(generator.rand(10)).toEqual(3);
    expect(generator.rand(10)).toEqual(0);
  });
});

describe("selectValue", () => {
  it("selects a number at random given the random generator", () => {
    const values = [1, 2, 3, 5, 8];
    const generator = new FakeRandomGenerator([4, 2]);

    expect(selectValue(values, generator)).toEqual(8);
    expect(selectValue(values, generator)).toEqual(3);
  });
});
