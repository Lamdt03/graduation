import React, { useState, Component } from 'react';
import { SearchFullText } from "../../wailsjs/go/controller/SearchController";
import {OpenFolderDialog} from "../../wailsjs/go/main/App"; // Cập nhật đường dẫn nếu khác
import { controller } from "../../wailsjs/go/models";

// Fallback types if controller.LocationsFile is missing
interface Location {
    col: number;
    row: number;
}

interface LocationsFile {
    locations: Location[];
    filename: string;
}

// Error boundary to catch rendering errors
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
            return <div style={{ color: '#d32f2f', padding: '1rem' }}>Something went wrong. Please try again.</div>;
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
            <div className="text-uploader-container">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Full-Text Search</h1>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>
                        Selected Folder:
                    </label>
                    <div style={{ marginBottom: '0.5rem', color: folderPath ? 'black' : '#888' }}>
                        {folderPath || 'No folder selected'}
                    </div>
                    <button
                        onClick={handleSelectFolder}
                        className="centered-button"
                        style={{
                            fontSize: '1rem',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#2d72d9',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Select Folder
                    </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>Search Term</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter search term"
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="centered-button"
                    style={{
                        fontSize: '1rem',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: loading ? '#ccc' : '#2d72d9',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        width: '100%',
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>

                {error && (
                    <div
                        style={{
                            marginTop: '1rem',
                            padding: '8px',
                            backgroundColor: '#ffd6d6',
                            color: '#d32f2f',
                            borderRadius: '4px',
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                    {results.length === 0 && !loading && !error && (
                        <div style={{ fontSize: '1rem', color: '#666' }}>
                            No results found. Try a different search term or folder.
                        </div>
                    )}
                    {results.length > 0 && (
                        <>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                Search Results ({results.length})
                            </h2>
                            <div className="table-container">
                                <table className="excel-table">
                                    <thead>
                                    <tr>
                                        <th>Filename</th>
                                        <th>Matches (Row, Col)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {results.slice(0, 100).map((file, index) => (
                                        <tr key={index}>
                                            <td>{file.filename || 'Unknown'}</td>
                                            <td>
                                                {file.locations && file.locations.length > 0 ? (
                                                    file.locations.map((loc, i) => (
                                                        <span key={i} style={{ marginRight: '8px' }}>
                                                            ({loc.row}, {loc.col})
                                                        </span>
                                                    ))
                                                ) : (
                                                    'No specific locations'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {results.length > 100 && (
                                <div style={{ fontSize: '1rem', color: '#666', marginTop: '1rem' }}>
                                    Showing first 100 results. {results.length - 100} more results not displayed.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default FullTextSearch;
