<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import MaterialsList from './MaterialsList';
import Favorites from './Favorites';
import AddMaterial from './AddMaterial';

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand" to="/">Study Companion</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/materials">Materials</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/favorites">Favorites</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/add">Add Material</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/materials" element={<MaterialsList />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/add" element={<AddMaterial />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
=======
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
>>>>>>> 202fe499efc4f66ea4434e0f977621848efcd932
