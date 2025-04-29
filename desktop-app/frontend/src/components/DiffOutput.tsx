import React from 'react';
import * as Diff from 'diff';

interface DiffOutputProps {
    originalText: string;
    modifiedText: string;
}

const DiffOutput: React.FC<DiffOutputProps> = ({ originalText, modifiedText }) => {
    const diff = Diff.diffLines(originalText, modifiedText);

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Comparison Result</h3>
            <pre
                style={{
                    background: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap',
                }}
            >
        {diff.map((part, index) => {
            const style: React.CSSProperties = {
                backgroundColor: part.added
                    ? '#e6ffe6'
                    : part.removed
                        ? '#ffe6e6'
                        : 'transparent',
                display: 'block',
            };
            return (
                <span key={index} style={style}>
              {part.value}
            </span>
            );
        })}
      </pre>
        </div>
    );
};

export default DiffOutput;