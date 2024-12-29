import { FC, useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  WipResult,
  WipType,
  calculateWip,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { IssuesTable } from "../../../components/issues-table";
import { WipChart } from "@agileplanning-io/flow-charts/src/wip/wip-chart";
import { omit } from "remeda";
import { Checkbox } from "antd";
import { useProjectContext } from "../../context";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";
import { ChartParams, useChartParams } from "./use-chart-params";
import { useFilterParams } from "@app/filter/use-filter-params";
import { asAbsolute, defaultDateRange } from "@agileplanning-io/flow-lib";
import {
  ControlBar,
  Dropdown,
  DropdownItemType,
  FormControl,
  IssueFilterForm,
  ReportType,
} from "@agileplanning-io/flow-components";

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
  }, [filter, chartParams.includeStoppedIssues, chartParams.wipType]);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterIssues(issues, omit(filter, ["dates"]));
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, setFilteredIssues]);

  const [wipResult, setWipResult] = useState<WipResult>();

  useEffect(() => {
    if (!filter?.dates) {
      return;
    }

    setWipResult(
      calculateWip({
        issues: filteredIssues,
        range: asAbsolute(filter.dates),
        includeStoppedIssues: chartParams.includeStoppedIssues,
        wipType: chartParams.wipType,
      }),
    );
  }, [
    filter,
    filteredIssues,
    chartParams.includeStoppedIssues,
    chartParams.wipType,
  ]);

  return (
    <>
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Wip}
        showHierarchyFilter={true}
      />

      <ChartParamsForm
        chartParams={chartParams}
        setChartParams={setChartParams}
      />

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

type ChartParamsFormProps = {
  chartParams: ChartParams;
  setChartParams: (params: ChartParams) => void;
};

const ChartParamsForm: FC<ChartParamsFormProps> = ({
  chartParams,
  setChartParams,
}) => {
  const wipTypeItems: DropdownItemType<WipType>[] = [
    { label: "Status", key: WipType.Status },
    { label: "Lead Time", key: WipType.LeadTime },
  ];

  const onWipTypeChanged = (wipType: WipType) =>
    setChartParams({ ...chartParams, wipType });

  return (
    <ControlBar>
      <FormControl label="WIP algorithm">
        <Dropdown
          items={wipTypeItems}
          selectedKey={chartParams.wipType}
          onItemSelected={onWipTypeChanged}
        />
      </FormControl>

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
    </ControlBar>
  );
};
