import React, { useState, useEffect } from "react";
import api from "../../../api";
import "./AdminBlogManager.css";

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");
  const [readingTime, setReadingTime] = useState("5 mins");
  const [coverImageFile, setCoverImageFile] = useState(null);
  
  // Sections: { text: string, imageFile: File | null, existingImageUrl: string }
  const [sections, setSections] = useState([{ text: "", imageFile: null, existingImageUrl: "" }]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      if (res.data.success) {
        setBlogs(res.data.blogs);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { text: "", imageFile: null, existingImageUrl: "" }]);
  };

  const handleRemoveSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const handleSectionTextChange = (index, val) => {
    const updated = [...sections];
    updated[index].text = val;
    setSections(updated);
  };

  const handleSectionImageChange = (index, file) => {
    const updated = [...sections];
    updated[index].imageFile = file;
    setSections(updated);
  };

  const resetForm = () => {
    setTitle("");
    setSnippet("");
    setReadingTime("5 mins");
    setCoverImageFile(null);
    setSections([{ text: "", imageFile: null, existingImageUrl: "" }]);
    setIsEditing(false);
    setCurrentBlogId(null);
  };

  const handleEdit = (blog) => {
    setIsEditing(true);
    setCurrentBlogId(blog._id);
    setTitle(blog.title);
    setSnippet(blog.snippet);
    setReadingTime(blog.readingTime);
    setCoverImageFile(null);
    
    if (blog.sections && blog.sections.length > 0) {
      setSections(blog.sections.map(s => ({
        text: s.text || "",
        imageFile: null,
        existingImageUrl: s.imageUrl || ""
      })));
    } else {
      setSections([{ text: "", imageFile: null, existingImageUrl: "" }]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append("title", title);
    formData.append("snippet", snippet);
    formData.append("readingTime", readingTime);

    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }

    // Pass sections as JSON (only text and existing URLs)
    const sectionData = sections.map(s => ({
      text: s.text,
      imageUrl: s.existingImageUrl
    }));
    formData.append("sections", JSON.stringify(sectionData));

    // Append new section image files dynamically
    sections.forEach((sec, index) => {
      if (sec.imageFile) {
        formData.append(`sectionImage_${index}`, sec.imageFile);
      }
    });

    try {
      if (isEditing) {
        // If editing but didn't select new cover, keep old
        const blogToEdit = blogs.find(b => b._id === currentBlogId);
        if (blogToEdit && !coverImageFile) {
          formData.append("existingCoverImage", blogToEdit.coverImage);
        }

        await api.put(`/blogs/${currentBlogId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      } else {
        await api.post("/blogs", formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error("Error saving blog:", err);
      alert("Error saving blog. Check console.");
    }
  };

  return (
    <div className="admin-blog-container">
      <h2>{isEditing ? "Edit Blog Post" : "Add New Blog Post"}</h2>

      <form onSubmit={handleSubmit} className="admin-blog-form">
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <input
          type="text"
          placeholder="Short Snippet (for grid view)"
          value={snippet}
          onChange={(e) => setSnippet(e.target.value)}
          required
        />
        
        <input
          type="text"
          placeholder="Reading Time (e.g. 7-10 mins)"
          value={readingTime}
          onChange={(e) => setReadingTime(e.target.value)}
        />

        <div className="file-input-group">
          <label>Cover Image (Required for new blogs):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImageFile(e.target.files[0])}
            required={!isEditing}
          />
        </div>

        <div className="blog-sections-editor">
          <h3>Blog Content (Sections)</h3>
          {sections.map((sec, index) => (
            <div key={index} className="blog-section-block">
              <h4>Section {index + 1}</h4>
              <textarea
                placeholder="Paragraph text..."
                value={sec.text}
                onChange={(e) => handleSectionTextChange(index, e.target.value)}
                rows={4}
              />
              <div className="file-input-group">
                <label>Section Image (Optional):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSectionImageChange(index, e.target.files[0])}
                />
                {sec.existingImageUrl && !sec.imageFile && (
                  <span className="existing-img-note">Existing Image uploaded.</span>
                )}
              </div>
              {sections.length > 1 && (
                <button type="button" className="btn-remove-section" onClick={() => handleRemoveSection(index)}>
                  Remove Section
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-section" onClick={handleAddSection}>
            + Add Another Section
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit-blog">
            {isEditing ? "Update Blog" : "Publish Blog"}
          </button>
          {isEditing && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="admin-blogs-list">
        <h3>Existing Blogs</h3>
        <table>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>
                  <img src={blog.coverImage} alt="cover" className="admin-preview-img" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                </td>
                <td>{blog.title}</td>
                <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(blog)}>Edit</button>
                  <button onClick={() => handleDelete(blog._id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No blogs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBlogManager;
