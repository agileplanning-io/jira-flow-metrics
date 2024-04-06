import { WorkflowStagesTable } from "@agileplanning-io/flow-components";
import {
  CycleTimePolicy,
  LabelFilterType,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { getSelectedStages } from "@data/workflows";
import { Col, Form, Row, Select, Checkbox, SelectProps, Space } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { clone, flatten } from "rambda";
import { FC, Key, useEffect, useMemo, useState } from "react";

type EditCycleTimePolicyForm = {
  project: Project;
  cycleTimePolicy: CycleTimePolicy;
  setCycleTimePolicy: (policy: CycleTimePolicy) => void;
};

export const EditCycleTimePolicyForm: FC<EditCycleTimePolicyForm> = ({
  project,
  cycleTimePolicy,
  setCycleTimePolicy,
}) => {
  const selectedStoryStages = useMemo(() => {
    return getSelectedStages(
      project?.workflowScheme.stories,
      cycleTimePolicy?.stories,
    );
  }, [project, cycleTimePolicy]);

  const selectedEpicStages = useMemo(() => {
    const epicPolicy = cycleTimePolicy?.epics;

    if (epicPolicy.type !== "status") {
      return undefined;
    }

    const selectedStages = getSelectedStages(
      project?.workflowScheme.epics,
      epicPolicy,
    );

    return selectedStages;
  }, [project, cycleTimePolicy]);

  useEffect(() => {
    const epicPolicy = clone(cycleTimePolicy.epics);
    if (epicPolicy.type === "status" && !epicPolicy.statuses?.length) {
      const statuses: TransitionStatus[] = flatten(
        project.workflowScheme.epics.stages
          .filter((stage) => stage.selectByDefault)
          .map((stage) => stage.statuses),
      );
      epicPolicy.statuses = statuses.map((status) => status.name);
      setCycleTimePolicy({
        ...cycleTimePolicy,
        epics: epicPolicy,
      });
    }
  }, [project, selectedEpicStages, cycleTimePolicy, setCycleTimePolicy]);

  const [labels, setLabels] = useState<SelectProps["options"]>();

  useEffect(() => {
    setLabels(makeOptions(project?.labels));
  }, [project]);

  const onStoryStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      project?.workflowScheme.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    const policy = clone(cycleTimePolicy);
    policy.stories.statuses = statuses;
    setCycleTimePolicy(policy);
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      project?.workflowScheme.epics.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "status") {
      policy.epics.statuses = statuses;
    }
    setCycleTimePolicy(policy);
  };

  const onStoryIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    const policy = clone(cycleTimePolicy);
    policy.stories.includeWaitTime = e.target.checked;
    setCycleTimePolicy(policy);
  };

  const onEpicIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "status") {
      policy.epics.includeWaitTime = e.target.checked;
    }
    setCycleTimePolicy(policy);
  };

  const onLabelsChanged = (labels: string[]) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "computed") {
      if (!policy.epics.labelsFilter) {
        policy.epics.labelsFilter = {};
      }
      policy.epics.labelsFilter.labels = labels;
    }
    setCycleTimePolicy(policy);
  };

  const onLabelFilterTypeChanged = (labelFilterType: LabelFilterType) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "computed") {
      if (!policy.epics.labelsFilter) {
        policy.epics.labelsFilter = {};
      }
      policy.epics.labelsFilter.labelFilterType = labelFilterType;
    }
    setCycleTimePolicy(policy);
  };

  const epicCycleTimePolicyType = cycleTimePolicy.epics.type;
  const onEpicCycleTimePolicyChanged = (
    type: CycleTimePolicy["epics"]["type"],
  ) => {
    const policy = clone(cycleTimePolicy);
    policy.epics.type = type;
    setCycleTimePolicy(policy);
  };

  return (
    <Form layout="vertical">
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <h3>Stories</h3>
          <Form.Item label="Selected Stages">
            <WorkflowStagesTable
              workflowStages={project?.workflowScheme.stories.stages}
              selectedStages={selectedStoryStages}
              onSelectionChanged={onStoryStagesChanged}
            />
          </Form.Item>
          <Checkbox
            checked={cycleTimePolicy.stories.includeWaitTime}
            onChange={onStoryIncludeWaitTimeChanged}
          >
            Include wait time
          </Checkbox>
        </Col>
        <Col span={12}>
          <h3>Epics</h3>
          <Form.Item label="Epic Policy Type">
            <Select
              value={epicCycleTimePolicyType}
              onChange={onEpicCycleTimePolicyChanged}
              options={[
                { value: "computed", label: "Computed" },
                { value: "status", label: "Status" },
              ]}
            />
          </Form.Item>
          {epicCycleTimePolicyType === "computed" ? (
            <Form.Item label="Labels" style={{ width: "100%" }}>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item style={{ width: "25%" }}>
                  <Select
                    value={
                      cycleTimePolicy.epics.type === "computed"
                        ? cycleTimePolicy.epics.labelsFilter?.labelFilterType
                        : undefined
                    }
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
                    value={
                      cycleTimePolicy.epics.type === "computed"
                        ? cycleTimePolicy.epics.labelsFilter?.labels
                        : undefined
                    }
                    onChange={onLabelsChanged}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          ) : (
            <>
              <Form.Item label="Selected Stages">
                <WorkflowStagesTable
                  workflowStages={project?.workflowScheme.epics.stages}
                  selectedStages={selectedEpicStages}
                  onSelectionChanged={onEpicStagesChanged}
                />
              </Form.Item>
              <Checkbox
                checked={cycleTimePolicy.epics.includeWaitTime}
                onChange={onEpicIncludeWaitTimeChanged}
              >
                Include wait time
              </Checkbox>
            </>
          )}
        </Col>
      </Row>
      <Row gutter={[8, 8]}></Row>
      <Row gutter={[8, 8]}>
        <Col span={8}></Col>
      </Row>
    </Form>
  );
};

const makeOptions = (values?: string[]): SelectProps["options"] => {
  return values?.map((value) => ({
    label: value,
    value: value,
  }));
};
