// API Service for XyloAI Chatbot
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Conversations API
export const conversationsAPI = {
    // Get all conversations
    getAll: async () => {
        try {
            const response = await fetch(`${API_URL}/api/conversations`);
            if (!response.ok) throw new Error('Failed to fetch conversations');
            return await response.json();
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    },

    // Get specific conversation
    getById: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/${id}`);
            if (!response.ok) throw new Error('Conversation not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return null;
        }
    },

    // Search conversations
    search: async (query: string) => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Error searching conversations:', error);
            return [];
        }
    },

    // Delete conversation
    delete: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete conversation');
            return await response.json();
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }
};

// Projects API
export const projectsAPI = {
    // Get all projects
    getAll: async () => {
        try {
            const response = await fetch(`${API_URL}/api/projects`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            return await response.json();
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
    },

    // Create new project
    create: async (name: string, description?: string) => {
        try {
            const response = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });
            if (!response.ok) throw new Error('Failed to create project');
            return await response.json();
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    // Get project conversations
    getConversations: async (projectId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/projects/${projectId}/conversations`);
            if (!response.ok) throw new Error('Failed to fetch project conversations');
            return await response.json();
        } catch (error) {
            console.error('Error fetching project conversations:', error);
            return [];
        }
    },

    // Delete project
    delete: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/projects/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete project');
            return await response.json();
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }
};
