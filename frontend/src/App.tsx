import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { FileComparer } from './pages/FileComparer';
import { SearchFolder } from './pages/SearchFolder';

const App: React.FC = () => (
    <Router>
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to="/compare">File Comparer</Link>
                    </li>
                    <li>
                        <Link to="/search">Search Folder</Link>
                    </li>
                </ul>
            </nav>
            <Routes>
                <Route path="/compare" element={<FileComparer />} />
                <Route path="/search" element={<SearchFolder />} />
                <Route path="/" element={<h1>Welcome! Choose a page above.</h1>} />
            </Routes>
        </div>
    </Router>
);

export default App;