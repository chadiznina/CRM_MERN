import React, { useEffect, useState } from 'react';
import { Layout, Menu, message, Table, Button, Modal, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { projects as mockedProjects } from '../../mockData';
import axios from 'axios';
import "../styles/Dashboard.css";

const { Header, Content, Footer } = Layout;

const Dashboard = () => {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [data, setData] = useState({});
  const [projects, setProjects] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLuckyNumber = async () => {
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await axios.get("http://localhost:3000/api/v1/dashboard", axiosConfig);
      setData({ msg: response.data.msg, luckyNumber: response.data.secret });
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (token === "") {
      navigate("/login");
      message.warning("Please login first to access the dashboard");
    } else {
      fetchLuckyNumber();
      setProjects(mockedProjects); // Set mocked data as projects
    }
  }, [token]);

  const columns = [
    { title: 'Project Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = (values) => {
    setLoading(true);
    // Simulate project creation with mocked data
    setTimeout(() => {
      setProjects([...projects, { _id: Date.now().toString(), ...values }]);
      message.success('Project created successfully');
      setVisible(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout className='layout'>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">Dashboard</Menu.Item>
          <Menu.Item key="2">
            <Link to="/logout">Logout</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <h1>Dashboard</h1>
          <p>Hi {data.msg}! {data.luckyNumber}</p>
          <Table columns={columns} dataSource={projects} rowKey="_id" />
          <Button className="add-button" type="primary" shape="circle" onClick={showModal}>
            +
          </Button>
          <Modal
            visible={visible}
            title="Create a new project"
            onCancel={handleCancel}
            footer={null}
          >
            <Form layout="vertical" onFinish={handleCreate}>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[{ required: true, message: 'Please input the project name!' }]}
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
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2024 Created by Ant UED</Footer>
    </Layout>
  );
};

export default Dashboard;