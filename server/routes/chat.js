const express = require('express');
const router = express.Router();

// Get conversation history
router.get('/conversation/:id', (req, res) => {
  const { id } = req.params;
  // In a real app, you'd fetch from a database
  res.json({ messages: [] });
});

// Create new conversation
router.post('/conversation', (req, res) => {
  const conversationId = Date.now().toString();
  res.json({ conversationId });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
