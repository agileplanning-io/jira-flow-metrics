import {
  ClientIssueFilter,
  CycleTimePolicy,
  CycleTimePolicyType,
  DraftPolicy,
  EpicCycleTimePolicyType,
  getSelectedStages,
  IssueAttributesFilter,
  SavedPolicy,
  StatusCycleTimePolicy,
  TransitionStatus,
  WorkflowScheme,
} from "@agileplanning-io/flow-metrics";
import { Typography } from "antd";
import { clone, flat } from "remeda";
import { FC, Key, useMemo } from "react";
import { CurrentPolicy, PoliciesDropdown } from "./policies-dropdown";
import { Dropdown, DropdownItemType } from "../control-bars/dropdown";
import { FormControl } from "../control-bars/form-control";
import { HelpIcon } from "../control-bars/help-icon";
import { Popdown } from "../control-bars/popdown";
import {
  FilterOptions,
  IssueAttributesFilterForm,
} from "../filters/issue-attributes-filter-form";
import { WorkflowStagesTable } from "../workflow-stages-table";
import { ControlBar } from "../control-bars/control-bar";
import { summariseFilter } from "../filters/summarise-filter";

type EditCycleTimePolicyForm = {
  currentPolicy: CurrentPolicy;
  defaultCompletedFilter?: IssueAttributesFilter;
  selectCycleTimePolicy: (policyId?: string) => void;
  updateCurrentPolicy: (policy: CycleTimePolicy) => void;
  savedPolicies?: SavedPolicy[];
  filterOptions: FilterOptions;
  workflowScheme: WorkflowScheme;
  onMakeDefaultClicked: (policy: SavedPolicy) => void;
  onSaveClicked: (policy: SavedPolicy) => void;
  saveCycleTimePolicy: (policy: DraftPolicy) => Promise<SavedPolicy>;
  deleteCycleTimePolicy: (policyId: string) => Promise<void>;
};

