import {
  FilterType,
  IssueAttributesFilter,
  defaultValuesFilter,
} from "@agileplanning-io/flow-metrics";
import { Form, Select, SelectProps, Space } from "antd";
import { FC } from "react";
import { ClientIssueFilter } from "@app/filter/client-issue-filter";
import { clone } from "remeda";

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
  labelColSpan: number;
  wrapperColSpan: number;
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
  labelColSpan,
  wrapperColSpan,
}) => {
  const statusOptions = makeOptions(statuses);
  const resolutionOptions = makeOptions(resolutions);
  const componentOptions = makeOptions(components);
  const issueTypeOptions = makeOptions(issueTypes);
  const assigneeOptions = makeOptions(assignees);
  const labelOptions = makeOptions(labels);

  return (
    <Form
      layout="horizontal"
      labelCol={{ span: labelColSpan }}
      wrapperCol={{ span: wrapperColSpan }}
    >
      {showStatusFilter ? (
        <ValuesFilterField
          label="Statuses"
          options={statusOptions}
          filter={filter}
          filterKey="statuses"
          onChange={setFilter}
        />
      ) : null}
      {showResolutionFilter ? (
        <ValuesFilterField
          label="Resolutions"
          filter={filter}
          filterKey="resolutions"
          onChange={setFilter}
          options={resolutionOptions}
        />
      ) : null}
      {showAssigneesFilter ? (
        <ValuesFilterField
          label="Assignees"
          filter={filter}
          filterKey="assignees"
          onChange={setFilter}
          options={assigneeOptions}
        />
      ) : null}

      <ValuesFilterField
        label="Labels"
        filter={filter}
        filterKey="labels"
        onChange={setFilter}
        options={labelOptions}
      />

      <ValuesFilterField
        label="Components"
        filter={filter}
        filterKey="components"
        onChange={setFilter}
        options={componentOptions}
      />

      <ValuesFilterField
        label="Issue types"
        filter={filter}
        filterKey="issueTypes"
        onChange={setFilter}
        options={issueTypeOptions}
      />
    </Form>
  );
};

type ValuesFilterFieldProps = {
  label: string;
  filter?: IssueAttributesFilter;
  filterKey: keyof IssueAttributesFilter;
  onChange: (filter: IssueAttributesFilter) => void;
  options: SelectProps["options"];
};

const ValuesFilterField: FC<ValuesFilterFieldProps> = ({
  label,
  options,
  filter,
  filterKey,
  onChange,
}) => {
  const onTypeChanged = (type: FilterType) => {
    if (filter) {
      const valuesFilter = filter[filterKey] ?? defaultValuesFilter();
      valuesFilter.type = type;
      filter[filterKey] = valuesFilter;
      onChange(clone(filter));
    }
  };

  const onValuesChanged = (values: string[]) => {
    if (filter) {
      const valuesFilter = filter[filterKey] ?? defaultValuesFilter();
      valuesFilter.values = values;
      filter[filterKey] = valuesFilter;
      onChange(clone(filter));
    }
  };

  return (
    <Form.Item label={label} style={{ width: "100%", margin: "8px 0" }}>
      <Space.Compact style={{ width: "100%" }}>
        <Form.Item style={{ width: "25%", margin: 0 }}>
          <Select
            value={filter?.[filterKey]?.type}
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
            value={filter?.[filterKey]?.values}
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
