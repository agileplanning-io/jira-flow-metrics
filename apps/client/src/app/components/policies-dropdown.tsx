import {
  CycleTimePolicy,
  SavedPolicy,
  isPolicyEqual,
} from "@agileplanning-io/flow-metrics";
import {
  CaretDownOutlined,
  CheckOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useProjectContext } from "@app/projects/context";
import {
  Project,
  useCreatePolicy,
  useDeletePolicy,
  useGetPolicies,
  useSetDefaultPolicy,
  useUpdatePolicy,
} from "@data/projects";
import {
  Space,
  Button,
  Dropdown,
  MenuProps,
  Form,
  Input,
  Modal,
  Typography,
  Tooltip,
} from "antd";
import { FC, useMemo, useState } from "react";
import { isNullish } from "remeda";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const setDefaultPolicy = useSetDefaultPolicy(project.id);
  const updatePolicy = useUpdatePolicy(project.id);

  if (!savedPolicies) {
    return null;
  }

  const currentPolicy = savedPolicies?.find(
    (policy) => policy.id === savedPolicyId,
  );

  const changed =
    currentPolicy && !isPolicyEqual(currentPolicy.policy, cycleTimePolicy);

  const canSave = !isNullish(currentPolicy) && changed;
  const saveReason = canSave
    ? undefined
    : isNullish(currentPolicy)
    ? "Save this policy as a named policy first"
    : "No policy changes to save";

  const canSaveAs = isNullish(currentPolicy) || changed;
  const saveAsReason = canSaveAs ? undefined : "No policy changes to save";

  const canMakeDefault = !isNullish(currentPolicy) && !currentPolicy.isDefault;
  const makeDefaultReason = canMakeDefault
    ? undefined
    : isNullish(currentPolicy)
    ? "Save this policy to make it the default"
    : "Selected policy is already the default";

  const canDelete = !isNullish(currentPolicy);
  const deleteReason = canDelete
    ? undefined
    : "Save this policy as a named policy first";

  const saveItems: MenuProps["items"] = [
    {
      label: <Tooltip title={saveReason}>Save</Tooltip>,
      key: "Save",
      disabled: !canSave,
      onClick: () => {
        if (currentPolicy) {
          updatePolicy.mutate({ ...currentPolicy, policy: cycleTimePolicy });
        }
      },
    },
    {
      label: <Tooltip title={saveAsReason}>Save As...</Tooltip>,
      key: "SaveAs",
      disabled: !canSaveAs,
      onClick: () => setShowSaveDialog(true),
    },
    {
      label: <Tooltip title={deleteReason}>Delete...</Tooltip>,
      key: "Delete",
      disabled: !canDelete,
      onClick: () => setShowDeleteDialog(true),
    },
    {
      label: <Tooltip title={makeDefaultReason}>Make default</Tooltip>,
      key: "MakeDefault",
      disabled: !canMakeDefault,
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
      icon: policy.id === savedPolicyId ? <CheckOutlined /> : undefined,
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
        <Dropdown menu={{ items: saveItems, selectedKeys }} trigger={["click"]}>
          <Button size="small" icon={<CaretDownOutlined />} iconPosition="end">
            {currentPolicy?.name ?? (
              <Typography.Text type="secondary">Custom</Typography.Text>
            )}
            <SaveOutlined style={{ color: changed ? undefined : "#AAA" }} />
          </Button>
        </Dropdown>
      </Space.Compact>

      <SaveModal
        open={showSaveDialog}
        projectId={project.id}
        savedPolicies={savedPolicies}
        cycleTimePolicy={cycleTimePolicy}
        onPolicySaved={(policy) => setSavedPolicyId(policy.id)}
        onClose={() => setShowSaveDialog(false)}
      />

      <DeleteModal
        open={showDeleteDialog}
        projectId={project.id}
        onPolicyDeleted={() => setSavedPolicyId(undefined)}
        onClose={() => setShowDeleteDialog(false)}
        cycleTimePolicy={currentPolicy}
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

  const duplicateName = useMemo(
    () => savedPolicies.some((policy) => policy.name === newPolicyName),
    [savedPolicies, newPolicyName],
  );

  const validationHelp = useMemo(() => {
    if (invalidName) {
      return "Please enter a name for the policy";
    }

    if (duplicateName) {
      return "A policy with this name already exists";
    }
  }, [invalidName, duplicateName]);

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
          validateStatus={duplicateName ? "error" : "validating"}
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

type DeleteModalProps = {
  open: boolean;
  projectId: string;
  cycleTimePolicy?: SavedPolicy;
  onPolicyDeleted: () => void;
  onClose: () => void;
};

const DeleteModal: FC<DeleteModalProps> = ({
  open,
  projectId,
  cycleTimePolicy,
  onPolicyDeleted,
  onClose,
}) => {
  const deleteCycleTimePolicy = useDeletePolicy(projectId);

  const onOk = async () => {
    if (!cycleTimePolicy) {
      return;
    }

    deleteCycleTimePolicy.mutate(cycleTimePolicy.id, {
      onSuccess: () => {
        onPolicyDeleted();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Delete Policy"
      open={open}
      confirmLoading={deleteCycleTimePolicy.isLoading}
      onOk={onOk}
      onCancel={onClose}
    >
      <p>
        Are you sure you want to delete policy <b>{cycleTimePolicy?.name}</b>?
      </p>
    </Modal>
  );
};
