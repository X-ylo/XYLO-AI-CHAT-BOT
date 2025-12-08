import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatContainer from './components/ChatContainer';
import ChatInputBar from './components/ChatInputBar';
import { Message } from './components/ChatMessage';
import { conversationsAPI, projectsAPI } from './services/api';
import './App.css';

interface ConversationSummary {
    conversationId: string;
    title: string;
    updatedAt: string;
}

interface Project {
    projectId: string;
    name: string;
}

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [conversationId, setConversationId] = useState<string>('default-conversation');
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    // Fetch conversations and projects on mount
    useEffect(() => {
        loadConversations();
        loadProjects();
    }, []);

    const loadConversations = async () => {
        const data = await conversationsAPI.getAll();
        setConversations(data);
    };

    const loadProjects = async () => {
        const data = await projectsAPI.getAll();
        setProjects(data);
    };

    useEffect(() => {
        // Connect to WebSocket server
        const newSocket = io('http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
            // Join default conversation room
            newSocket.emit('join-conversation', conversationId);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        // Listen for messages from server
        newSocket.on('message-received', (data: { id: number; type: string; content: string; timestamp: string }) => {
            const newMessage: Message = {
                id: data.id.toString(),
                role: data.type === 'user' ? 'user' : 'assistant',
                content: data.content,
                timestamp: new Date(data.timestamp)
            };
            setMessages(prev => [...prev, newMessage]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [conversationId]);

    const handleSendMessage = (content: string) => {
        if (socket && isConnected) {
            // Send message to server
            socket.emit('new-message', {
                conversationId: conversationId,
                message: content,
                userId: socket.id
            });
        }
    };

    const handleNewChat = () => {
        // Create new conversation
        const newConversationId = `conversation-${Date.now()}`;
        setConversationId(newConversationId);
        setMessages([]);

        // Join new conversation room
        if (socket && isConnected) {
            socket.emit('join-conversation', newConversationId);
        }

        // Reload conversations list
        setTimeout(() => loadConversations(), 1000);
    };

    const handleLoadConversation = async (id: string) => {
        const conversation = await conversationsAPI.getById(id);
        if (conversation) {
            setConversationId(conversation.conversationId);
            const loadedMessages: Message[] = conversation.messages.map((msg: any, index: number) => ({
                id: `${conversation.conversationId}-${index}`,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.timestamp)
            }));
            setMessages(loadedMessages);

            if (socket && isConnected) {
                socket.emit('join-conversation', id);
            }
        }
    };

    const handleCreateProject = async (name: string) => {
        try {
            await projectsAPI.create(name);
            await loadProjects();
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            // Reset to all conversations
            await loadConversations();
        } else {
            // Search conversations
            const results = await conversationsAPI.search(query);
            setConversations(results);
        }
    };

    return (
        <div className="app">
            <Sidebar
                onNewChat={handleNewChat}
                conversations={conversations}
                projects={projects}
                onLoadConversation={handleLoadConversation}
                onCreateProject={handleCreateProject}
                onSearch={handleSearch}
            />
            <div className="main-content">
                <TopBar title="XyloAI" />
                <ChatContainer messages={messages} />
                <ChatInputBar onSendMessage={handleSendMessage} disabled={!isConnected} />
            </div>
        </div>
    );
};

export default App;
