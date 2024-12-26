import {
  CycleTimePolicyType,
  DraftPolicy,
  EpicCycleTimePolicyType,
} from "@agileplanning-io/flow-metrics";
import { TestDataCache } from "@fixtures/data/storage/test-storage";
import { LocalPoliciesRepository } from "./policies-repository";

describe("LocalPoliciesRepository", () => {
  const projectId = "my-project";

  let repo: LocalPoliciesRepository;

  beforeEach(() => {
    const cache = new TestDataCache();
    repo = new LocalPoliciesRepository(cache);
  });

  it("creates policies", async () => {
    // arrange
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
    await repo.createPolicy(projectId, draft);

    // assert
    const policies = await repo.getPolicies(projectId);

    expect(policies).toEqual([
      {
        id: "UFUsXOAn9R_P",
        ...draft,
      },
    ]);
  });

  it("updates policies", async () => {
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

    const policy = await repo.createPolicy(projectId, draft);

    // act
    await repo.updatePolicy(projectId, { ...policy, isDefault: true });

    // assert
    const policies = await repo.getPolicies(projectId);

    expect(policies).toEqual([
      {
        ...policy,
        isDefault: true,
      },
    ]);
  });

  it("updates the default policy", async () => {
    const policy1 = await repo.createPolicy(projectId, {
      policy: {
        type: CycleTimePolicyType.ProcessTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.Derived,
        },
      },
      isDefault: true,
      name: "policy 1",
    });

    const policy2 = await repo.createPolicy(projectId, {
      policy: {
        type: CycleTimePolicyType.ProcessTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.EpicStatus,
          statuses: ["In Progress"],
        },
      },
      isDefault: false,
      name: "policy 2",
    });

    // act
    await repo.setDefaultPolicy(projectId, policy2.id);

    // assert
    const policies = await repo.getPolicies(projectId);

    expect(policies).toEqual([
      { ...policy1, isDefault: false },
      { ...policy2, isDefault: true },
    ]);
  });

  it("deletes policies", async () => {
    const policy1 = await repo.createPolicy(projectId, {
      policy: {
        type: CycleTimePolicyType.ProcessTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.Derived,
        },
      },
      isDefault: true,
      name: "policy 1",
    });

    const policy2 = await repo.createPolicy(projectId, {
      policy: {
        type: CycleTimePolicyType.ProcessTime,
        statuses: ["In Progress"],
        epics: {
          type: EpicCycleTimePolicyType.EpicStatus,
          statuses: ["In Progress"],
        },
      },
      isDefault: false,
      name: "policy 2",
    });

    // act
    await repo.deletePolicy(projectId, policy2.id);

    // assert
    const policies = await repo.getPolicies(projectId);

    expect(policies).toEqual([policy1]);
  });
});
