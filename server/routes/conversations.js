const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Get all conversations (sorted by most recent)
router.get('/', async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ updatedAt: -1 })
            .limit(50)
            .select('conversationId title updatedAt createdAt projectId');

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Search conversations - MUST come before /:id route
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        // Search with case-insensitive regex that matches from the start or anywhere
        const searchRegex = new RegExp(q, 'i');
        const prefixRegex = new RegExp(`^${q}`, 'i'); // Matches from the start

        const allMatches = await Conversation.find({
            $or: [
                { title: searchRegex },
                { 'messages.content': searchRegex }
            ]
        })
            .sort({ updatedAt: -1 })
            .select('conversationId title updatedAt');

        // Sort results: prefix matches first, then other matches
        const results = allMatches.sort((a, b) => {
            const aStartsWith = prefixRegex.test(a.title);
            const bStartsWith = prefixRegex.test(b.title);

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;

            // If both or neither start with query, sort by update time
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        res.json(results.slice(0, 20)); // Limit to 20 results
    } catch (error) {
        console.error('Error searching conversations:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get specific conversation by ID
router.get('/:id', async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            conversationId: req.params.id
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// Delete conversation
router.delete('/:id', async (req, res) => {
    try {
        const result = await Conversation.deleteOne({
            conversationId: req.params.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

module.exports = router;
