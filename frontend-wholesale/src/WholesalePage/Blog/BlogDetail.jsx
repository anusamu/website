import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import api from "../../api";
import "./BlogDetail.css";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${id}`);
        if (res.data.success) {
          setBlog(res.data.blog);
        }
      } catch (err) {
        console.error("Failed to fetch blog detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="blog-page-wrapper">
        <Navbar />
        <div className="blog-detail-loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-page-wrapper">
        <Navbar />
        <div className="blog-detail-not-found">
          <h2>Blog not found</h2>
          <button onClick={() => navigate('/blog')} className="back-to-blogs">Back to Blogs</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-page-wrapper">
      <Navbar />
      
      <div className="blog-detail-container">
        
        {/* Cover Image Banner */}
        <div className="blog-detail-cover">
          <img src={blog.coverImage} alt={blog.title} />
        </div>

        <div className="blog-detail-content-wrapper">
          {/* Header section */}
          <h1 className="blog-detail-title">{blog.title}</h1>
          
          <div className="blog-detail-meta">
            <span className="blog-date">
              Date {new Date(blog.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </span>
            <span className="blog-reading-time">
              Reading time: {blog.readingTime}
            </span>
          </div>

          {/* Dynamic Content Sections */}
          <div className="blog-detail-body">
            {blog.sections && blog.sections.map((sec, index) => (
              <div key={index} className="blog-section">
                {sec.text && <p className="blog-section-text">{sec.text}</p>}
                {sec.imageUrl && (
                  <div className="blog-section-image-wrapper">
                    <img src={sec.imageUrl} alt={`section-${index}`} className="blog-section-image" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetail;
