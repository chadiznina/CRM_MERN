const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res) => {
  const { title, description, projectId, estimatedTime, assignee } = req.body;
  if (!title || !description || !projectId || !estimatedTime || !assignee) {
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
    estimatedTime,
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
    // if user is not admin, should update only estimatedTime and assignee
  if (req.user.role !== "admin") {
        if(req.body.description || req.body.title) { {
            return res.status(400).json({
                msg: "You are not authorized to update task",
            });
        }}
    }

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
  await Task.findByIdAndUpdate(req.params.id, req.body);
  return res.status(200).json({ msg: "Task updated" });
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

module.exports = { createTask, getTask, updateTask, deleteTask };
