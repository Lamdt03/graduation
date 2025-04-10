import React from 'react';
import { TextFileDiff as TextDiffType } from '../types';

interface TextFileDiffProps {
    diffs: TextDiffType[];
}

export const TextFileDiff: React.FC<TextFileDiffProps> = ({ diffs }) => (
    <div>
        <h3>Text File Differences</h3>
        {diffs.map((diff) => (
            <div
                key={diff.lineNumber}
                style={{ backgroundColor: diff.isDifferent ? 'yellow' : 'transparent' }}
            >
                Line {diff.lineNumber}: {diff.content}
            </div>
        ))}
    </div>
);