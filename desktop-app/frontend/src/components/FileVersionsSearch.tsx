import React, { useState } from "react";

const FileVersionsSearch: React.FC = () => {
    const [filePath, setFilePath] = useState<string>("");
    const [target, setTarget] = useState<string>("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleSearch = async () => {
        if (!filePath || !target) {
            setErrorMsg("Vui lòng nhập đường dẫn file và từ khóa tìm kiếm.");
            return;
        }

        setLoading(true);
        setErrorMsg("");
        try {
            const encodedPath = encodeURIComponent(filePath);
            const response = await fetch(
                `http://127.0.0.1:9999/file/versions?filepath=${encodedPath}&target=${target}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (!response.ok) throw new Error("Không thể lấy dữ liệu.");
            const data = await response.json();
            setResults(data);
        } catch (error: any) {
            console.error("Lỗi khi tìm kiếm:", error);
            setErrorMsg("Tìm kiếm thất bại: " + error.message);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-versions-search-page">
            <div className="centered-button" style={{ flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="text"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        placeholder="Nhập đường dẫn file (VD: C:\Users\lamdt\...)"
                        style={{
                            padding: "10px",
                            width: "400px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="Nhập từ khóa tìm kiếm (VD: main)"
                        style={{
                            padding: "10px",
                            width: "400px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? "Đang tìm..." : "Tìm kiếm"}
                    </button>
                </div>

                {errorMsg && (
                    <div style={{ color: "red", fontSize: "0.9rem" }}>{errorMsg}</div>
                )}

                {results.length > 0 && (
                    <div style={{ marginTop: "1rem", width: "100%", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ backgroundColor: "#f2f2f2" }}>
                                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Tên file</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Vị trí (Hàng, Cột)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                        {result.filename}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                        {result.locations.map((loc: any, locIndex: number) => (
                                            <div key={locIndex}>
                                                Hàng: {loc.row}, Cột: {loc.col}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {results.length === 0 && !loading && !errorMsg && (
                    <p style={{ textAlign: "center", color: "#666", marginTop: "1rem" }}>
                        Nhập thông tin và nhấn Tìm kiếm để xem kết quả.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FileVersionsSearch;