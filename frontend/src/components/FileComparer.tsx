import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { TextFileDiff } from './TextFileDiff';
import { CellFileDiff } from './CellFileDiff';
import { compareTextFiles, compareCellFiles } from '../utils/fileUtils';
import { TextFileDiff as TextDiffType, CellFileDiff as CellDiffType } from '../types';
import {FILE_COMPARER_API_HOST} from "../config/config";

export const FileComparer: React.FC = () => {
    const [textDiffs, setTextDiffs] = useState<TextDiffType[]>([]);
    const [cellDiffs, setCellDiffs] = useState<CellDiffType[]>([]);

    const compareTextFiles = async (file1: File, file2: File) => {
        const formData = new FormData();
        formData.append('file1', file1);
        formData.append('file2', file2);

        const response = await fetch(`${FILE_COMPARER_API_HOST}/api/compare/text`, {
            method: 'POST',
            body: formData,
            mode: "cors",

        });
        const data: TextDiffType[] = await response.json();
        setTextDiffs(data);
        setCellDiffs([]);
    };

    const compareCellFiles = async (file1: File, file2: File) => {
        const formData = new FormData();
        formData.append('file1', file1);
        formData.append('file2', file2);

        const response = await fetch(`${FILE_COMPARER_API_HOST}/api/compare/cell`, {
            method: 'POST',
            body: formData,
        });
        const data: CellDiffType[] = await response.json();
        setCellDiffs(data);
        setTextDiffs([]);
    };

    const handleFilesSelected = (files: File[]) => {
        if (files.length !== 2) return;

        const [file1, file2] = files;
        const isTextFile = /\.(txt|py|go|c)$/.test(file1.name);

        if (isTextFile) {
            compareTextFiles(file1, file2);
        } else {
            compareCellFiles(file1, file2);
        }
    };

    return (
        <div>
            <h2>File Comparer</h2>
            <FileUploader onFilesSelected={handleFilesSelected} multiple />
            {textDiffs.length > 0 && <TextFileDiff diffs={textDiffs} />}
            {cellDiffs.length > 0 && <CellFileDiff diffs={cellDiffs} />}
        </div>
    );
};