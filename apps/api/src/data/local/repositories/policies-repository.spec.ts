import {
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
} from "@agileplanning-io/flow-metrics";
import { DraftPolicy } from "@entities/saved-policies";
import { TestDataCache } from "@fixtures/data/storage/test-storage";
import { PoliciesRepository } from "./policies-repository";

describe("PoliciesRepository", () => {
  it("creates policies", async () => {
    // arrange
    const cache = new TestDataCache();
    const repo = new PoliciesRepository(cache);

    const draft: DraftPolicy = {
      policy: {
        type: CycleTimePolicyType.ProcessTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.Derived,
        },
      },
      isDefault: false,
      name: "my policy",
    };

    // act
    await repo.createPolicy("my-project", draft);

    // assert
    const policies = await repo.getPolicies("my-project");

    expect(policies).toEqual([
      {
        id: "QuGzXH0AA-HL",
        ...draft,
      },
    ]);
  });

  it("updates policies", async () => {
    // arrange
    const cache = new TestDataCache();
    const repo = new PoliciesRepository(cache);

    const draft: DraftPolicy = {
      policy: {
        type: CycleTimePolicyType.ProcessTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.Derived,
        },
      },
      isDefault: false,
      name: "my policy",
    };

    const policy = await repo.createPolicy("my-project", draft);

    // act
    await repo.updatePolicy("my-project", { ...policy, isDefault: true });

    // assert
    const policies = await repo.getPolicies("my-project");

    expect(policies).toEqual([
      {
        ...policy,
        isDefault: true,
      },
    ]);
  });
});
