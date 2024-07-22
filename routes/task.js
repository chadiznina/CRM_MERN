const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const { createTask, getTask, getTasks, updateTask, deleteTask } = require('../controllers/task');

router.route("/create").post(authMiddleware, createTask);
router.route("/").get(authMiddleware, getTasks);
router.route("/task/:id").get(authMiddleware, getTask);
router.route("/task/:id").put(authMiddleware, updateTask);
router.route("/task/:id").delete(authMiddleware, deleteTask);

module.exports = router;