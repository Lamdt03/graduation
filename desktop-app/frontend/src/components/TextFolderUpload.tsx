import React, { useState, useMemo } from 'react';

interface FileNode {
    name: string;
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
    isDirectory: boolean;
    children?: FileNode[];
    expanded?: boolean;
}

const TextFolderUpload: React.FC = () => {
    const [rootNode, setRootNode] = useState<FileNode | null>(null);
    const [content1, setContent1] = useState<string>('');
    const [content2, setContent2] = useState<string>('');
    const [diffLines1, setDiffLines1] = useState<number[]>([]);
    const [diffLines2, setDiffLines2] = useState<number[]>([]);
    const [fileName1, setFileName1] = useState<string>('');
    const [fileName2, setFileName2] = useState<string>('');
    const [isCompared, setIsCompared] = useState<boolean>(false);

    // Memoized file stats
    const fileStats1 = useMemo(() => ({
        lines: content1.split('\n').length,
        chars: content1.length
    }), [content1]);

    const fileStats2 = useMemo(() => ({
        lines: content2.split('\n').length,
        chars: content2.length
    }), [content2]);

    const handleFolderPick = async () => {
        const dirHandle = await (window as any).showDirectoryPicker();
        const root: FileNode = {
            name: '/',
            handle: dirHandle,
            isDirectory: true,
        };
        setRootNode(root);
    };

    const readDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
        const nodes: FileNode[] = [];
        for await (const [name, handle] of (dirHandle as any).entries()) {
            nodes.push({
                name,
                handle,
                isDirectory: handle.kind === 'directory',
            });
        }
        return nodes;
    };

    const toggleExpand = async (node: FileNode) => {
        if (!node.isDirectory) return;
        if (node.expanded) {
            node.expanded = false;
            node.children = [];
        } else {
            const children = await readDirectory(node.handle as FileSystemDirectoryHandle);
            node.children = children;
            node.expanded = true;
        }
        setRootNode({ ...rootNode! });
    };

    const handleFileClick = async (handle: FileSystemHandle, target: 'left' | 'right') => {
        if (handle.kind !== 'file') return;
        const file = await (handle as FileSystemFileHandle).getFile();
        const text = await file.text();
        if (target === 'left') {
            setContent1(text);
            setFileName1(file.name);
            compareContents(text, content2);
        } else {
            setContent2(text);
            setFileName2(file.name);
            compareContents(content1, text);
        }
    };

    const compareContents = (text1: string, text2: string) => {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
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
    };

    const clearComparison = () => {
        setDiffLines1([]);
        setDiffLines2([]);
        setIsCompared(false);
    };

    const renderFileTree = (node: FileNode, depth = 0) => (
        <div key={node.name + depth} className="file-tree-node" style={{ paddingLeft: depth * 16 }}>
            {node.isDirectory ? (
                <div onClick={() => toggleExpand(node)} className="directory">
                    {node.expanded ? '📂' : '📁'} {node.name}
                </div>
            ) : (
                <div className="file">
                    📄 {node.name}
                    <button
                        className="file-button"
                        onClick={() => handleFileClick(node.handle, 'left')}
                        aria-label={`Select ${node.name} for left panel`}
                    >
                        ⬅️
                    </button>
                    <button
                        className="file-button"
                        onClick={() => handleFileClick(node.handle, 'right')}
                        aria-label={`Select ${node.name} for right panel`}
                    >
                        ➡️
                    </button>
                </div>
            )}
            {node.expanded && node.children?.map(child => renderFileTree(child, depth + 1))}
        </div>
    );

    const renderEditableBlock = (content: string, diffLines: number[], fileName: string, stats: { lines: number; chars: number }) => {
        const lines = content.split('\n');
        const hasDifferences = diffLines.length > 0;
        return (
            <div className="text-uploader-container">
                <div className="file-header">
                    <div>
                        <div className="file-name">{fileName || 'No file selected'}</div>
                        <div className="file-stats">{stats.lines} lines, {stats.chars} characters</div>
                    </div>
                    {isCompared && (
                        <span className={`diff-badge ${!hasDifferences ? 'no-diff' : ''}`}>
                            {hasDifferences ? `${diffLines.length} diffs` : 'No differences'}
                        </span>
                    )}
                </div>
                <div className="editable-box">
                    {lines.map((line, index) => (
                        <div
                            key={index}
                            className={`editable-line ${diffLines.includes(index) ? 'highlight-line' : ''}`}
                        >
                            {line || <br />}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const totalDifferences = diffLines1.length + diffLines2.length;

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
                    Folder Text Comparison Tool
                </h1>
                <p style={{
                    margin: '8px 0 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                   Select a folder and compare text files to identify differences
                </p>
            </div>
            {!rootNode ? (
                <div className="centered-button">
                    <button
                        className="upload-button"
                        onClick={handleFolderPick}
                        aria-label="Select folder"
                    >
                        📁 Select Folder
                    </button>
                </div>
            ) : (
                <>
                    <div className="main-layout">
                        <div className="file-tree">
                            {renderFileTree(rootNode)}
                        </div>
                        <div className="content-box">
                            {renderEditableBlock(content1, diffLines1, fileName1, fileStats1)}
                        </div>
                        <div className="content-box">
                            {renderEditableBlock(content2, diffLines2, fileName2, fileStats2)}
                        </div>
                    </div>
                    {isCompared && (
                        <div className="compare-section">
                            <button
                                className="upload-button"
                                onClick={handleFolderPick}
                                aria-label="Select another folder"
                            >
                                Change Folder
                            </button>
                            <button
                                className="clear-button"
                                onClick={clearComparison}
                                aria-label="Clear comparison results"
                            >
                                Clear Results
                            </button>
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
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TextFolderUpload;