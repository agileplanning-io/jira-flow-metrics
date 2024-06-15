import { FC, useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { flatten, compact, uniq, pipe, map, isNonNullish } from "remeda";
import { Interval } from "@agileplanning-io/flow-lib";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { EditFilterForm } from "./edit-filter-form";
import { ExpandableOptions } from "@app/components/expandable-options";
import { Col, Form, Row, Select, Tag } from "antd";
import { DateSelector } from "@agileplanning-io/flow-components";
import { ClientIssueFilter } from "@app/filter/client-issue-filter";
import { getHeaderOptions } from "./header-options";

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
          labelColSpan={2}
          wrapperColSpan={10}
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
