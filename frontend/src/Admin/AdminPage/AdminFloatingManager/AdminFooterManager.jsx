import React, { useState, useEffect } from "react";
import api from "../../../api";
import "./AdminFooterManager.css";

const AdminFooterManager = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [newsletterHeading, setNewsletterHeading] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactHours, setContactHours] = useState("");
  const [copyrightText, setCopyrightText] = useState("");

  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    youtube: "",
    twitter: "",
    pinterest: "",
  });

  const [categories, setCategories] = useState([]);
  const [supportLinks, setSupportLinks] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [policyLinks, setPolicyLinks] = useState([]);

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const res = await api.get("/footer");
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setNewsletterHeading(d.newsletterHeading || "");
        setContactEmail(d.contactEmail || "");
        setContactPhone(d.contactPhone || "");
        setContactHours(d.contactHours || "");
        setCopyrightText(d.copyrightText || "");
        setSocialLinks(d.socialLinks || {});
        setCategories(d.categories || []);
        setSupportLinks(d.supportLinks || []);
        setQuickLinks(d.quickLinks || []);
        setPolicyLinks(d.policyLinks || []);
      }
    } catch (err) {
      console.error("Error fetching footer data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for link array modifications
  const handleLinkChange = (setter, list, index, field, value) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
  };

  const handleAddLink = (setter, list) => {
    setter([...list, { title: "New Link", link: "/" }]);
  };

  const handleRemoveLink = (setter, list, index) => {
    const updated = [...list];
    updated.splice(index, 1);
    setter(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg("");

      const payload = {
        newsletterHeading,
        contactEmail,
        contactPhone,
        contactHours,
        copyrightText,
        socialLinks,
        categories,
        supportLinks,
        quickLinks,
        policyLinks,
      };

      const res = await api.put("/admin/footer", payload);
      if (res.data?.success) {
        setSuccessMsg("Footer updated successfully! Changes are live on the website.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Error updating footer:", err);
      alert(err.response?.data?.message || "Failed to update footer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-footer-loading">Loading footer configuration...</div>;
  }

  return (
    <div className="admin-footer-manager">
      <div className="footer-mgr-header">
        <div>
          <h2>Manage Website Footer</h2>
          <p className="footer-mgr-subtitle">
            Customize column links, contact information, social links, newsletter text, and copyright details without touching code.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="footer-save-top-btn"
        >
          {saving ? "Saving Changes..." : "Save Footer"}
        </button>
      </div>

      {successMsg && <div className="footer-success-banner">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="footer-mgr-form">
        {/* SECTION 1: TOP NEWSLETTER HEADING */}
        <div className="footer-section-card">
          <h3>1. Top Banner / Newsletter Heading</h3>
          <div className="footer-input-group">
            <label>Newsletter Title</label>
            <input
              type="text"
              value={newsletterHeading}
              onChange={(e) => setNewsletterHeading(e.target.value)}
              placeholder="e.g. Review the Application & Contact Us"
              required
            />
          </div>
        </div>

        {/* SECTION 2: CONTACT DETAILS */}
        <div className="footer-section-card">
          <h3>2. Contact Details (Column 5)</h3>
          <div className="footer-grid-3">
            <div className="footer-input-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="rajagopalhandloom@gmail.com"
              />
            </div>
            <div className="footer-input-group">
              <label>Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 9037569632"
              />
            </div>
            <div className="footer-input-group">
              <label>Working Hours Text</label>
              <input
                type="text"
                value={contactHours}
                onChange={(e) => setContactHours(e.target.value)}
                placeholder="3:30 am - 9 pm, Monday - Sunday"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: EDITABLE COLUMNS */}
        <div className="footer-columns-grid">
          {/* Column 1: Categories */}
          <div className="footer-col-card">
            <div className="col-card-header">
              <h4>Column 1: Categories ({categories.length})</h4>
              <button
                type="button"
                className="add-link-btn"
                onClick={() => handleAddLink(setCategories, categories)}
              >
                + Add Item
              </button>
            </div>
            <div className="links-edit-list">
              {categories.map((item, idx) => (
                <div key={idx} className="link-item-row">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleLinkChange(setCategories, categories, idx, "title", e.target.value)
                    }
                    className="link-title-input"
                  />
                  <input
                    type="text"
                    placeholder="URL / Path"
                    value={item.link}
                    onChange={(e) =>
                      handleLinkChange(setCategories, categories, idx, "link", e.target.value)
                    }
                    className="link-url-input"
                  />
                  <button
                    type="button"
                    className="remove-link-btn"
                    onClick={() => handleRemoveLink(setCategories, categories, idx)}
                    title="Remove link"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Support */}
          <div className="footer-col-card">
            <div className="col-card-header">
              <h4>Column 2: Support ({supportLinks.length})</h4>
              <button
                type="button"
                className="add-link-btn"
                onClick={() => handleAddLink(setSupportLinks, supportLinks)}
              >
                + Add Item
              </button>
            </div>
            <div className="links-edit-list">
              {supportLinks.map((item, idx) => (
                <div key={idx} className="link-item-row">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleLinkChange(setSupportLinks, supportLinks, idx, "title", e.target.value)
                    }
                    className="link-title-input"
                  />
                  <input
                    type="text"
                    placeholder="URL / Path"
                    value={item.link}
                    onChange={(e) =>
                      handleLinkChange(setSupportLinks, supportLinks, idx, "link", e.target.value)
                    }
                    className="link-url-input"
                  />
                  <button
                    type="button"
                    className="remove-link-btn"
                    onClick={() => handleRemoveLink(setSupportLinks, supportLinks, idx)}
                    title="Remove link"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="footer-col-card">
            <div className="col-card-header">
              <h4>Column 3: Quick Links ({quickLinks.length})</h4>
              <button
                type="button"
                className="add-link-btn"
                onClick={() => handleAddLink(setQuickLinks, quickLinks)}
              >
                + Add Item
              </button>
            </div>
            <div className="links-edit-list">
              {quickLinks.map((item, idx) => (
                <div key={idx} className="link-item-row">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleLinkChange(setQuickLinks, quickLinks, idx, "title", e.target.value)
                    }
                    className="link-title-input"
                  />
                  <input
                    type="text"
                    placeholder="URL / Path"
                    value={item.link}
                    onChange={(e) =>
                      handleLinkChange(setQuickLinks, quickLinks, idx, "link", e.target.value)
                    }
                    className="link-url-input"
                  />
                  <button
                    type="button"
                    className="remove-link-btn"
                    onClick={() => handleRemoveLink(setQuickLinks, quickLinks, idx)}
                    title="Remove link"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Policies */}
          <div className="footer-col-card">
            <div className="col-card-header">
              <h4>Column 4: Our Policies ({policyLinks.length})</h4>
              <button
                type="button"
                className="add-link-btn"
                onClick={() => handleAddLink(setPolicyLinks, policyLinks)}
              >
                + Add Item
              </button>
            </div>
            <div className="links-edit-list">
              {policyLinks.map((item, idx) => (
                <div key={idx} className="link-item-row">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleLinkChange(setPolicyLinks, policyLinks, idx, "title", e.target.value)
                    }
                    className="link-title-input"
                  />
                  <input
                    type="text"
                    placeholder="URL / Path"
                    value={item.link}
                    onChange={(e) =>
                      handleLinkChange(setPolicyLinks, policyLinks, idx, "link", e.target.value)
                    }
                    className="link-url-input"
                  />
                  <button
                    type="button"
                    className="remove-link-btn"
                    onClick={() => handleRemoveLink(setPolicyLinks, policyLinks, idx)}
                    title="Remove link"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: SOCIAL MEDIA LINKS */}
        <div className="footer-section-card">
          <h3>3. Social Media Links</h3>
          <div className="footer-grid-2">
            <div className="footer-input-group">
              <label>Instagram URL</label>
              <input
                type="url"
                value={socialLinks.instagram || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, instagram: e.target.value })
                }
                placeholder="https://instagram.com/rajagpalhandlomm"
              />
            </div>
            <div className="footer-input-group">
              <label>Facebook URL</label>
              <input
                type="url"
                value={socialLinks.facebook || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, facebook: e.target.value })
                }
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="footer-input-group">
              <label>YouTube URL</label>
              <input
                type="url"
                value={socialLinks.youtube || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, youtube: e.target.value })
                }
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="footer-input-group">
              <label>Twitter / X URL</label>
              <input
                type="url"
                value={socialLinks.twitter || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, twitter: e.target.value })
                }
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="footer-input-group">
              <label>Pinterest URL</label>
              <input
                type="url"
                value={socialLinks.pinterest || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, pinterest: e.target.value })
                }
                placeholder="https://pinterest.com/..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: COPYRIGHT TEXT */}
        <div className="footer-section-card">
          <h3>4. Copyright & Bottom Legal Notice</h3>
          <div className="footer-input-group">
            <label>Bottom Bar Notice</label>
            <textarea
              rows="3"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              placeholder="© 2026, RG Handloom . All Rights Reserved..."
            />
          </div>
        </div>

        <div className="footer-submit-bar">
          <button type="submit" disabled={saving} className="footer-save-main-btn">
            {saving ? "Saving Changes..." : "Save Footer Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFooterManager;
