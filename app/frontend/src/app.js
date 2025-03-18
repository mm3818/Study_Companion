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
