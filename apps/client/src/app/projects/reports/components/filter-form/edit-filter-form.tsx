import { Interval, formatDate } from "@agileplanning-io/flow-lib";
import {
  FilterType,
  HierarchyLevel,
  ValuesFilter,
} from "@agileplanning-io/flow-metrics";
import { Col, Form, Row, Select, SelectProps, Space } from "antd";
import { FC, ReactNode } from "react";
import { DateSelector } from "../date-selector";
import {
  ExpandableOptions,
  ExpandableOptionsHeader,
} from "@app/components/expandable-options";
import { ClientIssueFilter } from "@app/filter/context/context";

export type EditFilterFormProps = {
  filter: ClientIssueFilter;
  setFilter: (filter: ClientIssueFilter) => void;
  showDateSelector: boolean;
  showResolutionFilter: boolean;
  showStatusFilter: boolean;
  showHierarchyFilter: boolean;
  statuses?: string[];
  resolutions?: string[];
  components?: string[];
  issueTypes?: string[];
  assignees?: string[];
  labels?: string[];
  expandableOptionsExtra?: ReactNode;
};

export const EditFilterForm: FC<EditFilterFormProps> = ({
  filter,
  setFilter,
  showDateSelector,
  showResolutionFilter,
  showStatusFilter,
  showHierarchyFilter,
  statuses,
  resolutions,
  components,
  issueTypes,
  assignees,
  labels,
  expandableOptionsExtra,
}) => {
  const onHierarchyLevelChanged = (hierarchyLevel: HierarchyLevel) =>
    setFilter({ ...filter, hierarchyLevel });

  const onResolutionsChanged = (resolutions: ValuesFilter) =>
    setFilter({ ...filter, resolutions });

  const onStatusesChanged = (statuses: ValuesFilter) =>
    setFilter({ ...filter, statuses });

  const onIssueTypesChanged = (issueTypes: ValuesFilter) =>
    setFilter({ ...filter, issueTypes });

  const onAssigneesChanged = (assignees: ValuesFilter) =>
    setFilter({ ...filter, assignees });

  const onDatesChanged = (dates?: Interval) => setFilter({ ...filter, dates });

  const onLabelsChanged = (labels: ValuesFilter) =>
    setFilter({ ...filter, labels });

  const onComponentsChanged = (components: ValuesFilter) =>
    setFilter({ ...filter, components });

  const headerOptions = getHeaderOptions(filter);

  const statusOptions = makeOptions(statuses);
  const resolutionOptions = makeOptions(resolutions);
  const componentOptions = makeOptions(components);
  const issueTypeOptions = makeOptions(issueTypes);
  const assigneeOptions = makeOptions(assignees);
  const labelOptions = makeOptions(labels);

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
        extra={expandableOptionsExtra}
      >
        <Form
          layout="horizontal"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 10 }}
        >
          {showStatusFilter ? (
            <ValuesFilterField
              label="Statuses"
              options={statusOptions}
              filter={filter.statuses}
              onChange={onStatusesChanged}
            />
          ) : null}
          {showResolutionFilter ? (
            <ValuesFilterField
              label="Resolutions"
              filter={filter.resolutions}
              onChange={onResolutionsChanged}
              options={resolutionOptions}
            />
          ) : null}
          <ValuesFilterField
            label="Assignees"
            filter={filter.assignees}
            onChange={onAssigneesChanged}
            options={assigneeOptions}
          />

          <ValuesFilterField
            label="Labels"
            filter={filter.labels}
            onChange={onLabelsChanged}
            options={labelOptions}
          />

          <ValuesFilterField
            label="Components"
            filter={filter.components}
            onChange={onComponentsChanged}
            options={componentOptions}
          />

          <ValuesFilterField
            label="Issue types"
            filter={filter.issueTypes}
            onChange={onIssueTypesChanged}
            options={issueTypeOptions}
          />
        </Form>
      </ExpandableOptions>
    </>
  );
};

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

type ValuesFilterFieldProps = {
  label: string;
  filter?: ValuesFilter;
  onChange: (filter: ValuesFilter) => void;
  options: SelectProps["options"];
};

const ValuesFilterField: FC<ValuesFilterFieldProps> = ({
  label,
  options,
  filter,
  onChange,
}) => {
  const onTypeChanged = (type: FilterType) => {
    if (filter) {
      filter.type = type;
      onChange(filter);
    }
  };

  const onValuesChanged = (values: string[]) => {
    if (filter) {
      filter.values = values;
      onChange(filter);
    }
  };

  return (
    <Form.Item label={label} style={{ width: "100%", margin: "8px 0" }}>
      <Space.Compact style={{ width: "100%" }}>
        <Form.Item style={{ width: "25%", margin: 0 }}>
          <Select
            value={filter?.type}
            onChange={onTypeChanged}
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
            options={options}
            value={filter?.values}
            onChange={onValuesChanged}
          />
        </Form.Item>
      </Space.Compact>
    </Form.Item>
  );
};

const makeOptions = (values?: string[]) =>
  values?.map((option) => ({
    label: option,
    value: option,
  }));
