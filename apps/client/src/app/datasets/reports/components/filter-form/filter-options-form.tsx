import { FC, useEffect, useState } from "react";
import { HierarchyLevel, Issue } from "@jbrunton/flow-metrics";
import { Col, Form, Row, Select, SelectProps, Tag } from "antd";
import { DateSelector } from "../date-selector";
import { isNil, map, pipe, reject, uniq } from "rambda";
import { useFilterContext } from "../../../../filter/context";
import { Interval, defaultDateRange } from "@jbrunton/flow-lib";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { formatDate } from "@jbrunton/flow-lib";

export type FilterOptions = {
  hierarchyLevel?: HierarchyLevel;
  dates?: Interval;
  resolutions?: string[];
  statuses?: string[];
  issueTypes?: string[];
};

type FilterOptionsProps = {
  issues?: Issue[];
  filteredIssuesCount?: number;

  showDateSelector: boolean;
  showResolutionFilter: boolean;
  showStatusFilter: boolean;
  showHierarchyFilter: boolean;
};

export const FilterOptionsForm: FC<FilterOptionsProps> = ({
  issues,
  filteredIssuesCount,
  showDateSelector,
  showResolutionFilter,
  showStatusFilter,
  showHierarchyFilter,
}) => {
  const { filter: initialFilter, setFilter } = useFilterContext();

  const [resolutions, setResolutions] = useState<SelectProps["options"]>();
  const [statuses, setStatuses] = useState<SelectProps["options"]>();
  const [issueTypes, setIssueTypes] = useState<SelectProps["options"]>();
  const [assignees, setAssignees] = useState<SelectProps["options"]>();

  const [hierarchyLevel, setHierarchyLevel] = useState<
    HierarchyLevel | undefined
  >(initialFilter.hierarchyLevel);

  useEffect(() => {
    if (!issues) {
      return;
    }

    const filteredIssues = issues.filter((issue) =>
      hierarchyLevel ? issue.hierarchyLevel === hierarchyLevel : true,
    );

    setResolutions(makeFilterOptions(filteredIssues, "resolution"));
    setIssueTypes(makeFilterOptions(filteredIssues, "issueType"));
    setStatuses(makeFilterOptions(filteredIssues, "status"));
    setAssignees(makeFilterOptions(filteredIssues, "assignee"));
  }, [issues, hierarchyLevel, setResolutions, setIssueTypes, setStatuses]);

  const [selectedResolutions, setSelectedResolutions] = useState<string[]>(
    showResolutionFilter ? initialFilter.resolutions ?? [] : [],
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    showStatusFilter ? initialFilter.statuses ?? [] : [],
  );
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>(
    initialFilter.issueTypes ?? [],
  );
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    initialFilter.assignees ?? [],
  );

  const [dates, setDates] = useState<Interval | undefined>(() => {
    return showDateSelector
      ? initialFilter.dates ?? defaultDateRange()
      : undefined;
  });

  useEffect(() => {
    setFilter({
      dates,
      resolutions: selectedResolutions,
      statuses: selectedStatuses,
      issueTypes: selectedIssueTypes,
      assignees: selectedAssignees,
      hierarchyLevel,
    });
  }, [
    setFilter,
    dates,
    selectedResolutions,
    selectedStatuses,
    selectedIssueTypes,
    selectedAssignees,
    hierarchyLevel,
  ]);
  const options: ExpandableOptionsHeader["options"][number][] = [];

  if (dates) {
    options.push({
      label: "Dates",
      value: `${formatDate(dates.start)}-${formatDate(dates.end)}`,
    });
  }
  if (hierarchyLevel) {
    options.push({ label: "Hierarchy level", value: hierarchyLevel });
  }
  if (selectedResolutions.length) {
    options.push({ label: "Resolutions", value: selectedResolutions.join() });
  }
  if (selectedStatuses.length) {
    options.push({ label: "Statuses", value: selectedStatuses.join() });
  }
  if (selectedIssueTypes.length) {
    options.push({ label: "Issue types", value: selectedIssueTypes.join() });
  }
  if (selectedAssignees.length) {
    options.push({ label: "Assignees", value: selectedAssignees.join() });
  }

  return (
    <ExpandableOptions
      header={{ title: "Filter Options", options }}
      extra={
        filteredIssuesCount ? <Tag>{filteredIssuesCount} issues</Tag> : null
      }
    >
      <Form layout="vertical">
        <Row gutter={[8, 8]}>
          {showDateSelector ? (
            <Col span={8}>
              <Form.Item label="Dates">
                <DateSelector dates={dates} onChange={setDates} />
              </Form.Item>
            </Col>
          ) : null}
          {showHierarchyFilter ? (
            <Col span={4}>
              <Form.Item label="Hierarchy Level">
                <Select
                  allowClear={true}
                  value={hierarchyLevel}
                  onChange={setHierarchyLevel}
                >
                  <Select.Option value="Story">Story</Select.Option>
                  <Select.Option value="Epic">Epic</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          ) : null}
          {showResolutionFilter ? (
            <Col span={4}>
              <Form.Item label="Resolution">
                <Select
                  mode="multiple"
                  allowClear={true}
                  options={resolutions}
                  value={selectedResolutions}
                  onChange={setSelectedResolutions}
                />
              </Form.Item>
            </Col>
          ) : null}
          {showStatusFilter ? (
            <Col span={4}>
              <Form.Item label="Status">
                <Select
                  mode="multiple"
                  allowClear={true}
                  options={statuses}
                  value={selectedStatuses}
                  onChange={setSelectedStatuses}
                />
              </Form.Item>
            </Col>
          ) : null}
          <Col span={4}>
            <Form.Item label="Issue Type">
              <Select
                mode="multiple"
                allowClear={true}
                options={issueTypes}
                value={selectedIssueTypes}
                onChange={setSelectedIssueTypes}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Assignees">
              <Select
                mode="multiple"
                allowClear={true}
                options={assignees}
                value={selectedAssignees}
                onChange={setSelectedAssignees}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </ExpandableOptions>
  );
};

const makeFilterOptions = (
  issues: Issue[],
  property: keyof Issue,
): SelectProps["options"] => {
  const options = getUniqueValues(issues, property);
  return options?.map((option) => ({
    label: option,
    value: option,
  }));
};

const getUniqueValues = (issues: Issue[], property: keyof Issue): string[] => {
  return pipe(
    map((issue: Issue) => issue[property]),
    reject(isNil),
    uniq,
  )(issues);
};
