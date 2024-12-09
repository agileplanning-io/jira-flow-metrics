import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import { getSelectedStages } from "@data/workflows";
import { getHeaderOptions } from "./header-options";
import {
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
} from "@agileplanning-io/flow-metrics";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy } = useProjectContext();

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  const selectedStoryStages = getSelectedStages(
    project.workflowScheme.stories,
    cycleTimePolicy,
  );

  const selectedEpicStages = getSelectedStages(
    project.workflowScheme.epics,
    cycleTimePolicy.epics.type === EpicCycleTimePolicyType.EpicStatus
      ? cycleTimePolicy.epics
      : undefined,
  );

  const options: ExpandableOptionsHeader["options"][number][] = [
    {
      label: "story stages",
      value: `Stages=${selectedStoryStages}`,
    },
    {
      value:
        cycleTimePolicy.type === CycleTimePolicyType.LeadTime
          ? "Lead Time"
          : "Process Time",
    },
    {
      label: "epic policy type",
      value: cycleTimePolicy.epics.type,
    },
  ];

  if (cycleTimePolicy.epics.type === EpicCycleTimePolicyType.EpicStatus) {
    options.push({
      label: "epic stages",
      value: `Stages=${selectedEpicStages}`,
    });
  }

  if (cycleTimePolicy?.epics.type === EpicCycleTimePolicyType.Derived) {
    options.push(...getHeaderOptions(cycleTimePolicy.epics));
  }

  return (
    <ExpandableOptions
      header={{
        title: "Cycle Time Policy",
        options,
      }}
    >
      <EditCycleTimePolicyForm
        project={project}
        cycleTimePolicy={cycleTimePolicy}
        setCycleTimePolicy={setCycleTimePolicy}
      />
    </ExpandableOptions>
  );
};
