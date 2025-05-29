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
            <Link to="/text-folder" className={`menu-item ${currentPath === '/text-folder' ? 'active' : ''}`}>Text Folder</Link>
            <Link to="/excel-folder" className={`menu-item ${currentPath === '/excel-folder' ? 'active' : ''}`}>Excel Folder</Link>
            <Link to="/full-text-search" className={`menu-item ${currentPath === '/full-text-search' ? 'active' : ''}`}>Folder Search</Link>
            <Link to="/file-monitor" className={`menu-item ${currentPath === '/file-monitor' ? 'active' : ''}`}>Monitor folder</Link>
            <Link to="/file-versions-search" className={`menu-item ${currentPath === '/file-versions-search' ? 'active' : ''}`}>File Version Search</Link>
        </div>
    );
};

export default Menu;
