import { LoadingSpinner } from "@app/components/loading-spinner";
import { Project, UpdateProjectParams, useUpdateProject } from "@data/projects";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Select,
  SelectProps,
  Space,
} from "antd";
import { FC, Key, useCallback, useState } from "react";
import {
  WorkflowBoard,
  WorkflowStagesTable,
} from "@agileplanning-io/flow-components";
import { WorkflowStage } from "@data/issues";
import { flatten } from "rambda";
import { LabelFilterType } from "@agileplanning-io/flow-metrics";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  ComputedCycleTimePolicy,
  fromCycleTimePolicy,
  toCycleTimePolicy,
} from "../context/context";

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
    useState<ComputedCycleTimePolicy>(
      fromCycleTimePolicy(project?.defaultCycleTimePolicy),
    );

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

  const labels = makeOptions(project.labels);

  const onStoryStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      project?.workflow.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({ ...updatedCycleTimePolicy, statuses });
    }
  };

  const onIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({
        ...updatedCycleTimePolicy,
        includeWaitTime: e.target.checked,
      });
    }
  };

  const onLabelFilterTypeChanged = (labelFilterType: LabelFilterType) => {
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({
        ...updatedCycleTimePolicy,
        labelFilterType,
      });
    }
  };

  const onLabelsChanged = (labels: string[]) => {
    if (updatedCycleTimePolicy) {
      setUpdatedCycleTimePolicy({
        ...updatedCycleTimePolicy,
        labels,
      });
    }
  };

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
          defaultCycleTimePolicy: toCycleTimePolicy(updatedCycleTimePolicy),
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
          project={{
            statuses: project.statuses.stories,
            workflow: project.workflow.stories.stages,
          }}
          onWorkflowChanged={onStoryWorkflowChanged}
          disabled={updateProject.isLoading}
        />
      </Form.Item>

      <Form.Item label="Epic Workflow" style={{ overflowX: "auto" }}>
        <WorkflowBoard
          project={{
            statuses: project.statuses.epics,
            workflow: project.workflow.epics.stages,
          }}
          onWorkflowChanged={onEpicWorkflowChanged}
          disabled={updateProject.isLoading}
        />
      </Form.Item>

      <Form.Item label="Default Cycle Time Policy">
        <WorkflowStagesTable
          workflowStages={project.workflow.stories.stages}
          selectedStages={updatedCycleTimePolicy.statuses}
          onSelectionChanged={onStoryStagesChanged}
        />
        <Checkbox
          checked={updatedCycleTimePolicy.includeWaitTime}
          onChange={onIncludeWaitTimeChanged}
        >
          Include wait time
        </Checkbox>

        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Form.Item label="Labels" style={{ width: "100%" }}>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item style={{ width: "25%" }}>
                  <Select
                    value={updatedCycleTimePolicy.labelFilterType}
                    onChange={onLabelFilterTypeChanged}
                    options={[
                      { value: "include", label: "Include" },
                      { value: "exclude", label: "Exclude" },
                    ]}
                  />
                </Form.Item>
                <Form.Item style={{ width: "75%" }}>
                  <Select
                    mode="multiple"
                    allowClear={true}
                    options={labels}
                    value={updatedCycleTimePolicy.labels}
                    onChange={onLabelsChanged}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>
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

const makeOptions = (values?: string[]): SelectProps["options"] => {
  return values?.map((value) => ({
    label: value,
    value: value,
  }));
};
