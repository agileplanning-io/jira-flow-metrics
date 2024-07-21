import { WorkflowStagesTable } from "@agileplanning-io/flow-components";
import {
  CycleTimePolicy,
  StatusCycleTimePolicy,
  TransitionStatus,
  WorkflowScheme,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { getSelectedStages } from "@data/workflows";
import { Col, Form, Row, Select, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { clone, flat } from "remeda";
import { FC, Key, useMemo } from "react";
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
    if (cycleTimePolicy.stories.type !== "status") {
      return undefined;
    }

    return getSelectedStages(
      project.workflowScheme.stories,
      cycleTimePolicy.stories,
    );
  }, [project, cycleTimePolicy]);

  const selectedEpicStages = useMemo(() => {
    if (cycleTimePolicy.epics.type !== "status") {
      return undefined;
    }

    return getSelectedStages(
      project.workflowScheme.epics,
      cycleTimePolicy.epics,
    );
  }, [project, cycleTimePolicy]);

  const storyCycleTimePolicyType = cycleTimePolicy.stories.type;
  const onStoryCycleTimePolicyTypeChanged = (
    type: CycleTimePolicy["stories"]["type"],
  ) => {
    const policy = clone(cycleTimePolicy);
    if (type !== policy.stories.type) {
      if (type === "status") {
        policy.stories = buildDefaultStatusesPolicy(project, "stories");
      } else {
        policy.stories = { type: "statusCategory", includeWaitTime: false };
      }
      setCycleTimePolicy(policy);
    }
  };

  const onStoryStagesChanged = (keys: Key[]) => {
    const policy = clone(cycleTimePolicy);
    if (policy.stories.type === "status") {
      const statuses: string[] = flat(
        project?.workflowScheme.stories.stages
          .filter((stage) => keys.includes(stage.name))
          .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
      );
      policy.stories.statuses = statuses;
      setCycleTimePolicy(policy);
    }
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "status") {
      const statuses: string[] = flat(
        project?.workflowScheme.epics.stages
          .filter((stage) => keys.includes(stage.name))
          .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
      );
      policy.epics.statuses = statuses;
      setCycleTimePolicy(policy);
    }
  };

  const onStoryIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    const policy = clone(cycleTimePolicy);
    policy.stories.includeWaitTime = e.target.checked;
    setCycleTimePolicy(policy);
  };

  const onEpicIncludeWaitTimeChanged = (e: CheckboxChangeEvent) => {
    const policy = clone(cycleTimePolicy);
    policy.epics.includeWaitTime = e.target.checked;
    setCycleTimePolicy(policy);
  };

  const onFilterChanged = (filter: ClientIssueFilter) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === "computed") {
      policy.epics = {
        type: "computed",
        includeWaitTime: policy.epics.includeWaitTime,
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
        policy.epics = buildDefaultStatusesPolicy(project, "epics");
      } else if (type === "statusCategory") {
        policy.epics = { type: "statusCategory", includeWaitTime: false };
      } else {
        policy.epics = { type: "computed", includeWaitTime: false };
      }
      setCycleTimePolicy(policy);
    }
  };

  const StoryPolicyForm = () => (
    <Form layout="vertical">
      <h3>Stories</h3>
      <Form.Item label="Story Policy Type">
        <Select
          value={storyCycleTimePolicyType}
          onChange={onStoryCycleTimePolicyTypeChanged}
          options={[
            { value: "status", label: "Status" },
            { value: "statusCategory", label: "Status Category" },
          ]}
        />
      </Form.Item>

      {storyCycleTimePolicyType === "status" ? (
        <Form.Item label="Selected Stages">
          <WorkflowStagesTable
            workflowStages={project?.workflowScheme.stories.stages}
            selectedStages={selectedStoryStages}
            onSelectionChanged={onStoryStagesChanged}
          />
        </Form.Item>
      ) : null}

      <Form.Item>
        <Checkbox
          checked={cycleTimePolicy.stories.includeWaitTime}
          onChange={onStoryIncludeWaitTimeChanged}
        >
          Include wait time
        </Checkbox>
      </Form.Item>
    </Form>
  );

  const EpicPolicyForm = () => (
    <>
      <Form layout="vertical">
        <h3>Epics</h3>
        <Form.Item label="Epic Policy Type">
          <Select
            value={epicCycleTimePolicyType}
            onChange={onEpicCycleTimePolicyTypeChanged}
            options={[
              { value: "computed", label: "Computed" },
              { value: "status", label: "Status" },
              { value: "statusCategory", label: "Status Category" },
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
          {epicCycleTimePolicyType === "status" ? (
            <Form layout="vertical">
              <Form.Item label="Selected Stages">
                <WorkflowStagesTable
                  workflowStages={project?.workflowScheme.epics.stages}
                  selectedStages={selectedEpicStages}
                  onSelectionChanged={onEpicStagesChanged}
                />
              </Form.Item>
            </Form>
          ) : null}
        </>
      )}

      <Form.Item>
        <Checkbox
          checked={cycleTimePolicy.epics.includeWaitTime}
          onChange={onEpicIncludeWaitTimeChanged}
        >
          Include wait time
        </Checkbox>
      </Form.Item>
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
    </>
  );
};

const buildDefaultStatusesPolicy = (
  project: Project,
  hierarchyLevel: keyof WorkflowScheme,
): StatusCycleTimePolicy => {
  const statuses: TransitionStatus[] = flat(
    project.workflowScheme[hierarchyLevel].stages
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
