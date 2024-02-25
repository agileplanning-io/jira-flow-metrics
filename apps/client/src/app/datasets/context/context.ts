import { createContext } from "react";
import { Dataset } from "@data/datasets";
import {
  CycleTimePolicy,
  Issue,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";

export type DatasetContextType = {
  dataset?: Dataset;
  cycleTimePolicy: CycleTimePolicy;
  setCycleTimePolicy: (policy: CycleTimePolicy) => void;
  issues?: Issue[];
};

export const DatasetContext = createContext<DatasetContextType>({
  setCycleTimePolicy: () => {},
  cycleTimePolicy: {
    labelFilterType: LabelFilterType.Include,
    includeWaitTime: false,
  },
});
