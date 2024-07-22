import React, { useState, useEffect } from 'react';
import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-react';
import { Modal, Form, Select, Button } from 'antd';
import axios from 'axios';
import PropTypes from 'prop-types';

const { Option } = Select;

function Calendar({ projectId }) {
  const [events, setEvents] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const tasks = response.data.tasks;
        const events = tasks.map(task => ({
          id: task._id,
          text: task.title,
          start: new DayPilot.Date(task.startDate),
          end: new DayPilot.Date(task.endDate),
          barColor: task.color || "#6aa84f"
        }));
        setTasks(tasks);
        setEvents(events);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const onTimeRangeSelected = (args) => {
    setSelectedRange(args);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const values = await form.validateFields();
      const selectedTask = tasks.find(task => task._id === values.taskId);
      const updatedTask = {
        ...selectedTask,
        startDate: selectedRange.start.toString(),
        endDate: selectedRange.end.toString(),
      };

      await axios.put(`http://localhost:3000/api/v1/projects/${projectId}/tasks/task/${selectedTask._id}`, updatedTask, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const newEvent = {
        start: new DayPilot.Date(selectedRange.start),
        end: new DayPilot.Date(selectedRange.end),
        id: selectedTask._id,
        text: selectedTask.title,
        barColor: selectedTask.color || "#6aa84f",
      };

      setEvents(events.map(event => event.id === selectedTask._id ? newEvent : event));
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <DayPilotCalendar
        startDate={DayPilot.Date.today().firstDayOfWeek()}
        viewType="Week"
        onTimeRangeSelected={onTimeRangeSelected}
        events={events}
        controlRef={setCalendar}
      />
      <Modal
        visible={modalVisible}
        title="Log Task Time"
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleModalOk}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskId"
            label="Task"
            rules={[{ required: true, message: 'Please select a task!' }]}
          >
            <Select>
              {tasks.map(task => (
                <Option key={task._id} value={task._id}>{task.title}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

Calendar.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Calendar;
