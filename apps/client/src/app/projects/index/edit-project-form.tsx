import { LoadingSpinner } from "@app/components/loading-spinner";
import {
  Project,
  UpdateProjectParams,
  Workflow,
  useUpdateProject,
} from "@data/projects";
import { Button, Form, Input } from "antd";
import { FC, useCallback, useState } from "react";
import {
  WorkflowBoard,
  WorkflowBoardProps,
} from "@agileplanning-io/flow-components";
import { WorkflowStage } from "@data/issues";
import { CycleTimePolicy } from "@agileplanning-io/flow-metrics";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import { FullScreenDrawer } from "@app/components/full-screen-drawer";
import { EditFilterForm } from "../reports/components/filter-form/edit-filter-form";
import { ClientIssueFilter, toClientFilter } from "@app/filter/context/context";

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

  const [updatedCycleTimePolicy, setUpdatedCycleTimePolicy] =
    useState<CycleTimePolicy>(project?.defaultCycleTimePolicy);

  const [updatedDefaultCompletedFilter, setUpdatedDefaultCompletedFilter] =
    useState<ClientIssueFilter>(toClientFilter(project.defaultCompletedFilter));

  const updateProject = useUpdateProject();

  const onStoryWorkflowChanged = useCallback(
    (workflow: WorkflowStage[]) =>
      setUpdatedStoryWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      ),
    [setUpdatedStoryWorkflow],
  );

  const onEpicWorkflowChanged = useCallback(
    (workflow: WorkflowStage[]) =>
      setUpdatedEpicWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      ),
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
    if (updatedStoryWorkflow && updatedEpicWorkflow && updatedCycleTimePolicy) {
      updateProject.mutate(
        {
          id: project.id,
          name: project.name,
          storyWorkflowStages: updatedStoryWorkflow,
          epicWorkflowStages: updatedEpicWorkflow,
          defaultCycleTimePolicy: updatedCycleTimePolicy,
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
          <Input value={project.name} />
        </Form.Item>
      </Form>

      <h2>Default Cycle Time Policy</h2>

      <EditCycleTimePolicyForm
        project={project}
        cycleTimePolicy={updatedCycleTimePolicy}
        setCycleTimePolicy={setUpdatedCycleTimePolicy}
      />

      <h2>Default Completed Work Filter</h2>

      <EditFilterForm
        filter={updatedDefaultCompletedFilter}
        setFilter={setUpdatedDefaultCompletedFilter}
        showDateSelector={false}
        showHierarchyFilter={false}
        showResolutionFilter={true}
        showStatusFilter={false}
        showAssigneesFilter={false}
        issueTypes={project.issueTypes}
        labels={project.labels}
        components={project.components}
        resolutions={project.resolutions}
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
