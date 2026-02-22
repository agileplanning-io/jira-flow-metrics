import { FC, useCallback, useEffect, useReducer } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  workflowToState,
  stateToWorkflow,
  ModifyWorkflowActionType,
  workflowStateReducer,
  WorkflowState,
  DraggableType,
} from "./workflow-state";
import { WorkflowStageCard } from "./column";
import { Flex } from "antd";
import { validateWorkflow } from "./validation";
import { Workflow } from "@agileplanning-io/flow-metrics";
import { makeDragResponder } from "./drag-responder";

const Container = styled.div`
  display: flex;
`;

export type WorkflowBoardProps = {
  workflow: Workflow;
  onWorkflowChanged: (workflow: Workflow, validationErrors?: string[]) => void;
  disabled: boolean;
  readonly: boolean;
};

const initState = (workflow: Workflow) => workflowToState(workflow);

export const WorkflowBoard: FC<WorkflowBoardProps> = ({
  workflow,
  onWorkflowChanged,
  disabled,
  readonly,
}) => {
  const [state, dispatch] = useReducer(
    workflowStateReducer,
    workflow,
    initState,
  );

  const onStateChanged = useCallback(
    (state: WorkflowState) => {
      const workflow = stateToWorkflow(state);
      const validationErrors = validateWorkflow(workflow.stages);
      onWorkflowChanged(workflow, validationErrors);
    },
    [state],
  );

  useEffect(() => {
    onStateChanged(state);
  }, [state, onStateChanged]);

  const onDragEnd = useCallback(makeDragResponder(dispatch), [dispatch]);

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
          droppableId="unused-statuses-container"
          type={DraggableType.Unused}
          isDropDisabled={disabled || readonly}
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              <UnusedColumnCard
                state={state}
                disabled={disabled}
                readonly={readonly}
              />
            </Container>
          )}
        </Droppable>
        <Droppable
          droppableId="workflow-columns-container"
          direction="horizontal"
          type={DraggableType.WorkstageColumn}
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {state.columnOrder.map((columnId, index) => {
                const column = state.columns[columnId];
                const statuses = column.statusIds.map(
                  (statusId) => state.statuses[statusId],
                );
                return (
                  <WorkflowStageCard
                    key={column.id}
                    column={column}
                    statuses={statuses}
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
          <Droppable
            droppableId="new-column-container"
            type={DraggableType.NewColumn}
          >
            {(provided) => (
              <Container {...provided.droppableProps} ref={provided.innerRef}>
                <NewColumnCard disabled={disabled} readonly={readonly} />
              </Container>
            )}
          </Droppable>
        ) : null}
      </Flex>
    </DragDropContext>
  );
};

type UnusedColumnCardProps = {
  state: WorkflowState;
  disabled: boolean;
  readonly: boolean;
};

const UnusedColumnCard: FC<UnusedColumnCardProps> = ({
  state,
  disabled,
  readonly,
}) => (
  <WorkflowStageCard
    key={DraggableType.Unused}
    column={state.columns[DraggableType.Unused]}
    statuses={state.columns[DraggableType.Unused].statusIds.map(
      (statusIdId) => state.statuses[statusIdId],
    )}
    index={0}
    isDragDisabled={true}
    disabled={disabled}
    readonly={readonly}
  />
);

type NewColumnCardProps = {
  disabled: boolean;
  readonly: boolean;
};

const NewColumnCard: FC<NewColumnCardProps> = ({ disabled, readonly }) => (
  <WorkflowStageCard
    key={DraggableType.NewColumn}
    column={{
      id: DraggableType.NewColumn,
      statusIds: [],
      title: "New Column",
    }}
    statuses={[]}
    index={0}
    isDragDisabled={true}
    disabled={disabled}
    readonly={readonly}
  />
);
