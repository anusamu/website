import React from 'react';
import './About.css';
import aboutBannerImg from '../../assets/aboutbanner.jpg';
import brandBannerImg from '../../assets/about_lower_Image.png';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        {/* Top Tagline Section */}
        <section className="tagline-section">
          <h1 className="main-tagline">
            Every Thread Tells a Story of Tradition,<br />
            Craftsmanship, and Timeless Elegance.
          </h1>
          <div className="hero-image-wrapper">
            <img
              src={aboutBannerImg}
              alt="Artisan weaver standard loom"
              className="hero-image"
            />
          </div>
        </section>

        {/* Main Content Section */}
        <section className="content-section">
          <h2 className="section-title">
            <span className="text-dark">About </span>
            <span className="text-olive">Handloom Tradition</span>
          </h2>

          <div className="text-body">
            <p>
              Established in 1996 amidst the spiritual and cultural grandeur of the historic Sree Padmanabhaswamy Temple, Rajagopal Handloom began its remarkable journey as <strong>Sree Padam Textiles</strong> under the visionary leadership of its founder, <strong>Sri. Gopalakrishnan</strong>. With a profound passion for preserving Kerala's rich handloom heritage, what started as a modest textile store soon evolved into a distinguished destination renowned for authenticity, exceptional craftsmanship, and timeless elegance.
            </p>

            <p>
              Built upon the values of trust, uncompromising quality, and heartfelt customer relationships, the brand became celebrated for its exquisite collection of traditional Kerala sarees, mundus, frocks, and finely crafted ethnic garments that embody the grace and cultural essence of Kerala.
            </p>

            <p>
              Following the passing of Sri. Gopalakrishnan, his cherished vision was carried forward with dedication by his son and daughter, <strong>Sri. Prabhu G</strong> and <strong>Ms. Divya G</strong>, who transformed his dream into a flourishing legacy. Guided by the same principles of honesty, perseverance, and excellence, they successfully steered the brand through a rapidly evolving and competitive textile landscape, ensuring that its heritage continued to thrive for future generations.
            </p>

            <p>
              Two decades after its foundation, the legacy expanded with the inauguration of a second showroom, <strong>Rajagopal Handloom</strong>, located close to the sacred temple where the journey first began. Today, Rajagopal Handloom stands as a trusted name in the handloom industry, proudly serving customers across India with premium-quality traditional textiles that blend heritage, craftsmanship, and affordability.
            </p>

            <p>
              For nearly three decades, every thread woven into Rajagopal Handloom has reflected a story of dedication, authenticity, and enduring relationships with generations of customers. Our continued growth across retail and wholesale operations remains deeply rooted in our commitment to preserving the beauty of traditional Indian attire while embracing innovation and the future.
            </p>

            <p>
              From a humble beginning to a cherished legacy, Rajagopal Handloom continues to weave stories of tradition, trust, and timeless craftsmanship—one thread at a time.
            </p>
          </div>
        </section>

        {/* Bottom Hero / Branding Image Section */}
        <section className="brand-image-section">
          <img
            src={brandBannerImg}
            alt="Rajagopal Handloom Tradition Woven with Elegance"
            className="brand-image"
          />
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
