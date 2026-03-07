import { vitest } from "vitest";
import { mock } from "vitest-mock-extended";
import { DraggableType } from "./workflow-state";
import { makeDragResponder } from "./drag-responder";
import { DropResult, OnDragEndResponder } from "@hello-pangea/dnd";
import { workflowActions } from "./workflow-reducer";

describe("makeDragResponder", () => {
  const sourceColumnId = "sourceColumnId";
  const sourceStatusId = "sourceStatusId";
  const targetColumnId = "targetColumnId";

  const dispatch = vitest.fn();

  let responder: OnDragEndResponder;

  beforeEach(() => {
    responder = makeDragResponder(dispatch);
  });

  it(`generates a reorderColumns action when a column is dragged over another`, () => {
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

    expect(dispatch).toHaveBeenCalledWith(
      workflowActions.reorderColumns({
        sourceColumnId,
        newColumnIndex: destinationIndex,
      }),
    );
  });

  it(`generates a reorderStatuses action when a status is moved within a column`, () => {
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

    expect(dispatch).toHaveBeenCalledWith(
      workflowActions.reorderStatuses({
        statusId: sourceStatusId,
        columnId: sourceColumnId,
        newStatusIndex: destinationIndex,
      }),
    );
  });

  it(`generates an addColumn action when a status is moved over the new column`, () => {
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

    expect(dispatch).toHaveBeenCalledWith(
      workflowActions.addColumn({ sourceColumnId, sourceIndex: 0 }),
    );
  });

  it(`generates an addColumn action when a status is moved over the new column`, () => {
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

    expect(dispatch).toHaveBeenCalledWith(
      workflowActions.addColumn({ sourceColumnId, sourceIndex: 0 }),
    );
  });

  it(`generates a moveToColumn action when a status is moved over another column`, () => {
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

    expect(dispatch).toHaveBeenCalledWith(
      workflowActions.moveToColumn({
        sourceColumnId,
        sourceIndex,
        targetColumnId,
        targetIndex,
      }),
    );
  });
});
