import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  IconButton,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import axios from "axios";

function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, setUser, devMode } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [devFormData, setDevFormData] = useState({
    displayName: user?.developer_profile?.displayName || "",
    githubUrl: user?.developer_profile?.githubUrl || "",
    portfolioUrl: user?.developer_profile?.portfolioUrl || "",
    yearsOfExperience: user?.developer_profile?.yearsOfExperience || "",
    primaryLanguage: user?.developer_profile?.primaryLanguage || "",
    bio: user?.developer_profile?.bio || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });

    // Replace the default formatting to add comma after the day
    return formatted.replace(/(\w+) (\d+)(,?) (\d+)/, "$1 $2, $4");
  };

  // At the top of the component, after the hooks

  // Update form data when user object changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
      });

      if (user.developer_profile) {
        setDevFormData({
          displayName: user.developer_profile.displayName || "",
          githubUrl: user.developer_profile.githubUrl || "",
          portfolioUrl: user.developer_profile.portfolioUrl || "",
          yearsOfExperience: user.developer_profile.yearsOfExperience || "",
          primaryLanguage: user.developer_profile.primaryLanguage || "",
          bio: user.developer_profile.bio || "",
        });
      }
    }
  }, [user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleDevChange = (e) => {
    const { name, value } = e.target;
    setDevFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  // Function to handle success messages with auto-dismissal
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess("");
    }, 3000); // Message will disappear after 3 seconds
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Show preview and confirmation dialog
    setSelectedFile(file);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpload = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const response = await axios.post(
        `/api/profile/user/${user.id}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.ok) {
        // Update user context with new profile picture URL
        setUser({
          ...user,
          profile_picture_url: response.data.profilePictureUrl,
        });
        showSuccessMessage("Profile picture updated successfully!");
      } else {
        setError("Failed to update profile picture");
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError(
        err.response?.data?.message || "Error uploading profile picture"
      );
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  const handleCancelUpload = () => {
    setShowConfirmDialog(false);
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userId = user?.id;
      if (!userId) {
        setError("User ID not found");
        return;
      }

      const response = await axios.put(`/api/profile/user/${userId}`, formData);

      if (response.data.ok && response.data.user) {
        setUser(response.data.user);
        showSuccessMessage("Profile updated successfully!");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error("Profile Component - Error:", err);
      setError(
        err.response?.data?.message || "An error occurred updating your profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDevSubmit = async (e) => {
    e.preventDefault();

    if (!devFormData.displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userId = user?.id;
      if (!userId) {
        setError("User ID not found");
        return;
      }

      const response = await axios.put(
        `/api/profile/developer/${userId}`,
        devFormData
      );
      if (response.data.ok && response.data.user) {
        setUser(response.data.user);
        showSuccessMessage("Developer profile updated successfully!");
      } else {
        setError("Failed to update developer profile");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred updating your developer profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(99vh - 64px)",
        py: 4,
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Left Column - Profile Summary */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  mb: 3,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={user.profile_picture_url}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: theme.palette.primary.main,
                      mb: 2,
                    }}
                  >
                    <UserOutlined style={{ fontSize: "3rem" }} />
                  </Avatar>
                  <IconButton
                    onClick={handleProfilePictureClick}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: theme.palette.background.paper,
                      "&:hover": {
                        bgcolor: theme.palette.background.paper,
                      },
                    }}
                  >
                    <CameraOutlined />
                  </IconButton>
                </Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Box>

              <Box sx={{ flexGrow: 1, width: "100%" }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  {devMode && user.developer_profile?.displayName
                    ? user.developer_profile.displayName
                    : `${user.firstName} ${user.lastName}`}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Member since {formatDate(user.createdDate)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Edit Profile Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                {devMode ? "Edit Developer Profile" : "Edit Profile"}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              {devMode ? (
                <form onSubmit={handleDevSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Developer Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Display Name"
                        name="displayName"
                        value={devFormData.displayName}
                        onChange={handleDevChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="GitHub URL"
                        name="githubUrl"
                        value={devFormData.githubUrl}
                        onChange={handleDevChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Portfolio URL"
                        name="portfolioUrl"
                        value={devFormData.portfolioUrl}
                        onChange={handleDevChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        name="yearsOfExperience"
                        type="number"
                        value={devFormData.yearsOfExperience}
                        onChange={handleDevChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Primary Programming Language"
                        name="primaryLanguage"
                        value={devFormData.primaryLanguage}
                        onChange={handleDevChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={devFormData.bio}
                        onChange={handleDevChange}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={4}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        {loading ? "Saving Changes..." : "Save Changes"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Personal Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user.email}
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: theme.palette.text.secondary,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        {loading ? "Saving Changes..." : "Save Changes"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Add the confirmation dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelUpload}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Profile Picture Upload</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <Avatar
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : user.profile_picture_url
              }
              sx={{
                width: 120,
                height: 120,
                bgcolor: theme.palette.primary.main,
              }}
            >
              <UserOutlined style={{ fontSize: "3rem" }} />
            </Avatar>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Are you sure you want to update your profile picture?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload}>Cancel</Button>
          <Button
            onClick={handleConfirmUpload}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;
