import React, { useState, Component } from 'react';
import { SearchFullText } from "../../wailsjs/go/controller/SearchController";
import { OpenFolderDialog } from "../../wailsjs/go/main/App";
import { controller } from "../../wailsjs/go/models";

interface Location {
    col: number;
    row: number;
}

interface LocationsFile {
    locations: Location[];
    filename: string;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <div className="error-message-box">Something went wrong. Please try again.</div>;
        }
        return this.props.children;
    }
}

const FullTextSearch: React.FC = () => {
    const [folderPath, setFolderPath] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [results, setResults] = useState<controller.LocationsFile[] | LocationsFile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!folderPath || !searchTerm) {
            setError('Please select a folder and enter a search term.');
            return;
        }
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await SearchFullText(folderPath, searchTerm);
            setResults(response || []);
        } catch (err: any) {
            setError(`Search failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFolder = async () => {
        try {
            const selected = await OpenFolderDialog();
            if (selected) {
                setFolderPath(selected);
                setError(null);
            }
        } catch (err: any) {
            setError(`Failed to open folder dialog: ${err.message}`);
        }
    };

    return (
        <ErrorBoundary>
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
                        Full-Text Search Tool
                    </h1>
                    <p style={{
                        margin: '8px 0 0',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        Search for keywords within files in a selected folder
                    </p>
                </div>
                <div className="search-container">
                    <div className="file-header">
                        <div>
                            <div className="file-name">Search Configuration</div>
                            <div className="file-stats">
                                Selected Folder: {folderPath || 'None'}
                            </div>
                        </div>
                        {results.length > 0 && (
                            <span className="diff-badge">
                                {results.length} matches
                            </span>
                        )}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="upload-button" aria-label="Select folder to search">
                            Select Folder
                            <input
                                type="button"
                                className="file-input"
                                onClick={handleSelectFolder}
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter search term"
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
                    {error && (
                        <div className="error-message-box">
                            {error}
                        </div>
                    )}
                    <div className="result-container">
                        {results.length === 0 && !loading && !error && (
                            <p className="file-stats">
                                No results found. Try a different search term or folder.
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
                                        {results.slice(0, 100).map((file, index) => (
                                            <tr key={index}>
                                                <td>{file.filename || 'Unknown'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {results.length > 100 && (
                                    <p className="file-stats">
                                        Showing first 100 results. {results.length - 100} more results not displayed.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default FullTextSearch;