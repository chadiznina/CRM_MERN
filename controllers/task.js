const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res) => {
  const { title, description, projectId, assignee } = req.body;
  if (!title || !description || !projectId || !assignee) {
    return res.status(400).json({
      msg: "You need to provide all the fields",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(400).json({
      msg: "You are not authorized to create task",
    });
  }

  const findProject = await Project.findById(projectId);
  if (!findProject) {
    return res.status(400).json({
      msg: "Project not found",
    });
  }

  const task = new Task({
    title,
    description,
    projectId,
    assignee,
    createdBy: req.user.id,
  });
  await task.save();
  findProject.tasks.push(task);
  await findProject.save();
  res.status(201).json({ task, msg: "Task created" });
};

const getTask = async (req, res) => {
  let task = await Task.findById(req.params.id);
  return res.status(200).json({ task });
};

const updateTask = async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(400).json({
      msg: "Task not found",
    });
  }
  const {startDate, endDate} = req.body;

  if(startDate < endDate) {
    return res.status(400).json({
      msg: "Start date should be less than end date",
    });
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body);
  return res.status(200).json({ task, msg: "Task updated" });
};

const getTasks = async (req, res) => {
  let tasks = await Task.find({});
  tasks = tasks.filter((task) => task.assignee.equals(req.user.id));
  return res.status(200).json({ tasks });
};

const deleteTask = async (req, res) => {
  const project = await Project.findById(req.body.projectId);
  if (!project) {
    return res.status(400).json({
      msg: "Project not found",
    });
  }

  let task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(400).json({
      msg: "Task not found",
    });
  }
  await Task.findByIdAndDelete(req.params.id);
  return res.status(200).json({ msg: "Task deleted" });
};

module.exports = { createTask, getTask ,getTasks,  updateTask, deleteTask };
