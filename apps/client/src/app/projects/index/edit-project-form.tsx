import { LoadingSpinner } from "@app/components/loading-spinner";
import {
  Project,
  UpdateProjectParams,
  useGetBoards,
  useUpdateProject,
} from "@data/projects";
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Tag,
} from "antd";
import { FC, useCallback, useState } from "react";
import {
  IssueAttributesFilterForm,
  WorkflowBoard,
  WorkflowBoardProps,
} from "@agileplanning-io/flow-components";
import { WorkflowStage } from "@data/issues";
import {
  ClientIssueFilter,
  DateFilterType,
  fromClientFilter,
  toClientFilter,
  Workflow,
} from "@agileplanning-io/flow-metrics";
import { FullScreenDrawer } from "@app/components/full-screen-drawer";

export type EditProjectFormProps = {
  project: Project;
  onClose: () => void;
};

export const EditProjectForm: FC<EditProjectFormProps> = ({
  project,
  onClose,
}) => {
  const [updatedStoryWorkflow, setUpdatedStoryWorkflow] =
    useState<UpdateProjectParams["storyWorkflowStages"]>();

  const [updatedEpicWorkflow, setUpdatedEpicWorkflow] =
    useState<UpdateProjectParams["epicWorkflowStages"]>();

  const [updatedName, setUpdatedName] = useState(project.name);

  const [updatedDefaultCompletedFilter, setUpdatedDefaultCompletedFilter] =
    useState<ClientIssueFilter>(toClientFilter(project.defaultCompletedFilter));

  const [validationErrors, setValidationErrors] = useState<string[]>();
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const updateValidationErrors = (validationErrors?: string[]) => {
    if (!validationErrors) {
      setShowValidationErrors(false);
    }

    setValidationErrors(validationErrors);
  };

  const updateProject = useUpdateProject();

  const [boardsQuery, setBoardsQuery] = useState<string>("");

  const { data: boards, isLoading: isLoadingBoards } = useGetBoards(
    project.id,
    boardsQuery,
  );

  const onStoryWorkflowChanged = useCallback(
    (workflow: WorkflowStage[], validationErrors?: string[]) => {
      updateValidationErrors(validationErrors);
      setUpdatedStoryWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      );
    },
    [setUpdatedStoryWorkflow],
  );

  const onEpicWorkflowChanged = useCallback(
    (workflow: WorkflowStage[], validationErrors?: string[]) => {
      updateValidationErrors(validationErrors);
      setUpdatedEpicWorkflow(
        workflow.map((stage) => ({
          ...stage,
          statuses: stage.statuses.map((status) => status.name),
        })),
      );
    },
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
      updatedDefaultCompletedFilter
    ) {
      if (validationErrors?.length) {
        setShowValidationErrors(true);
        return;
      }

      updateProject.mutate(
        {
          id: project.id,
          name: updatedName,
          storyWorkflowStages: updatedStoryWorkflow,
          epicWorkflowStages: updatedEpicWorkflow,
          defaultCycleTimePolicy: project.defaultCycleTimePolicy,
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

  const notFoundContent = isLoadingBoards ? (
    <Empty
      className="ant-empty-normal"
      image={<Spin style={{ margin: 0 }} size="large" />}
      description="Loading"
    />
  ) : boardsQuery.trim().length > 0 ? (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No data sources found"
    />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Type to search" />
  );

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

      <h2>Default Completed Work Filter</h2>

      <IssueAttributesFilterForm
        filter={updatedDefaultCompletedFilter}
        setFilter={setUpdatedDefaultCompletedFilter}
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

      <h3>Project boards</h3>

      <Form.Item label="Add board">
        <Select
          showSearch
          onSearch={setBoardsQuery}
          // onChange={onSelectDataSource}
          // filterOption={filterOption}
          notFoundContent={notFoundContent}
        >
          {boards?.map((board, index) => (
            <Select.Option value={index} label={board.name} key={board.id}>
              <Space>
                <Tag color="blue">{board.location}</Tag>
                <Tag color="green">{board.type}</Tag>
                {board.name}
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <FullScreenDrawer
        title={workflowToEdit?.title}
        open={workflowToEdit !== undefined}
        onClose={() => setWorkflowToEdit(undefined)}
        height="90%"
      >
        {workflowToEdit ? (
          <>
            {showValidationErrors && (
              <Alert
                type="error"
                style={{ padding: 0, marginBottom: "8px" }}
                description={
                  <ul>
                    {validationErrors?.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                }
              />
            )}

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