export const EditCycleTimePolicyForm: FC<EditCycleTimePolicyForm> = ({
  currentPolicy,
  defaultCompletedFilter,
  selectCycleTimePolicy,
  updateCurrentPolicy,
  savedPolicies,
  filterOptions,
  workflowScheme,
  onMakeDefaultClicked,
  onSaveClicked,
  saveCycleTimePolicy,
  deleteCycleTimePolicy,
}) => {
  const selectedStoryStages = useMemo(() => {
    return getSelectedStages(workflowScheme.stories, currentPolicy.policy);
  }, [workflowScheme, currentPolicy.policy]);

  const selectedEpicStages = useMemo(() => {
    if (
      currentPolicy.policy.epics.type !== EpicCycleTimePolicyType.EpicStatus
    ) {
      return undefined;
    }

    return getSelectedStages(workflowScheme.epics, currentPolicy.policy.epics);
  }, [workflowScheme, currentPolicy.policy]);

  const cycleTimePolicyType = currentPolicy.policy.type;
  const onStoryCycleTimePolicyTypeChanged = (type: CycleTimePolicyType) => {
    const policy = clone(currentPolicy.policy);
    if (type !== policy.type) {
      policy.type = type;
      updateCurrentPolicy(policy);
    }
  };

  const onStoryStagesChanged = (keys: Key[]) => {
    const policy = clone(currentPolicy.policy);

    const statuses: string[] = flat(
      workflowScheme.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)),
    );

    policy.statuses = statuses;
    updateCurrentPolicy(policy);
  };

  const onEpicStagesChanged = (keys: Key[]) => {
    const policy = clone(currentPolicy.policy);

    if (policy.epics.type === EpicCycleTimePolicyType.EpicStatus) {
      const statuses: string[] = flat(
        workflowScheme.epics.stages
          .filter((stage) => keys.includes(stage.name))
          .map((stage) => stage.statuses.map((status) => status.name)),
      );

      policy.epics.statuses = statuses;
      updateCurrentPolicy(policy);
    }
  };

  const onFilterChanged = (filter: ClientIssueFilter) => {
    const policy = clone(currentPolicy.policy);
    if (policy.epics.type === EpicCycleTimePolicyType.Derived) {
      policy.epics = {
        type: EpicCycleTimePolicyType.Derived,
        ...filter,
      };
    }
    updateCurrentPolicy(policy);
  };

  const epicCycleTimePolicyType = currentPolicy.policy.epics.type;
  const onEpicCycleTimePolicyTypeChanged = (
    type: CycleTimePolicy["epics"]["type"],
  ) => {
    const policy = clone(currentPolicy.policy);
    if (type !== policy.epics.type) {
      if (type === EpicCycleTimePolicyType.EpicStatus) {
        policy.epics = {
          ...buildDefaultStatusesPolicy(workflowScheme, "epics"),
          type: EpicCycleTimePolicyType.EpicStatus,
        };
      } else {
        policy.epics = {
          type: EpicCycleTimePolicyType.Derived,
          ...clone(defaultCompletedFilter),
        };
      }
      updateCurrentPolicy(policy);
    }
  };

  const policyItems: DropdownItemType<CycleTimePolicyType>[] = [
    { label: "Process Time", key: CycleTimePolicyType.ProcessTime },
    { label: "Lead Time", key: CycleTimePolicyType.LeadTime },
  ];

  const epicPolicyItems: DropdownItemType<EpicCycleTimePolicyType>[] = [
    { label: "Status", key: EpicCycleTimePolicyType.EpicStatus },
    { label: "Derived", key: EpicCycleTimePolicyType.Derived },
  ];

  return (
    <ControlBar>
      {savedPolicies ? (
        <PoliciesDropdown
          savedPolicies={savedPolicies}
          currentPolicy={currentPolicy}
          saveCycleTimePolicy={saveCycleTimePolicy}
          deleteCycleTimePolicy={deleteCycleTimePolicy}
          onPolicySelected={(policy) => {
            if (policy) {
              selectCycleTimePolicy(policy.id);
            } else {
              selectCycleTimePolicy(undefined);
            }
          }}
          onSaveClicked={onSaveClicked}
          onMakeDefaultClicked={onMakeDefaultClicked}
        />
      ) : null}

      <FormControl
        label={
          <>
            Cycle time policy{" "}
            <HelpIcon
              content={
                <span>
                  How to calculate cycle times.
                  <br />
                  <Typography.Text code>Process Time</Typography.Text> is the
                  amount of time the issue spent in the selected workflow
                  stages.
                  <br />
                  <Typography.Text code>Lead Time</Typography.Text> is the total
                  time to completion (including wait time).
                </span>
              }
            />
          </>
        }
      >
        <Dropdown
          items={policyItems}
          selectedKey={cycleTimePolicyType}
          onItemSelected={onStoryCycleTimePolicyTypeChanged}
        />
      </FormControl>

      <FormControl
        label={
          <>
            Selected stages{" "}
            <HelpIcon
              content={
                <span>
                  The workflow stages to count as 'in progress'.
                  <br />
                  Time spent in these stages is counted towards the cycle time,
                  and time spent in other stages is counted as 'wait time'.
                </span>
              }
            />
          </>
        }
      >
        <Popdown
          title="Select story stages"
          value={selectedStoryStages}
          renderLabel={(selectedStoryStages) => selectedStoryStages.join(", ")}
          onValueChanged={(stages) => onStoryStagesChanged(stages)}
        >
          {(value, setValue) => (
            <WorkflowStagesTable
              workflowStages={workflowScheme.stories.stages}
              selectedStages={value}
              onSelectionChanged={(stages) => setValue(stages as string[])}
            />
          )}
        </Popdown>
      </FormControl>

      <FormControl label="Epic policy">
        <Dropdown
          items={epicPolicyItems}
          selectedKey={epicCycleTimePolicyType}
          onItemSelected={onEpicCycleTimePolicyTypeChanged}
        />
      </FormControl>

      {epicCycleTimePolicyType === EpicCycleTimePolicyType.Derived ? (
        <FormControl label="Completed issues">
          <Popdown
            renderLabel={summariseFilter}
            value={currentPolicy.policy.epics as IssueAttributesFilter}
            title="Completed issues filter"
            onValueChanged={onFilterChanged}
          >
            {(value, setValue) => (
              <div style={{ width: 480 }}>
                <IssueAttributesFilterForm
                  filter={value}
                  filterOptions={filterOptions}
                  setFilter={setValue}
                  showAssigneesFilter={false}
                  showResolutionFilter={true}
                  showStatusFilter={false}
                  labelColSpan={6}
                  wrapperColSpan={18}
                />
              </div>
            )}
          </Popdown>
        </FormControl>
      ) : (
        <FormControl
          label={
            <>
              Selected stages{" "}
              <HelpIcon
                content={
                  <span>
                    The workflow stages to count as 'in progress'.
                    <br />
                    Time spent in these stages is counted towards the cycle
                    time, and time spent in other stages is counted as 'wait
                    time'.
                  </span>
                }
              />
            </>
          }
        >
          <Popdown
            title="Select epic stages"
            value={selectedEpicStages}
            renderLabel={(selectedEpicStages) => selectedEpicStages?.join(", ")}
            onValueChanged={(stages) => {
              if (stages) {
                onEpicStagesChanged(stages);
              }
            }}
          >
            {(value, setValue) => (
              <WorkflowStagesTable
                workflowStages={workflowScheme.epics.stages}
                selectedStages={value}
                onSelectionChanged={(stages) => setValue(stages as string[])}
              />
            )}
          </Popdown>
        </FormControl>
      )}
    </ControlBar>
  );
};

const buildDefaultStatusesPolicy = (
  workflowScheme: WorkflowScheme,
  hierarchyLevel: keyof WorkflowScheme,
): StatusCycleTimePolicy => {
  const statuses: TransitionStatus[] = flat(
    workflowScheme[hierarchyLevel].stages
      .filter((stage) => stage.selectByDefault)
      .map((stage) => stage.statuses),
  );
  const policy: StatusCycleTimePolicy = {
    statuses: statuses.map((status) => status.name),
  };
  return policy;
};
