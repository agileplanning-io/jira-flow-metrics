import { FilterType, ValuesFilter } from "@agileplanning-io/flow-metrics";
import { Form, Select, SelectProps, Space } from "antd";
import { FC, ReactNode } from "react";
import { ClientIssueFilter } from "@app/filter/context/context";

export type EditFilterFormProps = {
  filter: ClientIssueFilter;
  setFilter: (filter: ClientIssueFilter) => void;
  showDateSelector: boolean;
  showResolutionFilter: boolean;
  showStatusFilter: boolean;
  showHierarchyFilter: boolean;
  showAssigneesFilter: boolean;
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
  showResolutionFilter,
  showStatusFilter,
  showAssigneesFilter,
  statuses,
  resolutions,
  components,
  issueTypes,
  assignees,
  labels,
}) => {
  const onResolutionsChanged = (resolutions: ValuesFilter) =>
    setFilter({ ...filter, resolutions });

  const onStatusesChanged = (statuses: ValuesFilter) =>
    setFilter({ ...filter, statuses });

  const onIssueTypesChanged = (issueTypes: ValuesFilter) =>
    setFilter({ ...filter, issueTypes });

  const onAssigneesChanged = (assignees: ValuesFilter) =>
    setFilter({ ...filter, assignees });

  const onLabelsChanged = (labels: ValuesFilter) =>
    setFilter({ ...filter, labels });

  const onComponentsChanged = (components: ValuesFilter) =>
    setFilter({ ...filter, components });

  // const headerOptions = getHeaderOptions(filter);

  const statusOptions = makeOptions(statuses);
  const resolutionOptions = makeOptions(resolutions);
  const componentOptions = makeOptions(components);
  const issueTypeOptions = makeOptions(issueTypes);
  const assigneeOptions = makeOptions(assignees);
  const labelOptions = makeOptions(labels);

  return (
    <Form layout="horizontal" labelCol={{ span: 2 }} wrapperCol={{ span: 10 }}>
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
      {showAssigneesFilter ? (
        <ValuesFilterField
          label="Assignees"
          filter={filter.assignees}
          onChange={onAssigneesChanged}
          options={assigneeOptions}
        />
      ) : null}

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
  );
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
            defaultValue={FilterType.Include}
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