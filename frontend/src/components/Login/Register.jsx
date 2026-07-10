import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";

function Register() {
  const navigate = useNavigate();
const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "15px",
  outline: "none",
  background: "#f8fafc",
};
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        "/register",
        formData
      );

      alert(res.data.message);

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#f3f6fb,#e8f0ff)",
      padding: "20px",
    }}
  >
    <form
      onSubmit={handleRegister}
      style={{
        width: "100%",
        maxWidth: "430px",
        background: "#fff",
        padding: "40px",
        borderRadius: "18px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#1e293b",
          fontSize: "32px",
          fontWeight: "700",
        }}
      >
        Create Account
      </h2>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: "10px",
          background: "#2563eb",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          marginTop: "10px",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
        onMouseOut={(e) => (e.target.style.background = "#2563eb")}
      >
        Register
      </button>

      <p
        style={{
          textAlign: "center",
          marginTop: "22px",
          color: "#64748b",
          fontSize: "15px",
        }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Login
        </Link>
      </p>
    </form>
  </div>
);
}

export default Register;