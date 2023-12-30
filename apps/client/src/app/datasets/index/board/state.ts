import { StatusCategory, TransitionStatus } from "@jbrunton/flow-metrics";
import { DraggableLocation } from "@hello-pangea/dnd";
import { produce } from "immer";
import { WorkflowStage } from "@data/issues";
import { Dataset, UpdateDatasetParams } from "@data/datasets";

export type Status = {
  id: string;
  status: TransitionStatus;
};

export type WorkflowStageColumn = {
  id: string;
  title: string;
  statusIds: string[];
};

export type WorkflowState = {
  tasks: Record<string, Status>;
  columns: Record<string, WorkflowStageColumn>;
  columnOrder: string[];
};

type ReorderColumnsParams = {
  columnId: string;
  destination: DraggableLocation;
};

export const reorderColumns = produce(
  (draft: WorkflowState, { columnId, destination }: ReorderColumnsParams) => {
    const columnIndex = draft.columnOrder.indexOf(columnId);
    draft.columnOrder.splice(columnIndex, 1);
    draft.columnOrder.splice(destination.index, 0, columnId);
  },
);

type ReorderTasksParams = {
  columnId: string;
  taskId: string;
  destination: DraggableLocation;
};

export const reorderTasks = produce(
  (
    draft: WorkflowState,
    { columnId, taskId, destination }: ReorderTasksParams,
  ) => {
    const column = draft.columns[columnId];
    const taskIndex = column.statusIds.indexOf(taskId);
    column.statusIds.splice(taskIndex, 1);
    column.statusIds.splice(destination.index, 0, taskId);
  },
);

type AddColumnParams = {
  source: DraggableLocation;
  taskIndex: number;
};

export const deleteColumn = produce(
  (draft: WorkflowState, columnId: string) => {
    const column = draft.columns[columnId];
    const columnIndex = draft.columnOrder.indexOf(columnId);

    draft.columns["unused"].statusIds.push(...column.statusIds);
    draft.columnOrder.splice(columnIndex, 1);
    delete draft.columns[columnId];
  },
);

export const renameColumn = produce(
  (draft: WorkflowState, columnId: string, newTitle: string) => {
    draft.columns[columnId].title = newTitle;
  },
);

export const addColumn = produce(
  (draft: WorkflowState, { source, taskIndex }: AddColumnParams) => {
    const sourceColumn = draft.columns[source.droppableId];
    const taskId = sourceColumn.statusIds[taskIndex];
    const task = draft.tasks[taskId];

    const columnExists = (title: string) =>
      Object.values(draft.columns).some((column) => column.title === title);

    const buildNewColumn = (count?: number): WorkflowStageColumn => {
      const newTitle =
        count === undefined ? task.status.name : `${task.status.name} ${count}`;
      if (columnExists(newTitle)) {
        return buildNewColumn((count ?? 1) + 1);
      }
      return {
        id: newTitle,
        title: newTitle,
        statusIds: [task.id],
      };
    };

    const newColumn = buildNewColumn();

    sourceColumn.statusIds.splice(taskIndex, 1);

    draft.columns[newColumn.id] = newColumn;
    draft.columnOrder.push(newColumn.id);
  },
);

type MoveToColumnParams = {
  taskId: string;
  source: DraggableLocation;
  destination: DraggableLocation;
};

export const moveToColumn = produce(
  (
    draft: WorkflowState,
    { taskId, source, destination }: MoveToColumnParams,
  ) => {
    draft.columns[source.droppableId].statusIds.splice(source.index, 1);
    draft.columns[destination.droppableId].statusIds.splice(
      destination.index,
      0,
      taskId,
    );
  },
);

export const stateToWorkflow = (
  state: WorkflowState,
): UpdateDatasetParams["workflow"] => {
  return state.columnOrder.map((columnId) => {
    const column = state.columns[columnId];
    const statuses = column.statusIds.map(
      (statusId) => state.tasks[statusId].status,
    );
    const selectByDefault = statuses.some(
      (status) => status.category === StatusCategory.InProgress,
    );
    return {
      name: column.title,
      selectByDefault,
      statuses: statuses.map((status) => status.name),
    };
  });
};

export const datasetToState = (dataset: Dataset): WorkflowState => {
  const taskId = (status: TransitionStatus) => `task:${status.name}`;
  const colId = (stage: WorkflowStage) => `col:${stage.name}`;

  const workflowState: WorkflowState = {
    tasks: Object.fromEntries(
      dataset.statuses.map((status) => [
        taskId(status),
        {
          id: taskId(status),
          status: status,
        },
      ]),
    ),
    columns: Object.fromEntries(
      dataset.workflow
        .map((stage): [string, WorkflowStageColumn] => [
          colId(stage),
          {
            id: colId(stage),
            title: stage.name,
            statusIds: stage.statuses.map((status) => taskId(status)),
          },
        ])
        .concat([["unused", { id: "unused", title: "Unused", statusIds: [] }]]),
    ),
    columnOrder: dataset.workflow.map((stage) => colId(stage)),
  };

  return workflowState;
};
