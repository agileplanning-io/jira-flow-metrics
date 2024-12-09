import { WorkflowStagesTable } from "@agileplanning-io/flow-components";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
  StatusCycleTimePolicy,
  TransitionStatus,
  WorkflowScheme,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { getSelectedStages } from "@data/workflows";
import { Col, Form, Row, Select } from "antd";
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
    return getSelectedStages(project.workflowScheme.stories, cycleTimePolicy);
  }, [project, cycleTimePolicy]);

  const selectedEpicStages = useMemo(() => {
    if (cycleTimePolicy.epics.type !== EpicCycleTimePolicyType.EpicStatus) {
      return undefined;
    }

    return getSelectedStages(
      project.workflowScheme.epics,
      cycleTimePolicy.epics,
    );
  }, [project, cycleTimePolicy]);

  const cycleTimePolicyType = cycleTimePolicy.type;
  const onStoryCycleTimePolicyTypeChanged = (type: CycleTimePolicyType) => {
    const policy = clone(cycleTimePolicy);
    if (type !== policy.type) {
      policy.type = type;
      setCycleTimePolicy(policy);
    }
  };

  const onStoryStagesChanged = (keys: Key[]) => {
    const policy = clone(cycleTimePolicy);

    const statuses: string[] = flat(
      project?.workflowScheme.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
    );

    policy.statuses = statuses;
    setCycleTimePolicy(policy);
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const policy = clone(cycleTimePolicy);

    if (policy.epics.type === EpicCycleTimePolicyType.EpicStatus) {
      const statuses: string[] = flat(
        project?.workflowScheme.epics.stages
          .filter((stage) => keys.includes(stage.name))
          .map((stage) => stage.statuses.map((status) => status.name)) ?? [],
      );

      policy.epics.statuses = statuses;
      setCycleTimePolicy(policy);
    }
  };

  const onFilterChanged = (filter: ClientIssueFilter) => {
    const policy = clone(cycleTimePolicy);
    if (policy.epics.type === EpicCycleTimePolicyType.Derived) {
      policy.epics = {
        type: EpicCycleTimePolicyType.Derived,
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
      if (type === EpicCycleTimePolicyType.EpicStatus) {
        policy.epics = {
          ...buildDefaultStatusesPolicy(project, "epics"),
          type: EpicCycleTimePolicyType.EpicStatus,
        };
      } else {
        policy.epics = { type: EpicCycleTimePolicyType.Derived };
      }
      setCycleTimePolicy(policy);
    }
  };

  const StoryPolicyForm = () => (
    <Form layout="vertical">
      <h3>Stories</h3>
      <Form.Item label="Story Policy Type">
        <Select
          value={cycleTimePolicyType}
          onChange={onStoryCycleTimePolicyTypeChanged}
          options={[
            { value: "ProcessTime", label: "Process Time" },
            { value: "LeadTime", label: "Lead Time" },
          ]}
        />
      </Form.Item>

      <Form.Item label="Selected Stages">
        <WorkflowStagesTable
          workflowStages={project?.workflowScheme.stories.stages}
          selectedStages={selectedStoryStages}
          onSelectionChanged={onStoryStagesChanged}
        />
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
              { value: "Derived", label: "Derived" },
              { value: "EpicStatus", label: "Status" },
            ]}
          />
        </Form.Item>
      </Form>
      {epicCycleTimePolicyType === EpicCycleTimePolicyType.Derived ? (
        <EditFilterForm
          filter={cycleTimePolicy.epics}
          resolutions={project.resolutions}
          labels={project.labels}
          components={project.components}
          issueTypes={project.issueTypes}
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
        <Form layout="vertical">
          <Form.Item label="Selected Stages">
            <WorkflowStagesTable
              workflowStages={project?.workflowScheme.epics.stages}
              selectedStages={selectedEpicStages}
              onSelectionChanged={onEpicStagesChanged}
            />
          </Form.Item>
        </Form>
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
    statuses: statuses.map((status) => status.name),
  };
  return policy;
};
