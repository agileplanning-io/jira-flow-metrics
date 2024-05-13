import { useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  WipResult,
  calculateWip,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { IssuesTable } from "../../../components/issues-table";
import { WipChart } from "@agileplanning-io/flow-charts/src/wip/wip-chart";
import { omit } from "remeda";
import { Checkbox, Col, Row } from "antd";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { useFilterParams } from "@app/filter/context/use-filter-params";
import { defaultDateRange } from "@agileplanning-io/flow-lib";

export const WipPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams({
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  });

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  const chartStyle = useAtomValue(chartStyleAtom);

  const { chartParams, setChartParams } = useChartParams();

  useEffect(() => {
    // reset the selected issue list if we change the filter
    setSelectedIssues([]);
  }, [filter, chartParams.includeStoppedIssues]);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterIssues(
        issues,
        omit(filter, ["dates"]),
      ).filter((issue) => {
        if (chartParams.includeStoppedIssues) {
          return true;
        }

        const isStopped =
          issue.metrics.started && issue.statusCategory === "To Do";

        return !isStopped;
      });
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, chartParams.includeStoppedIssues, setFilteredIssues]);

  const [wipResult, setWipResult] = useState<WipResult>();

  useEffect(() => {
    if (!filter?.dates) {
      return;
    }

    setWipResult(
      calculateWip({
        issues: filteredIssues,
        range: filter.dates,
      }),
    );
  }, [filter, filteredIssues]);

  return (
    <>
      <FilterOptionsForm
        filter={filter}
        setFilter={setFilter}
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={false}
        showHierarchyFilter={true}
      />
      <ExpandableOptions
        header={{
          title: "Chart Options",
          options: [
            {
              value: chartParams.includeStoppedIssues
                ? "Include stopped issues"
                : "Exclude stopped issues",
            },
            {
              value: chartParams.showPercentileLabels
                ? "Show percentile labels"
                : "Hide percentile labels",
            },
          ],
        }}
      >
        <Row gutter={[8, 8]}>
          <Col span={6}>
            <Checkbox
              checked={chartParams.includeStoppedIssues}
              onChange={(e) =>
                setChartParams({
                  ...chartParams,
                  includeStoppedIssues: e.target.checked,
                })
              }
            >
              Include stopped issues
            </Checkbox>
            <Checkbox
              checked={chartParams.showPercentileLabels}
              onChange={(e) =>
                setChartParams({
                  ...chartParams,
                  showPercentileLabels: e.target.checked,
                })
              }
            >
              Show percentile labels
            </Checkbox>
          </Col>
        </Row>
      </ExpandableOptions>

      {wipResult ? (
        <WipChart
          result={wipResult}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={chartParams.showPercentileLabels}
          style={chartStyle}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
