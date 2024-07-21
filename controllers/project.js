const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const createProject = async (req, res) => {
  const { title, estimatedTime, description } = req.body;
  if (!title || !estimatedTime || !description) {
    return res.status(400).json({
      msg: "Fields cannot be empty",
    });
  }

  const findProject = await Project.findOne({
    title,
  });

  if (findProject) {
    return res.status(400).json({
      msg: "Project already exists",
    });
  } else if (req.user.role !== "admin") {
    return res.status(400).json({
      msg: "You are not authorized to create project",
    });
  } else {
    const project = new Project({
      title,
      estimatedTime,
      description,
      createdBy: req.user.id,
    });
    await project.save();
    res.status(201).json({ project, msg: "Project created" });
  }
};

const getProjects = async (req, res) => {
  let projects;
  if (req.user.role === "admin") {
    projects = await Project.find({});
  } else {
    const tasks = await Task.find({ assignee: req.user.id });
    const projectIds = tasks.map((task) => task.projectId);
    projects = await Project.find({ _id: { $in: projectIds } });
  }

  return res.status(200).json({ projects });
};

const getProject = async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(400).json({
      msg: "Project not found",
    });
  }

  let tasks = await Task.find({ projectId: req.params.id });
  if (req.user.role !== "admin") {
    tasks = tasks.filter((task) => task.assignee.equals(req.user.id));
  }

  for (let i = 0; i < tasks.length; i++) {
    tasks[i] = tasks[i].toObject();
    tasks[i].assignee = await User.findById(tasks[i].assignee);

    if (tasks[i].assignee) {
      tasks[i].assignee = tasks[i].assignee.toObject();
    }
  }

  project = project.toObject();
  project.tasks = tasks;
  return res.status(200).json({ project });
};

const updateProject = async (req, res) => {
  let project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(400).json({
      msg: "Project not found",
    });
  }
  if (req.user.role !== "admin") {
    return res.status(400).json({
      msg: "You are not authorized to update project",
    });
  } else {
    await Project.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json({ msg: "Project updated" });
  }
};

const deleteProject = async (req, res) => {
  let project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(400).json({
      msg: "Project not found",
    });
  }
  if (req.user.role !== "admin") {
    return res.status(400).json({
      msg: "You are not authorized to delete project",
    });
  } else {
    await Project.findByIdAndDelete(req.params.id);
    const tasks = await Task.find({ projectId: req.params.id });
    for (let i = 0; i < tasks.length; i++) {
      await Task.findByIdAndDelete(tasks[i]._id);
    }
    return res.status(200).json({ msg: "Project deleted" });
  }
};
module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
