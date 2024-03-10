import { Collapse, Tag, Typography } from "antd";
import { FC, ReactNode, useState } from "react";

export type ExpandableOptionsHeader = {
  title: string;
  options: { label?: string; value?: string }[];
};

export type ExpandableOptionsProps = {
  header: ExpandableOptionsHeader;
  children: ReactNode;
  extra?: ReactNode;
};

export const ExpandableOptions: FC<ExpandableOptionsProps> = ({
  header: { title, options },
  children,
  extra,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>();
  const expanded = !expandedKeys?.length;
  const header = (
    <span style={{ opacity: expanded ? 1 : 0.5 }}>
      <span>{title}&nbsp;</span>
      {options.map(({ label, value }, index) => (
        <span key={`${title}-${index}`}>
          {label ? (
            <Typography.Text key={`option-${title}-${index}`} type="secondary">
              {label}:&nbsp;
            </Typography.Text>
          ) : null}
          {value ? <Tag key={`${title}-${index}-value`}>{value}</Tag> : null}
        </span>
      ))}
    </span>
  );
  return (
    <Collapse
      style={{ marginBottom: 8 }}
      bordered={false}
      size="small"
      onChange={(keys) => setExpandedKeys(keys as string[])}
      items={[
        {
          key: "project",
          label: header,
          children,
          extra,
        },
      ]}
    />
  );
};
