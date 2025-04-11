import React, { useState } from 'react';

const AddMaterial = () => {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object and populate it with form fields
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('title', title);
    formData.append('content', content);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      // Make the POST request to the backend
      const response = await fetch('http://localhost:5000/materials', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        // On success, display the success message and clear form fields
        setMessage(data.message);
        setError('');
        setSubject('');
        setTitle('');
        setContent('');
        setAttachment(null);
      } else {
        // On error, display the error message
        setError(data.message);
        setMessage('');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
      setMessage('');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add New Material</h2>
      {/* Notification messages */}
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
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
          ></textarea>
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
        <button type="submit" className="btn btn-primary mt-2">Submit</button>
      </form>
    </div>
  );
};

export default AddMaterial;
