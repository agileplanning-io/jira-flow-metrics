import { Modal, Typography } from "antd";
import { Project, useRemoveProject } from "@data/projects";
import { useEffect } from "react";

export type RemoveProjectModalParams = {
  isOpen: boolean;
  close: () => void;
  project?: Project;
};

export const RemoveProjectModal: React.FC<RemoveProjectModalParams> = ({
  isOpen,
  close,
  project,
}) => {
  const removeProject = useRemoveProject(project?.id);

  useEffect(() => {
    if (removeProject.isSuccess) {
      close();
    }
  }, [removeProject.isSuccess, close]);

  return (
    <Modal
      title="Remove project?"
      open={isOpen}
      onOk={() => removeProject.mutate()}
      onCancel={close}
      confirmLoading={removeProject.isLoading}
    >
      <p>
        Are you sure you want to remove the project{" "}
        <Typography.Text code>{project?.name}</Typography.Text>?
      </p>
    </Modal>
  );
};
