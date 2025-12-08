const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ConversationSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Conversation'
    },
    messages: [MessageSchema],
    projectId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate title from first message
ConversationSchema.pre('save', function () {
    if (this.messages.length > 0 && this.title === 'New Conversation') {
        const firstMessage = this.messages[0].content;
        this.title = firstMessage.length > 50
            ? firstMessage.substring(0, 50) + '...'
            : firstMessage;
    }
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Conversation', ConversationSchema);
