import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { useProjectContext } from "@app/projects/context";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditCycleTimePolicyForm } from "@app/components/edit-cycle-time-policy-form";
import { getSelectedStages } from "@data/workflows";
import { getHeaderOptions } from "./header-options";

export const CycleTimePolicyForm = () => {
  const { project, cycleTimePolicy, setCycleTimePolicy } = useProjectContext();

  if (!cycleTimePolicy || !project) {
    return <LoadingSpinner />;
  }

  const selectedStoryStages = getSelectedStages(
    project.workflowScheme.stories,
    cycleTimePolicy.stories.type === "status"
      ? cycleTimePolicy?.stories
      : undefined,
  );

  const selectedEpicStages = getSelectedStages(
    project.workflowScheme.epics,
    cycleTimePolicy.epics.type === "status" ? cycleTimePolicy.epics : undefined,
  );

  const options: ExpandableOptionsHeader["options"][number][] = [
    {
      label: "story stages",
      value:
        cycleTimePolicy.stories.type === "status"
          ? `Stages=${selectedStoryStages}`
          : "StatusCategory=In Progress",
    },
    {
      value: `${
        cycleTimePolicy.stories.includeWaitTime ? "Include" : "Exclude"
      } story wait time`,
    },
    {
      label: "epic policy type",
      value: cycleTimePolicy.epics.type,
    },
  ];

  if (
    cycleTimePolicy.epics.type === "status" ||
    cycleTimePolicy.epics.type === "statusCategory"
  ) {
    options.push(
      {
        label: "epic stages",
        value:
          cycleTimePolicy.epics.type === "status"
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

  if (cycleTimePolicy?.epics.type === "computed") {
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
