import { StatusCategory, TransitionStatus } from "../issues";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
} from "../metrics";
import { getSelectedStages } from "./selected-stages";
import { Workflow } from "./types";

describe("getSelectedStages", () => {
  it("returns the selected workflow stages for the given policy", () => {
    const policy: CycleTimePolicy = {
      type: CycleTimePolicyType.ProcessTime,
      statuses: ["In Progress", "In Review", "In Staging"],
      epics: {
        type: EpicCycleTimePolicyType.Derived,
      },
    };

    const backlog: TransitionStatus = {
      name: "Backlog",
      category: StatusCategory.ToDo,
    };
    const inProgress: TransitionStatus = {
      name: "In Progress",
      category: StatusCategory.InProgress,
    };
    const inReview: TransitionStatus = {
      name: "In Review",
      category: StatusCategory.InProgress,
    };
    const inStaging: TransitionStatus = {
      name: "In Staging",
      category: StatusCategory.InProgress,
    };
    const done: TransitionStatus = {
      name: "Done",
      category: StatusCategory.Done,
    };

    const workflow: Workflow = {
      stages: [
        {
          name: "Backlog",
          statuses: [backlog],
          selectByDefault: false,
        },
        {
          name: "In Progress",
          statuses: [inProgress, inReview],
          selectByDefault: true,
        },
        {
          name: "In Staging",
          statuses: [inStaging],
          selectByDefault: true,
        },
        {
          name: "Done",
          statuses: [done],
          selectByDefault: false,
        },
      ],
      statuses: [],
    };

    const stages = getSelectedStages(workflow, policy);

    expect(stages).toEqual(["In Progress", "In Staging"]);
  });
});
