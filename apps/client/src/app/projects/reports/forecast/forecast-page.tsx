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
import { defaultDateRange, formatDate } from "@agileplanning-io/flow-lib";
import { Project } from "@data/projects";
import {
  ControlBar,
  DatePicker,
  FormControl,
  IssueFilterForm,
  Popdown,
  ReportType,
} from "@agileplanning-io/flow-components";
import { Button, Checkbox, Form, InputNumber, Space, Tooltip } from "antd";
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
  return (
    <ControlBar>
      <FormControl label="Inputs">
        <Popdown
          title="Simulation inputs"
          value={chartParams}
          onValueChanged={setChartParams}
          renderLabel={(value) => (
            <Space direction="horizontal">
              <span>{value.issueCount} issues</span>
              <span>&middot;</span>
              <span>Start {formatDate(value.startDate)}</span>
            </Space>
          )}
        >
          {(value, setValue) => (
            <Form
              style={{ width: "350px" }}
              layout="horizontal"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Form.Item label="Issue count" style={{ margin: "8px 0" }}>
                <InputNumber
                  controls={false}
                  value={value.issueCount}
                  onChange={(issueCount) => {
                    if (isNonNullish(issueCount)) {
                      setValue({ ...value, issueCount });
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Start date"
                style={{ margin: "8px 0", width: "100%" }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  value={value.startDate}
                  allowClear={true}
                  onChange={(e) => {
                    setValue({
                      ...value,
                      startDate: e ?? undefined,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Seed"
                style={{ margin: "8px 0", width: "100%" }}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <InputNumber
                    controls={false}
                    style={{ width: "100%" }}
                    value={value.seed}
                    onChange={(e) => {
                      if (e) {
                        setValue({ ...value, seed: e });
                      }
                    }}
                  />
                  <Tooltip title="New seed">
                    <Button
                      icon={
                        <RedoOutlined
                          onClick={() =>
                            setValue({
                              ...value,
                              seed: newSeed(),
                            })
                          }
                        />
                      }
                    />
                  </Tooltip>
                </Space.Compact>
              </Form.Item>
            </Form>
          )}
        </Popdown>
      </FormControl>

      <FormControl label="Options">
        <Popdown
          title="Simulation options"
          value={chartParams}
          onValueChanged={setChartParams}
          renderLabel={(value) => (
            <Space direction="horizontal">
              {value.includeLongTail ? "Incl. long tail" : "Excl. long tail"}
              &middot;
              {value.includeLeadTimes ? "Incl. lead times" : "Excl. lead times"}
              &middot;
              {value.excludeOutliers ? "Excl. outliers" : "Incl. outliers"}
            </Space>
          )}
        >
          {(value, setValue) => (
            <Space direction="vertical">
              <Checkbox
                checked={value.includeLongTail}
                onChange={(e) =>
                  setValue({
                    ...value,
                    includeLongTail: e.target.checked,
                  })
                }
              >
                Include long tail
              </Checkbox>
              <Checkbox
                checked={value.includeLeadTimes}
                onChange={(e) =>
                  setValue({
                    ...value,
                    includeLeadTimes: e.target.checked,
                  })
                }
              >
                Include lead times
              </Checkbox>
              <Checkbox
                checked={value.excludeOutliers}
                onChange={(e) =>
                  setValue({
                    ...value,
                    excludeOutliers: e.target.checked,
                  })
                }
              >
                Exclude cycle time outliers
              </Checkbox>
            </Space>
          )}
        </Popdown>
      </FormControl>

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
  );
};
