import React, { useState } from 'react';

// TypeScript interfaces matching Go structs
interface Location {
    col: number;
    row: number;
}

interface LocationsFile {
    locations: Location[];
    filename: string;
}

const FullTextSearch: React.FC = () => {
    const [folderPath, setFolderPath] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [results, setResults] = useState<LocationsFile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!folderPath || !searchTerm) {
            setError('Please provide both folder path and search term.');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // Call Wails-bound Go method
            const response = await window.go.main.SearchController.SearchFullText(folderPath, searchTerm);
            setResults(response);
        } catch (err: any) {
            setError(`Search failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Full-Text Search</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Folder Path</label>
                <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder="Enter folder path (e.g., /path/to/folder)"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Search Term</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                onClick={handleSearch}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {loading ? 'Searching...' : 'Search'}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">Search Results</h2>
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2 text-left">Filename</th>
                            <th className="border p-2 text-left">Matches (Row, Col)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.map((file, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border p-2">{file.filename}</td>
                                <td className="border p-2">
                                    {file.locations.length > 0 ? (
                                        file.locations.map((loc, i) => (
                                            <span key={i} className="mr-2">
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
            )}
        </div>
    );
};

export default FullTextSearch;