import { ExportOutlined } from "@ant-design/icons";
import {
  IssueExternalLinkComponent,
  IssueLinkComponent,
} from "@agileplanning-io/flow-components";
import { Tag } from "antd";
import { Link } from "react-router-dom";

export const IssueLink: IssueLinkComponent = ({ text, path, tag }) => {
  const link = (
    <Link style={{ whiteSpace: "nowrap" }} to={path}>
      {text}
    </Link>
  );
  if (tag) {
    return <Tag>{link}</Tag>;
  }
  return link;
};

export const IssueExternalLink: IssueExternalLinkComponent = ({
  externalUrl,
}) => {
  return (
    <Link to={externalUrl} target="_blank">
      <ExportOutlined />
    </Link>
  );
};
