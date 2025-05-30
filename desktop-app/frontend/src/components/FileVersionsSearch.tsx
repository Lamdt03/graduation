import React, { useState } from "react";
import { OpenFileDialog } from "../../wailsjs/go/main/App"; // Giả định có API này, tương tự OpenFolderDialog

interface Location {
    col: number;
    row: number;
}

interface SearchResult {
    locations: Location[];
    filename: string;
}

const FileVersionsSearch: React.FC = () => {
    const [filePath, setFilePath] = useState<string>("");
    const [target, setTarget] = useState<string>("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleSelectFile = async () => {
        try {
            const selected = await OpenFileDialog();
            if (selected) {
                setFilePath(selected);
                setErrorMsg("");
            }
        } catch (err: any) {
            setErrorMsg(`Failed to open file dialog: ${err.message}`);
        }
    };

    const handleSearch = async () => {
        if (!filePath || !target) {
            setErrorMsg("Please select a file and a keyword to search.");
            return;
        }

        setLoading(true);
        setErrorMsg("");
        try {
            const encodedPath = encodeURIComponent(filePath);
            const response = await fetch(
                `http://127.0.0.1:9999/file/versions?filepath=${encodedPath}&target=${target}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    mode: 'cors',
                }
            );
             if (!response.ok) throw new Error("can not get data.");
            const data = await response.json();
            setResults(data);
        } catch (error: any) {
            console.error("search error:", error);
            setErrorMsg("search fail: " + error.message);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="folder-upload-page">

            <div style={{
                padding: '20px 0',
                textAlign: 'center',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333'
                }}>
                    File Versions Search Tool
                </h1>
                <p style={{
                    margin: '8px 0 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Search for keywords within versions of a specific file
                </p>
            </div>
            <div className="search-container">
                <div className="file-header">
                    <div>
                        <div className="file-name">Search Configuration</div>
                        <div className="file-stats">
                            Selected File: {filePath || 'None'}
                        </div>
                    </div>
                    {results.length > 0 && (
                        <span className="diff-badge">
                            {results.length} matches
                        </span>
                    )}
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label className="upload-button" aria-label="Select file to search">
                        Select File
                        <input
                            type="button"
                            className="file-input"
                            onClick={handleSelectFile}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="search-input" className="file-name">
                        Search Term
                    </label>
                    <input
                        id="search-input"
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="Enter search term (e.g., main)"
                        className="search-input"
                        aria-label="Enter search term"
                    />
                </div>
                <div className="compare-section">
                    <button
                        className="compare-button"
                        onClick={handleSearch}
                        disabled={loading}
                        aria-label={loading ? 'Searching' : 'Start search'}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {errorMsg && (
                    <div className="error-message-box">
                        {errorMsg}
                    </div>
                )}
                <div className="result-container">
                    {results.length === 0 && !loading && !errorMsg && (
                        <p className="file-stats">
                            Select a file and enter a search term to view results.
                        </p>
                    )}
                    {results.length > 0 && (
                        <>
                            <div className="file-header">
                                <div className="file-name">
                                    Search Results ({results.length})
                                </div>
                            </div>
                            <div className="table-container">
                                <table className="excel-table">
                                    <thead>
                                    <tr>
                                        <th>Filename</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {results.map((result, index) => (
                                        <tr key={index}>
                                            <td>{result.filename || 'Unknown'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileVersionsSearch;