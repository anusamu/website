const mongoose = require("mongoose");

const FooterLinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
  },
  { _id: false }
);

const FooterConfigSchema = new mongoose.Schema(
  {
    newsletterHeading: {
      type: String,
      default: "Review the Application & Contact Us",
    },
    categories: {
      type: [FooterLinkSchema],
      default: [
        { title: "Kanchipuram Saree", link: "/products?category=Kanchipuram Saree" },
        { title: "Cotton Saree", link: "/products?category=Cotton Saree" },
        { title: "Tissue Saree", link: "/products?category=Tissue Saree" },
        { title: "Kalyani Saree", link: "/products?category=Kalyani Saree" },
        { title: "Frock", link: "/products?category=Frock" },
        { title: "Pattu Pavadai", link: "/products?category=Pattu Pavadai" },
        { title: "Dhavani", link: "/products?category=Dhavani" },
        { title: "Set Mund", link: "/products?category=Set Mund" },
      ],
    },
    supportLinks: {
      type: [FooterLinkSchema],
      default: [
        { title: "Track Order", link: "/track-order" },
        { title: "Contact us", link: "/contact" },
        { title: "My Account", link: "/my-account" },
      ],
    },
    quickLinks: {
      type: [FooterLinkSchema],
      default: [
        { title: "About Us", link: "/about" },
        { title: "Brand Story", link: "/about" },
        { title: "Blog", link: "/blog" },
        { title: "Careers", link: "/contact" },
        { title: "Store Locator", link: "/contact" },
      ],
    },
    policyLinks: {
      type: [FooterLinkSchema],
      default: [
        { title: "FAQs", link: "/faqs" },
        { title: "Shipping Details", link: "/shipping-details" },
        { title: "Return, Exchange and Refund Policy", link: "/return-exchange-and-refund-policy" },
        { title: "Term of Use", link: "/term-of-use" },
        { title: "Privacy Policy", link: "/privacy-policy" },
        { title: "Cookie Policy", link: "/cookie-policy" },
      ],
    },
    contactEmail: {
      type: String,
      default: "rajagopalhandloom@gmail.com",
    },
    contactPhone: {
      type: String,
      default: "+91 9037569632",
    },
    contactHours: {
      type: String,
      default: "3:30 am - 9 pm, Monday - Sunday",
    },
    copyrightText: {
      type: String,
      default:
        "© 2026, RG Handloom . All Rights Reserved . Privacy policy . Refund policy . Terms of service . Shipping policy . Contact information",
    },
    socialLinks: {
      instagram: { type: String, default: "https://instagram.com" },
      facebook: { type: String, default: "https://facebook.com" },
      youtube: { type: String, default: "https://youtube.com" },
      twitter: { type: String, default: "https://twitter.com" },
      pinterest: { type: String, default: "https://pinterest.com" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FooterConfig", FooterConfigSchema);
