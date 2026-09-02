import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import CustomCursor from "../../../components/CustomCursor/CustomCursor";
import "./MyProfile.css";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await api.get("/profile");

      if (response.data.success) {
        setUser(response.data.user);
        setFormData({
          firstName: response.data.user.firstName || "",
          lastName: response.data.user.lastName || "",
          phoneNumber: response.data.user.phoneNumber || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(
        err.response?.data?.message || "Failed to load profile details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation for empty first name and phone number length
    if (!formData.firstName.trim()) {
      setUpdateMessage("First name cannot be empty.");
      return;
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.trim())) {
      setUpdateMessage("Phone number must be exactly 10 digits.");
      return;
    }

    setUpdateLoading(true);
    setUpdateMessage("");

    try {
      const response = await api.put("/profile", formData);

      if (response.data.success) {
        setUpdateMessage("Profile updated successfully!");
        setUser(response.data.user);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setUpdateMessage("");
        }, 1200);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateMessage(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="profile-page-wrapper">
      <CustomCursor />
      
      <header className="profile-header-container">
        <Navbar />
      </header>

      <main className="profile-main-content">
        <div className="profile-container">
          <h2 className="profile-title">My Profile</h2>

          {loading ? (
            <div className="profile-center-state">Loading profile...</div>
          ) : error ? (
            <div className="profile-center-state profile-error-state">{error}</div>
          ) : user ? (
            <div>
              {/* Profile Header Box */}
              <div className="profile-header">
                <div className="profile-header-left">
                  <div className="profile-avatar-box">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="profile-avatar-img"
                      />
                    ) : (
                      user.firstName?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="profile-email">{user.email}</p>
                    <span className="profile-role-badge">{user.role}</span>
                  </div>
                </div>

                <button 
                  className="profile-edit-btn"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile ✏️
                </button>
              </div>

              {/* Personal Details Grid */}
              <div className="profile-grid">
                <div className="profile-field-card">
                  <p className="profile-field-label">First Name</p>
                  <p className="profile-field-value">{user.firstName}</p>
                </div>
                <div className="profile-field-card">
                  <p className="profile-field-label">Last Name</p>
                  <p className="profile-field-value">{user.lastName || "N/A"}</p>
                </div>
                <div className="profile-field-card">
                  <p className="profile-field-label">Email Address</p>
                  <p className="profile-field-value">{user.email}</p>
                </div>
                <div className="profile-field-card">
                  <p className="profile-field-label">Phone Number</p>
                  <p className="profile-field-value">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div className="profile-field-card">
                  <p className="profile-field-label">Account Created</p>
                  <p className="profile-field-value">{formatDate(user.createdAt)}</p>
                </div>
                <div className="profile-field-card">
                  <p className="profile-field-label">Last Login</p>
                  <p className="profile-field-value">{formatDate(user.lastLogin)}</p>
                </div>
              </div>

              {/* Action Cards Section: My Orders & My Wishlist */}
              <div className="profile-action-section">
                <div 
                  className="profile-action-card" 
                  onClick={() => navigate("/MyOrders")}
                >
                  <div className="profile-action-content">
                    <h4>My Orders</h4>
                    <p>View your past purchases & track shipments</p>
                  </div>
                  <div className="profile-action-icon">📦</div>
                </div>

                <div 
                  className="profile-action-card" 
                  onClick={() => navigate("/myWishlist")}
                >
                  <div className="profile-action-content">
                    <h4>My Wishlist</h4>
                    <p>Manage items currently saved in your wishlist</p>
                  </div>
                  <div className="profile-action-icon">🛒</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="profile-center-state">No profile data available.</p>
          )}
        </div>
      </main>

      {/* Edit Profile Popup Modal */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <div className="profile-modal-header">
              <h3>Edit Profile</h3>
              <button 
                className="profile-modal-close" 
                onClick={() => setIsEditModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="profile-modal-form">
              <div className="profile-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="profile-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>

              {updateMessage && (
                <p className={`profile-form-msg ${updateMessage.includes("success") ? "success" : "error"}`}>
                  {updateMessage}
                </p>
              )}

              <div className="profile-modal-actions">
                <button 
                  type="button" 
                  className="profile-cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="profile-save-btn"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="profile-footer-container">
        <Footer />
      </footer>
    </div>
  );
};

export default MyProfile;