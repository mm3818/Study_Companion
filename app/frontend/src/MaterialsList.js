import React, { useEffect, useState } from 'react';

function MaterialsList() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');

  const fetchMaterials = () => {
    let url = 'http://localhost:5000/materials';
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length) url += '?' + params.join('&');
    
    fetch(url)
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error("Error fetching materials:", err));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const addFavorite = (materialId) => {
    fetch('http://localhost:5000/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ material_id: materialId }),
    })
      .then(res => res.json())
      .then(() => alert("Added to favorites"))
      .catch(err => console.error("Error adding favorite:", err));
  };

  return (
    <div>
      <h2>Study Materials</h2>
      <form onSubmit={handleSearch} className="form-inline mb-3">
        <input 
          type="text" 
          className="form-control mr-2" 
          placeholder="Search title or content" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <input 
          type="text" 
          className="form-control mr-2" 
          placeholder="Subject (folder)" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {materials.length === 0 ? (
        <p>No materials found.</p>
      ) : (
        materials.map(material => (
          <div key={material.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{material.title}</h5>
              <h6 className="card-subtitle mb-2 text-muted">Subject: {material.subject}</h6>
              <p className="card-text">{material.content}</p>
              {material.attachment && (
                <a href={material.attachment} target="_blank" rel="noopener noreferrer">
                  Download Attachment
                </a>
              )}
              <button className="btn btn-outline-success ml-3" onClick={() => addFavorite(material.id)}>
                Add to Favorites
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MaterialsList;
