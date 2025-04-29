import React, { useState } from 'react';
import * as XLSX from "xlsx";

interface FileNode {
    name: string;
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
    isDirectory: boolean;
    children?: FileNode[];
    expanded?: boolean;
}

interface ParsedSheet {
    sheetName: string;
    data: Record<string, any>[];
}

const ExcelFolderUpload: React.FC = () => {
    const [rootNode, setRootNode] = useState<FileNode | null>(null);
    const [sheets1, setSheets1] = useState<ParsedSheet[]>([]);
    const [selectedSheet1, setSelectedSheet1] = useState<ParsedSheet | null>(null);
    const [differences, setDifferences] = useState<Record<string, boolean>>({});

    const [sheets2, setSheets2] = useState<ParsedSheet[]>([]);
    const [selectedSheet2, setSelectedSheet2] = useState<ParsedSheet | null>(null);

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
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const parsedSheets = workbook.SheetNames.map(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
                        defval: '',
                    });
                    return { sheetName, data: jsonData };
                });

                setSheets1(parsedSheets);
                setSelectedSheet1(parsedSheets[0]);
                compareSheets(parsedSheets[0],selectedSheet2);
            };

            reader.readAsArrayBuffer(file);
        } else {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const parsedSheets = workbook.SheetNames.map(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
                        defval: '',
                    });
                    return { sheetName, data: jsonData };
                });

                setSheets2(parsedSheets);
                setSelectedSheet2(parsedSheets[0]);
                compareSheets(selectedSheet1,parsedSheets[0]);
            };

            reader.readAsArrayBuffer(file);
        }
    };

    const compareSheets = (sheet1: ParsedSheet | null, sheet2: ParsedSheet | null) => {
        if (!sheet1 || !sheet2) return;

        const diffs: Record<string, boolean> = {};
        const allColumns = new Set([
            ...Object.keys(sheet1.data[0] || {}),
            ...Object.keys(sheet2.data[0] || {}),
        ]);

        const maxRows = Math.max(sheet1.data.length, sheet2.data.length);

        for (let row = 0; row < maxRows; row++) {
            for (const col of Array.from(allColumns)) {
                const val1 = sheet1.data[row]?.[col] ?? '';
                const val2 = sheet2.data[row]?.[col] ?? '';
                const key = `${row}-${col}`;
                if (val1 !== val2) {
                    diffs[key] = true;
                }
            }
        }

        setDifferences(diffs);
    };

    const renderFileTree = (node: FileNode, depth = 0) => (
        <div key={node.name + depth} className="file-tree-node" style={{ paddingLeft: depth * 16 }}>
            {node.isDirectory ? (
                <div onClick={() => toggleExpand(node)} className="directory">
                    {node.expanded ? '📂' : '📁'} {node.name}
                </div>
            ) : (
                <div className="file">
                    📄 {node.name} {' '}
                    <button onClick={() => handleFileClick(node.handle, 'left')}>⬅️</button>{' '}
                    <button onClick={() => handleFileClick(node.handle, 'right')}>➡️</button>
                </div>
            )}
            {node.expanded && node.children?.map(child => renderFileTree(child, depth + 1))}
        </div>
    );

    const renderTable = (sheet: ParsedSheet | null) => {
        if (!sheet || sheet.data.length === 0)
            return <textarea
                className="text-uploader-area"
                rows={15}
                cols={60}
            />;

        const columns = Object.keys(sheet.data[0]);

        return (
            <div className="table-container">
                <table className="excel-table">
                    <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sheet.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map(col => (
                                <td
                                    key={col}
                                    className={differences[`${rowIndex}-${col}`] ? 'diff-cell' : ''}
                                >
                                    {row[col]}
                                </td>

                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderSheetSelector = (
        sheets: ParsedSheet[],
        selectedSheet: string,
        onSelect: (sheetName: ParsedSheet) => void
    ) => {
        if (sheets.length === 0) return null;

        return (
            <select value={selectedSheet} onChange={(e) => {
                const clickedSheet = sheets.find(item => item.sheetName === e.target.value)
                if (clickedSheet) onSelect(clickedSheet);
            }}>
                {sheets.map(sheet => (
                    <option key={sheet.sheetName} value={sheet.sheetName}>
                        {sheet.sheetName}
                    </option>
                ))}
            </select>
        );
    };

    return (
        <div className="folder-upload-page">
            {!rootNode ? (
                <div className="centered-button">
                    <button onClick={handleFolderPick}>📁 Chọn thư mục</button>
                </div>
            ) : (
                <div className="main-layout">
                    <div className="file-tree">
                        {renderFileTree(rootNode)}
                    </div>
                    <div className="text-uploader-wrapper">
                        <div className="text-uploader-container">
                            {renderTable(selectedSheet1)}
                            {renderSheetSelector(sheets1, selectedSheet1?.sheetName ?? "", (value) => {
                                setSelectedSheet1(value);
                                compareSheets(value, selectedSheet2)
                            })}
                        </div>

                        <div className="text-uploader-container">
                            {renderTable(selectedSheet2)}
                            {renderSheetSelector(sheets2, selectedSheet2?.sheetName ?? "", (value) => {
                                setSelectedSheet2(value);
                                compareSheets(value, selectedSheet1)
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelFolderUpload;