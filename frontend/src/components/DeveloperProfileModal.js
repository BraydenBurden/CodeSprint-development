import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useUser } from "../contexts/UserContext";

export default function DeveloperProfileModal({ open, onClose }) {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    displayName: "",
    githubUrl: "",
    portfolioUrl: "",
    yearsOfExperience: "",
    primaryLanguage: "",
    bio: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://localhost:8080/auth/developer-profile/${user.id}`,
        formData
      );

      if (response.data.ok) {
        // Update the user object with developer status and profile
        setUser({
          ...user,
          developer: 1,
          developer_profile: response.data,
        });
        onClose();
      } else {
        setError(response.data.message || "Failed to create developer profile");
      }
    } catch (error) {
      console.error("Error creating developer profile:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while creating your developer profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Developer Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide your developer information to enable developer mode.
          </Typography>
          <TextField
            fullWidth
            required
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="GitHub Profile URL"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Portfolio Website URL"
            name="portfolioUrl"
            value={formData.portfolioUrl}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Years of Experience"
            name="yearsOfExperience"
            type="number"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Primary Programming Language"
            name="primaryLanguage"
            value={formData.primaryLanguage}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            multiline
            rows={4}
            value={formData.bio}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Creating..." : "Create Profile"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
