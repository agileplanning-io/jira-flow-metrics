import { Button, Table } from "antd";
import { Domain, useDomains } from "@data/domains";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { AddDomainModal } from "./add-domain-modal";
import { Link } from "react-router-dom";
import { projectsIndexPath } from "../navigation/paths";
import { RemoveDomainModal } from "./remove-domain-modal";

export const DomainsIndexPage = () => {
  const { data: domains } = useDomains();

  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [domainToRemove, setDomainToRemove] = useState<Domain>();

  const dataSet = domains?.map((domain) => ({
    key: domain.id,
    ...domain,
  }));

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsAddDomainModalOpen(true)}
        style={{ marginBottom: "16px" }}
      >
        Add Domain
      </Button>
      <Table
        dataSource={dataSet}
        columns={[
          {
            title: "Host",
            key: "host",
            render: (_, domain) => (
              <Link to={projectsIndexPath({ domainId: domain.id })}>
                {domain.host}
              </Link>
            ),
          },
          {
            title: "Credentials",
            dataIndex: "credentials",
            key: "credentials",
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, domain) => (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => setDomainToRemove(domain)}
              />
            ),
          },
        ]}
      />
      <AddDomainModal
        isOpen={isAddDomainModalOpen}
        close={() => setIsAddDomainModalOpen(false)}
      />

      <RemoveDomainModal
        isOpen={domainToRemove !== undefined}
        close={() => setDomainToRemove(undefined)}
        domain={domainToRemove}
      />
    </>
  );
};
