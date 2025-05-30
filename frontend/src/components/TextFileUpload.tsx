import React, { useState, useCallback, useMemo } from 'react';

const TextFileUpload: React.FC = () => {
    const [content1, setContent1] = useState<string>('');
    const [content2, setContent2] = useState<string>('');
    const [diffLines1, setDiffLines1] = useState<number[]>([]);
    const [diffLines2, setDiffLines2] = useState<number[]>([]);
    const [fileName1, setFileName1] = useState<string>('');
    const [fileName2, setFileName2] = useState<string>('');
    const [isCompared, setIsCompared] = useState<boolean>(false);

    // Memoized file stats for performance
    const fileStats1 = useMemo(() => ({
        lines: content1.split('\n').length,
        chars: content1.length
    }), [content1]);

    const fileStats2 = useMemo(() => ({
        lines: content2.split('\n').length,
        chars: content2.length
    }), [content2]);

    const handleFileChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement>,
        setContent: React.Dispatch<React.SetStateAction<string>>,
        setFileName: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            setContent(e.target?.result as string);
        };
        reader.readAsText(file);
    }, []);

    const handleEditableChange = useCallback((
        e: React.FormEvent<HTMLDivElement>,
        setContent: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const text = (e.target as HTMLDivElement).innerText;
        setContent(text);
    }, []);

    const compareContents = useCallback(() => {
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
        const maxLength = Math.max(lines1.length, lines2.length);

        const diff1: number[] = [];
        const diff2: number[] = [];

        for (let i = 0; i < maxLength; i++) {
            if (lines1[i] !== lines2[i]) {
                if (i < lines1.length) diff1.push(i);
                if (i < lines2.length) diff2.push(i);
            }
        }

        setDiffLines1(diff1);
        setDiffLines2(diff2);
        setIsCompared(true);
    }, [content1, content2]);

    const clearComparison = useCallback(() => {
        setDiffLines1([]);
        setDiffLines2([]);
        setIsCompared(false);
    }, []);

    const renderEditableBlock = useCallback((
        content: string,
        setContent: React.Dispatch<React.SetStateAction<string>>,
        diffLines: number[],
        fileName: string,
        fileStats: { lines: number; chars: number }
    ) => {
        const lines = content.split('\n');
        const hasDifferences = diffLines.length > 0;

        return (
            <div className="text-uploader-container">
                <div className="file-header">
                    <div>
                        <div className="file-name">
                            {fileName || 'No file selected'}
                        </div>
                        <div className="file-stats">
                            {fileStats.lines} lines, {fileStats.chars} characters
                        </div>
                    </div>
                    {isCompared && (
                        <span className={`diff-badge ${!hasDifferences ? 'no-diff' : ''}`}>
                            {hasDifferences ? `${diffLines.length} diffs` : 'No differences'}
                        </span>
                    )}
                </div>

                <div
                    contentEditable
                    className="editable-box"
                    onInput={(e) => handleEditableChange(e, setContent)}
                    suppressContentEditableWarning
                >
                    {lines.map((line, index) => (
                        <div
                            key={index}
                            className={`editable-line ${
                                diffLines.includes(index) ? 'highlight-line' : ''
                            }`}
                        >
                            {line || <br />}
                        </div>
                    ))}
                </div>
            </div>
        );
    }, [handleEditableChange, isCompared]);

    const canCompare = content1.trim().length > 0 && content2.trim().length > 0;
    const totalDifferences = diffLines1.length + diffLines2.length;

    return (
        <div>
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
                    File Comparison Tool
                </h1>
                <p style={{
                    margin: '8px 0 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Upload and compare text files to identify differences
                </p>
            </div>

            <div className="text-uploader-wrapper">
                <div className="text-uploader-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label className="upload-button">
                            Choose File 1
                            <input
                                type="file"
                                className="file-input"
                                onChange={(e) => handleFileChange(e, setContent1, setFileName1)}
                                accept=".txt,.js,.jsx,.ts,.tsx,.css,.html,.json,.md,.py,.java,.cpp,.c"
                            />
                        </label>
                        {fileName1 && (
                            <span style={{
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '4px 8px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                            }}>
                                {fileName1}
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-uploader-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label className="upload-button">
                            Choose File 2
                            <input
                                type="file"
                                className="file-input"
                                onChange={(e) => handleFileChange(e, setContent2, setFileName2)}
                                accept=".txt,.js,.jsx,.ts,.tsx,.css,.html,.json,.md,.py,.java,.cpp,.c"
                            />
                        </label>
                        {fileName2 && (
                            <span style={{
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '4px 8px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                            }}>
                                {fileName2}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-uploader-wrapper">
                {renderEditableBlock(content1, setContent1, diffLines1, fileName1, fileStats1)}
                {renderEditableBlock(content2, setContent2, diffLines2, fileName2, fileStats2)}
            </div>

            <div className="compare-section">
                <button
                    className="compare-button"
                    onClick={compareContents}
                    disabled={!canCompare}
                >
                    Compare Files
                </button>

                {isCompared && (
                    <button
                        className="clear-button"
                        onClick={clearComparison}
                    >
                        Clear Results
                    </button>
                )}

                {isCompared && (
                    <div className="comparison-summary">
                        <div style={{ fontWeight: '500', marginBottom: '8px' }}>
                            Comparison Results
                        </div>

                        {totalDifferences === 0 ? (
                            <div style={{ color: '#28a745', fontWeight: '500' }}>
                                ✓ Files are identical
                            </div>
                        ) : (
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <div className="summary-number">{diffLines1.length}</div>
                                    <div className="summary-label">Differences in File 1</div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-number">{diffLines2.length}</div>
                                    <div className="summary-label">Differences in File 2</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextFileUpload;