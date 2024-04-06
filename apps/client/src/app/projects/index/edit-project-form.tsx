import { LoadingSpinner } from "@app/components/loading-spinner";
import { Project, UpdateProjectParams, useUpdateProject } from "@data/projects";
import { Button, Form, Input } from "antd";
import { FC, useCallback, useState } from "react";
import { WorkflowBoard } from "@agileplanning-io/flow-components";
import { WorkflowStage } from "@data/issues";
import { CycleTimePolicy } from "@agileplanning-io/flow-metrics";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";

export type EditProjectFormProps = {
  project: Project;
  onClose: () => void;
};

export const EditProjectForm: FC<EditProjectFormProps> = ({
  project,
  onClose,
}) => {
  const [updatedStoryWorkflow, setUpdatedStoryWorkflow] =
    useState<UpdateProjectParams["storyWorkflow"]>();

  const [updatedEpicWorkflow, setUpdatedEpicWorkflow] =
    useState<UpdateProjectParams["epicWorkflow"]>();

  const [updatedCycleTimePolicy, setUpdatedCycleTimePolicy] =
    useState<CycleTimePolicy>(project?.defaultCycleTimePolicy);

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

  if (!project) {
    return <LoadingSpinner />;
  }

  const applyChanges = () => {
    if (updatedStoryWorkflow && updatedEpicWorkflow && updatedCycleTimePolicy) {
      updateProject.mutate(
        {
          id: project.id,
          name: project.name,
          storyWorkflow: updatedStoryWorkflow,
          epicWorkflow: updatedEpicWorkflow,
          defaultCycleTimePolicy: updatedCycleTimePolicy,
        },
        {
          onSuccess: onClose,
        },
      );
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Name">
        <Input value={project.name} />
      </Form.Item>

      <Form.Item label="Story Workflow" style={{ overflowX: "auto" }}>
        <WorkflowBoard
          workflow={project.workflowScheme.stories}
          onWorkflowChanged={onStoryWorkflowChanged}
          disabled={updateProject.isLoading}
        />
      </Form.Item>

      <Form.Item label="Epic Workflow" style={{ overflowX: "auto" }}>
        <WorkflowBoard
          workflow={project.workflowScheme.epics}
          onWorkflowChanged={onEpicWorkflowChanged}
          disabled={updateProject.isLoading}
        />
      </Form.Item>

      <Form.Item label="Default Cycle Time Policy">
        <EditCycleTimePolicyForm
          project={project}
          cycleTimePolicy={updatedCycleTimePolicy}
          setCycleTimePolicy={setUpdatedCycleTimePolicy}
        />
      </Form.Item>

      <Button
        type="primary"
        onClick={applyChanges}
        loading={updateProject.isLoading}
        disabled={updatedStoryWorkflow === undefined || updateProject.isLoading}
      >
        Apply Changes
      </Button>
    </Form>
  );
};
