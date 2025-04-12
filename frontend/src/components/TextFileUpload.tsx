import React, {useState} from 'react';

const TextFileUpload: React.FC = () => {
    const [content1,setContent1] = useState<string>("");
    const [content2,setContent2] = useState<string>("");

    const handleFileChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setContent1(e.target?.result as string)
        };
        reader.readAsText(file);
    };

    const handleTextareaChange1 = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = event.target.value;
        setContent1(newContent);
    };

    const handleFileChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setContent2(e.target?.result as string)
        };
        reader.readAsText(file);
    };

    const handleTextareaChange2 = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = event.target.value;
        console.log(newContent)
        setContent2(newContent);
    };

    return (
        <div className="text-uploader-wrapper">
            <div className="text-uploader-container">
                <input
                    className="upload-button"
                    type="file"
                    onChange={handleFileChange1}
                />
                <textarea
                    className="text-uploader-area"
                    onChange={handleTextareaChange1}
                    value={content1}
                    rows={15}
                    cols={60}
                />
            </div>

            <div className="text-uploader-container">
                <input
                    className="upload-button"
                    type="file"
                    onChange={handleFileChange2}
                />
                <textarea
                    className="text-uploader-area"
                    onChange={handleTextareaChange2}
                    value={content2}
                    rows={15}
                    cols={60}
                />
            </div>
        </div>



    );
};

export default TextFileUpload;
