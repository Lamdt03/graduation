// Menu.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Menu: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="menu-container">
            <Link to="/text" className={`menu-item ${currentPath === '/text' ? 'active' : ''}`}>Text</Link>
            <Link to="/excel" className={`menu-item ${currentPath === '/excel' ? 'active' : ''}`}>Excel</Link>
            <Link to="/folder" className={`menu-item ${currentPath === '/folder' ? 'active' : ''}`}>Folder</Link>
            <Link to="/download" className={`menu-item ${currentPath === '/download' ? 'active' : ''}`}>Download desktop app</Link>
        </div>
    );
};

export default Menu;
