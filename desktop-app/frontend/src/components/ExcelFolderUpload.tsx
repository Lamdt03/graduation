import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

interface FileNode {
    name: string;
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
    isDirectory: boolean;
    children?: FileNode[];
    expanded?: boolean;
}

// Cập nhật ParsedSheet để lưu dữ liệu dạng mảng 2 chiều
interface ParsedSheet {
    sheetName: string;
    data: any[][];
}

const ExcelFolderUpload: React.FC = () => {
    const [rootNode, setRootNode] = useState<FileNode | null>(null);
    const [sheets1, setSheets1] = useState<ParsedSheet[]>([]);
    const [selectedSheet1, setSelectedSheet1] = useState<ParsedSheet | null>(null);
    const [fileName1, setFileName1] = useState<string>('');
    const [sheets2, setSheets2] = useState<ParsedSheet[]>([]);
    const [selectedSheet2, setSelectedSheet2] = useState<ParsedSheet | null>(null);
    const [fileName2, setFileName2] = useState<string>('');
    // Sử dụng Set<string> thay vì Record<string, boolean>
    const [differences, setDifferences] = useState<Set<string>>(new Set());
    const [isCompared, setIsCompared] = useState<boolean>(false);

    // Cập nhật sheet stats để phù hợp với mảng 2 chiều
    const sheetStats1 = useMemo(() => ({
        rows: selectedSheet1?.data.length || 0,
        cols: selectedSheet1?.data[0]?.length || 0
    }), [selectedSheet1]);

    const sheetStats2 = useMemo(() => ({
        rows: selectedSheet2?.data.length || 0,
        cols: selectedSheet2?.data[0]?.length || 0
    }), [selectedSheet2]);

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
        if (target === 'left') {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Chuyển sang mảng 2 chiều
                const parsedSheets = workbook.SheetNames.map(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    return { sheetName, data: jsonData };
                });

                setSheets1(parsedSheets);
                setSelectedSheet1(parsedSheets[0]);
                setFileName1(file.name);
                compareSheets(parsedSheets[0], selectedSheet2);
            };

            reader.readAsArrayBuffer(file);
        } else {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Chuyển sang mảng 2 chiều
                const parsedSheets = workbook.SheetNames.map(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    return { sheetName, data: jsonData };
                });

                setSheets2(parsedSheets);
                setSelectedSheet2(parsedSheets[0]);
                setFileName2(file.name);
                compareSheets(selectedSheet1, parsedSheets[0]);
            };

            reader.readAsArrayBuffer(file);
        }
    };

    // Cập nhật compareSheets để giống ExcelComparisonPage
    const compareSheets = (sheet1: ParsedSheet | null, sheet2: ParsedSheet | null) => {
        if (!sheet1 || !sheet2) return;

        const diffs = new Set<string>();
        const maxRow = Math.max(sheet1.data.length, sheet2.data.length);

        for (let row = 0; row < maxRow; row++) {
            const row1 = sheet1.data[row] || [];
            const row2 = sheet2.data[row] || [];
            const maxCol = Math.max(row1.length, row2.length);

            for (let col = 0; col < maxCol; col++) {
                if ((row1[col] || '') !== (row2[col] || '')) {
                    diffs.add(`${row}-${col}`);
                }
            }
        }

        setDifferences(diffs);
        setIsCompared(true);
    };

    const clearComparison = () => {
        setDifferences(new Set());
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

    // Cập nhật renderTable để hiển thị mảng 2 chiều
    const renderTable = (sheet: ParsedSheet | null, fileName: string, stats: { rows: number; cols: number }) => {
        if (!sheet || sheet.data.length === 0) {
            return (
                <div className="text-uploader-container">
                    <div className="file-header">
                        <div>
                            <div className="file-name">{fileName || 'No file selected'}</div>
                            <div className="file-stats">0 rows, 0 columns</div>
                        </div>
                    </div>
                    <div className="table-container">
                        <p style={{ color: '#666', textAlign: 'center', padding: '16px' }}>
                            No sheet selected
                        </p>
                    </div>
                </div>
            );
        }

        const hasDifferences = Array.from(differences).some(cell => sheet.data.some((row, rowIndex) => cell.startsWith(`${rowIndex}-`)));

        return (
            <div className="text-uploader-container">
                <div className="file-header">
                    <div>
                        <div className="file-name">{fileName || 'No file selected'} - {sheet.sheetName}</div>
                        <div className="file-stats">{stats.rows} rows, {stats.cols} columns</div>
                    </div>
                    {isCompared && (
                        <span className={`diff-badge ${!hasDifferences ? 'no-diff' : ''}`}>
                            {hasDifferences ? `${differences.size} diffs` : 'No differences'}
                        </span>
                    )}
                </div>
                <div className="table-container">
                    <table className="excel-table">
                        <tbody>
                        {sheet.data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={differences.has(`${rowIndex}-${colIndex}`) ? 'diff-cell' : ''}
                                    >
                                        {cell ?? ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderSheetSelector = (
        sheets: ParsedSheet[],
        selectedSheet: ParsedSheet | null,
        onSelect: (sheet: ParsedSheet) => void
    ) => {
        if (sheets.length === 0) return null;

        return (
            <select
                className="sheet-select"
                value={selectedSheet?.sheetName ?? ''}
                onChange={(e) => {
                    const clickedSheet = sheets.find(item => item.sheetName === e.target.value);
                    if (clickedSheet) onSelect(clickedSheet);
                }}
                aria-label="Select sheet"
            >
                <option value="" disabled>Select Sheet</option>
                {sheets.map(sheet => (
                    <option key={sheet.sheetName} value={sheet.sheetName}>
                        {sheet.sheetName}
                    </option>
                ))}
            </select>
        );
    };

    const totalDifferences = differences.size;

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
                    Excel Folder Comparison Tool
                </h1>
                <p style={{
                    margin: '8px 0 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Select a folder and compare Excel sheets to identify differences
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
                        <div className="text-uploader-wrapper">
                            <div className="text-uploader-container">
                                {renderTable(selectedSheet1, fileName1, sheetStats1)}
                                {renderSheetSelector(sheets1, selectedSheet1, (value) => {
                                    setSelectedSheet1(value);
                                    compareSheets(value, selectedSheet2);
                                })}
                            </div>
                            <div className="text-uploader-container">
                                {renderTable(selectedSheet2, fileName2, sheetStats2)}
                                {renderSheetSelector(sheets2, selectedSheet2, (value) => {
                                    setSelectedSheet2(value);
                                    compareSheets(selectedSheet1, value);
                                })}
                            </div>
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
                                        ✓ Sheets are identical
                                    </div>
                                ) : (
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <div className="summary-number">{totalDifferences}</div>
                                            <div className="summary-label">Different Cells</div>
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

export default ExcelFolderUpload;