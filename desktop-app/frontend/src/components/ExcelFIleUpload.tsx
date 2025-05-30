import React, {useCallback, useMemo, useState} from 'react';
import * as XLSX from 'xlsx';

const ExcelComparisonPage: React.FC = () => {
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [sheets1, setSheets1] = useState<string[]>([]);
    const [sheets2, setSheets2] = useState<string[]>([]);
    const [selectedSheet1, setSelectedSheet1] = useState<string>('');
    const [selectedSheet2, setSelectedSheet2] = useState<string>('');
    const [data1, setData1] = useState<any[][]>([]);
    const [data2, setData2] = useState<any[][]>([]);
    const [diffCells, setDiffCells] = useState<Set<string>>(new Set());
    const [isCompared, setIsCompared] = useState(false);

    // Memoized sheet stats
    const sheetStats1 = useMemo(() => ({
        rows: data1.length,
        cols: data1[0]?.length || 0
    }), [data1]);

    const sheetStats2 = useMemo(() => ({
        rows: data2.length,
        cols: data2[0]?.length || 0
    }), [data2]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, setSheets: React.Dispatch<React.SetStateAction<string[]>>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, {type: 'array'});
            setSheets(workbook.SheetNames);
        };
        reader.readAsArrayBuffer(file);
        setFile(file);
    }, []);

    const handleSheetSelect = useCallback((sheetName: string, file: File | null, setData: React.Dispatch<React.SetStateAction<any[][]>>) => {
        if (!file || !sheetName) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, {type: 'array'});
            const ws = workbook.Sheets[sheetName];
            const sheetData: any[][] = XLSX.utils.sheet_to_json(ws, {header: 1});
            setData(sheetData);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const compareSheets = useCallback(() => {
        const diffs = new Set<string>();
        const maxRow = Math.max(data1.length, data2.length);

        for (let row = 0; row < maxRow; row++) {
            const row1 = data1[row] || [];
            const row2 = data2[row] || [];
            const maxCol = Math.max(row1.length, row2.length);

            for (let col = 0; col < maxCol; col++) {
                if ((row1[col] || '') !== (row2[col] || '')) {
                    diffs.add(`${row}-${col}`);
                }
            }
        }
        setDiffCells(diffs);
        setIsCompared(true);
    }, [data1, data2]);

    const clearComparison = useCallback(() => {
        setDiffCells(new Set());
        setIsCompared(false);
    }, []);

    const renderTable = (data: any[][], title: string, sheetName: string, stats: { rows: number; cols: number }) => {
        const hasDifferences = Array.from(diffCells).some(cell => data.some((row, rowIndex) => cell.startsWith(`${rowIndex}-`)));
        return (
            <div className="text-uploader-container">
                <div className="file-header">
                    <div>
                        <div className="file-name">{sheetName || 'No sheet selected'}</div>
                        <div className="file-stats">{stats.rows} rows, {stats.cols} columns</div>
                    </div>
                    {isCompared && (
                        <span className={`diff-badge ${!hasDifferences ? 'no-diff' : ''}`}>
                            {hasDifferences ? `${diffCells.size} diffs` : 'No differences'}
                        </span>
                    )}
                </div>
                <div className="table-container">
                    <table className="excel-table">
                        <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={diffCells.has(`${rowIndex}-${colIndex}`) ? 'diff-cell' : ''}
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

    const canCompare = data1.length > 0 && data2.length > 0;

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
                    Excel sheet Comparison Tool
                </h1>
                <p style={{
                    margin: '8px 0 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Upload and compare Excel sheets to identify differences
                </p>
            </div>
                <div className="text-uploader-wrapper">
                    <div className="text-uploader-container">
                        <div>
                            <label className="upload-button" aria-label="Upload first Excel file">
                                Choose Excel File 1
                                <input
                                    type="file"
                                    className="file-input"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => handleFileChange(e, setFile1, setSheets1)}
                                />
                            </label>
                            {file1 && (
                                <span className="file-name-tag">{file1.name}</span>
                            )}
                        </div>
                        {sheets1.length > 0 && (
                            <select
                                className="sheet-select"
                                onChange={(e) => {
                                    setSelectedSheet1(e.target.value);
                                    handleSheetSelect(e.target.value, file1, setData1);
                                }}
                                value={selectedSheet1}
                                aria-label="Select sheet for first file"
                            >
                                <option value="">Select Sheet</option>
                                {sheets1.map((s, i) => <option key={i} value={s}>{s}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="text-uploader-container" >
                        <div>
                            <label className="upload-button" aria-label="Upload second Excel file">
                                Choose Excel File 2
                                <input
                                    type="file"
                                    className="file-input"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => handleFileChange(e, setFile2, setSheets2)}
                                />
                            </label>
                            {file2 && (
                                <span className="file-name-tag">{file2.name}</span>
                            )}
                        </div>
                        {sheets2.length > 0 && (
                            <select
                                className="sheet-select"
                                onChange={(e) => {
                                    setSelectedSheet2(e.target.value);
                                    handleSheetSelect(e.target.value, file2, setData2);
                                }}
                                value={selectedSheet2}
                                aria-label="Select sheet for second file"
                            >
                                <option value="">Select Sheet</option>
                                {sheets2.map((s, i) => <option key={i} value={s}>{s}</option>)}
                            </select>
                        )}
                    </div>
                </div>
                <div className="text-uploader-wrapper">
                    {data1.length > 0 && renderTable(data1, 'Sheet 1', selectedSheet1, sheetStats1)}
                    {data2.length > 0 && renderTable(data2, 'Sheet 2', selectedSheet2, sheetStats2)}
                </div>

                <div className="compare-section">
                    <button
                        className="compare-button"
                        onClick={compareSheets}
                        disabled={!canCompare}
                        aria-label="Compare selected sheets"
                    >
                        Compare Sheets
                    </button>
                    {isCompared && (
                        <button
                            className="clear-button"
                            onClick={clearComparison}
                            aria-label="Clear comparison results"
                        >
                            Clear Results
                        </button>
                    )}

                </div>


        </div>
    );
};

export default ExcelComparisonPage;