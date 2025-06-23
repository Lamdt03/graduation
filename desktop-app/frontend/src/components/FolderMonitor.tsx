import React, { useState } from "react";
import {InstallService,OpenFolderDialog} from "../../wailsjs/go/main/App";
import {controller} from "../../wailsjs/go/models";
import { useEffect } from 'react';

interface log{
    path: string;
    timestamp: string;
    event: string;
}

const FolderMonitor: React.FC = () => {
    const [folderPath, setFolderPath] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [results, setResults] = useState<log[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleSelectFolder = async () => {
        try {
            const selectedPath = await OpenFolderDialog();
            if (selectedPath) {
                setFolderPath(selectedPath);
                setErrorMsg("");
            }
        } catch (error) {
            console.error("select folder error:", error);
            alert("Cannot select folder.");
        }
    };

    const handleMonitor = async () => {
        if (!folderPath) {
            setErrorMsg("Please specify a folder.");
            return;
        }

        setLoading(true);
        try {
            await InstallService(folderPath);
            alert("Install service success.");
        } catch (error: any) {
            console.error("InstallService error:", error);

            if (error.message?.includes("not running as administrator")) {
                alert("You need to start the app with Administrator privileges.\n" +
                    "right click to the app and choose 'Run as administrator'.");
            } else {
                alert("Install service fail: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLog = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:9999/logs`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    mode: 'cors',
                }
            );
            if (!response.ok) throw new Error("can not get data.");
            const data = await response.json();
            if (data === null) return;
            setResults(data);
        } catch (error: any) {
            console.error("log error:", error);
            setResults([]);
        }
    }

    useEffect(() => {
        // Run handleSearch immediately
        handleLog();

        // Set up interval to run every 10 seconds
        const intervalId = setInterval(() => {
            handleLog();
        }, 10000); // 10000ms = 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    });

    return (
        <div className="folder-upload-page">
            <div style={{
                padding: '20px 0',
                textAlign: 'center',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333'
                }}>
                   Folder monitor tool
                </h1>
                <p style={{
                    margin: '8px 0 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                   monitor folder to trace it change when it is moved, change, edit, remove
                </p>
            </div>
            <div className="centered-button" style={{ flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="text"
                        value={folderPath}
                        readOnly
                        placeholder="selected folder"
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
                    {loading ? "processing..." : "Monitor"}
                </button>

                {errorMsg && (
                    <div style={{ color: "red", fontSize: "0.9rem" }}>{errorMsg}</div>
                )}

                <p className="text-sm text-gray-500 mt-2" style={{ textAlign: "center", color: "#666" }}>
                    To monitor the folder, start up with <strong>Administrator</strong> privileges.
                </p>
            </div>

            <div className="result-container">
                {results.length > 0 && (
                    <>
                        <div className="file-header">
                            <div className="file-name">
                                Folder Event ({results.length})
                            </div>
                        </div>
                        <div className="table-container">
                            <table className="excel-table">
                                <thead>
                                <tr>
                                    <th>Filename</th>
                                    <th>Event</th>
                                    <th>Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {results.slice(0, 100).map((log, index) => (
                                    <tr key={index}>
                                        <td>{log.path || 'Unknown'}</td>
                                        <td>{log.event || 'Unknown'}</td>
                                        <td>{log.timestamp || 'Unknown'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {results.length > 100 && (
                            <p className="file-stats">
                                Showing first 100 results. {results.length - 100} more results not displayed.
                            </p>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default FolderMonitor;
