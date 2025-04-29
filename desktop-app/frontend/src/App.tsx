import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import TextPage from './pages/TextPage';
import ExcelPage from './pages/ExcelPage';
import TextFolderPage from './pages/TextFolderPage';
import ExcelFolderPage from "./pages/ExcelFolderPage";

const App: React.FC = () => {
    return (
        <Router> {}
            <div className="layout">
                <Menu />
                <div className="content">
                    <Routes>
                        <Route path="/text" element={<TextPage />} />
                        <Route path="/excel" element={<ExcelPage />} />
                        <Route path="/text-folder" element={<TextFolderPage />} />
                        <Route path="/excel-folder" element={<ExcelFolderPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
