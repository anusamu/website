import React, { useEffect, useState } from "react";
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

      alert(res.data.message || "OTP sent to registered email!");
      setUserEmail(res.data.email);
      setStep(2);
    } catch (error) {
      console.log("Backend Error:", error.response?.data);
      alert(error.response?.data?.message || "Login Failed");
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

      alert(res.data.message || "Logged in successfully!");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role?.toLowerCase();

      if (role === "admin" || role === "superadmin") {
        navigate("/admindashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log("OTP Verify Error:", error.response?.data);
      alert(error.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN HANDLER
  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      return alert("Google login failed");
    }

    try {
      setLoading(true);

      const res = await api.post("/login/google", {
        token: response.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role?.toLowerCase();

      if (role === "admin" || role === "superadmin") {
        navigate("/admindashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Google login error:", error.response?.data || error);
      alert(error.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
            shape: "pill",
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // MATCHED LUXURY E-COMMERCE STYLES
  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#2b2b2b",
    },

    brandHeader: {
      fontSize: "1.35rem",
      fontFamily: '"Playfair Display", "Didot", "Georgia", serif',
      letterSpacing: "0.02em",
      color: "#1a1a1a",
      marginBottom: "3.5rem",
      fontWeight: "400",
      textAlign: "center",
    },

    formCard: {
      width: "100%",
      maxWidth: "360px",
      display: "flex",
      flexDirection: "column",
    },

    heading: {
      fontSize: "1.75rem",
      fontFamily: '"Playfair Display", "Didot", "Georgia", serif',
      fontWeight: "400",
      marginBottom: "0.35rem",
      color: "#1a1a1a",
      letterSpacing: "-0.01em",
    },

    subheading: {
      fontSize: "0.875rem",
      color: "#767676",
      marginBottom: "1.75rem",
      lineHeight: "1.4",
    },

    inputGroup: {
      marginBottom: "0.85rem",
      position: "relative",
    },

    input: {
      width: "100%",
      padding: "0.85rem 1.15rem",
      fontSize: "0.925rem",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      boxSizing: "border-box",
      outline: "none",
      color: "#1a1a1a",
      backgroundColor: "#ffffff",
      transition: "border-color 0.2s ease",
    },

    primaryButton: {
      width: "100%",
      padding: "0.9rem",
      fontSize: "0.925rem",
      fontWeight: "500",
      color: "#ffffff",
      backgroundColor: loading ? "#a3ac98" : "#8c967d", // Muted luxury sage green
      border: "none",
      borderRadius: "10px",
      cursor: loading ? "not-allowed" : "pointer",
      marginTop: "0.5rem",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },

    dividerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      margin: "1.5rem 0",
    },

    dividerLine: {
      flex: 1,
      height: "1px",
      backgroundColor: "#e5e7eb",
    },

    dividerText: {
      color: "#9ca3af",
      fontSize: "0.8rem",
      fontWeight: "400",
      textTransform: "lowercase",
    },

    googleWrapper: {
      width: "100%",
      marginBottom: "1.25rem",
    },

    footerText: {
      textAlign: "center",
      marginTop: "1.75rem",
      fontSize: "0.825rem",
      color: "#6b7280",
    },

    linkButton: {
      background: "none",
      border: "none",
      color: "#656e5b",
      fontWeight: "500",
      padding: 0,
      marginLeft: "6px",
      cursor: "pointer",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
    },

    termsText: {
      textAlign: "center",
      fontSize: "0.75rem",
      color: "#9ca3af",
      marginTop: "2.5rem",
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Brand Heading */}
      <h1 style={styles.brandHeader}>RajaGopal Handloom Online</h1>

      <div style={styles.formCard}>
        {step === 1 ? (
          <>
            <h2 style={styles.heading}>Sign in</h2>
            <p style={styles.subheading}>Sign in or create an account</p>

            <form onSubmit={handleLogin}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="emailOrPhone"
                  placeholder="Email or Phone number"
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
                style={styles.primaryButton}
              >
                {loading ? "Continuing..." : "Continue with shop"}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>
            </form>

            <div style={styles.dividerRow}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.googleWrapper}>
              <div id="google-signin" />
            </div>

            <p style={styles.footerText}>
              Don't have an account?
              <button
                type="button"
                style={styles.linkButton}
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 style={styles.heading}>Verify OTP</h2>
            <p style={styles.subheading}>
              An authentication code has been sent to{" "}
              <strong style={{ color: "#1a1a1a" }}>{userEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{
                    ...styles.input,
                    textAlign: "center",
                    letterSpacing: "0.25em",
                    fontWeight: "600",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>

            <p style={styles.footerText}>
              Need to change email?
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

        <p style={styles.termsText}>
          By continuing, you agree to our{" "}
          <a href="#terms" style={{ color: "inherit", textDecoration: "underline" }}>
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;