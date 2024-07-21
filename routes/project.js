const express = require('express');
const router = express.Router();

const { createProject, getProjects, getProject, updateProject, deleteProject } = require('../controllers/project');
const authMiddleware = require('../middleware/auth');
const taskRouter = require('./task');

router.route("/create").post(authMiddleware, createProject);
router.route("/").get(authMiddleware, getProjects);
router.route("/:id").get(authMiddleware, getProject);
router.route("/:id").put(authMiddleware, updateProject);
router.route("/:id").delete(authMiddleware, deleteProject);
router.use("/:projectId/tasks", taskRouter);

module.exports = router;
