import React from 'react';
import './TopBar.css';

interface TopBarProps {
    title?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title = 'XyloAI' }) => {
    return (
        <div className="topbar">
            <div className="topbar-content">
                {/* Title moved to Sidebar */}
            </div>
        </div>
    );
};

export default TopBar;
