import React, {useState} from 'react';
import {FileUploader} from '../components/FileUploader';
import {TextFileDiff} from '../components/TextFileDiff';
import {CellFileDiff} from '../components/CellFileDiff';
import {CellFileDiff as CellDiffType, TextFileDiff as TextDiffType} from '../types';
import * as XLSX from 'xlsx';
import '../styles/FileComparer.css';
import {FILE_COMPARER_API_HOST} from "../config/config";

export const FileComparer: React.FC = () => {
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [file1Content, setFile1Content] = useState<string>('');
    const [file2Content, setFile2Content] = useState<string>('');
    const [file1Table, setFile1Table] = useState<string[][]>([]);
    const [file2Table, setFile2Table] = useState<string[][]>([]);
    const [textDiffs, setTextDiffs] = useState<TextDiffType[]>([]);
    const [cellDiffs, setCellDiffs] = useState<CellDiffType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'text' | 'excel' | null>(null);

    const readExcelFile = (file: File, setTable: (table: string[][]) => void) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(new Uint8Array(data), {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1}) as string[][];
            setTable(jsonData);
        };
        reader.onerror = () => setError(`Failed to read ${file.name}`);
        reader.readAsArrayBuffer(file);
    };

    const handleFile1Selected = (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile1(selectedFile);
            setTextDiffs([]);
            setCellDiffs([]);
            setError(null);

            if (fileType === 'text') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    setFile1Content(content);
                    setFile1Table([]);
                };
                reader.onerror = () => setError('Failed to read File 1');
                reader.readAsText(selectedFile);
            } else if (fileType === 'excel') {
                readExcelFile(selectedFile, (table) => {
                    setFile1Table(table);
                    setFile1Content('');
                });
            }
        }
    };

    const handleFile2Selected = (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile2(selectedFile);
            setTextDiffs([]);
            setCellDiffs([]);
            setError(null);

            if (fileType === 'text') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    setFile2Content(content);
                    setFile2Table([]);
                };
                reader.onerror = () => setError('Failed to read File 2');
                reader.readAsText(selectedFile);
            } else if (fileType === 'excel') {
                readExcelFile(selectedFile, (table) => {
                    setFile2Table(table);
                    setFile2Content('');
                });
            }
        }
    };

    const compareFiles = async () => {
        if (!file1 || !file2) {
            setError('Please select both files to compare');
            return;
        }
        if (!fileType) {
            setError('Please select a file type from the menu');
            return;
        }

        const endpoint = fileType === 'text' ? `${FILE_COMPARER_API_HOST}/api/compare/text` : `${FILE_COMPARER_API_HOST}/api/compare/cell`;
        const formData = new FormData();
        formData.append('file1', file1);
        formData.append('file2', file2);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                mode: "cors",
            });

            if (!response.ok) {
                throw new Error(`Comparison failed with status: ${response.status}`);
            }

            const data = await response.json();
            if (fileType === 'text') {
                setTextDiffs(data as TextDiffType[]);
                setCellDiffs([]);
            } else {
                setCellDiffs(data as CellDiffType[]);
                setTextDiffs([]);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during comparison');
        }
    };

    const renderTable = (tableData: string[][]) => {
        if (!tableData.length) return null;
        return (
            <table className="file-table">
                <thead>
                <tr>
                    {tableData[0].map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {tableData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="file-comparer-container">
            <h2>File Comparer</h2>
            <div className="file-type-select">
                <label>File Type:</label>
                <select
                    value={fileType || ''}
                    onChange={(e) => {
                        setFileType(e.target.value as 'text' | 'excel');
                        setFile1(null);
                        setFile2(null);
                        setFile1Content('');
                        setFile2Content('');
                        setFile1Table([]);
                        setFile2Table([]);
                        setTextDiffs([]);
                        setCellDiffs([]);
                        setError(null);
                    }}
                >
                    <option value="" disabled>
                        Select File Type
                    </option>
                    <option value="text">Text File</option>
                    <option value="excel">Excel</option>
                </select>
            </div>
            <div className='container-file-field'>
                <button
                    className="file-button"
                    onClick={() => document.getElementById('file1-input')?.click()}
                    disabled={!fileType}
                >
                    Choose File 1 {file1 ? `(${file1.name})` : ''}
                </button>
                <FileUploader
                    onFilesSelected={handleFile1Selected}
                    multiple={false}
                    style={{display: 'none'}}
                    id="file1-input"
                />
                <button
                    className="file-button"
                    onClick={() => document.getElementById('file2-input')?.click()}
                    disabled={!fileType}
                >
                    Choose File 2 {file2 ? `(${file2.name})` : ''}
                </button>
                <FileUploader
                    onFilesSelected={handleFile2Selected}
                    multiple={false}
                    style={{display: 'none'}}
                    id="file2-input"
                />
                <div className="file-content-container">
                    <div className="file-content">
                        <label>File 1 Content:</label>
                        {fileType === 'text' ? (
                            <textarea
                                value={file1Content}
                                readOnly
                                placeholder="File 1 content will appear here"
                                className="file-textarea"
                            />
                        ) : (
                            <div className="file-table-container">{renderTable(file1Table)}</div>
                        )}
                    </div>
                </div>
                <div className="file-content-container">
                    <div className="file-content">
                        <label>File 2 Content:</label>
                        {fileType === 'text' ? (
                            <textarea
                                value={file2Content}
                                readOnly
                                placeholder="File 2 content will appear here"
                                className="file-textarea"
                            />
                        ) : (
                            <div className="file-table-container">{renderTable(file2Table)}</div>
                        )}
                    </div>
                </div>
            </div>
            {(file1 || file2) && fileType && (
                <button className="compare-button" onClick={compareFiles}>
                    Compare Files
                </button>
            )}
            {error && <div className="error-message">{error}</div>}
            {textDiffs.length > 0 && <TextFileDiff diffs={textDiffs}/>}
            {cellDiffs.length > 0 && <CellFileDiff diffs={cellDiffs}/>}
        </div>
    );
};