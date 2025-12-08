import React from 'react';
import './ChatMessage.css';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`chat-message ${message.role}`}>
            <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-timestamp">{formatTime(message.timestamp)}</div>
            </div>
        </div>
    );
};

export default ChatMessage;
