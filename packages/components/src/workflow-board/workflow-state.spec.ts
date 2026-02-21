import { StatusCategory } from "@agileplanning-io/flow-metrics";
import {
  addColumn,
  projectToState,
  stateToWorkflow,
  Status,
  WorkflowStageColumn,
  WorkflowState,
} from "./workflow-state";
import { expect, it, describe } from "vitest";
import { produce } from "immer";

const statuses = {
  "status:Backlog": {
    id: "status:Backlog",
    status: { name: "Backlog", category: StatusCategory.ToDo },
  },
  "status:To Do": {
    id: "status:To Do",
    status: { name: "To Do", category: StatusCategory.ToDo },
  },
  "status:In Progress": {
    id: "status:In Progress",
    status: { name: "In Progress", category: StatusCategory.InProgress },
  },
  "status:In Review": {
    id: "status:In Review",
    status: { name: "In Review", category: StatusCategory.InProgress },
  },
  "status:Done": {
    id: "status:Done",
    status: { name: "Done", category: StatusCategory.Done },
  },
};

const columns = {
  "col:To Do": {
    id: "col:To Do",
    title: "To Do",
    statusIds: ["status:To Do", "status:Backlog"],
  },
  "col:In Progress": {
    id: "col:In Progress",
    title: "In Progress",
    statusIds: ["status:In Progress", "status:In Review"],
  },
  "col:Done": {
    id: "col:Done",
    title: "Done",
    statusIds: ["status:Done"],
  },
};

const buildInitialState = (): WorkflowState => ({
  statuses,
  columns,
  columnOrder: [
    columns["col:To Do"].id,
    columns["col:In Progress"].id,
    columns["col:Done"].id,
  ],
});

describe("immer", () => {
  type Foo = { value: number };

  const double = produce((foo: Foo) => {
    foo.value = foo.value * 2;
    return foo;
  });

  const buildFoo = (value: number) => ({ value });

  it("can be tested", () => {
    const initialState = buildFoo(1);
    expect(double(initialState)).toEqual(buildFoo(2));
  });
});

describe("#projectToState", () => {
  it("generates a view state", () => {
    const workflowState = projectToState({
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
        { name: "Done", category: StatusCategory.Done },
      ],
    });

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

describe("addColumn", () => {
  it("adds a column", () => {
    const state = buildInitialState();

    const newState = addColumn(state, {
      source: { droppableId: columns["col:In Progress"].id, index: 1 },
    });

    // expect(stateToWorkflow(newState)).toEqual({
    //   columns: {
    //     ["col:To Do"]: columns["col:To Do"],
    //   },
    // });

    expect(newState).toEqual({});
  });
});
