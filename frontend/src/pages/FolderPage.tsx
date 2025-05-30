const FolderPage = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Welcome to the Folder Page</h1>
            <p>
                Manage your folders seamlessly with our app! Download it now to get
                started.
            </p>
            <a
                href="https://pub-307544eb45a04ffbba9d883b62e3d6f4.r2.dev/v1.0.1/file-monitor.exe" // Replace with your actual download link
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    marginTop: '10px',
                }}
            >
                Download the App
            </a>
        </div>
    );
};

export default FolderPage;