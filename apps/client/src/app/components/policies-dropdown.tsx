import { CycleTimePolicy, SavedPolicy } from "@agileplanning-io/flow-metrics";
import { CaretDownOutlined, SaveOutlined } from "@ant-design/icons";
import { useProjectContext } from "@app/projects/context";
import {
  Project,
  useCreatePolicy,
  useGetPolicies,
  useSetDefaultPolicy,
} from "@data/projects";
import { Space, Button, Dropdown, MenuProps, Form, Input, Modal } from "antd";
import { FC, useMemo, useState } from "react";

type PoliciesDropdownProps = {
  project: Project;
  cycleTimePolicy: CycleTimePolicy;
};

export const PoliciesDropdown: FC<PoliciesDropdownProps> = ({
  project,
  cycleTimePolicy,
}) => {
  const { savedPolicyId, setSavedPolicyId, setCycleTimePolicy } =
    useProjectContext();
  const { data: savedPolicies } = useGetPolicies(project.id);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const setDefaultPolicy = useSetDefaultPolicy(project.id);

  if (!savedPolicies) {
    return null;
  }

  const currentPolicy = savedPolicies?.find(
    (policy) => policy.id === savedPolicyId,
  );

  const saveItems: MenuProps["items"] = [
    { label: "Save", key: "Save", disabled: true },
    {
      label: "Save as...",
      key: "SaveAs",
      onClick: () => setShowSaveDialog(true),
    },
    { label: "Delete...", key: "Delete" },
    {
      label: "Make default",
      key: "MakeDefault",
      onClick: () => {
        if (currentPolicy) {
          setDefaultPolicy.mutate(currentPolicy?.id);
        }
      },
    },
  ];

  if (savedPolicies.length) {
    saveItems.push({ type: "divider" });
  }

  saveItems.push(
    ...savedPolicies.map((policy) => ({
      label: policy.name,
      key: policy.id,
      onClick: () => {
        setSavedPolicyId(policy.id);
        setCycleTimePolicy(policy.policy);
      },
    })),
  );

  const selectedKeys = currentPolicy ? [currentPolicy.id] : [];

  return (
    <>
      <Space.Compact>
        <Dropdown menu={{ items: saveItems, selectedKeys }}>
          <Button size="small" icon={<CaretDownOutlined />} iconPosition="end">
            {currentPolicy?.name ?? "Custom"}
            <SaveOutlined disabled={true} />
          </Button>
        </Dropdown>
      </Space.Compact>
      <SaveModal
        open={showSaveDialog}
        projectId={project.id}
        savedPolicies={savedPolicies}
        cycleTimePolicy={cycleTimePolicy}
        onPolicySaved={() => {}}
        onClose={() => setShowSaveDialog(false)}
      />
    </>
  );
};

type SaveModalProps = {
  open: boolean;
  projectId: string;
  cycleTimePolicy: CycleTimePolicy;
  savedPolicies: SavedPolicy[];
  onPolicySaved: (policy: SavedPolicy) => void;
  onClose: () => void;
};

const SaveModal: FC<SaveModalProps> = ({
  open,
  projectId,
  cycleTimePolicy,
  savedPolicies,
  onPolicySaved,
  onClose,
}) => {
  const saveCycleTimePolicy = useCreatePolicy(projectId);
  const [newPolicyName, setNewPolicyName] = useState<string>("");

  const invalidName = useMemo(
    () => newPolicyName.length === 0,
    [newPolicyName],
  );

  const alreadyExists = useMemo(
    () => savedPolicies.some((policy) => policy.name === newPolicyName),
    [savedPolicies, newPolicyName],
  );

  const validationHelp = useMemo(() => {
    if (invalidName) {
      return "Please enter a name for the policy";
    }

    if (alreadyExists) {
      return "A policy with this name already exists";
    }
  }, [invalidName, alreadyExists]);

  const onOk = async () => {
    saveCycleTimePolicy.mutate(
      {
        name: newPolicyName,
        policy: cycleTimePolicy,
        isDefault: false,
      },
      {
        onSuccess: (policy) => {
          onClose();
          onPolicySaved(policy);
        },
      },
    );
  };

  return (
    <Modal
      title="Save Policy"
      open={open}
      confirmLoading={saveCycleTimePolicy.isLoading}
      afterOpenChange={() => {
        setNewPolicyName("");
      }}
      onOk={onOk}
      onCancel={onClose}
      okButtonProps={{ disabled: !!validationHelp }}
    >
      <Form>
        <Form.Item
          label="Name"
          help={validationHelp}
          validateStatus={alreadyExists ? "error" : "validating"}
        >
          <Input
            value={newPolicyName}
            autoComplete="off"
            disabled={saveCycleTimePolicy.isLoading}
            onChange={(event) => setNewPolicyName(event.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
