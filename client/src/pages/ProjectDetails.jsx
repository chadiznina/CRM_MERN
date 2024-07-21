import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Modal, Form, Input, Select, Space, Popconfirm, Table } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import "../styles/Dashboard.css";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const ProjectDetails = () => {
  const { id } = useParams();
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [user, setUser] = useState(null);  // Define user state
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editTaskVisible, setEditTaskVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      try {
        const response = await axios.get("http://localhost:3000/api/v1/getCurrentUser", axiosConfig);
        setUser(response.data.user);
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchProjectDetails = async () => {
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get(`http://localhost:3000/api/v1/projects/${id}`, axiosConfig);
      setProject(response.data.project);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUsers = async () => {
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get("http://localhost:3000/api/v1/users", axiosConfig);
      setUsers(response.data.users);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token === "") {
      navigate("/login");
      toast.warn("Please login first to access the project details");
    } else {
      fetchProjectDetails();
      fetchUsers();
    }
  }, [token, id]);

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setEditTaskVisible(false);
    setSelectedTask(null);
  };

  const handleCreateTask = async (values) => {
    setLoading(true);
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const taskData = {
      ...values,
      projectId: id
    };

    try {
      await axios.post(`http://localhost:3000/api/v1/projects/${id}/tasks/create`, taskData, axiosConfig);
      toast.success('Task created successfully');
      fetchProjectDetails(); // Refresh the project details to get the updated task list
      setVisible(false);
    } catch (error) {
      toast.error(error.response.data.msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (values) => {
    setLoading(true);
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const taskData = {
      ...values,
      projectId: id
    };

    try {
      await axios.put(`http://localhost:3000/api/v1/projects/${id}/tasks/task/${selectedTask._id}`, taskData, axiosConfig);
      toast.success('Task updated successfully');
      fetchProjectDetails(); // Refresh the project details to get the updated task list
      setEditTaskVisible(false);
    } catch (error) {
      toast.error(error.response.data.msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        title: selectedTask?.title, // assuming you want to send the title and projectId in the delete request body
        projectId: id
      }
    };

    try {
      await axios.delete(`http://localhost:3000/api/v1/projects/${id}/tasks/task/${taskId}`, axiosConfig);
      toast.success('Task deleted successfully');
      fetchProjectDetails(); // Refresh the project details to get the updated task list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const taskColumns = [
    { title: 'Task Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Estimated Time', dataIndex: 'estimatedTime', key: 'estimatedTime' },
    {
      title: 'Assigned To',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee) => assignee ? assignee.name : "Unassigned"
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          {user?.role === 'admin' ? (
            <>
              <Button icon={<EditOutlined />} onClick={() => {
                setSelectedTask(record);
                setEditTaskVisible(true);
              }}>Edit</Button>
              <Popconfirm title="Are you sure to delete this task?" onConfirm={() => handleDeleteTask(record._id)}>
                <Button icon={<DeleteOutlined />} danger>Delete</Button>
              </Popconfirm>
            </>
          ) : (
            <Button icon={<EditOutlined />} onClick={() => {
              setSelectedTask(record);
              setEditTaskVisible(true);
            }}>Edit</Button>
          )}
        </Space>
      )
    }
  ];

  const renderEditTaskForm = () => {
    const commonFormItems = (
      <>
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please input the task title!' }]}
        >
          <Input disabled={user?.role !== 'admin'} />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the task description!' }]}
        >
          <Input.TextArea disabled={user?.role !== 'admin'} />
        </Form.Item>
      </>
    );

    const adminSpecificFormItems = (
      <Form.Item
        name="assignee"
        label="Assignee"
        rules={[{ required: true, message: 'Please select an assignee!' }]}
      >
        <Select disabled={user?.role !== 'admin'}>
          {users.map(user => (
            <Option key={user._id} value={user._id}>{user.name}</Option>
          ))}
        </Select>
      </Form.Item>
    );

    const nonAdminSpecificFormItems = (
      <Form.Item
        name="estimatedTime"
        label="Estimated Time"
        rules={[{ required: true, message: 'Please input the estimated time!' }]}
      >
        <Input />
      </Form.Item>
    );

    return (
      <Form layout="vertical" onFinish={handleEditTask} initialValues={selectedTask}>
        {commonFormItems}
        {user?.role === 'admin' ? adminSpecificFormItems : nonAdminSpecificFormItems}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <Layout className='layout'>
      <Header className="dashboard-header">
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ flex: 1 }}>
          <Menu.Item key="1" onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
        </Menu>
        <Button className="logout-button" onClick={() => {
          localStorage.removeItem("auth");
          setToken("");
          navigate("/login");
          toast.success("Logged out successfully");
        }}>Logout</Button>
      </Header>
      <Layout>
        <Sider width={200} className="dashboard-sider">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
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
            {project && (
              <div>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
                  Back to Projects
                </Button>
                <h1>Project Details</h1>
                <h2>Title</h2>
                <p>{project.title}</p>
                <h2>Description</h2>
                <p>{project.description}</p>
                <h2>Estimated Time</h2>
                <p>{project.estimatedTime}</p>
                {user?.role === 'admin' && (
                  <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
                    Add Task
                  </Button>
                )}
                <Table columns={taskColumns} dataSource={project.tasks} rowKey="_id" style={{ marginTop: 20 }} />
              </div>
            )}
            <Modal
              visible={visible}
              title="Create a new task"
              onCancel={handleCancel}
              footer={null}
            >
              <Form layout="vertical" onFinish={handleCreateTask}>
                <Form.Item
                  name="title"
                  label="Task Title"
                  rules={[{ required: true, message: 'Please input the task title!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please input the task description!' }]}
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
                <Form.Item
                  name="assignee"
                  label="Assignee"
                  rules={[{ required: true, message: 'Please select an assignee!' }]}
                >
                  <Select>
                    {users.map(user => (
                      <Option key={user._id} value={user._id}>{user.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Create
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              visible={editTaskVisible}
              title="Edit Task"
              onCancel={handleCancel}
              footer={null}
            >
              {selectedTask && renderEditTaskForm()}
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ProjectDetails;
