import { FilterType } from "@agileplanning-io/flow-metrics";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import { getSelectedStages } from "@data/workflows";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy } = useProjectContext();

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  const selectedStoryStages = getSelectedStages(
    project.workflowScheme.stories,
    cycleTimePolicy?.stories,
  );

  const selectedEpicStages = getSelectedStages(
    project.workflowScheme.epics,
    cycleTimePolicy.epics.type === "status" ? cycleTimePolicy.epics : undefined,
  );

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
    {
      label: "epic policy type",
      value: cycleTimePolicy?.epics.type,
    },
  ];

  if (cycleTimePolicy.epics.type === "status") {
    options.push(
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
    );
  }

  if (
    cycleTimePolicy?.epics.type === "computed" &&
    cycleTimePolicy.epics.labelsFilter?.labels?.length
  ) {
    options.push({
      label:
        cycleTimePolicy?.epics.labelsFilter?.labelFilterType ===
        FilterType.Include
          ? "Include labels"
          : "Exclude labels",
      value: cycleTimePolicy?.epics.labelsFilter?.labels?.join(),
    });
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
