import React, { useState } from 'react';

const TextFileUpload: React.FC = () => {
    const [content1, setContent1] = useState<string>('');
    const [content2, setContent2] = useState<string>('');
    const [diffLines1, setDiffLines1] = useState<number[]>([]);
    const [diffLines2, setDiffLines2] = useState<number[]>([]);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setContent: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setContent(e.target?.result as string);
        };
        reader.readAsText(file);
    };

    const handleEditableChange = (
        e: React.FormEvent<HTMLDivElement>,
        setContent: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const text = (e.target as HTMLDivElement).innerText;
        setContent(text);
    };

    const compareContents = () => {
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
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
    };

    const renderEditableBlock = (
        content: string,
        setContent: React.Dispatch<React.SetStateAction<string>>,
        diffLines: number[]
    ) => {
        const lines = content.split('\n');
        return (
            <div
                contentEditable
                className="editable-box"
                onInput={(e) => handleEditableChange(e, setContent)}
                suppressContentEditableWarning
            >
                {lines.map((line, index) => (
                    <div
                        key={index}
                        className={`editable-line ${
                            diffLines.includes(index) ? 'highlight-line' : ''
                        }`}
                    >
                        {line || <br />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
        <div className="text-uploader-wrapper">
            <div className="text-uploader-container">
                <input
                    className="upload-button"
                    type="file"
                    onChange={(e) => handleFileChange(e, setContent1)}
                />
                {renderEditableBlock(content1, setContent1, diffLines1)}
            </div>

            <div className="text-uploader-container">
                <input
                    className="upload-button"
                    type="file"
                    onChange={(e) => handleFileChange(e, setContent2)}
                />
                {renderEditableBlock(content2, setContent2, diffLines2)}
            </div>
        </div>
            <div className="compare-button">
                <button onClick={compareContents}>Compare</button>
            </div>
        </div>
    );
};

export default TextFileUpload;
