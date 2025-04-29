import React, { ChangeEvent, useRef } from 'react';
import * as XLSX from 'xlsx';
import '../styles.css'; // Import the CSS file

interface DiffInputProps {
    originalText: string;
    modifiedText: string;
    setOriginalText: (text: string) => void;
    setModifiedText: (text: string) => void;
    onCompare: () => void;
    originalLines: React.ReactNode[];
    modifiedLines: React.ReactNode[];
}

const DiffInput: React.FC<DiffInputProps> = ({
                                                 originalText,
                                                 modifiedText,
                                                 setOriginalText,
                                                 setModifiedText,
                                                 onCompare,
                                                 originalLines,
                                                 modifiedLines,
                                             }) => {
    const originalRef = useRef<HTMLDivElement>(null);
    const modifiedRef = useRef<HTMLDivElement>(null);

    const handleOriginalInput = () => {
        if (originalRef.current) {
            setOriginalText(originalRef.current.innerText);
        }
    };

    const handleModifiedInput = () => {
        if (modifiedRef.current) {
            setModifiedText(modifiedRef.current.innerText);
        }
    };

    const handleFileUpload = (
        e: ChangeEvent<HTMLInputElement>,
        setText: (text: string) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const text = XLSX.utils.sheet_to_csv(firstSheet);
                setText(text);
            };
            reader.readAsArrayBuffer(file);
        } else {
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setText(text);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="input-container">
            <div className="text-areas">
                <div className="text-section">
                    <h3>Original Text</h3>
                    <input
                        type="file"
                        accept=".txt,.xlsx,.xls"
                        onChange={(e) => handleFileUpload(e, setOriginalText)}
                        className="file-input"
                    />
                    <div
                        ref={originalRef}
                        contentEditable
                        onInput={handleOriginalInput}
                        className="editable-area"
                    >
                        {originalLines.length > 0 ? (
                            originalLines
                        ) : (
                            <span className="placeholder">
                {originalText || 'Enter or upload original text here...'}
              </span>
                        )}
                    </div>
                </div>
                <div className="text-section">
                    <h3>Modified Text</h3>
                    <input
                        type="file"
                        accept=".txt,.xlsx,.xls"
                        onChange={(e) => handleFileUpload(e, setModifiedText)}
                        className="file-input"
                    />
                    <div
                        ref={modifiedRef}
                        contentEditable
                        onInput={handleModifiedInput}
                        className="editable-area"
                    >
                        {modifiedLines.length > 0 ? (
                            modifiedLines
                        ) : (
                            <span className="placeholder">
                {modifiedText || 'Enter or upload modified text here...'}
              </span>
                        )}
                    </div>
                </div>
            </div>
            <button onClick={onCompare} className="compare-button">
                Compare
            </button>
        </div>
    );
};

export default DiffInput;