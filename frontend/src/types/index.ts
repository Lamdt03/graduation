export interface TextFileDiff {
    lineNumber: number;
    content: string;
    isDifferent: boolean;
}

export interface CellFileDiff {
    row: number;
    column: number;
    value: string;
}

export interface SearchResult {
    fileName: string;
    locations: { line: number; column?: number }[];
}