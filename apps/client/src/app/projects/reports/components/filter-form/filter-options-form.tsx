import { FC } from "react";
import {
  ClientIssueFilter,
  HierarchyLevel,
  Issue,
} from "@agileplanning-io/flow-metrics";
import { isNonNullish } from "remeda";
import { Interval } from "@agileplanning-io/flow-lib";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { ExpandableOptions } from "@app/components/expandable-options";
import { Col, Form, Row, Select, Tag } from "antd";
import {
  DateSelector,
  IssueAttributesFilterForm,
  useFilterOptions,
} from "@agileplanning-io/flow-components";
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
  const filterOptions = useFilterOptions(issues, filter);

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
        <IssueAttributesFilterForm
          filter={filter}
          setFilter={setFilter}
          showResolutionFilter={showResolutionFilter}
          showStatusFilter={showStatusFilter}
          showAssigneesFilter={true}
          filterOptions={filterOptions}
          labelColSpan={2}
          wrapperColSpan={10}
        />
      </ExpandableOptions>
    </>
  );
};
