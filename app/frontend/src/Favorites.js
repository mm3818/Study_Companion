import React, { useEffect, useState } from 'react';

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = () => {
    fetch('http://localhost:5000/favorites')
      .then(res => res.json())
      .then(data => setFavorites(data))
      .catch(err => console.error("Error fetching favorites:", err));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div>
      <h2>Your Favorites</h2>
      {favorites.length === 0 ? (
        <p>No favorites added.</p>
      ) : (
        favorites.map(item => (
          <div key={item.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{item.title}</h5>
              <h6 className="card-subtitle mb-2 text-muted">Subject: {item.subject}</h6>
              <p className="card-text">{item.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Favorites;
