import { DraftPolicy, SavedPolicy } from "@agileplanning-io/flow-metrics";
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
import { CSSProperties, FC, useMemo, useState } from "react";

export type CurrentPolicy = DraftPolicy & {
  isChanged: boolean;
};

export function isSavedPolicy(
  policy: CurrentPolicy,
): policy is SavedPolicy & { isChanged: boolean } {
  return "id" in policy;
}

type PoliciesDropdownProps = {
  currentPolicy: CurrentPolicy;
  savedPolicies: SavedPolicy[];

  onSaveClicked: (policy: SavedPolicy) => void;
  onMakeDefaultClicked: (policy: SavedPolicy) => void;

  onPolicySelected: (savedPolicy?: SavedPolicy) => void;
  saveCycleTimePolicy: (policy: DraftPolicy) => Promise<SavedPolicy>;
  deleteCycleTimePolicy: (policyId: string) => Promise<void>;
};

export const PoliciesDropdown: FC<PoliciesDropdownProps> = ({
  currentPolicy,
  savedPolicies,

  onSaveClicked,
  onMakeDefaultClicked,

  onPolicySelected,
  saveCycleTimePolicy,
  deleteCycleTimePolicy,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const menuItems = buildPolicyItems({
    currentPolicy,
    onSaveClicked: () => {
      if (isSavedPolicy(currentPolicy)) {
        onSaveClicked(currentPolicy);
      }
    },
    onSaveAsClicked: () => setShowSaveDialog(true),
    onDeleteClicked: () => setShowDeleteDialog(true),
    onMakeDefaultClicked: () => {
      if (isSavedPolicy(currentPolicy)) {
        onMakeDefaultClicked(currentPolicy);
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
      icon:
        isSavedPolicy(currentPolicy) && policy.id === currentPolicy.id ? (
          <CheckOutlined />
        ) : undefined,
      onClick: () => onPolicySelected(policy),
    })),
  );

  const selectedKeys = isSavedPolicy(currentPolicy) ? [currentPolicy.id] : [];

  return (
    <>
      <Space.Compact>
        <Dropdown menu={{ items: menuItems, selectedKeys }} trigger={["click"]}>
          <Button size="small" icon={<CaretDownOutlined />} iconPosition="end">
            {isSavedPolicy(currentPolicy) ? (
              currentPolicy.name
            ) : (
              <Typography.Text type="secondary">Custom</Typography.Text>
            )}
            <SaveOutlined
              style={{ color: currentPolicy.isChanged ? blue.primary : "#AAA" }}
            />
          </Button>
        </Dropdown>
      </Space.Compact>

      <SaveModal
        open={showSaveDialog}
        saveCycleTimePolicy={saveCycleTimePolicy}
        savedPolicies={savedPolicies}
        currentPolicy={currentPolicy}
        onPolicySaved={onPolicySelected}
        onClose={() => setShowSaveDialog(false)}
      />

      <DeleteModal
        open={showDeleteDialog}
        deleteCycleTimePolicy={deleteCycleTimePolicy}
        onPolicyDeleted={() => onPolicySelected(undefined)}
        onClose={() => setShowDeleteDialog(false)}
        currentPolicy={currentPolicy}
      />
    </>
  );
};

type BuildPolicyItemsProps = {
  currentPolicy: CurrentPolicy;
  onSaveClicked: () => void;
  onSaveAsClicked: () => void;
  onDeleteClicked: () => void;
  onMakeDefaultClicked: () => void;
};

const buildPolicyItems = ({
  currentPolicy,
  onSaveClicked,
  onSaveAsClicked,
  onDeleteClicked,
  onMakeDefaultClicked,
}: BuildPolicyItemsProps) => {
  const buildTooltip = (
    canPerformAction: boolean,
    tooltip: () => string,
    label: string,
  ) => (
    <Tooltip title={canPerformAction ? undefined : tooltip()}>{label}</Tooltip>
  );

  const canSave = isSavedPolicy(currentPolicy) && currentPolicy.isChanged;
  const saveTooltip = buildTooltip(
    canSave,
    () =>
      isSavedPolicy(currentPolicy)
        ? "No policy changes to save"
        : "Save this policy as a named policy first",
    "Save",
  );

  const canSaveAs = !isSavedPolicy(currentPolicy) || currentPolicy.isChanged;
  const saveAsTooltip = buildTooltip(
    canSaveAs,
    () => "No policy changes to save",
    "Save As...",
  );

  const canMakeDefault =
    isSavedPolicy(currentPolicy) && !currentPolicy.isDefault;
  const makeDefaultTooltip = buildTooltip(
    canMakeDefault,
    () =>
      isSavedPolicy(currentPolicy)
        ? "Selected policy is already the default"
        : "Save this policy to make it the default",
    "Make default",
  );

  const canDelete = isSavedPolicy(currentPolicy);
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

  return menuItems;
};

type SaveModalProps = {
  open: boolean;
  saveCycleTimePolicy: (policy: DraftPolicy) => Promise<SavedPolicy>;
  currentPolicy: CurrentPolicy;
  savedPolicies: SavedPolicy[];
  onPolicySaved: (policy: SavedPolicy) => void;
  onClose: () => void;
};

const SaveModal: FC<SaveModalProps> = ({
  open,
  saveCycleTimePolicy,
  currentPolicy,
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
        policy: currentPolicy.policy,
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
  currentPolicy: CurrentPolicy;
  onPolicyDeleted: () => void;
  onClose: () => void;
};

const DeleteModal: FC<DeleteModalProps> = ({
  open,
  deleteCycleTimePolicy,
  currentPolicy,
  onPolicyDeleted,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onOk = async () => {
    if (!isSavedPolicy(currentPolicy)) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteCycleTimePolicy(currentPolicy.id);
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
        Are you sure you want to delete policy <b>{currentPolicy.name}</b>?
      </p>
    </Modal>
  );
};
