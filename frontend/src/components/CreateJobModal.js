import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function CreateJobModal({
  open,
  onClose,
  onJobCreated,
  onJobUpdated,
  user,
  job = null, // if present, we edit instead of create
}) {
  const isEditMode = Boolean(job);

  const [formData, setFormData] = useState({
    requestor_id: user.id,
    requestor_name: `${user.firstName} ${user.lastName}`,
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form if editing existing job
  useEffect(() => {
    if (isEditMode && job) {
      setFormData({
        requestor_id: job.requestor_id,
        requestor_name: job.requestor_name,
        title: job.title,
        description: job.description || "",
      });
    } else {
      setFormData({
        requestor_id: user.id,
        requestor_name: `${user.firstName} ${user.lastName}`,
        title: "",
        description: "",
      });
    }
  }, [job, isEditMode, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Job title is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;

      if (isEditMode) {
        // Update existing job
        response = await axios.put(
          `/api/projects/updateproject/${job.id}`,
          formData
        );
      } else {
        // Create new job
        response = await axios.post("/api/projects/createproject", formData);
      }

      if (response.data.ok) {
        if (isEditMode) {
          onJobUpdated && onJobUpdated(response.data.job); // pass updated job to parent
        } else {
          onJobCreated && onJobCreated(response.data.job); // pass new job to parent
        }
        onClose();
      } else {
        setError(response.data.message || "Failed to save job.");
      }
    } catch (err) {
      console.error("Error saving job:", err);
      setError("An error occurred while saving the job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? "Edit Job" : "Create a New Job"}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isEditMode
            ? "Update the details of your job."
            : "Fill in the details of the job you’d like to post."}
        </Typography>
        <TextField
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
            ? "Save Changes"
            : "Create Job"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
