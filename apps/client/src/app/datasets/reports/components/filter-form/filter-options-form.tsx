import { FC, useEffect, useState } from "react";
import { HierarchyLevel, Issue, filterIssues } from "@jbrunton/flow-metrics";
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
  const { filter, setFilter } = useFilterContext();

  const [resolutions, setResolutions] = useState<SelectProps["options"]>();
  const [statuses, setStatuses] = useState<SelectProps["options"]>();
  const [issueTypes, setIssueTypes] = useState<SelectProps["options"]>();
  const [assignees, setAssignees] = useState<SelectProps["options"]>();

  useEffect(() => {
    if (showDateSelector && !filter.dates) {
      setFilter({ ...filter, dates: defaultDateRange() });
    }
  });

  useEffect(() => {
    if (!issues) {
      return;
    }

    const filteredIssues = filterIssues(issues, {
      hierarchyLevel: filter.hierarchyLevel,
    });

    setResolutions(makeFilterOptions(filteredIssues, "resolution"));
    setIssueTypes(makeFilterOptions(filteredIssues, "issueType"));
    setStatuses(makeFilterOptions(filteredIssues, "status"));
    setAssignees(makeFilterOptions(filteredIssues, "assignee"));
  }, [issues, filter, setResolutions, setIssueTypes, setStatuses]);

  const options: ExpandableOptionsHeader["options"][number][] = [];

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
  if (filter.resolutions?.length) {
    options.push({ label: "Resolutions", value: filter.resolutions.join() });
  }
  if (filter.statuses?.length) {
    options.push({ label: "Statuses", value: filter.statuses.join() });
  }
  if (filter.issueTypes?.length) {
    options.push({ label: "Issue types", value: filter.issueTypes.join() });
  }
  if (filter.assignees?.length) {
    options.push({ label: "Assignees", value: filter.assignees.join() });
  }

  const onHierarchyLevelChanged = (hierarchyLevel: HierarchyLevel) =>
    setFilter({ ...filter, hierarchyLevel });

  const onResolutionsChanged = (resolutions?: string[]) =>
    setFilter({ ...filter, resolutions });

  const onStatusesChanged = (statuses?: string[]) =>
    setFilter({ ...filter, statuses });

  const onIssueTypesChanged = (issueTypes?: string[]) =>
    setFilter({ ...filter, issueTypes });

  const onAssigneesChanged = (assignees?: string[]) =>
    setFilter({ ...filter, assignees });

  const onDatesChanged = (dates?: Interval) => setFilter({ ...filter, dates });

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
                <DateSelector dates={filter.dates} onChange={onDatesChanged} />
              </Form.Item>
            </Col>
          ) : null}
          {showHierarchyFilter ? (
            <Col span={4}>
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
          {showResolutionFilter ? (
            <Col span={4}>
              <Form.Item label="Resolution">
                <Select
                  mode="multiple"
                  allowClear={true}
                  options={resolutions}
                  value={filter.resolutions}
                  onChange={onResolutionsChanged}
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
                  value={filter.statuses}
                  onChange={onStatusesChanged}
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
                value={filter.issueTypes}
                onChange={onIssueTypesChanged}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Assignees">
              <Select
                mode="multiple"
                allowClear={true}
                options={assignees}
                value={filter.assignees}
                onChange={onAssigneesChanged}
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
