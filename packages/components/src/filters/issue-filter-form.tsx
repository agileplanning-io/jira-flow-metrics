import { ControlBar } from "../control-bars/control-bar";
import { Dropdown, DropdownItemType } from "../control-bars/dropdown";
import { FormControl } from "../control-bars/form-control";
import { HelpIcon } from "../control-bars/help-icon";
import {
  ClientIssueFilter,
  HierarchyLevel,
  Issue,
  IssueAttributesFilter,
} from "@agileplanning-io/flow-metrics";
import { FC } from "react";
import { Popdown } from "../control-bars/popdown";
import { IssueAttributesFilterForm } from "./issue-attributes-filter-form";
import { summariseFilter } from "./summarise-filter";
import { DateSelector } from "../date-selector";
import { formatDate, Interval, isAbsolute } from "@agileplanning-io/flow-lib";
import { Tag, theme, Typography } from "antd";
import { isNonNullish } from "remeda";
import { useFilterOptions } from "./use-filter-options";

/**
 * Used to express the type of report for purposes of selecting sensible filter options.
 */
export enum ReportType {
  /**
   * The report shows metrics for completed issues. Disable optoins for filtering by status.
   */
  Completed,

  /**
   * The report show metrics for in progress issues. Disable options for filtering by status and resolution.
   */
  Wip,

  /**
   * An index view of all issues. All filter options should be available.
   */
  Index,
}

export type IssueFilterFormProps = {
  filter?: ClientIssueFilter;
  setFilter: (filter: ClientIssueFilter) => void;
  issues?: Issue[];
  reportType: ReportType;
  showHierarchyFilter: boolean;
  filteredIssuesCount?: number;
};

export const IssueFilterForm: FC<IssueFilterFormProps> = ({
  filter,
  setFilter,
  issues,
  reportType,
  showHierarchyFilter,
  filteredIssuesCount,
}) => {
  const { token } = theme.useToken();

  const hierarchyLevelItems: DropdownItemType<HierarchyLevel>[] = [
    { label: "Story", key: HierarchyLevel.Story },
    { label: "Epic", key: HierarchyLevel.Epic },
  ];

  const filterOptions = useFilterOptions(issues, filter);

  const onHierarchyLevelChanged = (hierarchyLevel?: HierarchyLevel) =>
    setFilter({ ...filter, hierarchyLevel });

  const onFilterChanged = (attributes: IssueAttributesFilter) =>
    setFilter({ ...filter, ...attributes });

  const onDatesChanged = (dates?: Interval) => setFilter({ ...filter, dates });

  const showStatusFilter = reportType === ReportType.Index;
  const showResolutionFilter = reportType !== ReportType.Wip;
  const showDatesFilter = reportType !== ReportType.Index;

  return (
    <ControlBar>
      {showHierarchyFilter ? (
        <FormControl
          label={
            <>
              Hierarchy level{" "}
              <HelpIcon
                content={
                  <span>Filter to individual tasks or larger epics.</span>
                }
              />
            </>
          }
        >
          <Dropdown
            items={hierarchyLevelItems}
            selectedKey={filter?.hierarchyLevel}
            onItemSelected={onHierarchyLevelChanged}
            allowClear={true}
          />
        </FormControl>
      ) : null}

      <FormControl label="Filter">
        <Popdown
          renderLabel={summariseFilter}
          value={filter as IssueAttributesFilter}
          title="Issues filter"
          onValueChanged={onFilterChanged}
        >
          {(value, setValue) => (
            <div style={{ width: 480 }}>
              <IssueAttributesFilterForm
                filter={value}
                filterOptions={filterOptions}
                setFilter={setValue}
                showAssigneesFilter={true}
                showResolutionFilter={showResolutionFilter}
                showStatusFilter={showStatusFilter}
                labelColSpan={6}
                wrapperColSpan={18}
              />
            </div>
          )}
        </Popdown>
      </FormControl>

      {showDatesFilter ? (
        <FormControl label="Dates">
          <Popdown
            title="Dates"
            renderLabel={summariseDatesFilter}
            value={filter?.dates}
            onValueChanged={onDatesChanged}
          >
            {(value, setValue) => (
              <DateSelector dates={value} onChange={setValue} />
            )}
          </Popdown>
        </FormControl>
      ) : null}

      {isNonNullish(filteredIssuesCount) ? (
        <Tag
          style={{
            marginRight: 0,
            marginLeft: "auto",
            backgroundColor: token.colorBgContainer,
          }}
        >
          {filteredIssuesCount} / {issues?.length} issues
        </Tag>
      ) : null}
    </ControlBar>
  );
};

const summariseDatesFilter = (dates?: Interval) => {
  if (!dates) {
    return (
      <Typography.Text type="secondary">No dates selected</Typography.Text>
    );
  }

  if (isAbsolute(dates)) {
    return `${formatDate(dates.start)}-${formatDate(dates.end)}`;
  } else {
    return `Last ${dates.unitCount} ${
      dates.unitCount === 1 ? dates.unit : `${dates.unit}s`
    }`;
  }
};
