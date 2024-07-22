import React, { useState, useEffect } from 'react';
import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-react';
import { Modal, Form, Select, Input, Button } from 'antd';
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
        const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/tasks`);
        const tasks = response.data.tasks;
        const events = tasks.map(task => ({
          id: task._id,
          text: task.title,
          start: task.timesheet.start,
          end: task.timesheet.end,
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
      const values = await form.validateFields();
      const selectedTask = tasks.find(task => task._id === values.taskId);
      const newEvent = {
        start: selectedRange.start,
        end: selectedRange.end,
        id: DayPilot.guid(),
        text: selectedTask.title,
        barColor: selectedTask.color || "#6aa84f",
      };

      await axios.post(`http://localhost:3000/api/v1/projects/${projectId}/tasks/create`, {
        ...newEvent,
        projectId,
        timesheet: { start: newEvent.start, end: newEvent.end },
        hoursWorked: values.hoursWorked
      });
      
      setEvents([...events, newEvent]);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating task:", error);
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
        title="Log Work Hours"
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
          <Form.Item
            name="hoursWorked"
            label="Hours Worked"
            rules={[{ required: true, message: 'Please input hours worked!' }]}
          >
            <Input type="number" />
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
