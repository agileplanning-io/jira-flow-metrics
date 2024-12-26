import { FilterType } from "../../issues";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  isPolicyEqual,
} from "./cycle-time-policy";

describe("isPolicyEqual", () => {
  const policy1: CycleTimePolicy = {
    type: CycleTimePolicyType.LeadTime,
    statuses: ["In Progress"],
    epics: {
      type: EpicCycleTimePolicyType.Derived,
      resolutions: {
        type: FilterType.Include,
        values: ["Done"],
      },
    },
  };

  it("returns true when the policies are semantically equal", () => {
    const policy2: CycleTimePolicy = {
      type: CycleTimePolicyType.LeadTime,
      statuses: ["In Progress"],
      epics: {
        type: EpicCycleTimePolicyType.Derived,
        resolutions: {
          type: FilterType.Include,
          values: ["Done"],
        },
        labels: {
          type: FilterType.Include,
          values: [],
        },
      },
    };

    expect(isPolicyEqual(policy1, policy2)).toBe(true);
  });

  it("returns false when the policies are semantically distinct", () => {
    const policy2: CycleTimePolicy = {
      type: CycleTimePolicyType.LeadTime,
      statuses: ["In Progress"],
      epics: {
        type: EpicCycleTimePolicyType.Derived,
        resolutions: {
          type: FilterType.Include,
          values: ["Done"],
        },
        labels: {
          type: FilterType.Include,
          values: ["Outlier"],
        },
      },
    };

    expect(isPolicyEqual(policy1, policy2)).toBe(false);
  });
});
