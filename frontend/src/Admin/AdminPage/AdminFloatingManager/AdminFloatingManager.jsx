import React, { useState, useEffect } from "react";
import "./AdminFloatingManager.css";
import AdminBlogManager from "../AdminBlogManager/AdminBlogManager";

const AdminFloatingManager = () => {
  const [activeTab, setActiveTab] = useState("floating"); // 'floating' or 'blog'
  
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("emoji");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [particleSymbol, setParticleSymbol] = useState("✨");

  const fetchItems = () => {
    fetch("http://localhost:5000/api/floating/all")
      .then((res) => res.json())
      .then((data) => data.success && setItems(data.data));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("particleSymbol", particleSymbol);

    if (type === "emoji") {
      formData.append("content", content);
    } else if (file) {
      formData.append("imageFile", file);
    }

    const res = await fetch("http://localhost:5000/api/floating/create", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setTitle("");
      setContent("");
      setFile(null);
      fetchItems();
    }
  };

  const handleToggle = async (id) => {
    await fetch(`http://localhost:5000/api/floating/toggle/${id}`, { method: "PATCH" });
    fetchItems();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/floating/delete/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <div className="ui-editz-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab("floating")}
          style={{ padding: '10px 20px', background: activeTab === 'floating' ? '#111' : '#f1f1f1', color: activeTab === 'floating' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Floating Animation
        </button>
        <button 
          onClick={() => setActiveTab("blog")}
          style={{ padding: '10px 20px', background: activeTab === 'blog' ? '#111' : '#f1f1f1', color: activeTab === 'blog' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Blog Manager
        </button>
      </div>

      {activeTab === "floating" && (
        <div className="admin-floating-container">
          <h2>Manage Floating Animation Items</h2>

      <form onSubmit={handleSubmit} className="admin-floating-form">
        <input
          type="text"
          placeholder="Title (e.g. Spring Blossom)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="emoji">Emoji</option>
          
        </select>

        {type === "emoji" ? (
          <input
            type="text"
            placeholder="Paste Emoji (e.g. 🌸)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        ) : (
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        )}

        <input
          type="text"
          placeholder="Click Particle Effect Symbol (Default ✨)"
          value={particleSymbol}
          onChange={(e) => setParticleSymbol(e.target.value)}
        />

        <button type="submit">Add Animation Item</button>
      </form>

      <div className="admin-items-list">
        <h3>Existing Floating Items</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Preview</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>
                  {item.type === "image" ? (
                    <img src={`http://localhost:5000${item.content}`} alt="" className="admin-preview-img" />
                  ) : (
                    item.content
                  )}
                </td>
                <td>{item.isActive ? "Active" : "Disabled"}</td>
                <td>
                  <button onClick={() => handleToggle(item._id)}>
                    {item.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      )}

      {activeTab === "blog" && (
        <AdminBlogManager />
      )}
    </div>
  );
};

export default AdminFloatingManager;