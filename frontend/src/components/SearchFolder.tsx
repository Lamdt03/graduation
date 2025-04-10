import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { SearchResult } from '../types';

export const SearchFolder: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);

    const searchFolder = async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        formData.append('searchTerm', searchTerm);

        const response = await fetch('/api/search', {
            method: 'POST',
            body: formData,
        });
        const data: SearchResult[] = await response.json();
        setResults(data);
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
            <FileUploader onFilesSelected={searchFolder} multiple />
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