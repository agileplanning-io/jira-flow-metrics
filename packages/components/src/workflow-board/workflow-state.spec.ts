import {
  StatusCategory,
  TransitionStatus,
  Workflow,
  WorkflowStage,
} from "@agileplanning-io/flow-metrics";
import {
  addColumn,
  workflowToState,
  stateToWorkflow,
  reorderColumns,
} from "./workflow-state";
import { expect, it, describe } from "vitest";
import { flat } from "remeda";

const statuses = {
  todo: { name: "To Do", category: StatusCategory.ToDo },
  inProgress: { name: "In Progress", category: StatusCategory.InProgress },
  inReview: { name: "In Review", category: StatusCategory.InProgress },
  done: { name: "Done", category: StatusCategory.Done },
} as const;

const buildWorkflowStage = (statuses: TransitionStatus[]): WorkflowStage => ({
  name: statuses[0].name,
  selectByDefault: statuses[0].category === StatusCategory.InProgress,
  statuses,
});

const buildTestWorkflow = (
  inProgressStatuses?: TransitionStatus[],
): Workflow => {
  const stages = [
    buildWorkflowStage([statuses.todo]),
    buildWorkflowStage(inProgressStatuses ?? [statuses.inProgress]),
    buildWorkflowStage([statuses.done]),
  ];

  return {
    stages,
    statuses: flat(stages.map((stage) => stage.statuses)),
  };
};

describe("#workflowToState", () => {
  it("generates a view state", () => {
    const workflowState = workflowToState(buildTestWorkflow());

    expect(workflowState).toEqual({
      columnOrder: ["col:To Do", "col:In Progress", "col:Done"],
      columns: {
        "col:Done": {
          id: "col:Done",
          statusIds: ["status:Done"],
          title: "Done",
        },
        "col:In Progress": {
          id: "col:In Progress",
          statusIds: ["status:In Progress"],
          title: "In Progress",
        },
        "col:To Do": {
          id: "col:To Do",
          statusIds: ["status:To Do"],
          title: "To Do",
        },
        unused: {
          id: "unused",
          statusIds: [],
          title: "Unused",
        },
      },
      statuses: {
        "status:Done": {
          id: "status:Done",
          status: {
            category: "Done",
            name: "Done",
          },
        },
        "status:In Progress": {
          id: "status:In Progress",
          status: {
            category: "In Progress",
            name: "In Progress",
          },
        },
        "status:To Do": {
          id: "status:To Do",
          status: {
            category: "To Do",
            name: "To Do",
          },
        },
      },
    });
  });
});

describe("#stateToProject", () => {
  it("is the inverse of projectToState", () => {
    const initialWorkflow = buildTestWorkflow();
    const inverseWorkflow = stateToWorkflow(workflowToState(initialWorkflow));
    expect(inverseWorkflow).toEqual(initialWorkflow);
  });
});

describe("addColumn", () => {
  it("appends a column to the workflow", () => {
    const workflow = buildTestWorkflow([
      statuses.inProgress,
      statuses.inReview,
    ]);
    const initialState = workflowToState(workflow);

    const newState = addColumn(initialState, {
      sourceColumnId: initialState.columns["col:In Progress"].id,
      sourceIndex: 1, // In Review status
    });

    expect(stateToWorkflow(newState)).toEqual({
      stages: [
        buildWorkflowStage([statuses.todo]),
        buildWorkflowStage([statuses.inProgress]),
        buildWorkflowStage([statuses.done]),
        buildWorkflowStage([statuses.inReview]),
      ],
      statuses: workflow.statuses,
    });
  });
});

describe("reorderColumns", () => {
  it("reorders the given workflow stages", () => {
    const workflow = buildTestWorkflow();
    const initialState = workflowToState(workflow);

    const newState = reorderColumns(initialState, {
      sourceColumnId: `col:In Progress`,
      newColumnIndex: 0,
    });

    expect(stateToWorkflow(newState)).toEqual({
      stages: [
        buildWorkflowStage([statuses.inProgress]),
        buildWorkflowStage([statuses.todo]),
        buildWorkflowStage([statuses.done]),
      ],
      statuses: workflow.statuses,
    });
  });
});
