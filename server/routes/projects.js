const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ updatedAt: -1 });

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Create new project
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name required' });
        }

        const projectId = `project-${Date.now()}`;

        const project = new Project({
            projectId,
            name,
            description: description || ''
        });

        await project.save();

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Get conversations for a specific project
router.get('/:id/conversations', async (req, res) => {
    try {
        const conversations = await Conversation.find({
            projectId: req.params.id
        })
            .sort({ updatedAt: -1 })
            .select('conversationId title updatedAt');

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching project conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const result = await Project.deleteOne({
            projectId: req.params.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
