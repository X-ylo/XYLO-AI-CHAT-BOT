import React, { useState, KeyboardEvent } from 'react';
import './ChatInputBar.css';

interface ChatInputBarProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, disabled = false }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input-bar">
            <div className="input-container">
                <textarea
                    className="message-input"
                    placeholder="Message XyloAI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled}
                    rows={1}
                />
                <button
                    className="send-button"
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                >
                    <svg
                        className="send-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatInputBar;
