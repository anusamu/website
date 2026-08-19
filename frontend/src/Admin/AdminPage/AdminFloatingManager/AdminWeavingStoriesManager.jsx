import React, { useState, useEffect } from "react";
import "./AdminFloatingManager.css";

const AdminWeavingStoriesManager = () => {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const backendUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

  const fetchItems = () => {
    const token = localStorage.getItem("token");
    fetch(`${apiUrl}/weaving-stories/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => data.success && setItems(data.data))
      .catch(err => console.error("Error fetching weaving stories:", err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image file");

    const formData = new FormData();
    formData.append("imageFile", file);

    const token = localStorage.getItem("token");
    const res = await fetch(`${apiUrl}/weaving-stories/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setFile(null);
      // reset file input visually
      e.target.reset();
      fetchItems();
    }
  };

  const handleToggle = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${apiUrl}/weaving-stories/toggle/${id}`, { 
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this story?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${apiUrl}/weaving-stories/delete/${id}`, { 
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  };

  return (
    <div className="admin-floating-container">
      <h2>Manage Weaving Stories</h2>

      <form onSubmit={handleSubmit} className="admin-floating-form">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload New Story</button>
      </form>

      <div className="admin-items-list">
        <h3>Existing Weaving Stories</h3>
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Likes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={item.imageUrl}
                    alt="Story"
                    className="admin-preview-img"
                    style={{ width: "80px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                  />
                </td>
                <td>{item.likes}</td>
                <td>{item.isActive ? "Active" : "Disabled"}</td>
                <td>
                  <button onClick={() => handleToggle(item._id)}>
                    {item.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWeavingStoriesManager;
