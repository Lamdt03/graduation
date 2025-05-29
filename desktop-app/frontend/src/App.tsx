import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Menu from './components/Menu';
import TextPage from './pages/TextPage';
import ExcelPage from './pages/ExcelPage';
import TextFolderPage from './pages/TextFolderPage';
import ExcelFolderPage from "./pages/ExcelFolderPage";
import FullTextSearchPage from "./pages/FullTextSearchPage";
import FolderMonitorPage from "./pages/FolderMonitorPage";
import FileVersionsSearchPage from "./pages/FileVersionsSearchPage";

const App: React.FC = () => {
    return (
        <Router> {}
            <div className="layout">
                <Menu/>
                <div className="content">
                    <Routes>
                        <Route path="/text" element={<TextPage/>}/>
                        <Route path="/excel" element={<ExcelPage/>}/>
                        <Route path="/text-folder" element={<TextFolderPage/>}/>
                        <Route path="/excel-folder" element={<ExcelFolderPage/>}/>
                        <Route path="/full-text-search" element={<FullTextSearchPage/>}/>
                        <Route path="/file-monitor" element={<FolderMonitorPage/>}/>
                        <Route path="/file-versions-search" element={<FileVersionsSearchPage/>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
