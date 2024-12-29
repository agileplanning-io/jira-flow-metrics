import { FC, useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  SummaryResult,
  filterCompletedIssues,
  forecast,
  fromClientFilter,
  toClientFilter,
} from "@agileplanning-io/flow-metrics";
import { useAtomValue } from "jotai";
import { ForecastChart } from "@agileplanning-io/flow-charts";
import { useProjectContext } from "../../context";
import { ChartParams, newSeed, useChartParams } from "./use-chart-params";
import { chartStyleAtom } from "../chart-style";
import { useFilterParams } from "@app/filter/use-filter-params";
import { defaultDateRange } from "@agileplanning-io/flow-lib";
import { Project } from "@data/projects";
import {
  ControlBar,
  DatePicker,
  FormControl,
  IssueFilterForm,
  ReportType,
} from "@agileplanning-io/flow-components";
import { Button, Checkbox, InputNumber, Space, Tooltip } from "antd";
import { isNonNullish } from "remeda";
import { RedoOutlined } from "@ant-design/icons";

export const ForecastPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams((project: Project) => ({
    ...toClientFilter(project.defaultCompletedFilter),
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  }));
  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const { chartParams, setChartParams } = useChartParams();
  const chartStyle = useAtomValue(chartStyleAtom);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(
        issues,
        fromClientFilter(filter, DateFilterType.Completed),
      ).sort(
        (i1, i2) =>
          i1.metrics.completed.getTime() - i2.metrics.completed.getTime(),
      );
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, setFilteredIssues]);

  const [result, setResult] = useState<SummaryResult>();

  useEffect(() => {
    if (!filteredIssues || filteredIssues.length === 0 || !chartParams) return;
    const result = forecast({
      interval: filter?.dates,
      selectedIssues: filteredIssues,
      ...chartParams,
    });
    setResult(result);
  }, [filteredIssues, filter, chartParams]);

  return (
    <>
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Completed}
        showHierarchyFilter={true}
      />

      <ChartParamsForm
        chartParams={chartParams}
        setChartParams={setChartParams}
      />

      {result ? (
        <ForecastChart
          result={result}
          style={chartStyle}
          showPercentiles={chartParams.showPercentileLabels}
        />
      ) : null}
    </>
  );
};

type ChartParamsFormProps = {
  chartParams: ChartParams;
  setChartParams: (params: ChartParams) => void;
};

const ChartParamsForm: FC<ChartParamsFormProps> = ({
  chartParams,
  setChartParams,
}) => {
  const onCountChanged = (issueCount: number | null) => {
    if (isNonNullish(issueCount)) {
      setChartParams({ ...chartParams, issueCount });
    }
  };

  return (
    <>
      <ControlBar>
        <FormControl label="Issue count">
          <InputNumber
            size="small"
            controls={false}
            style={{ width: "60px" }}
            value={chartParams.issueCount}
            onChange={onCountChanged}
          />
        </FormControl>

        <FormControl label="Start date">
          <DatePicker
            style={{ width: "150px" }}
            size="small"
            value={chartParams.startDate}
            allowClear={true}
            onChange={(e) => {
              setChartParams({
                ...chartParams,
                startDate: e ?? undefined,
              });
            }}
          />
        </FormControl>

        <FormControl label="Seed">
          <Space.Compact>
            <InputNumber
              size="small"
              controls={false}
              style={{ width: "160px" }}
              value={chartParams.seed}
              onChange={(e) => {
                if (e) {
                  setChartParams({ ...chartParams, seed: e });
                }
              }}
            />
            <Tooltip title="New seed">
              <Button
                size="small"
                icon={
                  <RedoOutlined
                    onClick={() =>
                      setChartParams({ ...chartParams, seed: newSeed() })
                    }
                  />
                }
              />
            </Tooltip>
          </Space.Compact>
        </FormControl>
      </ControlBar>
      <ControlBar>
        <Checkbox
          checked={chartParams.includeLongTail}
          onChange={(e) =>
            setChartParams({
              ...chartParams,
              includeLongTail: e.target.checked,
            })
          }
        >
          Include long tail
        </Checkbox>
        <Checkbox
          checked={chartParams.includeLeadTimes}
          onChange={(e) =>
            setChartParams({
              ...chartParams,
              includeLeadTimes: e.target.checked,
            })
          }
        >
          Include lead times
        </Checkbox>
        <Checkbox
          checked={chartParams.excludeOutliers}
          onChange={(e) =>
            setChartParams({
              ...chartParams,
              excludeOutliers: e.target.checked,
            })
          }
        >
          Exclude cycle time outliers
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
      </ControlBar>
    </>
  );
};
