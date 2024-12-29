import { ControlBar } from "../control-bars/control-bar";
import { Dropdown, DropdownItemType } from "../control-bars/dropdown";
import { FormControl } from "../control-bars/form-control";
import { HelpIcon } from "../control-bars/help-icon";
import {
  ClientIssueFilter,
  DatesFilter,
  HierarchyLevel,
  IssueAttributesFilter,
} from "@agileplanning-io/flow-metrics";
import { FC } from "react";
import { Popdown } from "../control-bars/popdown";
import {
  FilterOptions,
  IssueAttributesFilterForm,
} from "./issue-attributes-filter-form";
import { summariseFilter } from "./summarise-filter";
import { DateSelector } from "../date-selector";
import { formatDate, Interval, isAbsolute } from "@agileplanning-io/flow-lib";
import { Typography } from "antd";

export type IssueFilterFormProps = {
  filter?: ClientIssueFilter;
  setFilter: (filter: ClientIssueFilter) => void;
  filterOptions: FilterOptions;
};

export const IssueFilterForm: FC<IssueFilterFormProps> = ({
  filter,
  setFilter,
  filterOptions,
}) => {
  const hierarchyLevelItems: DropdownItemType<HierarchyLevel>[] = [
    { label: "Story", key: HierarchyLevel.Story },
    { label: "Epic", key: HierarchyLevel.Epic },
  ];

  const onHierarchyLevelChanged = (hierarchyLevel: HierarchyLevel) =>
    setFilter({ ...filter, hierarchyLevel });

  const onFilterChanged = (attributes: IssueAttributesFilter) =>
    setFilter({ ...filter, ...attributes });

  const onDatesChanged = (dates?: Interval) => setFilter({ ...filter, dates });

  return (
    <ControlBar>
      <FormControl
        label={
          <>
            Hierarchy level{" "}
            <HelpIcon
              content={<span>Filter to individual tasks or larger epics.</span>}
            />
          </>
        }
      >
        <Dropdown
          items={hierarchyLevelItems}
          selectedKey={filter?.hierarchyLevel}
          onItemSelected={onHierarchyLevelChanged}
        />
      </FormControl>

      <FormControl label="Filter">
        <Popdown
          renderLabel={summariseFilter}
          value={filter as IssueAttributesFilter}
          title="Properties"
          onValueChanged={onFilterChanged}
        >
          {(value, setValue) => (
            <div style={{ width: 480 }}>
              <IssueAttributesFilterForm
                filter={value}
                filterOptions={filterOptions}
                setFilter={setValue}
                showAssigneesFilter={false}
                showResolutionFilter={true}
                showStatusFilter={false}
                labelColSpan={6}
                wrapperColSpan={18}
              />
            </div>
          )}
        </Popdown>
      </FormControl>

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
