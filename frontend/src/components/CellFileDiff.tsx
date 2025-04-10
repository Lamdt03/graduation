import React from 'react';
import { CellFileDiff as CellDiffType } from '../types';

interface CellFileDiffProps {
    diffs: CellDiffType[];
}

export const CellFileDiff: React.FC<CellFileDiffProps> = ({ diffs }) => (
    <div>
        <h3>Cell File Differences</h3>
        {diffs.map((diff, index) => (
            <div key={index} style={{ backgroundColor: 'yellow' }}>
                Row {diff.row}, Column {diff.column}: {diff.value}
            </div>
        ))}
    </div>
);