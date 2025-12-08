const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Database
const connectDB = require('./config/database');
const Conversation = require('./models/Conversation');
const Project = require('./models/Project');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5000"],
  credentials: true
}));
app.use(express.json());

// Import routes
const chatRoutes = require('./routes/chat');
const conversationsRoutes = require('./routes/conversations');
const projectsRoutes = require('./routes/projects');

app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/projects', projectsRoutes);

// Store active conversations
const conversations = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user-typing', {
      userId: socket.id,
      isTyping: data.isTyping
    });
  });

  // Handle new messages
  socket.on('new-message', async (data) => {
    try {
      const { conversationId, message, userId } = data;

      // Store user message
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
      }

      const conversation = conversations.get(conversationId);
      const userMessageId = Date.now();
      const userMessage = {
        id: userMessageId,
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      conversation.push(userMessage);

      // Emit user message to all clients in the room
      io.to(conversationId).emit('message-received', userMessage);

      // Generate AI response
      const aiResponse = await generateAIResponse(message, conversation);

      // Store AI response
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      conversation.push(aiMessage);

      // Emit AI response to all clients in the room
      io.to(conversationId).emit('message-received', aiMessage);

      // Save to MongoDB if connected
      try {
        let dbConversation = await Conversation.findOne({ conversationId });

        if (!dbConversation) {
          dbConversation = new Conversation({
            conversationId,
            messages: []
          });
        }

        // Add both messages
        dbConversation.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date(userMessage.timestamp)
        });

        dbConversation.messages.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(aiMessage.timestamp)
        });

        await dbConversation.save();
        console.log(`✅ Saved conversation ${conversationId} to database`);
      } catch (dbError) {
        console.error('❌ MongoDB save error:', dbError.message);
      }

    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// AI Response Generation - Using Groq (Free AI)
async function generateAIResponse(message, conversationHistory) {
  try {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.log('No Groq API key found, using mock responses');
      return getMockResponse(message, conversationHistory);
    }

    const Groq = require('groq-sdk');
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Prepare conversation context
    const messages = [
      {
        role: "system",
        content: "You are XyloAI, an advanced AI assistant with a helpful, knowledgeable, and friendly personality. Provide clear, accurate, and engaging responses. Keep responses concise but informative. Be conversational and helpful."
      }
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: "user",
      content: message
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant", // Current fast and free model
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('Using Groq AI response');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    console.log('Falling back to mock responses');
    return getMockResponse(message, conversationHistory);
  }
}

// Mock AI responses for testing
function getMockResponse(message, conversationHistory = []) {
  const lowerMessage = message.toLowerCase();

  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm XyloAI, your AI assistant. How can I help you today?";
  }

  // Help requests
  if (lowerMessage.includes('help')) {
    return "I'm here to help! What specific assistance do you need? I can help with questions, provide information, or just chat!";
  }

  // Weather queries
  if (lowerMessage.includes('weather')) {
    return "I'd love to help with weather information! For current weather data, I'd recommend checking a weather app or website. What's your location?";
  }

  // Time queries
  if (lowerMessage.includes('time') || lowerMessage.includes('what time')) {
    return `The current time is ${new Date().toLocaleTimeString()}. How else can I assist you today?`;
  }

  // Date queries
  if (lowerMessage.includes('date') || lowerMessage.includes('what date')) {
    return `Today is ${new Date().toLocaleDateString()}. Is there anything else you'd like to know?`;
  }

  // Programming/tech questions
  if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('javascript') || lowerMessage.includes('python')) {
    return "I'd be happy to help with programming questions! What specific language or concept are you working with?";
  }

  // Math questions
  if (lowerMessage.includes('math') || lowerMessage.includes('calculate') || lowerMessage.includes('+') || lowerMessage.includes('-') || lowerMessage.includes('*') || lowerMessage.includes('/')) {
    return "I can help with math problems! What calculation do you need assistance with?";
  }

  // Food/cooking
  if (lowerMessage.includes('food') || lowerMessage.includes('cook') || lowerMessage.includes('recipe')) {
    return "I love talking about food! What kind of dish are you interested in making or learning about?";
  }

  // Travel
  if (lowerMessage.includes('travel') || lowerMessage.includes('vacation') || lowerMessage.includes('trip')) {
    return "Travel is exciting! Where are you planning to go, or what travel advice are you looking for?";
  }

  // General responses based on conversation context
  const responses = [
    "That's an interesting question! I'd be happy to help you with that.",
    "I understand you're looking for assistance. Let me provide some helpful information.",
    "Great question! Here's what I can tell you about that topic.",
    "I'm here to help! Could you provide more details about what you need?",
    "That's a fascinating topic! I'd love to discuss this further with you.",
    "I appreciate your message! How can I assist you today?",
    "Thanks for reaching out! I'm ready to help with any questions you have.",
    "That's a great point! Let me think about how I can help you with that.",
    "I'm glad you asked! This is something I can definitely help you explore.",
    "Interesting! I'd love to learn more about what you're working on."
  ];

  // If this is a follow-up message, be more conversational
  if (conversationHistory.length > 0) {
    const followUpResponses = [
      "I see! That makes sense. What else would you like to know?",
      "Ah, I understand now. How can I help you further?",
      "Got it! Is there anything specific about that you'd like me to explain?",
      "That's helpful context! What's your next question?",
      "I'm following along! What would you like to explore next?",
      "Perfect! Now I have a better understanding. What else can I help with?",
      "That clarifies things! How else can I assist you?",
      "I see what you mean! What's the next step you'd like to take?"
    ];
    return followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
  }

  // Default response
  return responses[Math.floor(Math.random() * responses.length)];
}

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
  });
}).catch(error => {
  console.error('Failed to connect to MongoDB, but server will still run:', error);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without MongoDB)`);
  });
});
