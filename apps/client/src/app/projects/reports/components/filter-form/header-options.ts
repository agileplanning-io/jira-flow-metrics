import { formatDate, isAbsolute } from "@agileplanning-io/flow-lib";
import { FilterType, ValuesFilter } from "@agileplanning-io/flow-metrics";
import { ExpandableOptionsHeader } from "@app/components/expandable-options";
import { ClientIssueFilter } from "@app/filter/client-issue-filter";

export const getHeaderOptions = (
  filter: ClientIssueFilter,
): ExpandableOptionsHeader["options"][number][] => {
  const options: ExpandableOptionsHeader["options"][number][] = [];

  const makeOptions = (
    filter: ValuesFilter,
    name: string,
  ): ExpandableOptionsHeader["options"][number] => ({
    label:
      filter.type === FilterType.Include
        ? `Include ${name}`
        : `Exclude ${name}`,
    value: filter.values?.join(),
  });

  if (filter.dates) {
    const value = isAbsolute(filter.dates)
      ? `${formatDate(filter.dates.start)}-${formatDate(filter.dates.end)}`
      : `Last ${filter.dates.unitCount}-${filter.dates.unit}${
          filter.dates.unitCount === 1 ? "" : "s"
        }`;
    options.push({
      label: "Dates",
      value,
    });
  }
  if (filter.hierarchyLevel) {
    options.push({ label: "Hierarchy level", value: filter.hierarchyLevel });
  }
  if (filter.resolutions?.values?.length) {
    options.push(makeOptions(filter.resolutions, "resolutions"));
  }
  if (filter.statuses?.values?.length) {
    options.push(makeOptions(filter.statuses, "statuses"));
  }
  if (filter.issueTypes?.values?.length) {
    options.push(makeOptions(filter.issueTypes, "issue types"));
  }
  if (filter.assignees?.values?.length) {
    options.push(makeOptions(filter.assignees, "assignees"));
  }
  if (filter.labels?.values?.length) {
    options.push(makeOptions(filter.labels, "labels"));
  }
  if (filter.components?.values?.length) {
    options.push(makeOptions(filter.components, "components"));
  }
  return options;
};
