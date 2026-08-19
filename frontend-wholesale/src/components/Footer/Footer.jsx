import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../../api";

// Separated External CSS File Linkage
import "./Footer.css";

const defaultFooterData = {
  newsletterHeading: "Review the Application & Contact Us",
  categories: [
    { title: "Kanchipuram Saree", link: "/products?category=Kanchipuram Saree" },
    { title: "Cotton Saree", link: "/products?category=Cotton Saree" },
    { title: "Tissue Saree", link: "/products?category=Tissue Saree" },
    { title: "Kalyani Saree", link: "/products?category=Kalyani Saree" },
    { title: "Frock", link: "/products?category=Frock" },
    { title: "Pattu Pavadai", link: "/products?category=Pattu Pavadai" },
    { title: "Dhavani", link: "/products?category=Dhavani" },
    { title: "Set Mund", link: "/products?category=Set Mund" },
  ],
  supportLinks: [
    { title: "Track Order", link: "/track-order" },
    { title: "Contact us", link: "/contact" },
    { title: "My Account", link: "/my-account" },
  ],
  quickLinks: [
    { title: "About Us", link: "/about" },
    { title: "Brand Story", link: "/about" },
    { title: "Blog", link: "/blog" },
    { title: "Careers", link: "/contact" },
    { title: "Store Locator", link: "/contact" },
  ],
  policyLinks: [
    { title: "FAQs", link: "/faqs" },
    { title: "Shipping Details", link: "/shipping-details" },
    { title: "Return, Exchange and Refund Policy", link: "/return-exchange-and-refund-policy" },
    { title: "Term of Use", link: "/term-of-use" },
    { title: "Privacy Policy", link: "/privacy-policy" },
    { title: "Cookie Policy", link: "/cookie-policy" },
  ],
  contactEmail: "rajagopalhandloom@gmail.com",
  contactPhone: "+91 9037569632",
  contactHours: "3:30 am - 9 pm, Monday - Sunday",
  copyrightText:
    "© 2026, RG Handloom . All Rights Reserved . Privacy policy . Refund policy . Terms of service . Shipping policy . Contact information",
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    pinterest: "https://pinterest.com",
  },
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [footerData, setFooterData] = useState(defaultFooterData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await api.get("/footer");
        if (res.data?.success && res.data?.data) {
          setFooterData((prev) => ({
            ...prev,
            ...res.data.data,
            socialLinks: {
              ...prev.socialLinks,
              ...(res.data.data.socialLinks || {}),
            },
          }));
        }
      } catch (err) {
        console.error("Error loading footer configuration:", err);
      }
    };

    fetchFooter();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Redirect to contact page and pass the entered email
    navigate("/contact", { state: { email } });
  };

  const {
    newsletterHeading,
    categories,
    supportLinks,
    quickLinks,
    policyLinks,
    contactEmail,
    contactPhone,
    contactHours,
    copyrightText,
    socialLinks,
  } = footerData;

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* --- TOP SECTION: Newsletter Subscription Row --- */}
        <div className="footer-newsletter-row">
          <div className="newsletter-title-box">
            <h3 className="newsletter-heading">
              {newsletterHeading || "Review the Application & Contact Us"}
            </h3>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
            />
            <button
              type="submit"
              className="newsletter-submit-btn"
              aria-label="Submit Newsletter"
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </form>
        </div>

        {/* --- MIDDLE SECTION: 5-Column Grid Layout --- */}
        <div className="footer-links-grid">
          {/* Column 1: Categories */}
          <div>
            <h4 className="footer-column-title">Categories</h4>
            <ul className="footer-links-list">
              {(categories || []).map((item, idx) => (
                <li key={item._id || item.title || idx}>
                  <Link to={item.link || `/products?category=${encodeURIComponent(item.title)}`}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Support */}
          <div>
            <h4 className="footer-column-title">Support</h4>
            <ul className="footer-links-list">
              {(supportLinks || []).map((item, idx) => (
                <li key={item._id || item.title || idx}>
                  <Link to={item.link || `/${item.title.toLowerCase().replace(" ", "-")}`}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links-list">
              {(quickLinks || []).map((item, idx) => (
                <li key={item._id || item.title || idx}>
                  <Link to={item.link || `/${item.title.toLowerCase().replace(" ", "-")}`}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Our Policies */}
          <div>
            <h4 className="footer-column-title">Our Policies</h4>
            <ul className="footer-links-list">
              {(policyLinks || []).map((item, idx) => (
                <li key={item._id || item.title || idx}>
                  <Link
                    to={
                      item.link ||
                      `/${item.title.toLowerCase().replaceAll(" ", "-").replaceAll(",", "")}`
                    }
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div className="contact-column-special">
            <h4 className="footer-column-title">Contact</h4>
            <ul className="footer-links-list contact-list-special">
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a href={`tel:${contactPhone}`}>Call us at : {contactPhone}</a>
                </li>
              )}
              {contactHours && <li className="contact-hours-text">{contactHours}</li>}
            </ul>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Copyright & Social Tray --- */}
        <div className="footer-bottom-row">
          <div>
            <p>{copyrightText}</p>
          </div>

          {/* Custom vector UI icon collection */}
          <div className="social-media-tray">
            {/* Instagram */}
            {socialLinks?.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            )}

            {/* Facebook */}
            {socialLinks?.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            )}

            {/* Youtube */}
            {socialLinks?.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            )}

            {/* X (Formerly Twitter) */}
            {socialLinks?.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}

            {/* Pinterest */}
            {socialLinks?.pinterest && (
              <a
                href={socialLinks.pinterest}
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}