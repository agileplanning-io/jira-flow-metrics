import { Key, useEffect, useState } from "react";
import {
  CycleTimePolicy,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";
import {
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  SelectProps,
  Space,
  Tag,
} from "antd";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { clone, flatten } from "rambda";
import { useProjectContext } from "@app/projects/context";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { WorkflowStagesTable } from "@agileplanning-io/flow-components";
import { LoadingSpinner } from "@app/components/loading-spinner";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy, issues } =
    useProjectContext();

  const selectedStoryStages = project?.workflow.stories.stages
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          cycleTimePolicy?.stories.statuses?.some(
            (projectStatus) => projectStatus === status.name,
          ),
      ),
    )
    .map((stage) => stage.name);

  const selectedEpicStages = project?.workflow.epics.stages
    .filter((stage) =>
      stage.statuses.every(
        (status) =>
          cycleTimePolicy?.epics.type === "status" &&
          cycleTimePolicy.epics.statuses?.some(
            (projectStatus) => projectStatus === status.name,
          ),
      ),
    )
    .map((stage) => stage.name);

  const [labels, setLabels] = useState<SelectProps["options"]>();

  useEffect(() => {
    setLabels(makeOptions(project?.labels));
  }, [project]);

  if (!cycleTimePolicy) {
    return <LoadingSpinner />;
  }

  const options: ExpandableOptionsHeader["options"][number][] = [
    {
      label: "story stages",
      value: selectedStoryStages
        ? `Stages=${selectedStoryStages}`
        : "StatusCategory=In Progress",
    },
    {
      value: `${
        cycleTimePolicy?.stories.includeWaitTime ? "Include" : "Exclude"
      } story wait time`,
    },
  ];

  if (cycleTimePolicy.epics.type === "status") {
    options.push(
      ...[
        {
          label: "epic stages",
          value: selectedEpicStages
            ? `Stages=${selectedEpicStages}`
            : "StatusCategory=In Progress",
        },
        {
          value: `${
            cycleTimePolicy.epics.includeWaitTime ? "Include" : "Exclude"
          } epic wait time`,
        },
      ],
    );
  }

  if (cycleTimePolicy?.epics.type === "computed") {
    options.push({
      label:
        cycleTimePolicy?.epics.labelsFilter?.labelFilterType ===
        LabelFilterType.Include
          ? "Include labels"
          : "Exclude labels",
      value: cycleTimePolicy?.epics.labelsFilter?.labels?.join(),
    });
  }

  const onStoryStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      project?.workflow.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    const policy = clone(cycleTimePolicy);
    policy.stories.statuses = statuses;
    setCycleTimePolicy(policy);
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flatten(
      project?.workflow.epics.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "status") {
      policy.epics.statuses = statuses;
    }
    setCycleTimePolicy(policy);
  };

  const onIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    const policy = clone(cycleTimePolicy);
    policy.stories.includeWaitTime = e.target.checked;
    setCycleTimePolicy(policy);
  };

  const onLabelsChanged = (labels: string[]) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "computed") {
      if (policy.epics.labelsFilter) {
        policy.epics.labelsFilter.labels = labels;
      }
    }
    setCycleTimePolicy(policy);
  };

  const onLabelFilterTypeChanged = (labelFilterType: LabelFilterType) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "computed") {
      if (policy.epics.labelsFilter) {
        policy.epics.labelsFilter.labelFilterType = labelFilterType;
      }
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
    <ExpandableOptions
      header={{
        title: "Cycle Time Policy",
        options,
      }}
      extra={issues ? <Tag>{issues.length} issues</Tag> : null}
    >
      <Form layout="vertical">
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <h3>Stories</h3>
            <Form.Item label="Selected Stages">
              <WorkflowStagesTable
                workflowStages={project?.workflow.stories.stages}
                selectedStages={selectedStoryStages}
                onSelectionChanged={onStoryStagesChanged}
              />
            </Form.Item>
            <Checkbox
              checked={cycleTimePolicy.stories.includeWaitTime}
              onChange={onIncludeWaitTimeChanged}
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
              <Form.Item label="Selected Stages">
                <WorkflowStagesTable
                  workflowStages={project?.workflow.epics.stages}
                  selectedStages={selectedEpicStages}
                  onSelectionChanged={onEpicStagesChanged}
                />
              </Form.Item>
            )}
          </Col>
        </Row>
        <Row gutter={[8, 8]}></Row>
        <Row gutter={[8, 8]}>
          <Col span={8}></Col>
        </Row>
      </Form>
    </ExpandableOptions>
  );
};

const makeOptions = (values?: string[]): SelectProps["options"] => {
  return values?.map((value) => ({
    label: value,
    value: value,
  }));
};
