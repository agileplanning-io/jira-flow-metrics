import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Space, Table } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AddDatasetModal } from "./add-dataset-modal";
import { Dataset, useSyncDataset } from "@data/datasets";
import {
  forecastPath,
  issuesIndexPath,
  scatterplotPath,
  throughputPath,
  timeSpentPath,
  wipPath,
} from "../../navigation/paths";
import { RemoveDatasetModal } from "./remove-dataset-modal";
import { formatDate } from "@jbrunton/flow-lib";
import { useNavigationContext } from "../../navigation/context";
import { EditDatasetForm } from "./edit-dataset-form";

export const DatasetsIndexPage = () => {
  const { domainId } = useNavigationContext();
  const [showAddDatasetForm, setShowAddDatasetForm] = useState(false);
  const [datasetToEdit, setDatasetToEdit] = useState<Dataset>();
  const [datasetToRemove, setDatasetToRemove] = useState<Dataset>();

  const [loadingDatasetId, setLoadingDatasetId] = useState<string>();

  const { datasets } = useNavigationContext();

  const dataSource = datasets?.map((dataset) => ({
    key: dataset.id,
    ...dataset,
  }));

  const syncDataset = useSyncDataset();

  const syncSelectedDataset = (dataset: Dataset) => {
    syncDataset.mutate(dataset.id);
    setLoadingDatasetId(dataset.id);
  };

  useEffect(() => {
    if (!syncDataset.isLoading) {
      setLoadingDatasetId(undefined);
    }
  }, [syncDataset.isLoading, setLoadingDatasetId]);

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setShowAddDatasetForm(true)}
        style={{ marginBottom: "16px" }}
      >
        Add Data Set
      </Button>

      <Table
        dataSource={dataSource}
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          {
            title: "Issues",
            key: "issues",
            render: (_, dataset) => (
              <Link to={issuesIndexPath({ datasetId: dataset.id })}>
                Issues{" "}
                {dataset.lastSync ? (
                  <span>({dataset.lastSync.issueCount})</span>
                ) : null}
              </Link>
            ),
          },
          {
            title: "Reports",
            key: "reports",
            render: (_, dataset) => (
              <Space size="large">
                <Link to={scatterplotPath({ datasetId: dataset.id })}>
                  Scatterplot
                </Link>
                <Link to={throughputPath({ datasetId: dataset.id })}>
                  Throughput
                </Link>
                <Link to={wipPath({ datasetId: dataset.id })}>WIP</Link>
                <Link to={forecastPath({ datasetId: dataset.id })}>
                  Forecast
                </Link>
                <Link to={timeSpentPath({ datasetId: dataset.id })}>
                  Time Spent
                </Link>
              </Space>
            ),
          },
          {
            title: "Sync",
            key: "sync",
            render: (_, dataset) => (
              <Space size="large">
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => syncSelectedDataset(dataset)}
                  disabled={loadingDatasetId !== undefined}
                  loading={
                    syncDataset.isLoading && dataset.id === loadingDatasetId
                  }
                >
                  Sync
                </Button>
                {dataset.lastSync ? (
                  <span>Last synced: {formatDate(dataset.lastSync.date)}</span>
                ) : (
                  <span>Never</span>
                )}
              </Space>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, dataset) => (
              <Space>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setDatasetToEdit(dataset)}
                  disabled={
                    loadingDatasetId !== undefined ||
                    dataset?.lastSync === undefined
                  }
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => setDatasetToRemove(dataset)}
                  disabled={loadingDatasetId !== undefined}
                />
              </Space>
            ),
          },
        ]}
      />

      <AddDatasetModal
        isOpen={showAddDatasetForm}
        close={() => setShowAddDatasetForm(false)}
        domainId={domainId}
      />
      <RemoveDatasetModal
        dataset={datasetToRemove}
        isOpen={datasetToRemove !== undefined}
        close={() => setDatasetToRemove(undefined)}
      />
      <Drawer
        size="large"
        placement="bottom"
        title={`Edit ${datasetToEdit?.name}`}
        open={datasetToEdit !== undefined}
        style={{ overflow: "hidden" }}
        height="100%"
        onClose={() => setDatasetToEdit(undefined)}
      >
        {datasetToEdit ? (
          <EditDatasetForm
            dataset={datasetToEdit}
            onClose={() => setDatasetToEdit(undefined)}
          />
        ) : null}
      </Drawer>
    </>
  );
};
