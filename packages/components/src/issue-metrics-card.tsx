import { Card, Descriptions } from "antd";
import { Issue } from "@jbrunton/flow-metrics";
import { formatNumber, formatTime } from "@jbrunton/flow-lib";
import { isNil } from "remeda";

export type IssueMetricsCardProps = {
  issue: Issue;
};

export const IssueMetricsCard: React.FC<IssueMetricsCardProps> = ({
  issue,
}) => {
  return (
    <Card title="Flow Metrics" size="small">
      <Descriptions
        column={1}
        key={issue.key}
        size="small"
        colon={false}
        labelStyle={{ width: "35%", fontWeight: 500 }}
      >
        <Descriptions.Item label="Started">
          {formatTime(issue.metrics.started) ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Completed">
          {formatTime(issue.metrics.completed) ?? "-"}
        </Descriptions.Item>
        {!isNil(issue.metrics.cycleTime) ? (
          <Descriptions.Item label="Cycle Time">
            {formatNumber(issue.metrics.cycleTime)} days
          </Descriptions.Item>
        ) : null}
        {!isNil(issue.metrics.age) ? (
          <Descriptions.Item label="Age">
            {formatNumber(issue.metrics.age)} days
          </Descriptions.Item>
        ) : null}
      </Descriptions>
    </Card>
  );
};
