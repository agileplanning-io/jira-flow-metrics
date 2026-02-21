import {
  StatusCategory,
  TransitionStatus,
  Workflow,
  WorkflowStage,
} from "@agileplanning-io/flow-metrics";
import { DraggableLocation } from "@hello-pangea/dnd";
import { produce } from "immer";
import { flatten } from "remeda";

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
  statuses: Record<string, Status>;
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

type ReorderStatusesParams = {
  columnId: string;
  statusId: string;
  destination: DraggableLocation;
};

export const reorderStatuses = produce(
  (
    draft: WorkflowState,
    { columnId, statusId, destination }: ReorderStatusesParams,
  ) => {
    const column = draft.columns[columnId];
    const statusIndex = column.statusIds.indexOf(statusId);
    column.statusIds.splice(statusIndex, 1);
    column.statusIds.splice(destination.index, 0, statusId);
  },
);

type AddColumnParams = {
  source: DraggableLocation;
  // TODO: do we need this? Isn't it the same as source.index?
  // statusIndex: number;
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
  (draft: WorkflowState, { source }: AddColumnParams) => {
    console.info("addColumn", JSON.parse(JSON.stringify(draft)), {
      source,
    });
    const sourceColumn = draft.columns[source.droppableId];
    const statusId = sourceColumn.statusIds[source.index];
    const status = draft.statuses[statusId];

    const columnExists = (title: string) =>
      Object.values(draft.columns).some((column) => column.title === title);

    const buildNewColumn = (count?: number): WorkflowStageColumn => {
      const newTitle =
        count === undefined
          ? status.status.name
          : `${status.status.name} ${count}`;
      if (columnExists(newTitle)) {
        return buildNewColumn((count ?? 1) + 1);
      }
      return {
        id: newTitle,
        title: newTitle,
        statusIds: [status.id],
      };
    };

    const newColumn = buildNewColumn();

    sourceColumn.statusIds.splice(source.index, 1);

    draft.columns[newColumn.id] = newColumn;
    draft.columnOrder.push(newColumn.id);
  },
);

type MoveToColumnParams = {
  statusId: string;
  source: DraggableLocation;
  destination: DraggableLocation;
};

export const moveToColumn = produce(
  (
    draft: WorkflowState,
    { statusId, source, destination }: MoveToColumnParams,
  ) => {
    draft.columns[source.droppableId].statusIds.splice(source.index, 1);
    draft.columns[destination.droppableId].statusIds.splice(
      destination.index,
      0,
      statusId,
    );
  },
);

export const stateToWorkflow = (state: WorkflowState): Workflow => {
  const stages = state.columnOrder.map((columnId) => {
    const column = state.columns[columnId];
    const statuses = column.statusIds.map(
      (statusId) => state.statuses[statusId].status,
    );
    const selectByDefault = statuses.some(
      (status) => status.category === StatusCategory.InProgress,
    );
    return {
      name: column.title,
      selectByDefault,
      statuses,
    };
  });

  const statuses = Object.values(state.statuses).map((status) => status.status);

  return { stages, statuses };
};

export const projectToState = (project: Workflow): WorkflowState => {
  const statusId = (status: TransitionStatus) => `status:${status.name}`;
  const colId = (stage: WorkflowStage) => `col:${stage.name}`;

  const statuses = Object.fromEntries(
    project.statuses.map((status) => [
      statusId(status),
      {
        id: statusId(status),
        status: status,
      },
    ]),
  );

  const workflowColumns: WorkflowStageColumn[] = project.stages.map(
    (stage) => ({
      id: colId(stage),
      title: stage.name,
      statusIds: stage.statuses.map((status) => statusId(status)),
    }),
  );

  const usedStatusIds = new Set(
    flatten(workflowColumns.map((column) => column.statusIds)),
  );
  const unusedStatusIds = Object.values(statuses)
    .filter((status) => !usedStatusIds.has(status.id))
    .map((status) => status.id);

  workflowColumns.push({
    id: "unused",
    title: "Unused",
    statusIds: unusedStatusIds,
  });

  const columns = Object.fromEntries(
    workflowColumns.map((stage) => [stage.id, stage]),
  );

  const columnOrder = project.stages.map((stage) => colId(stage));

  const workflowState: WorkflowState = {
    statuses: statuses,
    columns,
    columnOrder,
  };

  return workflowState;
};
