import { LoadingSpinner } from "@app/components/loading-spinner";
import { Project, UpdateProjectParams, useUpdateProject } from "@data/projects";
import { Alert, Button, Form, Input } from "antd";
import { FC, useCallback, useState } from "react";
import {
  IssueAttributesFilterForm,
  WorkflowBoard,
  WorkflowBoardProps,
} from "@agileplanning-io/flow-components";
import {
  ClientIssueFilter,
  DateFilterType,
  fromClientFilter,
  toClientFilter,
  Workflow,
} from "@agileplanning-io/flow-metrics";
import { FullScreenDrawer } from "@app/components/full-screen-drawer";

export type EditProjectFormProps = {
  project: Project;
  onClose: () => void;
};

export const EditProjectForm: FC<EditProjectFormProps> = ({
  project,
  onClose,
}) => {
  const [updatedStoryWorkflow, setUpdatedStoryWorkflow] =
    useState<UpdateProjectParams["storyWorkflowStages"]>();

  const [updatedEpicWorkflow, setUpdatedEpicWorkflow] =
    useState<UpdateProjectParams["epicWorkflowStages"]>();

  const [updatedName, setUpdatedName] = useState(project.name);

  const [updatedDefaultCompletedFilter, setUpdatedDefaultCompletedFilter] =
    useState<ClientIssueFilter>(toClientFilter(project.defaultCompletedFilter));

  const [validationErrors, setValidationErrors] = useState<string[]>();
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const updateValidationErrors = (validationErrors?: string[]) => {
    if (!validationErrors) {
      setShowValidationErrors(false);
    }

    setValidationErrors(validationErrors);
  };

  const updateProject = useUpdateProject();

  const onStoryWorkflowChanged = useCallback(
    (workflow: Workflow, validationErrors?: string[]) => {
      updateValidationErrors(validationErrors);
      setUpdatedStoryWorkflow(
        workflow.stages.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      );
    },
    [setUpdatedStoryWorkflow],
  );

  const onEpicWorkflowChanged = useCallback(
    (workflow: Workflow, validationErrors?: string[]) => {
      updateValidationErrors(validationErrors);
      setUpdatedEpicWorkflow(
        workflow.stages.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      );
    },
    [setUpdatedEpicWorkflow],
  );

  type WorkflowToEdit = {
    workflow: Workflow;
    title: string;
    onWorkflowChanged: WorkflowBoardProps["onWorkflowChanged"];
  };

  const [workflowToEdit, setWorkflowToEdit] = useState<WorkflowToEdit>();

  if (!project) {
    return <LoadingSpinner />;
  }

  const applyChanges = () => {
    if (
      updatedStoryWorkflow &&
      updatedEpicWorkflow &&
      updatedDefaultCompletedFilter
    ) {
      if (validationErrors?.length) {
        setShowValidationErrors(true);
        return;
      }

      updateProject.mutate(
        {
          id: project.id,
          name: updatedName,
          storyWorkflowStages: updatedStoryWorkflow,
          epicWorkflowStages: updatedEpicWorkflow,
          defaultCycleTimePolicy: project.defaultCycleTimePolicy,
          defaultCompletedFilter: fromClientFilter(
            updatedDefaultCompletedFilter,
            DateFilterType.Completed,
          ),
        },
        {
          onSuccess: onClose,
        },
      );
    }
  };

  return (
    <>
      <h2>Project Details</h2>

      <Form layout="vertical">
        <Form.Item label="Name">
          <Input
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
        </Form.Item>
      </Form>

      <h2>Default Completed Work Filter</h2>

      <IssueAttributesFilterForm
        filter={updatedDefaultCompletedFilter}
        setFilter={setUpdatedDefaultCompletedFilter}
        showResolutionFilter={true}
        showStatusFilter={false}
        showAssigneesFilter={false}
        filterOptions={project}
        labelColSpan={2}
        wrapperColSpan={10}
      />

      <h2>Workflows</h2>

      <h3>
        Story Workflow
        <Button
          style={{ width: "fit-content", marginTop: "8px" }}
          type="link"
          onClick={() =>
            setWorkflowToEdit({
              workflow: project.workflowScheme.stories,
              title: "Edit Story Workflow",
              onWorkflowChanged: onStoryWorkflowChanged,
            })
          }
        >
          Edit
        </Button>
      </h3>

      <WorkflowBoard
        workflow={project.workflowScheme.stories}
        onWorkflowChanged={onStoryWorkflowChanged}
        disabled={updateProject.isLoading}
        readonly={true}
      />

      <h3>
        Epic Workflow
        <Button
          style={{ width: "fit-content", marginTop: "8px" }}
          type="link"
          onClick={() =>
            setWorkflowToEdit({
              workflow: project.workflowScheme.epics,
              title: "Edit Epic Workflow",
              onWorkflowChanged: onEpicWorkflowChanged,
            })
          }
        >
          Edit
        </Button>
      </h3>

      <WorkflowBoard
        workflow={project.workflowScheme.epics}
        onWorkflowChanged={onEpicWorkflowChanged}
        disabled={updateProject.isLoading}
        readonly={true}
      />

      <Button
        type="primary"
        style={{ width: "fit-content", marginTop: "8px" }}
        onClick={applyChanges}
        loading={updateProject.isLoading}
        disabled={updateProject.isLoading}
      >
        Apply Changes
      </Button>

      <FullScreenDrawer
        title={workflowToEdit?.title}
        open={workflowToEdit !== undefined}
        onClose={() => setWorkflowToEdit(undefined)}
        height="90%"
      >
        {workflowToEdit ? (
          <>
            {showValidationErrors && (
              <Alert
                type="error"
                style={{ padding: 0, marginBottom: "8px" }}
                description={
                  <ul>
                    {validationErrors?.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                }
              />
            )}

            <WorkflowBoard
              workflow={workflowToEdit.workflow}
              onWorkflowChanged={workflowToEdit.onWorkflowChanged}
              disabled={updateProject.isLoading}
              readonly={false}
            />

            <Button
              type="primary"
              style={{ width: "fit-content", marginTop: "8px" }}
              onClick={applyChanges}
              loading={updateProject.isLoading}
              disabled={
                updatedStoryWorkflow === undefined ||
                updatedEpicWorkflow === undefined ||
                updateProject.isLoading
              }
            >
              Apply Changes
            </Button>
          </>
        ) : null}
      </FullScreenDrawer>
    </>
  );
};
