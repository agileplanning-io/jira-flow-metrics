import { Empty, Form, Input, Modal, Select, Space, Spin, Tag } from "antd";
import { DataSet, useCreateProject, useDataSets } from "@data/projects";
import { FC, useEffect, useRef, useState } from "react";

export type AddProjectModalParams = {
  isOpen: boolean;
  close: () => void;
  domainId?: string;
};

export const AddProjectModal: React.FC<AddProjectModalParams> = ({
  isOpen,
  close,
  domainId,
}) => {
  const [form] = Form.useForm();

  const [dataSetQuery, setDataSetQuery] = useState<string>("");

  const dataSets = useDataSets(domainId, dataSetQuery);

  // Cache the previous search results in order to continue showing them while performing a new
  // search.
  const cachedDataSets = useRef<DataSet[]>();

  useEffect(() => {
    if (dataSets.isSuccess) {
      cachedDataSets.current = dataSets.data;
    }
  }, [dataSets]);

  const dataSetOptions = dataSets.data ?? cachedDataSets.current ?? [];

  const [dataSet, setDataSet] = useState<DataSet>();

  const createProject = useCreateProject();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      createProject.mutate(
        { domainId, project: { jql: dataSet?.jql, domainId, ...values } },
        {
          onSuccess: () => {
            form.resetFields();
          },
        },
      );
    } catch (e) {
      // validation failed
    }
  };

  const onSelectDataSet = (value: string) => {
    if (!dataSets.data) {
      return;
    }

    const dataSet = dataSets.data[parseInt(value, 10)];
    setDataSet(dataSet);

    form.setFieldValue("name", dataSet.name);
  };

  useEffect(() => {
    if (createProject.isSuccess) {
      close();
    }
  }, [createProject.isSuccess, close]);

  return (
    <Modal
      title="Add Project"
      open={isOpen}
      onOk={onSubmit}
      onCancel={close}
      confirmLoading={createProject.isLoading}
    >
      <Form form={form}>
        <Form.Item
          name="data-set"
          label="Data sets"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            onSearch={setDataSetQuery}
            onChange={onSelectDataSet}
            filterOption={false}
            notFoundContent={
              <NotFoundContent
                query={dataSetQuery}
                isLoading={dataSets.isLoading}
                hasOptions={dataSetOptions.length > 0}
              />
            }
            loading={dataSets.isLoading}
          >
            {(dataSets.data ?? cachedDataSets.current)?.map(
              (dataSet, index) => (
                <Select.Option
                  value={index}
                  label={dataSet.name}
                  key={JSON.stringify(dataSet)}
                >
                  <Space>
                    {dataSet.type === "project" ? (
                      <Tag color="blue">project</Tag>
                    ) : (
                      <Tag color="orange">filter</Tag>
                    )}
                    {dataSet.name}
                  </Space>
                </Select.Option>
              ),
            )}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

type NotFoundContentProps = {
  query: string;
  isLoading: boolean;
  hasOptions: boolean;
};

const NotFoundContent: FC<NotFoundContentProps> = ({
  query,
  isLoading,
  hasOptions,
}) => {
  if (isLoading) {
    if (hasOptions) {
      return null;
    }

    return (
      <Empty
        className="ant-empty-normal"
        image={<Spin style={{ margin: 0 }} size="large" />}
        description="Loading"
      />
    );
  }

  if (query.trim().length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Type to search"
      />
    );
  }

  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No data sets found"
    />
  );
};
