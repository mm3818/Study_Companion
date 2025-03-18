import React, { useState } from 'react';

function AddMaterial() {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('title', title);
    formData.append('content', content);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    fetch('http://localhost:5000/materials', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        alert("Material added successfully");
        setSubject('');
        setTitle('');
        setContent('');
        setAttachment(null);
      })
      .catch(err => console.error("Error adding material:", err));
  };

  return (
    <div>
      <h2>Add New Material</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Subject:</label>
          <input 
            type="text" 
            className="form-control" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Title:</label>
          <input 
            type="text" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Content:</label>
          <textarea 
            className="form-control" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Attachment (PDF, PPT, PPTX):</label>
          <input 
            type="file" 
            className="form-control-file" 
            onChange={(e) => setAttachment(e.target.files[0])} 
            accept=".pdf,.ppt,.pptx"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2">Add Material</button>
      </form>
    </div>
  );
}

export default AddMaterial;
