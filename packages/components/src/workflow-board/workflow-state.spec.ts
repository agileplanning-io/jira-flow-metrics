import { StatusCategory } from "@agileplanning-io/flow-metrics";
import { addColumn, workflowToState, stateToWorkflow } from "./workflow-state";
import { expect, it, describe } from "vitest";

const buildTestWorkflow = () => ({
  stages: [
    {
      name: "To Do",
      selectByDefault: false,
      statuses: [{ name: "To Do", category: StatusCategory.ToDo }],
    },
    {
      name: "In Progress",
      selectByDefault: true,
      statuses: [
        { name: "In Progress", category: StatusCategory.InProgress },
        { name: "In Review", category: StatusCategory.InProgress },
      ],
    },
    {
      name: "Done",
      selectByDefault: true,
      statuses: [{ name: "Done", category: StatusCategory.Done }],
    },
  ],
  statuses: [
    { name: "To Do", category: StatusCategory.ToDo },
    { name: "In Progress", category: StatusCategory.InProgress },
    { name: "In Review", category: StatusCategory.InProgress },
    { name: "Done", category: StatusCategory.Done },
  ],
});

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
  it("adds a column", () => {
    const workflow = buildTestWorkflow();
    const initialState = workflowToState(workflow);

    const newState = addColumn(initialState, {
      sourceColumnId: initialState.columns["col:In Progress"].id,
      sourceIndex: 1, // In Review status
    });

    expect(stateToWorkflow(newState)).toEqual({
      stages: [
        {
          name: "To Do",
          selectByDefault: false,
          statuses: [
            {
              category: "To Do",
              name: "To Do",
            },
          ],
        },
        {
          name: "In Progress",
          selectByDefault: true,
          statuses: [
            {
              category: "In Progress",
              name: "In Progress",
            },
          ],
        },
        {
          name: "Done",
          selectByDefault: false,
          statuses: [
            {
              category: "Done",
              name: "Done",
            },
          ],
        },
        {
          name: "In Review",
          selectByDefault: true,
          statuses: [
            {
              category: "In Progress",
              name: "In Review",
            },
          ],
        },
      ],
      statuses: workflow.statuses,
    });
  });
});
