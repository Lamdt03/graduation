import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface ParsedSheet {
    sheetName: string;
    data: Record<string, any>[];
}

const ExcelFileUpload: React.FC = () => {
    const [sheets1, setSheets1] = useState<ParsedSheet[]>([]);
    const [selectedSheet1, setSelectedSheet1] = useState<string>('');
    const [differences, setDifferences] = useState<Record<string, boolean>>({});

    const [sheets2, setSheets2] = useState<ParsedSheet[]>([]);
    const [selectedSheet2, setSelectedSheet2] = useState<string>('');

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        setSheets: React.Dispatch<React.SetStateAction<ParsedSheet[]>>,
        setSelectedSheet: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = event.target.files?.[0];
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

            setSheets(parsedSheets);
            setSelectedSheet(parsedSheets[0]?.sheetName || '');
        };

        reader.readAsArrayBuffer(file);
    };

    const renderSheetSelector = (
        sheets: ParsedSheet[],
        selectedSheet: string,
        onSelect: (sheetName: string) => void
    ) => {
        if (sheets.length === 0) return null;

        return (
            <select value={selectedSheet} onChange={(e) => onSelect(e.target.value)}>
                {sheets.map(sheet => (
                    <option key={sheet.sheetName} value={sheet.sheetName}>
                        {sheet.sheetName}
                    </option>
                ))}
            </select>
        );
    };

    const renderTable = (sheet: ParsedSheet | undefined) => {
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


    const compareSheets = () => {
        const sheet1 = sheets1.find(s => s.sheetName === selectedSheet1);
        const sheet2 = sheets2.find(s => s.sheetName === selectedSheet2);

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



    const selectedData1 = sheets1.find(sheet => sheet.sheetName === selectedSheet1);
    const selectedData2 = sheets2.find(sheet => sheet.sheetName === selectedSheet2);

    return (
        <div>
        <div className="text-uploader-wrapper">
            <div className="text-uploader-container">
                <input
                    className="upload-button"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileUpload(e, setSheets1, setSelectedSheet1)}
                />
                {renderTable(selectedData1)}
                {renderSheetSelector(sheets1, selectedSheet1, setSelectedSheet1)}
            </div>

            <div className="text-uploader-container">
                <input
                    className="upload-button"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileUpload(e, setSheets2, setSelectedSheet2)}
                />
                {renderTable(selectedData2)}
                {renderSheetSelector(sheets2, selectedSheet2, setSelectedSheet2)}
            </div>
        </div>
            <div className="compare-button">
                <button onClick={compareSheets}>Compare</button>
            </div>
        </div>
    );
};

export default ExcelFileUpload;
