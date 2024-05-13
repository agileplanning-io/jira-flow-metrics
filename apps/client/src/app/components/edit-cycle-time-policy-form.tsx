import { WorkflowStagesTable } from "@agileplanning-io/flow-components";
import {
  CycleTimePolicy,
  StatusCycleTimePolicy,
  TransitionStatus,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { getSelectedStages } from "@data/workflows";
import { Col, Form, Row, Select, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { clone, flatten } from "remeda";
import { FC, Key, useEffect, useMemo } from "react";
import { EditFilterForm } from "@app/projects/reports/components/filter-form/edit-filter-form";
import { ClientIssueFilter } from "@app/filter/client-issue-filter";

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
      const epicPolicy = buildDefaultEpicStatusesPolicy(project);
      setCycleTimePolicy({
        ...cycleTimePolicy,
        epics: epicPolicy,
      });
    }
  }, [project, selectedEpicStages, cycleTimePolicy, setCycleTimePolicy]);

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

  const onFilterChanged = (filter: ClientIssueFilter) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "computed") {
      policy.epics = {
        type: "computed",
        ...filter,
      };
    }
    setCycleTimePolicy(policy);
  };

  const epicCycleTimePolicyType = cycleTimePolicy.epics.type;
  const onEpicCycleTimePolicyTypeChanged = (
    type: CycleTimePolicy["epics"]["type"],
  ) => {
    const policy = clone(cycleTimePolicy);
    if (type !== policy.epics.type) {
      if (type === "status") {
        policy.epics = buildDefaultEpicStatusesPolicy(project);
      } else {
        policy.epics = { type: "computed" };
      }
      setCycleTimePolicy(policy);
    }
  };

  const StoryPolicyForm = () => (
    <Form layout="vertical">
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
    </Form>
  );

  const EpicPolicyForm = () => (
    <>
      <Form layout="horizontal">
        <h3>Epics</h3>
        <Form.Item label="Epic Policy Type">
          <Select
            value={epicCycleTimePolicyType}
            onChange={onEpicCycleTimePolicyTypeChanged}
            options={[
              { value: "computed", label: "Computed" },
              { value: "status", label: "Status" },
            ]}
          />
        </Form.Item>
      </Form>
      {epicCycleTimePolicyType === "computed" ? (
        <EditFilterForm
          filter={cycleTimePolicy.epics}
          resolutions={project.resolutions}
          labels={project.labels}
          components={project.components}
          setFilter={onFilterChanged}
          showDateSelector={false}
          showAssigneesFilter={false}
          showHierarchyFilter={false}
          showResolutionFilter={true}
          showStatusFilter={false}
          labelColSpan={4}
          wrapperColSpan={20}
        />
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
    </>
  );

  return (
    <>
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <StoryPolicyForm />
        </Col>
        <Col span={12}>
          <EpicPolicyForm />
        </Col>
      </Row>
      <Row gutter={[8, 8]}></Row>
      <Row gutter={[8, 8]}>
        <Col span={8}></Col>
      </Row>
    </>
  );
};

const buildDefaultEpicStatusesPolicy = (project: Project) => {
  const statuses: TransitionStatus[] = flatten(
    project.workflowScheme.epics.stages
      .filter((stage) => stage.selectByDefault)
      .map((stage) => stage.statuses),
  );
  const policy: StatusCycleTimePolicy = {
    type: "status",
    statuses: statuses.map((status) => status.name),
    includeWaitTime: false,
  };
  return policy;
};
