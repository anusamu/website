import React, { useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { toast } from "react-toastify";
import api from "../../api";

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warning("Please select a star rating.");
      return;
    }
    if (comment.trim() === "") {
      toast.warning("Please enter a review comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/reviews/${productId}`, { rating, comment });
      if (res.data.success) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        if (onReviewAdded) onReviewAdded(res.data.review);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review. Are you logged in?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: "1px solid #eaeaea", borderRadius: "8px", backgroundColor: "#fafafa" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Write a Review
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>Rating:</Typography>
          <Box>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{ cursor: "pointer", display: "inline-block" }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                {star <= (hoverRating || rating) ? (
                  <StarIcon sx={{ color: "#FFB400", fontSize: "1.8rem" }} />
                ) : (
                  <StarBorderIcon sx={{ color: "#DDD", fontSize: "1.8rem" }} />
                )}
              </span>
            ))}
          </Box>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Share your thoughts about this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 2, backgroundColor: "#fff" }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: "#111",
            color: "#fff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#333" }
          }}
        >
          {isSubmitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Review"}
        </Button>
      </form>
    </Box>
  );
};

export default ReviewForm;
