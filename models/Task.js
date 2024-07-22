const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide title'],
        minlength: 3,
        maxlength: 50
    },

    description: {
        type: String,
        minlength: 3,
        maxlength: 200
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
});

module.exports = mongoose.model('Task', TaskSchema);
