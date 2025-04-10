import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { SearchResult } from '../types';

export const SearchFolder: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setResults([]);
        setError(null);
    };

    const handleSearch = async () => {
        if (!files.length || !searchTerm.trim()) {
            setError('Please select files and enter a search term');
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        formData.append('searchTerm', searchTerm);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Search failed with status: ${response.status}`);
            }

            const data: SearchResult[] = await response.json();
            setResults(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during search');
            setResults([]);
        }
    };

    return (
        <div>
            <h2>Full Text Search</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term"
            />
            <FileUploader onFilesSelected={handleFilesSelected} multiple />
            {files.length > 0 && searchTerm.trim() && (
                <button onClick={handleSearch} style={{ marginTop: '10px' }}>
                    Search
                </button>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {results.map((result) => (
                <div key={result.fileName}>
                    <h3>{result.fileName}</h3>
                    {result.locations.map((loc, idx) => (
                        <div key={idx}>
                            Line {loc.line}
                            {loc.column && `, Column ${loc.column}`}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};