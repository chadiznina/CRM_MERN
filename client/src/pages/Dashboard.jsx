import React, { useEffect, useState } from 'react';
import { Layout, Menu, message, Table, Button, Modal, Form, Input, Space, Popconfirm } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import "../styles/Dashboard.css";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [projects, setProjects] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get("http://localhost:3000/api/v1/projects", axiosConfig);
      setProjects(response.data.projects);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token === "") {
      navigate("/login");
      toast.warn("Please login first to access the dashboard");
    } else {
      fetchProjects();
    }
  }, [token]);

  const columns = [
    { title: 'Project Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Estimated Time', dataIndex: 'estimatedTime', key: 'estimatedTime' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/project/${record._id}`)}>View</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEditProject(record)}>Edit</Button>
          <Popconfirm title="Are you sure to delete this project?" onConfirm={() => handleDeleteProject(record._id)}>
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setEditVisible(false);
    setSelectedProject(null);
  };

  const handleCreate = async (values) => {
    setLoading(true);
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      await axios.post("http://localhost:3000/api/v1/projects/create", values, axiosConfig);
      toast.success('Project created successfully');
      fetchProjects(); // Refresh the project list
      setVisible(false);
    } catch (error) {
      toast.error(error.response.data.msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    setLoading(true);
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      await axios.put(`http://localhost:3000/api/v1/projects/${selectedProject._id}`, values, axiosConfig);
      toast.success('Project updated successfully');
      fetchProjects(); // Refresh the project list
      setEditVisible(false);
    } catch (error) {
      toast.error(error.response.data.msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      await axios.delete(`http://localhost:3000/api/v1/projects/${projectId}`, axiosConfig);
      toast.success('Project deleted successfully');
      fetchProjects(); // Refresh the project list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditVisible(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setToken("");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <Layout className='layout'>
      <Header className="dashboard-header">
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ flex: 1 }}>
          <Menu.Item key="1">Dashboard</Menu.Item>
        </Menu>
        <Button className="logout-button" onClick={handleLogout}>Logout</Button>
      </Header>
      <Layout>
        <Sider width={200} className="dashboard-sider">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1">Dashboard</Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px', minHeight: 'calc(100vh - 64px)' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: '100%',
            }}
          >
            <div className="content-header">
              <h1>Dashboard</h1>
              <Button className="add-button" type="primary" onClick={showModal}>
                + Add Project
              </Button>
            </div>
            <Table columns={columns} dataSource={projects} rowKey="_id" />
            <Modal
              visible={visible}
              title="Create a new project"
              onCancel={handleCancel}
              footer={null}
            >
              <Form layout="vertical" onFinish={handleCreate}>
                <Form.Item
                  name="title"
                  label="Project Title"
                  rules={[{ required: true, message: 'Please input the project title!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please input the project description!' }]}
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  name="estimatedTime"
                  label="Estimated Time"
                  rules={[{ required: true, message: 'Please input the estimated time!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Create
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              visible={editVisible}
              title="Edit project"
              onCancel={handleCancel}
              footer={null}
            >
              {selectedProject && (
                <Form layout="vertical" onFinish={handleEdit} initialValues={selectedProject}>
                  <Form.Item
                    name="title"
                    label="Project Title"
                    rules={[{ required: true, message: 'Please input the project title!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please input the project description!' }]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item
                    name="estimatedTime"
                    label="Estimated Time"
                    rules={[{ required: true, message: 'Please input the estimated time!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Update
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
