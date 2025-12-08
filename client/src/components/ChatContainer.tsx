import React, { useRef, useEffect } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import './ChatContainer.css';

interface ChatContainerProps {
    messages: Message[];
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="messages-wrapper">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <h2>How can I help you today?</h2>
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatContainer;
