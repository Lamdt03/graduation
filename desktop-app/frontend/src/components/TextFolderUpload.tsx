import React, { useState } from 'react';

interface FileNode {
    name: string;
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
    isDirectory: boolean;
    children?: FileNode[];
    expanded?: boolean;
}

const TextFolderUpload: React.FC = () => {
    const [rootNode, setRootNode] = useState<FileNode | null>(null);
    const [content1, setContent1] = useState<string>('');
    const [content2, setContent2] = useState<string>('');
    const [diffLines1, setDiffLines1] = useState<number[]>([]);
    const [diffLines2, setDiffLines2] = useState<number[]>([]);

    const handleFolderPick = async () => {
        const dirHandle = await (window as any).showDirectoryPicker();
        const root: FileNode = {
            name: '/',
            handle: dirHandle,
            isDirectory: true,
        };
        setRootNode(root);
    };

    const readDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
        const nodes: FileNode[] = [];
        for await (const [name, handle] of (dirHandle as any).entries()) {
            nodes.push({
                name,
                handle,
                isDirectory: handle.kind === 'directory',
            });
        }
        return nodes;
    };

    const toggleExpand = async (node: FileNode) => {
        if (!node.isDirectory) return;
        if (node.expanded) {
            node.expanded = false;
            node.children = [];
        } else {
            const children = await readDirectory(node.handle as FileSystemDirectoryHandle);
            node.children = children;
            node.expanded = true;
        }
        setRootNode({ ...rootNode! });
    };

    const handleFileClick = async (handle: FileSystemHandle, target: 'left' | 'right') => {
        if (handle.kind !== 'file') return;
        const file = await (handle as FileSystemFileHandle).getFile();
        const text = await file.text();
        if (target === 'left') {
            setContent1(text);
            compareContents(text, content2);
        } else {
            setContent2(text);
            compareContents(content1, text);
        }
    };

    const compareContents = (text1: string, text2: string) => {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
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

    const renderFileTree = (node: FileNode, depth = 0) => (
        <div key={node.name + depth} className="file-tree-node" style={{ paddingLeft: depth * 16 }}>
            {node.isDirectory ? (
                <div onClick={() => toggleExpand(node)} className="directory">
                    {node.expanded ? '📂' : '📁'} {node.name}
                </div>
            ) : (
                <div className="file">
                    📄 {node.name} {' '}
                    <button onClick={() => handleFileClick(node.handle, 'left')}>⬅️</button>{' '}
                    <button onClick={() => handleFileClick(node.handle, 'right')}>➡️</button>
                </div>
            )}
            {node.expanded && node.children?.map(child => renderFileTree(child, depth + 1))}
        </div>
    );

    const renderEditableBlock = (content: string, diffLines: number[]) => {
        const lines = content.split('\n');
        return (
            <div className="editable-box">
                {lines.map((line, index) => (
                    <div
                        key={index}
                        className={`editable-line ${diffLines.includes(index) ? 'highlight-line' : ''}`}
                    >
                        {line || <br />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="folder-upload-page">
            {!rootNode ? (
                <div className="centered-button">
                    <button onClick={handleFolderPick}>📁 Chọn thư mục</button>
                </div>
            ) : (
                <div className="main-layout">
                    <div className="file-tree">
                        {renderFileTree(rootNode)}
                    </div>
                    <div className="content-box">
                        {renderEditableBlock(content1, diffLines1)}
                    </div>
                    <div className="content-box">
                        {renderEditableBlock(content2, diffLines2)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextFolderUpload;