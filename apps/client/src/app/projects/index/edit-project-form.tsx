import { LoadingSpinner } from "@app/components/loading-spinner";
import {
  Project,
  UpdateProjectParams,
  useCreatePolicy,
  useDeletePolicy,
  useGetPolicies,
  useSetDefaultPolicy,
  useUpdatePolicy,
  useUpdateProject,
} from "@data/projects";
import { Button, Form, Input } from "antd";
import { FC, useCallback, useState } from "react";
import {
  EditCycleTimePolicyForm,
  EditFilterForm,
  WorkflowBoard,
  WorkflowBoardProps,
} from "@agileplanning-io/flow-components";
import { WorkflowStage } from "@data/issues";
import {
  ClientIssueFilter,
  CycleTimePolicy,
  DateFilterType,
  fromClientFilter,
  toClientFilter,
  Workflow,
} from "@agileplanning-io/flow-metrics";
import { FullScreenDrawer } from "@app/components/full-screen-drawer";
import { useProjectContext } from "../context";

export type EditProjectFormProps = {
  project: Project;
  onClose: () => void;
};

export const EditProjectForm: FC<EditProjectFormProps> = ({
  project,
  onClose,
}) => {
  const { savedPolicyId, setSavedPolicyId } = useProjectContext();

  const [updatedStoryWorkflow, setUpdatedStoryWorkflow] =
    useState<UpdateProjectParams["storyWorkflowStages"]>();

  const [updatedEpicWorkflow, setUpdatedEpicWorkflow] =
    useState<UpdateProjectParams["epicWorkflowStages"]>();

  const [updatedCycleTimePolicy, setUpdatedCycleTimePolicy] =
    useState<CycleTimePolicy>(project.defaultCycleTimePolicy);

  const [updatedName, setUpdatedName] = useState(project.name);

  const [updatedDefaultCompletedFilter, setUpdatedDefaultCompletedFilter] =
    useState<ClientIssueFilter>(toClientFilter(project.defaultCompletedFilter));

  const updateProject = useUpdateProject();
  const setDefaultPolicy = useSetDefaultPolicy(project.id);
  const updatePolicy = useUpdatePolicy(project.id);
  const saveCycleTimePolicy = useCreatePolicy(project.id);
  const deleteCycleTimePolicy = useDeletePolicy(project.id);

  const { data: savedPolicies } = useGetPolicies(project.id);

  const onStoryWorkflowChanged = useCallback(
    (workflow: WorkflowStage[]) =>
      setUpdatedStoryWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      ),
    [setUpdatedStoryWorkflow],
  );

  const onEpicWorkflowChanged = useCallback(
    (workflow: WorkflowStage[]) =>
      setUpdatedEpicWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      ),
    [setUpdatedEpicWorkflow],
  );

  type WorkflowToEdit = {
    workflow: Workflow;
    title: string;
    onWorkflowChanged: WorkflowBoardProps["onWorkflowChanged"];
  };

  const [workflowToEdit, setWorkflowToEdit] = useState<WorkflowToEdit>();

  if (!project) {
    return <LoadingSpinner />;
  }

  const applyChanges = () => {
    if (
      updatedStoryWorkflow &&
      updatedEpicWorkflow &&
      updatedCycleTimePolicy &&
      updatedDefaultCompletedFilter
    ) {
      updateProject.mutate(
        {
          id: project.id,
          name: updatedName,
          storyWorkflowStages: updatedStoryWorkflow,
          epicWorkflowStages: updatedEpicWorkflow,
          defaultCycleTimePolicy: updatedCycleTimePolicy,
          defaultCompletedFilter: fromClientFilter(
            updatedDefaultCompletedFilter,
            DateFilterType.Completed,
          ),
        },
        {
          onSuccess: onClose,
        },
      );
    }
  };

  return (
    <>
      <h2>Project Details</h2>

      <Form layout="vertical">
        <Form.Item label="Name">
          <Input
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
        </Form.Item>
      </Form>

      <h2>Default Cycle Time Policy</h2>

      <EditCycleTimePolicyForm
        savedPolicyId={savedPolicyId}
        setSavedPolicyId={setSavedPolicyId}
        savedPolicies={savedPolicies}
        filterOptions={project}
        workflowScheme={project.workflowScheme}
        cycleTimePolicy={updatedCycleTimePolicy}
        setCycleTimePolicy={setUpdatedCycleTimePolicy}
        onMakeDefaultClicked={(policy) => setDefaultPolicy.mutate(policy.id)}
        onSaveClicked={(policy) => updatePolicy.mutate(policy)}
        saveCycleTimePolicy={saveCycleTimePolicy}
        deleteCycleTimePolicy={deleteCycleTimePolicy}
      />

      <h2>Default Completed Work Filter</h2>

      <EditFilterForm
        filter={updatedDefaultCompletedFilter}
        setFilter={setUpdatedDefaultCompletedFilter}
        showDateSelector={false}
        showHierarchyFilter={false}
        showResolutionFilter={true}
        showStatusFilter={false}
        showAssigneesFilter={false}
        filterOptions={project}
        labelColSpan={2}
        wrapperColSpan={10}
      />

      <h2>Workflows</h2>

      <h3>
        Story Workflow
        <Button
          style={{ width: "fit-content", marginTop: "8px" }}
          type="link"
          onClick={() =>
            setWorkflowToEdit({
              workflow: project.workflowScheme.stories,
              title: "Edit Story Workflow",
              onWorkflowChanged: onStoryWorkflowChanged,
            })
          }
        >
          Edit
        </Button>
      </h3>

      <WorkflowBoard
        workflow={project.workflowScheme.stories}
        onWorkflowChanged={onStoryWorkflowChanged}
        disabled={updateProject.isLoading}
        readonly={true}
      />

      <h3>
        Epic Workflow
        <Button
          style={{ width: "fit-content", marginTop: "8px" }}
          type="link"
          onClick={() =>
            setWorkflowToEdit({
              workflow: project.workflowScheme.epics,
              title: "Edit Epic Workflow",
              onWorkflowChanged: onEpicWorkflowChanged,
            })
          }
        >
          Edit
        </Button>
      </h3>

      <WorkflowBoard
        workflow={project.workflowScheme.epics}
        onWorkflowChanged={onEpicWorkflowChanged}
        disabled={updateProject.isLoading}
        readonly={true}
      />

      <Button
        type="primary"
        style={{ width: "fit-content", marginTop: "8px" }}
        onClick={applyChanges}
        loading={updateProject.isLoading}
        disabled={updateProject.isLoading}
      >
        Apply Changes
      </Button>

      <FullScreenDrawer
        title={workflowToEdit?.title}
        open={workflowToEdit !== undefined}
        onClose={() => setWorkflowToEdit(undefined)}
        height="90%"
      >
        {workflowToEdit ? (
          <>
            <WorkflowBoard
              workflow={workflowToEdit.workflow}
              onWorkflowChanged={workflowToEdit.onWorkflowChanged}
              disabled={updateProject.isLoading}
              readonly={false}
            />
            <Button
              type="primary"
              style={{ width: "fit-content", marginTop: "8px" }}
              onClick={applyChanges}
              loading={updateProject.isLoading}
              disabled={
                updatedStoryWorkflow === undefined ||
                updatedEpicWorkflow === undefined ||
                updateProject.isLoading
              }
            >
              Apply Changes
            </Button>
          </>
        ) : null}
      </FullScreenDrawer>
    </>
  );
};
