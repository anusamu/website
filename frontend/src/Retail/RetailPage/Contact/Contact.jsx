import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  useTheme
} from "@mui/material";
import { toast } from "react-toastify";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import api from "../../../api";
import "./Contact.css";

const Contact = () => {
  const theme = useTheme();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: location.state?.email || "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.warning("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        type: "app_feedback",
      };
      const res = await api.post("/feedback", payload);
      if (res.data.success) {
        toast.success("Feedback submitted successfully. Thank you!");
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-root">
      <Navbar />

      <main className="contact-main-wrapper">
        <Box
          className="contact-container"
          sx={{
            maxWidth: 1100,
            mx: "auto",
            mt: { xs: "80px", sm: "100px", md: "110px" },
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 6, md: 10 },
          }}
        >
          {/* Title Header */}
          <Box className="contact-header" sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h3"
              className="contact-title"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                mb: 1.5,
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              className="contact-subtitle"
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                maxWidth: 600,
                mx: "auto",
              }}
            >
              We’d love to hear your feedback or answer any questions you have.
            </Typography>
          </Box>

          {/* Form Card */}
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={7}>
              <Paper elevation={0} className="contact-card">
                <form onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        variant="outlined"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="contact-textfield"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Email"
                        name="email"
                        type="email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="contact-textfield"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message / Feedback"
                        name="message"
                        variant="outlined"
                        multiline
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="contact-textfield"
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: "center", mt: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        className="contact-submit-btn"
                        disableElevation
                        sx={{
                          /* Fallback to MUI palette primary color if CSS variable isn't defined */
                          backgroundColor: "var(--primary-color, " + theme.palette.primary.main + ")",
                          "&:hover": {
                            backgroundColor: "var(--primary-dark, " + theme.palette.primary.dark + ")",
                          },
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={22} sx={{ color: "#ffffff" }} />
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;