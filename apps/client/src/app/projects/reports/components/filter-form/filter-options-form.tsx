import { FC, useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { flatten, compact, uniq, pipe, map } from "remeda";
import { useFilterContext } from "../../../../filter/context";
import { defaultDateRange } from "@agileplanning-io/flow-lib";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditFilterForm } from "./edit-filter-form";

type FilterOptionsProps = {
  issues?: Issue[];
  filteredIssuesCount?: number;

  showDateSelector: boolean;
  showResolutionFilter: boolean;
  showStatusFilter: boolean;
  showHierarchyFilter: boolean;
  defaultHierarchyLevel?: HierarchyLevel;
};

export const FilterOptionsForm: FC<FilterOptionsProps> = ({
  issues,
  filteredIssuesCount,
  showDateSelector,
  showResolutionFilter,
  showStatusFilter,
  showHierarchyFilter,
  defaultHierarchyLevel,
}) => {
  const { filter, setFilter } = useFilterContext();

  const [resolutionOptions, setResolutionOptions] = useState<string[]>();
  const [statusOptions, setStatusOptions] = useState<string[]>();
  const [labelOptions, setLabelOptions] = useState<string[]>();
  const [componentOptions, setComponentOptions] = useState<string[]>();
  const [issueTypeOptions, setIssueTypeOptions] = useState<string[]>();
  const [assigneeOptions, setAssigneeOptions] = useState<string[]>();

  useEffect(() => {
    if (showDateSelector && !filter?.dates) {
      setFilter({
        ...filter,
        dates: defaultDateRange(),
        hierarchyLevel: defaultHierarchyLevel,
      });
    }
  });

  useEffect(() => {
    if (!issues) {
      return;
    }

    const filteredIssues = filterIssues(issues, {
      hierarchyLevel: filter?.hierarchyLevel,
    });

    setResolutionOptions(getUniqueValues(filteredIssues, "resolution"));
    setIssueTypeOptions(getUniqueValues(filteredIssues, "issueType"));
    setStatusOptions(getUniqueValues(filteredIssues, "status"));
    setAssigneeOptions(getUniqueValues(filteredIssues, "assignee"));
    setLabelOptions(makeLabelOptions(filteredIssues));
    setComponentOptions(makeComponentOptions(filteredIssues));
  }, [
    issues,
    filter,
    setResolutionOptions,
    setIssueTypeOptions,
    setStatusOptions,
  ]);

  if (!filter) {
    return <LoadingSpinner />;
  }

  return (
    <EditFilterForm
      filter={filter}
      setFilter={setFilter}
      showDateSelector={showDateSelector}
      showResolutionFilter={showResolutionFilter}
      showStatusFilter={showStatusFilter}
      showHierarchyFilter={showHierarchyFilter}
      statuses={statusOptions}
      resolutions={resolutionOptions}
      components={componentOptions}
      issueTypes={issueTypeOptions}
      assignees={assigneeOptions}
      labels={labelOptions}
      expandableOptionsExtra={filteredIssuesCount}
    />
  );
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

// type ValuesFilterField = {
//   label: string;
//   filter?: ValuesFilter;
//   onChange: (filter: ValuesFilter) => void;
//   options: SelectProps["options"];
// };

// const ValuesFilterField: FC<ValuesFilterField> = ({
//   label,
//   options,
//   filter,
//   onChange,
// }) => {
//   const onTypeChanged = (type: FilterType) => {
//     if (filter) {
//       filter.type = type;
//       onChange(filter);
//     }
//   };

//   const onValuesChanged = (values: string[]) => {
//     if (filter) {
//       filter.values = values;
//       onChange(filter);
//     }
//   };

//   return (
//     <Form.Item label={label} style={{ width: "100%", margin: "8px 0" }}>
//       <Space.Compact style={{ width: "100%" }}>
//         <Form.Item style={{ width: "25%", margin: 0 }}>
//           <Select
//             value={filter?.type}
//             onChange={onTypeChanged}
//             options={[
//               { value: "include", label: "Include" },
//               { value: "exclude", label: "Exclude" },
//             ]}
//           />
//         </Form.Item>
//         <Form.Item style={{ width: "75%", margin: 0 }}>
//           <Select
//             mode="multiple"
//             allowClear={true}
//             options={options}
//             value={filter?.values}
//             onChange={onValuesChanged}
//           />
//         </Form.Item>
//       </Space.Compact>
//     </Form.Item>
//   );
// };
