import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";

import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

export default function JobCard({ job, onJobUpdated }) {
  const { devMode } = useUser();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    setFormData({
      title: job.title,
      description: job.description || "",
    });
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setError("");
  };

  const getStatusColor = (status) => {
    const normalized = status?.toLowerCase();

    switch (normalized) {
      case "bidding":
        return "#2196F3"; // Blue
      case "in_progress":
        return "#FF9800"; // Orange
      case "awaiting_client_approval":
      case "awaiting_developer_approval":
        return "#FFC107"; // Amber
      case "completed":
        return "#4CAF50"; // Green
      case "cancelled":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey fallback
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Job title is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `/api/projects/updatejob/${job.id}`,
        formData
      );

      if (response.data.ok) {
        onJobUpdated(response.data.job); // update job in parent list
        setIsEditing(false);
        setOpen(false);
      } else {
        setError(response.data.message || "Failed to update job.");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      setError("An error occurred while updating the job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        sx={{ mb: 2, p: 2, cursor: "pointer" }}
        onClick={handleOpen}
        elevation={3}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ flexGrow: 1, minWidth: 200 }}
          >
            {job.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            whiteSpace="nowrap"
          >
            {`Posted on ${new Date(job.created_at).toLocaleDateString()}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            whiteSpace="nowrap"
          >
            {job.requestor_name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              textTransform: "capitalize",
              color: getStatusColor(job.status),
              whiteSpace: "nowrap",
            }}
          >
            {job.status.replace(/_/g, " ")}
          </Typography>
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isEditing ? "Edit Job" : job.title}
          <IconButton onClick={handleClose} sx={{ color: "red" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {isEditing ? (
            <>
              {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <TextField
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Description:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {job.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Status:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: getStatusColor(job.status), mb: 2 }}
              >
                {job.status.replace(/_/g, " ")}
              </Typography>

              {devMode ? (
                <>
                  <Typography variant="subtitle2">Client:</Typography>
                  <Typography variant="body2">{job.requestor_name}</Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2">Created:</Typography>
                  <Typography variant="body2">
                    {new Date(job.created_at).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {devMode ? (
            <>
              <Button onClick={() => console.log("Bid on job")}>
                Submit Bid
              </Button>
              <Button onClick={() => console.log("Message client")}>
                Message Client
              </Button>
            </>
          ) : isEditing ? (
            <>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Job</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
