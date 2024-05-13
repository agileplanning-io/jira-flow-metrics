import { FC, useEffect, useState } from "react";
import {
  FilterType,
  HierarchyLevel,
  Issue,
  ValuesFilter,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { flatten, compact, uniq, pipe, map, isNonNullish } from "remeda";
import { Interval, formatDate } from "@agileplanning-io/flow-lib";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditFilterForm } from "./edit-filter-form";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "@app/components/expandable-options";
import { Col, Form, Row, Select, Tag } from "antd";
import { DateSelector } from "../date-selector";
import { ClientIssueFilter } from "@app/filter/context/client-issue-filter";

type FilterOptionsProps = {
  issues?: Issue[];
  filteredIssuesCount?: number;
  showDateSelector: boolean;
  showResolutionFilter: boolean;
  showStatusFilter: boolean;
  showHierarchyFilter: boolean;
  filter?: ClientIssueFilter;
  setFilter: (filter: ClientIssueFilter) => void;
};

export const FilterOptionsForm: FC<FilterOptionsProps> = ({
  issues,
  filteredIssuesCount,
  showDateSelector,
  showResolutionFilter,
  showStatusFilter,
  showHierarchyFilter,
  filter,
  setFilter,
}) => {
  const [resolutionOptions, setResolutionOptions] = useState<string[]>();
  const [statusOptions, setStatusOptions] = useState<string[]>();
  const [labelOptions, setLabelOptions] = useState<string[]>();
  const [componentOptions, setComponentOptions] = useState<string[]>();
  const [issueTypeOptions, setIssueTypeOptions] = useState<string[]>();
  const [assigneeOptions, setAssigneeOptions] = useState<string[]>();

  // useEffect(() => {
  // TODO: move this to page level defaults?
  // if (showDateSelector && !filter?.dates) {
  //   setFilter({
  //     ...filter,
  //     dates: defaultDateRange(),
  //     hierarchyLevel: defaultHierarchyLevel,
  //   });
  // }
  // });

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

  const headerOptions = getHeaderOptions(filter);

  const onHierarchyLevelChanged = (hierarchyLevel: HierarchyLevel) =>
    setFilter({ ...filter, hierarchyLevel });

  const onDatesChanged = (dates?: Interval) => setFilter({ ...filter, dates });

  return (
    <>
      <Form layout="horizontal" style={{ padding: "12px 12px 0 12px" }}>
        <Row gutter={[8, 8]}>
          {showDateSelector ? (
            <Col span={9}>
              <Form.Item label="Dates">
                <DateSelector dates={filter.dates} onChange={onDatesChanged} />
              </Form.Item>
            </Col>
          ) : null}
          {showHierarchyFilter ? (
            <Col span={5}>
              <Form.Item label="Hierarchy Level">
                <Select
                  allowClear={true}
                  value={filter.hierarchyLevel}
                  onChange={onHierarchyLevelChanged}
                >
                  <Select.Option value="Story">Story</Select.Option>
                  <Select.Option value="Epic">Epic</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
      <ExpandableOptions
        header={{ title: "Filter Options", options: headerOptions }}
        extra={
          isNonNullish(filteredIssuesCount) ? (
            <Tag style={{ marginRight: -4 }}>
              {filteredIssuesCount} / {issues?.length} issues
            </Tag>
          ) : null
        }
      >
        <EditFilterForm
          filter={filter}
          setFilter={setFilter}
          showDateSelector={showDateSelector}
          showResolutionFilter={showResolutionFilter}
          showStatusFilter={showStatusFilter}
          showHierarchyFilter={showHierarchyFilter}
          showAssigneesFilter={true}
          statuses={statusOptions}
          resolutions={resolutionOptions}
          components={componentOptions}
          issueTypes={issueTypeOptions}
          assignees={assigneeOptions}
          labels={labelOptions}
        />
      </ExpandableOptions>
    </>
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

const getHeaderOptions = (
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
    options.push({
      label: "Dates",
      value: `${formatDate(filter.dates.start)}-${formatDate(
        filter.dates.end,
      )}`,
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
