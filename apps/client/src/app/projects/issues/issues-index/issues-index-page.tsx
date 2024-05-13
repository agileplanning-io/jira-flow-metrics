import { useEffect, useState } from "react";
import { IssuesTable, SortState } from "../../../components/issues-table";
import {
  FilterType,
  Issue,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { omit, pipe, sortBy } from "remeda";
import { Col, Form, Input } from "antd";
import * as fuzzball from "fuzzball";
import { useProjectContext } from "../../context";
import { FilterOptionsForm } from "../../reports/components/filter-form/filter-options-form";
import { useFilterParams } from "@app/filter/context/use-filter-params";

export const IssuesIndexPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams();

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [sortState, setSortState] = useState<SortState>({
    columnKey: "created",
    sortOrder: "descend",
  });

  useEffect(() => {
    if (!filter) {
      // Set a dummy filter to trigger the default one when parsing with zod
      setFilter({ labels: { type: FilterType.Include, values: [] } });
    }
  }, [filter, setFilter]);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = pipe(
        issues,
        (issues) => filterIssues(issues, omit(filter, ["dates"])),
        (issues) => {
          if (searchQuery.trim().length === 0) {
            return issues;
          }

          const searchedIssues = issues
            .map((issue) => {
              const sortResult = fuzzball.extract(
                searchQuery,
                [issue.key, issue.summary],
                { scorer: fuzzball.token_set_ratio },
              );
              const sortIndex = Math.max(
                ...sortResult.map(([, score]) => score),
              );
              return {
                ...issue,
                sortIndex,
              };
            })
            .filter((issue) => issue.sortIndex >= 60);

          const sortedIssues = sortBy(
            searchedIssues,
            (issue) => -issue.sortIndex,
          );

          return sortedIssues;
        },
      );
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, searchQuery, setFilteredIssues]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setSortState({
        columnKey: undefined,
        sortOrder: null,
      });
    }
  }, [searchQuery]);

  return (
    <>
      <FilterOptionsForm
        filter={filter}
        setFilter={setFilter}
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={false}
        showStatusFilter={true}
        showResolutionFilter={true}
        showHierarchyFilter={true}
      />
      <Col span={6}>
        <Form.Item label="Search">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Item>
      </Col>
      <IssuesTable
        issues={filteredIssues}
        defaultSortField="created"
        sortState={sortState}
        onSortStateChanged={setSortState}
      />
    </>
  );
};
