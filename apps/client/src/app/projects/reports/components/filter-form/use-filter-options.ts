import { FilterOptions } from "@agileplanning-io/flow-components";
import {
  ClientIssueFilter,
  filterIssues,
  Issue,
} from "@agileplanning-io/flow-metrics";
import { useEffect, useState } from "react";
import { pipe, compact, uniq, flatten, map } from "remeda";

export const useFilterOptions = (
  issues?: Issue[],
  filter?: ClientIssueFilter,
): FilterOptions => {
  const [resolutions, setResolutions] = useState<string[]>();
  const [statuses, setStatuses] = useState<string[]>();
  const [labels, setLabels] = useState<string[]>();
  const [components, setComponents] = useState<string[]>();
  const [issueTypes, setIssueTypes] = useState<string[]>();
  const [assignees, setAssignees] = useState<string[]>();

  useEffect(() => {
    if (!issues) {
      return;
    }

    const filteredIssues = filterIssues(issues, {
      hierarchyLevel: filter?.hierarchyLevel,
    });

    setResolutions(getUniqueValues(filteredIssues, "resolution"));
    setIssueTypes(getUniqueValues(filteredIssues, "issueType"));
    setStatuses(getUniqueValues(filteredIssues, "status"));
    setAssignees(getUniqueValues(filteredIssues, "assignee"));
    setLabels(makeLabelOptions(filteredIssues));
    setComponents(makeComponentOptions(filteredIssues));
  }, [
    issues,
    filter,
    setResolutions,
    setIssueTypes,
    setStatuses,
    setAssignees,
    setLabels,
    setComponents,
  ]);

  return {
    resolutions,
    statuses,
    labels,
    components,
    issueTypes,
    assignees,
  };
};

const getUniqueValues = (issues: Issue[], property: keyof Issue): string[] => {
  return pipe(
    issues,
    map((issue) => issue[property]?.toString()),
    compact,
    uniq(),
  );
};

const makeLabelOptions = (issues: Issue[]): string[] => {
  const options: string[] = uniq(flatten(issues.map((issue) => issue.labels)));
  return options;
};

const makeComponentOptions = (issues: Issue[]): string[] => {
  const options: string[] = uniq(
    flatten(issues.map((issue) => issue.components)),
  );
  return options;
};
