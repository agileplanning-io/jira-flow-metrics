import { vitest } from "vitest";
import { mock } from "vitest-mock-extended";
import { DraggableType, ModifyWorkflowActionType } from "./workflow-state";
import { makeDragResponder } from "./drag-responder";
import { DropResult, OnDragEndResponder } from "@hello-pangea/dnd";

describe("makeDragResponder", () => {
  const sourceColumnId = "sourceColumnId";
  const sourceStatusId = "sourceStatusId";
  const targetColumnId = "targetColumnId";

  const dispatch = vitest.fn();

  let responder: OnDragEndResponder;

  beforeEach(() => {
    responder = makeDragResponder(dispatch);
  });

  it(`generates a ${ModifyWorkflowActionType.ReorderColumns} action when a column is dragged over another`, () => {
    const destinationIndex = 1;

    const dropResult = mock<DropResult>({
      type: DraggableType.WorkstageColumn,
      draggableId: sourceColumnId,
      destination: {
        index: destinationIndex,
        droppableId: targetColumnId,
      },
    });

    responder(dropResult, mock());

    expect(dispatch).toHaveBeenCalledWith({
      type: ModifyWorkflowActionType.ReorderColumns,
      sourceColumnId: sourceColumnId,
      newColumnIndex: destinationIndex,
    });
  });

  it(`generates a ${ModifyWorkflowActionType.ReorderStatuses} action when a status is moved within a column`, () => {
    const sourceIndex = 0;
    const destinationIndex = 1;

    const dropResult = mock<DropResult>({
      type: DraggableType.Status,
      draggableId: sourceStatusId,
      source: {
        index: sourceIndex,
        droppableId: sourceColumnId,
      },
      destination: {
        index: destinationIndex,
        droppableId: sourceColumnId,
      },
    });

    responder(dropResult, mock());

    expect(dispatch).toHaveBeenCalledWith({
      type: ModifyWorkflowActionType.ReorderStatuses,
      statusId: sourceStatusId,
      columnId: sourceColumnId,
      newStatusIndex: destinationIndex,
    });
  });

  it(`generates a ${ModifyWorkflowActionType.AddColumn} action when a status is moved over the new column`, () => {
    const sourceIndex = 0;
    const destinationIndex = 1;

    const dropResult = mock<DropResult>({
      type: DraggableType.Status,
      draggableId: sourceStatusId,
      source: {
        index: sourceIndex,
        droppableId: sourceColumnId,
      },
      destination: {
        index: destinationIndex,
        droppableId: DraggableType.NewColumn,
      },
    });

    responder(dropResult, mock());

    expect(dispatch).toHaveBeenCalledWith({
      type: ModifyWorkflowActionType.AddColumn,
      sourceColumnId,
      sourceIndex: 0,
    });
  });

  it(`generates a ${ModifyWorkflowActionType.AddColumn} action when a status is moved over the new column`, () => {
    const sourceIndex = 0;
    const targetIndex = 1;

    const dropResult = mock<DropResult>({
      type: DraggableType.Status,
      draggableId: sourceStatusId,
      source: {
        index: sourceIndex,
        droppableId: sourceColumnId,
      },
      destination: {
        index: targetIndex,
        droppableId: DraggableType.NewColumn,
      },
    });

    responder(dropResult, mock());

    expect(dispatch).toHaveBeenCalledWith({
      type: ModifyWorkflowActionType.AddColumn,
      sourceColumnId,
      sourceIndex: 0,
    });
  });

  it(`generates a ${ModifyWorkflowActionType.MoveToColumn} action when a status is moved over another column`, () => {
    const sourceIndex = 0;
    const targetIndex = 1;

    const dropResult = mock<DropResult>({
      type: DraggableType.Status,
      draggableId: sourceStatusId,
      source: {
        index: sourceIndex,
        droppableId: sourceColumnId,
      },
      destination: {
        index: targetIndex,
        droppableId: targetColumnId,
      },
    });

    responder(dropResult, mock());

    expect(dispatch).toHaveBeenCalledWith({
      type: ModifyWorkflowActionType.MoveToColumn,
      sourceColumnId,
      sourceIndex,
      targetColumnId,
      targetIndex,
      statusId: sourceStatusId,
    });
  });
});
