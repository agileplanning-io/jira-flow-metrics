import { useEffect, useState } from "react";
import {
  FilterType,
  Issue,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { omit, pipe, sortBy } from "remeda";
import { Input } from "antd";
import * as fuzzball from "fuzzball";
import { useProjectContext } from "../../context";
import { useFilterParams } from "@app/filter/use-filter-params";
import { IssuesTable } from "@app/components/issues-table";
import {
  ControlBar,
  FormControl,
  IssueFilterForm,
  ReportType,
  SortState,
} from "@agileplanning-io/flow-components";

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
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Index}
        showHierarchyFilter={true}
      />

      <ControlBar>
        <FormControl label="Search">
          <Input
            size="small"
            style={{ width: "250px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FormControl>
      </ControlBar>

      <IssuesTable
        issues={filteredIssues}
        defaultSortField="created"
        sortState={sortState}
        onSortStateChanged={setSortState}
      />
    </>
  );
};
