import React, { useEffect, useState } from 'react';

function App() {
  // Example Google Drive link; replace with your actual link
  const googleDriveLink = "https://drive.google.com/drive/folders/1G_gnZ0sQYpaSiuqWtf518Ad-2rGHQZYl";

  // Example: fetch data from the Flask backend
  const [backendData, setBackendData] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:5000/capstone')
      .then(response => response.json())
      .then(data => setBackendData(data))
      .catch(err => console.error("Error fetching backend data:", err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Study Companion Frontend</h1>
      <p>Welcome to the Study Companion Web App!</p>

      {/* Display data fetched from the backend */}
      {backendData ? (
        <div>
          <h3>Backend Says:</h3>
          <pre>{JSON.stringify(backendData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading backend data...</p>
      )}

      <div style={{ marginTop: "30px" }}>
        <button style={{ margin: "10px", padding: "10px 20px" }}>
          <a 
            href={googleDriveLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Capstone Folder 1
          </a>
        </button>
        <button style={{ margin: "10px", padding: "10px 20px" }}>
          <a 
            href={googleDriveLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Capstone Folder 2
          </a>
        </button>
        <button style={{ margin: "10px", padding: "10px 20px" }}>
          <a 
            href={googleDriveLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Capstone Folder 3
          </a>
        </button>
      </div>
    </div>
  );
}

export default App;
