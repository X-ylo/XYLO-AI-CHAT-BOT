const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    conversations: [{
        type: String  // Store conversation IDs
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
ProjectSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Project', ProjectSchema);
