import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddAdmin.css";
import api from "../../../api";

export default function AddAdmin() {
  // --- UI States ---
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- Modal Visibility States ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- Form Handlers ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    permissions: ["user_read"]
  });
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  // --- Auth Token Retrieval Helper ---
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  // --- API Sync Operations ---
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/", {
        headers: getAuthHeader()
      });
      
      const data = response?.data;
      if (!data) {
        setAdmins([]);
        return;
      }

      if (Array.isArray(data)) {
        setAdmins(data);
      } else if (data.admins && Array.isArray(data.admins)) {
        setAdmins(data.admins);
      } else if (data.data && Array.isArray(data.data)) {
        setAdmins(data.data);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Error accessing backend records.";
      toast.error(errorMsg);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const executionWrapper = async () => {
      if (isMounted) {
        await fetchAdmins();
      }
    };
    executionWrapper();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/addadmin", formData, {
        headers: getAuthHeader()
      });

      toast.success(`Account successfully provisioned for ${formData.firstName}!`);
      setIsCreateModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to provision security account.";
      toast.error(errorMsg);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/editadmin/${selectedAdminId}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        permissions: formData.permissions
      }, {
        headers: getAuthHeader()
      });

      toast.info("System settings updated successfully.");
      setIsEditModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to apply modifications.";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you certain you want to revoke system privileges for ${name}?`)) {
      try {
        await api.delete(`/admin/editadmin/${id}`, {
          headers: getAuthHeader()
        });

        toast.warn(`System privileges revoked for ${name}.`);
        fetchAdmins();
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to eliminate system profile.";
        toast.error(errorMsg);
      }
    }
  };

  const handlePermissionChange = (perm) => {
    setFormData(prev => {
      const alreadyHas = prev.permissions.includes(perm);
      const updatedPerms = alreadyHas 
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: updatedPerms };
    });
  };

  const handleEditClick = (admin) => {
    setSelectedAdminId(admin._id);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      password: "", 
      permissions: admin.permissions || []
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "", permissions: ["user_read"] });
    setSelectedAdminId(null);
  };

  const filteredAdmins = admins.filter(admin => 
    `${admin.firstName} ${admin.lastName} ${admin.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-workspace-full">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <main className="widescreen-container">
        <div className="workspace-header">
          <div>
            <h2 className="view-title">Administrative Registry</h2>
            <p className="view-subtitle">Provision system security scopes, edit dynamic roles, and monitor deployment permission structures.</p>
          </div>
          <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="mui-button mui-button-contained">
            <span>➕</span> Add Admin
          </button>
        </div>

        <div className="mui-surface-card">
          <div className="card-filter-strip">
            <div className="search-field-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search administrators by name or context..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-field-input"
              />
            </div>
            <div className="badge-counter">
              Active Records: <strong>{filteredAdmins.length}</strong>
            </div>
          </div>

          <div className="responsive-table-scroll">
            <table className="mui-data-table">
              <thead>
                <tr>
                  <th>Identity Context</th>
                  <th>System Role</th>
                  <th>Permission Cleared Matrix</th>
                  <th className="text-right-aligned">Action Control</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="table-state-msg">Syncing database registers...</td></tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr><td colSpan="4" className="table-state-msg">No administrators registered in this branch.</td></tr>
                ) : filteredAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td>
                      <div className="user-profile-block">
                        <div className="user-avatar-circle">
                          {admin.firstName ? admin.firstName[0] : "A"}
                        </div>
                        <div>
                          <span className="user-fullname">{admin.firstName} {admin.lastName}</span>
                          <span className="user-subtext">{admin.email} • {admin.phoneNumber || "No Contact Link"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`mui-chip ${(admin.role || "Admin").toLowerCase()}`}>
                        {admin.role || "ADMIN"}
                      </span>
                    </td>
                    <td>
                      <div className="chips-matrix-container">
                        {(admin.permissions || []).map((perm, index) => (
                          <span key={index} className="matrix-pill">{perm.replace("_", " ")}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right-aligned actions-cell">
                      {admin.role === "SuperAdmin" ? (
                        <span className="immutable-flag">System Account Locked</span>
                      ) : (
                        <div className="action-buttons-group">
                          <button onClick={() => handleEditClick(admin)} className="icon-action-btn edit" title="Edit Parameters">✏️</button>
                          <button onClick={() => handleDelete(admin._id, `${admin.firstName} ${admin.lastName}`)} className="icon-action-btn delete" title="Revoke Access">🗑️</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="mui-backdrop">
          <div className="mui-modal-paper">
            <div className="modal-top-bar">
              <h3>🔒 Provision Admin Account</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="modal-close-cross">✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="mui-form">
              <div className="mui-form-row">
                <div className="mui-form-group">
                  <label>First Name</label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Jane" />
                </div>
                <div className="mui-form-group">
                  <label>Last Name</label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Smith" />
                </div>
              </div>
              <div className="mui-form-group">
                <label>Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="jane.smith@domain.com" />
              </div>
              <div className="mui-form-group">
                <label>Phone Contact Link</label>
                <input type="text" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 (555) 234-5678" />
              </div>
              <div className="mui-form-group">
                <label>Password Initialization</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="mui-form-group">
                <label>Dynamic Cleared Scope Matrix</label>
                <div className="matrix-selection-box">
                  {["user_read", "user_write", "billing_edit", "access_logs"].map((perm) => (
                    <label key={perm} className="mui-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        checked={formData.permissions.includes(perm)} 
                        onChange={() => handlePermissionChange(perm)} 
                      />
                      <span>{perm.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-action-row">
                <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="mui-btn-text">Abort</button>
                <button type="submit" className="mui-button mui-button-contained">Deploy Operator</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="mui-backdrop">
          <div className="mui-modal-paper">
            <div className="modal-top-bar">
              <h3>📝 Adjust Operational Fields</h3>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="modal-close-cross">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="mui-form">
              <div className="mui-form-row">
                <div className="mui-form-group">
                  <label>First Name</label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="mui-form-group">
                  <label>Last Name</label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="mui-form-group">
                <label>Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="mui-form-group">
                <label>Phone Contact Link</label>
                <input type="text" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
              </div>
              <div className="mui-form-group">
                <label>Modify Cleared Scope Matrix</label>
                <div className="matrix-selection-box">
                  {["user_read", "user_write", "billing_edit", "access_logs"].map((perm) => (
                    <label key={perm} className="mui-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        checked={formData.permissions.includes(perm)} 
                        onChange={() => handlePermissionChange(perm)} 
                      />
                      <span>{perm.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-action-row">
                <button type="button" onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="mui-btn-text">Discard</button>
                <button type="submit" className="mui-button mui-button-contained">Commit Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}