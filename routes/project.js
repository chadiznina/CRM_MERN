const express = require('express');
const router = express.Router();

const { createProject, getProjects, getProject, updateProject } = require('../controllers/project');
const authMiddleware = require('../middleware/auth');

router.route("/create").post(authMiddleware, createProject);
router.route("/").get(authMiddleware, getProjects);
router.route("/:id").get(authMiddleware, getProject);
router.route("/:id").put(authMiddleware, updateProject);

module.exports = router;
