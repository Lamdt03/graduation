import { TextFileDiff, CellFileDiff } from '../types';
import * as XLSX from 'xlsx';

export const compareTextFiles = (file1: string, file2: string): TextFileDiff[] => {
    const lines1 = file1.split('\n');
    const lines2 = file2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    const result: TextFileDiff[] = [];

    for (let i = 0; i < maxLength; i++) {
        const content = lines2[i] || '';
        result.push({
            lineNumber: i + 1,
            content,
            isDifferent: lines1[i] !== lines2[i]
        });
    }
    return result;
};

export const compareCellFiles = (file1: File, file2: File): Promise<CellFileDiff[]> => {
    return Promise.all([readExcel(file1), readExcel(file2)]).then(([data1, data2]) => {
        const diffs: CellFileDiff[] = [];
        data1.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (data2[rowIndex]?.[colIndex] !== cell) {
                    diffs.push({ row: rowIndex + 1, column: colIndex + 1, value: data2[rowIndex]?.[colIndex] || '' });
                }
            });
        });
        return diffs;
    });
};

const readExcel = (file: File): Promise<string[][]> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            resolve(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
        };
        reader.readAsArrayBuffer(file);
    });
};