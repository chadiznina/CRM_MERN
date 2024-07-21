const Task = require('../models/Task');

const createTask = async (req, res) => {
    const { title, description, project, estimatedTime, assignee } = req.body;
    if (!title || !description || !project || !estimatedTime || !assignee) {
        return res.status(400).json({
            msg: "Please provide title, description and project"
        });
    }

    const task = new Task({
        title,
        description,
        project,
        estimatedTime,
        assignee,
        createdBy: req.user.id
    });
    await task.save();
    res.status(201).json({ task, msg: "Task created" });
}