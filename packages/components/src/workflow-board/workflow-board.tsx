import { FC, useEffect, useReducer, useState } from "react";
import styled from "@emotion/styled";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import {
  workflowToState,
  stateToWorkflow,
  ModifyWorkflowActionType,
  workflowStateReducer,
} from "./workflow-state";
import { WorkflowStageCard } from "./column";
import { Flex } from "antd";
import { validateWorkflow } from "./validation";
import { Workflow } from "@agileplanning-io/flow-metrics";

const Container = styled.div`
  display: flex;
`;

export type WorkflowBoardProps = {
  workflow: Workflow;
  onWorkflowChanged: (workflow: Workflow, validationErrors?: string[]) => void;
  disabled: boolean;
  readonly: boolean;
};

export const WorkflowBoard: FC<WorkflowBoardProps> = ({
  workflow,
  onWorkflowChanged,
  disabled,
  readonly,
}) => {
  const [state, dispatch] = useReducer(workflowStateReducer, workflow, () =>
    workflowToState(workflow),
  );

  useEffect(() => {
    const workflow = stateToWorkflow(state);
    const validationErrors = validateWorkflow(workflow.stages);
    onWorkflowChanged(workflow, validationErrors);
  }, [state, onWorkflowChanged]);

  const onDragEnd: OnDragEndResponder = (event) => {
    const { destination, source, draggableId, type } = event;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      return dispatch({
        type: ModifyWorkflowActionType.ReorderColumns,
        sourceColumnId: draggableId,
        newColumnIndex: destination.index,
      });
    }

    if (source.droppableId === destination.droppableId) {
      return dispatch({
        type: ModifyWorkflowActionType.ReorderStatuses,
        columnId: source.droppableId,
        statusId: draggableId,
        newStatusIndex: destination.index,
      });
    }

    if (destination.droppableId === "new-column") {
      return dispatch({
        type: ModifyWorkflowActionType.AddColumn,
        sourceColumnId: source.droppableId,
        sourceIndex: source.index,
      });
    }

    return dispatch({
      type: ModifyWorkflowActionType.MoveToColumn,
      sourceColumnId: source.droppableId,
      sourceIndex: source.index,
      targetColumnId: destination.droppableId,
      targetIndex: destination.index,
      statusId: draggableId,
    });
  };

  const onDeleteColumn = (columnId: string) => {
    dispatch({
      type: ModifyWorkflowActionType.DeleteColumn,
      columnId,
    });
  };

  const onRenameColumn = (columnId: string, newTitle: string) => {
    dispatch({
      type: ModifyWorkflowActionType.RenameColumn,
      columnId,
      newTitle,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex style={{ margin: "0 -4px", overflowX: "auto" }}>
        <Droppable
          droppableId="unused-tasks"
          type="unused"
          isDropDisabled={disabled || readonly}
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              <WorkflowStageCard
                key="unused"
                column={state.columns["unused"]}
                tasks={state.columns["unused"].statusIds.map(
                  (taskId) => state.statuses[taskId],
                )}
                index={0}
                isDragDisabled={true}
                disabled={disabled}
                readonly={readonly}
              />
            </Container>
          )}
        </Droppable>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {state.columnOrder.map((columnId, index) => {
                const column = state.columns[columnId];
                const tasks = column.statusIds.map(
                  (taskId) => state.statuses[taskId],
                );
                return (
                  <WorkflowStageCard
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    isDragDisabled={false}
                    disabled={disabled}
                    readonly={readonly}
                    onDelete={onDeleteColumn}
                    onRenamed={onRenameColumn}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
        {!readonly ? (
          <Droppable droppableId="create-column" type="new-column">
            {(provided) => (
              <Container {...provided.droppableProps} ref={provided.innerRef}>
                <WorkflowStageCard
                  key="new-column"
                  column={{
                    id: "new-column",
                    statusIds: [],
                    title: "New Column",
                  }}
                  tasks={[]}
                  index={0}
                  isDragDisabled={true}
                  disabled={disabled}
                  readonly={readonly}
                />
              </Container>
            )}
          </Droppable>
        ) : null}
      </Flex>
    </DragDropContext>
  );
};
