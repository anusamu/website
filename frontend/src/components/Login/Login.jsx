import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./Login.css";

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
      window.dispatchEvent(new Event('authChange'));

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
      window.dispatchEvent(new Event('authChange'));

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

  return (
    <div className="page-wrapper">
      {/* Brand Heading */}
      <h1 className="brand-header">RajaGopal Handloom Online</h1>

      <div className="form-card">
        {step === 1 ? (
          <>
            <h2 className="heading">Sign in</h2>
            <p className="subheading">Sign in or create an account</p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="text"
                  name="emailOrPhone"
                  placeholder="Email or Phone number"
                  value={loginData.emailOrPhone}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary-button"
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

            <div className="divider-row">
              <span className="divider-line" />
              <span className="divider-text">or</span>
              <span className="divider-line" />
            </div>

            <div className="google-wrapper">
              <div id="google-signin" />
            </div>

            <p className="footer-text">
              Don't have an account?{" "}
              <button
                type="button"
                className="register-button"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="heading">Verify OTP</h2>
            <p className="subheading">
              An authentication code has been sent to{" "}
              <strong className="subheading-email">{userEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="input-field otp-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary-button"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>

            <p className="footer-text">
              Need to change email?
              <button
                type="button"
                className="link-button"
                onClick={() => setStep(1)}
              >
                Go Back
              </button>
            </p>
          </>
        )}

        <p className="terms-text">
          By continuing, you agree to our{" "}
          <a href="#terms" className="terms-link">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;