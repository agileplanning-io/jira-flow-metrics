import { Modal, Typography } from "antd";
import { useEffect } from "react";
import { Domain, useRemoveDomain } from "@data/domains";

export type RemoveDomainModalParams = {
  isOpen: boolean;
  close: () => void;
  domain?: Domain;
};

export const RemoveDomainModal: React.FC<RemoveDomainModalParams> = ({
  isOpen,
  close,
  domain,
}) => {
  const removeProject = useRemoveDomain(domain?.id);

  useEffect(() => {
    if (removeProject.isSuccess) {
      close();
    }
  }, [removeProject.isSuccess, close]);

  return (
    <Modal
      title="Remove domain?"
      open={isOpen}
      onOk={() => removeProject.mutate()}
      onCancel={close}
      confirmLoading={removeProject.isLoading}
    >
      <p>
        Are you sure you want to remove the domain{" "}
        <Typography.Text code>{domain?.host}</Typography.Text>?
      </p>
    </Modal>
  );
};
