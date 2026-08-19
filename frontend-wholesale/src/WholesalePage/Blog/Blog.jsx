import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import api from "../../api";
import "./Blog.css";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        if (res.data.success) {
          setBlogs(res.data.blogs);
        }
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="blog-page-wrapper">
      <Navbar />
      
      {/* Blog Hero Section */}
      <div className="blog-hero">
        <h1 className="blog-hero-title">Discover the stories woven into every thread.</h1>
      </div>

      {/* Blog Grid */}
      <div className="blog-container">
        {blogs.length === 0 ? (
          <div className="no-blogs">No blogs available at the moment.</div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <div 
                key={blog._id} 
                className="blog-card" 
                onClick={() => navigate(`/blog/${blog.slug}`)}
              >
                <div className="blog-card-image-wrapper">
                  <img src={blog.coverImage} alt={blog.title} className="blog-card-image" />
                </div>
                <div className="blog-card-content">
                  <h2 className="blog-card-title">{blog.title}</h2>
                  <p className="blog-card-snippet">{blog.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
