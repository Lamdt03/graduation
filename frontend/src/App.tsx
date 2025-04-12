import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import TextPage from './pages/TextPage';
import ExcelPage from './pages/ExcelPage';
import FolderPage from './pages/FolderPage';
import DownloadPage from './pages/DownloadPage';

const App: React.FC = () => {
    return (
        <Router> {}
            <div className="layout">
                <Menu />
                <div className="content">
                    <Routes>
                        <Route path="/text" element={<TextPage />} />
                        <Route path="/excel" element={<ExcelPage />} />
                        <Route path="/folder" element={<FolderPage />} />
                        <Route path="/download" element={<DownloadPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
