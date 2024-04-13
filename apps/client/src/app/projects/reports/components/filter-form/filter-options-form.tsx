import { FC, useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  FilterType,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { Col, Form, Row, Select, SelectProps, Space, Tag } from "antd";
import { DateSelector } from "../date-selector";
import { flatten, compact, uniq, pipe, map } from "remeda";
import { useFilterContext } from "../../../../filter/context";
import { Interval, defaultDateRange } from "@agileplanning-io/flow-lib";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "../../../../components/expandable-options";
import { formatDate } from "@agileplanning-io/flow-lib";

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

  const [resolutions, setResolutions] = useState<SelectProps["options"]>();
  const [statuses, setStatuses] = useState<SelectProps["options"]>();
  const [labels, setLabels] = useState<SelectProps["options"]>();
  const [components, setComponents] = useState<SelectProps["options"]>();
  const [issueTypes, setIssueTypes] = useState<SelectProps["options"]>();
  const [assignees, setAssignees] = useState<SelectProps["options"]>();

  useEffect(() => {
    if (showDateSelector && !filter.dates) {
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
      hierarchyLevel: filter.hierarchyLevel,
    });

    setResolutions(makeFilterOptions(filteredIssues, "resolution"));
    setIssueTypes(makeFilterOptions(filteredIssues, "issueType"));
    setStatuses(makeFilterOptions(filteredIssues, "status"));
    setAssignees(makeFilterOptions(filteredIssues, "assignee"));
    setLabels(makeLabelOptions(filteredIssues));
    setComponents(makeComponentOptions(filteredIssues));
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
  if (filter.labels?.length) {
    options.push({
      label:
        filter.labelFilterType === FilterType.Include
          ? "Include labels"
          : "Exclude labels",
      value: filter.labels.join(),
    });
  }
  if (filter.components?.length) {
    options.push({
      label: "Components",
      value: filter.components.join(),
    });
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

  const onLabelsChanged = (labels?: string[]) =>
    setFilter({ ...filter, labels });

  const onLabelFilterTypeChanged = (labelFilterType: FilterType) =>
    setFilter({ ...filter, labelFilterType });

  const onIssueTypeFilterTypeChanged = (issueTypeFilterType: FilterType) =>
    setFilter({ ...filter, issueTypeFilterType });

  const onComponentsChanged = (components?: string[]) =>
    setFilter({ ...filter, components });

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
        header={{ title: "Filter Options", options }}
        extra={
          filteredIssuesCount ? (
            <Tag style={{ marginRight: -4 }}>
              {filteredIssuesCount} / {issues?.length} issues
            </Tag>
          ) : null
        }
      >
        <Form
          layout="horizontal"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 10 }}
        >
          {showStatusFilter ? (
            <Form.Item label="Status" style={{ margin: "8px 0" }}>
              <Row>
                <Col span={8}>
                  <Select
                    mode="multiple"
                    allowClear={true}
                    options={statuses}
                    value={filter.statuses}
                    onChange={onStatusesChanged}
                  />
                </Col>
              </Row>
            </Form.Item>
          ) : null}
          {showResolutionFilter ? (
            <Form.Item label="Resolution" style={{ margin: "8px 0" }}>
              <Row>
                <Col span={8}>
                  <Select
                    mode="multiple"
                    allowClear={true}
                    options={resolutions}
                    value={filter.resolutions}
                    onChange={onResolutionsChanged}
                  />
                </Col>
              </Row>
            </Form.Item>
          ) : null}
          <Form.Item label="Assignees" style={{ margin: "8px 0" }}>
            <Row>
              <Col span={8}>
                <Select
                  mode="multiple"
                  allowClear={true}
                  options={assignees}
                  value={filter.assignees}
                  onChange={onAssigneesChanged}
                />
              </Col>
            </Row>
          </Form.Item>

          <Form.Item label="Labels" style={{ width: "100%", margin: "8px 0" }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item style={{ width: "25%", margin: 0 }}>
                <Select
                  value={filter.labelFilterType}
                  onChange={onLabelFilterTypeChanged}
                  options={[
                    { value: "include", label: "Include" },
                    { value: "exclude", label: "Exclude" },
                  ]}
                />
              </Form.Item>
              <Form.Item style={{ width: "75%", margin: 0 }}>
                <Select
                  mode="multiple"
                  allowClear={true}
                  options={labels}
                  value={filter.labels}
                  onChange={onLabelsChanged}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="Components" style={{ margin: "8px 0" }}>
            <Select
              mode="multiple"
              allowClear={true}
              options={components}
              value={filter.components}
              onChange={onComponentsChanged}
            />
          </Form.Item>

          <Form.Item
            label="Issue Types"
            style={{ width: "100%", margin: "8px 0" }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item style={{ width: "25%", margin: 0 }}>
                <Select
                  value={filter.issueTypeFilterType}
                  onChange={onIssueTypeFilterTypeChanged}
                  options={[
                    { value: "include", label: "Include" },
                    { value: "exclude", label: "Exclude" },
                  ]}
                />
              </Form.Item>
              <Form.Item style={{ width: "75%", margin: 0 }}>
                <Select
                  mode="multiple"
                  allowClear={true}
                  options={issueTypes}
                  value={filter.issueTypes}
                  onChange={onIssueTypesChanged}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </Form>
      </ExpandableOptions>
    </>
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
    issues,
    map((issue) => issue[property]?.toString()),
    compact,
    uniq(),
  );
};

const makeLabelOptions = (issues: Issue[]): SelectProps["options"] => {
  const options: string[] = uniq(flatten(issues.map((issue) => issue.labels)));
  return options?.map((option) => ({
    label: option,
    value: option,
  }));
};

const makeComponentOptions = (issues: Issue[]): SelectProps["options"] => {
  const options: string[] = uniq(
    flatten(issues.map((issue) => issue.components)),
  );
  return options?.map((option) => ({
    label: option,
    value: option,
  }));
};
