import React, { useState } from "react";
import {InstallService,OpenFolderDialog} from "../../wailsjs/go/main/App";

const FolderMonitor: React.FC = () => {
    const [folderPath, setFolderPath] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleSelectFolder = async () => {
        try {
            const selectedPath = await OpenFolderDialog();
            if (selectedPath) {
                setFolderPath(selectedPath);
                setErrorMsg("");
            }
        } catch (error) {
            console.error("Lỗi khi chọn thư mục:", error);
            alert("Không thể chọn thư mục.");
        }
    };

    const handleMonitor = async () => {
        if (!folderPath) {
            setErrorMsg("Vui lòng chọn thư mục trước.");
            return;
        }

        setLoading(true);
        try {
            await InstallService(folderPath);
            alert("Cài đặt service thành công.");
        } catch (error: any) {
            console.error("InstallService error:", error);

            if (error.message?.includes("not running as administrator")) {
                alert("Bạn cần chạy ứng dụng bằng quyền Administrator.\n" +
                    "Chuột phải vào app và chọn 'Run as administrator'.");
            } else {
                alert("Cài đặt service thất bại: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="folder-upload-page">
            <div className="centered-button" style={{ flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="text"
                        value={folderPath}
                        readOnly
                        placeholder="Chưa chọn thư mục..."
                        style={{
                            padding: "10px",
                            width: "400px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                    <button onClick={handleSelectFolder}>
                        Chọn thư mục
                    </button>
                </div>

                <button onClick={handleMonitor} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Monitor"}
                </button>

                {errorMsg && (
                    <div style={{ color: "red", fontSize: "0.9rem" }}>{errorMsg}</div>
                )}

                <p className="text-sm text-gray-500 mt-2" style={{ textAlign: "center", color: "#666" }}>
                    Nếu cài đặt thất bại, hãy đảm bảo bạn đang chạy ứng dụng với quyền <strong>Administrator</strong>.
                </p>
            </div>
        </div>
    );
};

export default FolderMonitor;
