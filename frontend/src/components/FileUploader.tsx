import React, { ChangeEvent } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  multiple = false,
  style,
  id,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return <input type="file" multiple={multiple} onChange={handleChange} style={style} id={id} />;
};