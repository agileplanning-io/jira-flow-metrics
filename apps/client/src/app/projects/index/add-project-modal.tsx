import { Empty, Form, Input, Modal, Select, Space, Spin, Tag } from "antd";
import { DataSource, useCreateProject, useDataSources } from "@data/projects";
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

  const [dataSourceQuery, setDataSourceQuery] = useState<string>("");

  const dataSources = useDataSources(domainId, dataSourceQuery);

  // Cache the previous search results in order to continue showing them while performing a new
  // search.
  const cachedDataSources = useRef<DataSource[]>();

  useEffect(() => {
    if (dataSources.isSuccess) {
      cachedDataSources.current = dataSources.data;
    }
  }, [dataSources]);

  const dataSourceOptions = dataSources.data ?? cachedDataSources.current ?? [];

  const [dataSource, setDataSource] = useState<DataSource>();

  const createProject = useCreateProject();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      createProject.mutate(
        {
          domainId,
          project: { query: dataSource?.query, domainId, ...values },
        },
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

  const onSelectDataSource = (value: string) => {
    if (!dataSources.data) {
      return;
    }

    const dataSource = dataSources.data[parseInt(value, 10)];
    setDataSource(dataSource);

    form.setFieldValue("name", dataSource.name);
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
          name="data-source"
          label="Data source"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            onSearch={setDataSourceQuery}
            onChange={onSelectDataSource}
            filterOption={false}
            notFoundContent={
              <NotFoundContent
                query={dataSourceQuery}
                isLoading={dataSources.isLoading}
                hasOptions={dataSourceOptions.length > 0}
              />
            }
            loading={dataSources.isLoading}
          >
            {(dataSources.data ?? cachedDataSources.current)?.map(
              (dataSource, index) => (
                <Select.Option
                  value={index}
                  label={dataSource.name}
                  key={JSON.stringify(dataSource)}
                >
                  <Space>
                    {dataSource.type === "project" ? (
                      <Tag color="blue">project</Tag>
                    ) : (
                      <Tag color="orange">filter</Tag>
                    )}
                    {dataSource.name}
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
      description="No data sources found"
    />
  );
};
