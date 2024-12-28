import {
  CycleTimePolicy,
  DraftPolicy,
  SavedPolicy,
  isPolicyEqual,
} from "@agileplanning-io/flow-metrics";
import {
  CaretDownOutlined,
  CheckOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { blue } from "@ant-design/colors";
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
  savedPolicyId?: string;
  savedPolicies: SavedPolicy[];
  cycleTimePolicy: CycleTimePolicy;

  onSaveClicked: (policy: SavedPolicy) => void;
  onMakeDefaultClicked: (policy: SavedPolicy) => void;

  onPolicySelected: (savedPolicy?: SavedPolicy) => void;
  saveCycleTimePolicy: (policy: DraftPolicy) => Promise<SavedPolicy>;
  deleteCycleTimePolicy: (policyId: string) => Promise<void>;
};

export const PoliciesDropdown: FC<PoliciesDropdownProps> = ({
  savedPolicyId,
  savedPolicies,
  cycleTimePolicy,

  onSaveClicked,
  onMakeDefaultClicked,

  onPolicySelected,
  saveCycleTimePolicy,
  deleteCycleTimePolicy,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const savedPolicy = savedPolicies?.find(
    (policy) => policy.id === savedPolicyId,
  );

  const { menuItems, changed } = buildPolicyItems({
    savedPolicy,
    cycleTimePolicy,
    onSaveClicked: () => {
      if (savedPolicy) {
        onSaveClicked({ ...savedPolicy, policy: cycleTimePolicy });
      }
    },
    onSaveAsClicked: () => setShowSaveDialog(true),
    onDeleteClicked: () => setShowDeleteDialog(true),
    onMakeDefaultClicked: () => {
      if (savedPolicy) {
        onMakeDefaultClicked(savedPolicy);
      }
    },
  });

  if (savedPolicies.length) {
    menuItems.push({ type: "divider" });
  }

  menuItems.push(
    ...savedPolicies.map((policy) => ({
      label: policy.name,
      key: policy.id,
      icon: policy.id === savedPolicyId ? <CheckOutlined /> : undefined,
      onClick: () => onPolicySelected(policy),
    })),
  );

  const selectedKeys = savedPolicy ? [savedPolicy.id] : [];

  return (
    <>
      <Space.Compact>
        <Dropdown menu={{ items: menuItems, selectedKeys }} trigger={["click"]}>
          <Button size="small" icon={<CaretDownOutlined />} iconPosition="end">
            {savedPolicy?.name ?? (
              <Typography.Text type="secondary">Custom</Typography.Text>
            )}
            <SaveOutlined style={{ color: changed ? blue.primary : "#AAA" }} />
          </Button>
        </Dropdown>
      </Space.Compact>

      <SaveModal
        open={showSaveDialog}
        saveCycleTimePolicy={saveCycleTimePolicy}
        savedPolicies={savedPolicies}
        cycleTimePolicy={cycleTimePolicy}
        onPolicySaved={onPolicySelected}
        onClose={() => setShowSaveDialog(false)}
      />

      <DeleteModal
        open={showDeleteDialog}
        deleteCycleTimePolicy={deleteCycleTimePolicy}
        onPolicyDeleted={() => onPolicySelected(undefined)}
        onClose={() => setShowDeleteDialog(false)}
        cycleTimePolicy={savedPolicy}
      />
    </>
  );
};

type BuildPolicyItemsProps = {
  savedPolicy?: SavedPolicy;
  cycleTimePolicy: CycleTimePolicy;
  onSaveClicked: () => void;
  onSaveAsClicked: () => void;
  onDeleteClicked: () => void;
  onMakeDefaultClicked: () => void;
};

const buildPolicyItems = ({
  savedPolicy,
  cycleTimePolicy,
  onSaveClicked,
  onSaveAsClicked,
  onDeleteClicked,
  onMakeDefaultClicked,
}: BuildPolicyItemsProps) => {
  const changed =
    !isNullish(savedPolicy) &&
    !isPolicyEqual(savedPolicy.policy, cycleTimePolicy);

  const buildTooltip = (
    canPerformAction: boolean,
    tooltip: () => string,
    label: string,
  ) => (
    <Tooltip title={canPerformAction ? undefined : tooltip()}>{label}</Tooltip>
  );

  const canSave = !isNullish(savedPolicy) && changed;
  const saveTooltip = buildTooltip(
    canSave,
    () =>
      isNullish(savedPolicy)
        ? "Save this policy as a named policy first"
        : "No policy changes to save",
    "Save",
  );

  const canSaveAs = isNullish(savedPolicy) || changed;
  const saveAsTooltip = buildTooltip(
    canSaveAs,
    () => "No policy changes to save",
    "Save As...",
  );

  const canMakeDefault = !isNullish(savedPolicy) && !savedPolicy.isDefault;
  const makeDefaultTooltip = buildTooltip(
    canMakeDefault,
    () =>
      isNullish(savedPolicy)
        ? "Save this policy to make it the default"
        : "Selected policy is already the default",
    "Make default",
  );

  const canDelete = !isNullish(savedPolicy);
  const deleteTooltip = buildTooltip(
    canDelete,
    () => "Save this policy as a named policy first",
    "Delete...",
  );

  const menuItems: MenuProps["items"] = [
    {
      label: saveTooltip,
      key: "Save",
      disabled: !canSave,
      onClick: onSaveClicked,
    },
    {
      label: saveAsTooltip,
      key: "SaveAs",
      disabled: !canSaveAs,
      onClick: onSaveAsClicked,
    },
    {
      label: deleteTooltip,
      key: "Delete",
      disabled: !canDelete,
      onClick: onDeleteClicked,
    },
    {
      label: makeDefaultTooltip,
      key: "MakeDefault",
      disabled: !canMakeDefault,
      onClick: onMakeDefaultClicked,
    },
  ];

  return { menuItems, changed };
};

type SaveModalProps = {
  open: boolean;
  saveCycleTimePolicy: (policy: DraftPolicy) => Promise<SavedPolicy>;
  cycleTimePolicy: CycleTimePolicy;
  savedPolicies: SavedPolicy[];
  onPolicySaved: (policy: SavedPolicy) => void;
  onClose: () => void;
};

const SaveModal: FC<SaveModalProps> = ({
  open,
  saveCycleTimePolicy,
  cycleTimePolicy,
  savedPolicies,
  onPolicySaved,
  onClose,
}) => {
  const [newPolicyName, setNewPolicyName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);
      const policy = await saveCycleTimePolicy({
        name: newPolicyName,
        policy: cycleTimePolicy,
        isDefault: false,
      });
      onClose();
      onPolicySaved(policy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Save Policy"
      open={open}
      confirmLoading={isLoading}
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
            disabled={isLoading}
            onChange={(event) => setNewPolicyName(event.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

type DeleteModalProps = {
  open: boolean;
  deleteCycleTimePolicy: (policyId: string) => Promise<void>;
  cycleTimePolicy?: SavedPolicy;
  onPolicyDeleted: () => void;
  onClose: () => void;
};

const DeleteModal: FC<DeleteModalProps> = ({
  open,
  deleteCycleTimePolicy,
  cycleTimePolicy,
  onPolicyDeleted,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onOk = async () => {
    if (!cycleTimePolicy) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteCycleTimePolicy(cycleTimePolicy.id);
      onPolicyDeleted();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Delete Policy"
      open={open}
      confirmLoading={isLoading}
      onOk={onOk}
      onCancel={onClose}
    >
      <p>
        Are you sure you want to delete policy <b>{cycleTimePolicy?.name}</b>?
      </p>
    </Modal>
  );
};
