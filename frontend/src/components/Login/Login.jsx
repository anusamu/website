
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // LOGIN + SEND OTP
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/login", {
        emailOrPhone: loginData.emailOrPhone,
        password: loginData.password,
      });

      alert(res.data.message);

      setUserEmail(res.data.email);

      setStep(2);
    } catch (error) {
      console.log("Backend Error:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
 const handleVerifyOtp = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const res = await api.post("/verify-login-otp", {
      email: userEmail,
      otp,
    });

    alert(res.data.message);

    // Save JWT Token
    localStorage.setItem("token", res.data.token);

    // Save Full User Data
    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    const role = res.data.user.role?.toLowerCase();

    if (role === "admin") {
      navigate("/admindashboard");
    } else if (role === "wholesale") {
      navigate("/wholesalehome");
    } else {
      navigate("/");
    }
  } catch (error) {
    console.log(
      "OTP Verify Error:",
      error.response?.data
    );

    alert(
      error.response?.data?.message ||
        "OTP Verification Failed"
    );
  } finally {
    setLoading(false);
  }
};
  const styles = {
    container: {
      maxWidth: "420px",
      margin: "60px auto",
      padding: "35px 30px",
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      boxShadow:
        "0 8px 24px rgba(0, 0, 0, 0.08)",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#333",
    },

    heading: {
      fontSize: "26px",
      fontWeight: "700",
      marginBottom: "8px",
      color: "#1a1a1a",
      textAlign: "center",
    },

    subheading: {
      fontSize: "14px",
      color: "#666",
      textAlign: "center",
      marginBottom: "24px",
    },

    inputGroup: {
      marginBottom: "16px",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      fontSize: "15px",
      border: "1px solid #dcdcdc",
      borderRadius: "8px",
      boxSizing: "border-box",
      outline: "none",
    },

    button: {
      width: "100%",
      padding: "12px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#fff",
      backgroundColor: loading
        ? "#a0c4ff"
        : "#4f46e5",
      border: "none",
      borderRadius: "8px",
      cursor: loading
        ? "not-allowed"
        : "pointer",
      marginTop: "10px",
    },

    footerText: {
      textAlign: "center",
      marginTop: "24px",
      fontSize: "14px",
      color: "#666",
    },

    linkButton: {
      background: "none",
      border: "none",
      color: "#4f46e5",
      fontWeight: "600",
      padding: 0,
      marginLeft: "5px",
      cursor: "pointer",
      textDecoration: "underline",
    },
  };

  return (
    <div style={styles.container}>
      {step === 1 ? (
        <>
          <h2 style={styles.heading}>
            Welcome Back
          </h2>

          <p style={styles.subheading}>
            Please enter your details to sign in.
          </p>

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Email or Phone Number"
                value={loginData.emailOrPhone}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading
                ? "Please wait..."
                : "Sign In"}
            </button>
          </form>

          <p style={styles.footerText}>
            Don't have an account?
            <button
              type="button"
              style={styles.linkButton}
              onClick={() =>
                navigate("/register")
              }
            >
              Register
            </button>
          </p>
        </>
      ) : (
        <>
          <h2 style={styles.heading}>
            Verify OTP
          </h2>

          <p style={styles.subheading}>
            An authentication code has been sent
            to
            <strong
              style={{
                color: "#1a1a1a",
              }}
            >
              {" "}
              {userEmail}
            </strong>
          </p>

          <form onSubmit={handleVerifyOtp}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter 6-Digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                required
                style={{
                  ...styles.input,
                  textAlign: "center",
                  letterSpacing: "2px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>
          </form>

          <p style={styles.footerText}>
            Made a mistake?
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => setStep(1)}
            >
              Go Back
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default Login;

