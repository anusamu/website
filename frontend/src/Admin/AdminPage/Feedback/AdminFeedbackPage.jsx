import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button, Switch, 
  CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";
import api from "../../../api";
import "./AdminFeedbackPage.css";

const AdminFeedbackPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  
  // States
  const [reviews, setReviews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null); // For drill-down view

  // Group reviews by product
  const productsWithReviews = React.useMemo(() => {
    const map = new Map();
    reviews.forEach(r => {
      const prodId = r.product?._id;
      if (!prodId) return;
      if (!map.has(prodId)) {
        map.set(prodId, {
          product: r.product,
          reviews: [],
          latestReview: r
        });
      }
      map.get(prodId).reviews.push(r);
    });
    return Array.from(map.values());
  }, [reviews]);

  // Edit Review Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tabIndex]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabIndex === 0) {
        // Fetch Reviews
        const revRes = await api.get("/admin/reviews");
        if (revRes.data.success) setReviews(revRes.data.reviews);
      } else {
        // Fetch App Feedback
        const feedRes = await api.get("/admin/feedbacks");
        if (feedRes.data.success) setFeedbacks(feedRes.data.feedbacks);
      }
    } catch (error) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // ----- Reviews Functions -----
  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const openEditDialog = (review) => {
    setEditingReview(review);
    setEditDialogOpen(true);
  };

  const handleUpdateReview = async () => {
    try {
      const res = await api.put(`/admin/reviews/${editingReview._id}`, {
        comment: editingReview.comment,
        status: editingReview.status
      });
      if (res.data.success) {
        setReviews(reviews.map(r => (r._id === editingReview._id ? res.data.review : r)));
        toast.success("Review updated");
        setEditDialogOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update review");
    }
  };

  // ----- Feedback Functions -----
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await api.delete(`/admin/feedbacks/${id}`);
      setFeedbacks(feedbacks.filter(f => f._id !== id));
      toast.success("Feedback deleted");
    } catch (err) {
      toast.error("Failed to delete feedback");
    }
  };

  const handleToggleFeedbackStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "unread" ? "read" : "unread";
    try {
      await api.put(`/admin/feedbacks/${id}`, { status: newStatus });
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus } : f));
      toast.success(`Marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Box sx={{ p: 4, width: "100%" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Reviews & Feedback Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{
            "& .MuiTab-root": { fontWeight: "bold", color: "#666" },
            "& .Mui-selected": { color: "#111 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#111" }
        }}>
          <Tab label="Product Reviews" />
          <Tab label="App Feedback / Mail" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabIndex === 0 && (
            <Box>
              {!selectedProductId ? (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>Products with Reviews</Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eaeaea", mb: 4 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
                        <TableRow>
                          <TableCell><strong>Product Image</strong></TableCell>
                          <TableCell><strong>Product Name</strong></TableCell>
                          <TableCell><strong>Total Reviews</strong></TableCell>
                          <TableCell><strong>Latest Review</strong></TableCell>
                          <TableCell align="right"><strong>Action</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productsWithReviews.length === 0 ? (
                          <TableRow><TableCell colSpan={5} align="center">No reviews found.</TableCell></TableRow>
                        ) : (
                          productsWithReviews.map((entry) => (
                            <TableRow key={entry.product._id} hover onClick={() => setSelectedProductId(entry.product._id)} sx={{ cursor: 'pointer' }}>
                              <TableCell>
                                <img src={entry.product.images?.[0] || "/placeholder.jpg"} alt={entry.product.productName} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                              </TableCell>
                              <TableCell>{entry.product.productName}</TableCell>
                              <TableCell>{entry.reviews.length}</TableCell>
                              <TableCell sx={{ maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#666" }}>
                                {entry.latestReview.rating}⭐ - {entry.latestReview.comment}
                              </TableCell>
                              <TableCell align="right">
                                <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); setSelectedProductId(entry.product._id); }}>
                                  View All
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">
                      Reviews for {productsWithReviews.find(p => p.product._id === selectedProductId)?.product.productName}
                    </Typography>
                    <Button variant="outlined" onClick={() => setSelectedProductId(null)}>
                      &larr; Back to Products
                    </Button>
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eaeaea", mb: 4 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
                        <TableRow>
                          <TableCell><strong>User</strong></TableCell>
                          <TableCell><strong>Rating</strong></TableCell>
                          <TableCell><strong>Comment</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reviews.filter(r => r.product?._id === selectedProductId).map((r) => (
                          <TableRow key={r._id}>
                            <TableCell>{r.user?.firstName} {r.user?.lastName}</TableCell>
                            <TableCell>{r.rating} ⭐</TableCell>
                            <TableCell sx={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.comment}
                            </TableCell>
                            <TableCell>{r.status}</TableCell>
                            <TableCell align="right">
                              <IconButton color="primary" onClick={() => openEditDialog(r)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleDeleteReview(r._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Application Feedback</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eaeaea" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Message</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedbacks.length === 0 ? (
                      <TableRow><TableCell colSpan={7} align="center">No feedback found.</TableCell></TableRow>
                    ) : (
                      feedbacks.map((f) => (
                        <TableRow key={f._id} sx={{ backgroundColor: f.status === 'unread' ? '#fff9e6' : 'inherit' }}>
                          <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{f.name}</TableCell>
                          <TableCell>{f.email}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell sx={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {f.message}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color={f.status === 'unread' ? "warning" : "inherit"}
                              onClick={() => handleToggleFeedbackStatus(f._id, f.status)}
                            >
                              {f.status}
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton color="error" onClick={() => handleDeleteFeedback(f._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Comment"
            value={editingReview?.comment || ""}
            onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            select
            fullWidth
            SelectProps={{ native: true }}
            label="Status"
            value={editingReview?.status || "approved"}
            onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value })}
          >
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleUpdateReview} variant="contained" sx={{ bgcolor: "#111", color: "#fff" }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFeedbackPage;
