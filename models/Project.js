const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50
    },

    description: {
        type: String,
        required: [true, 'Please provide description'],
        minlength: 3,
        maxlength: 200
    },
    
    estimatedTime: {
        type: Number,
        required: [true, 'Please provide estimated time']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ]
});

module.exports = mongoose.model("Project", ProjectSchema);