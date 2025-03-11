import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  Alert,
  CheckCircleOutline,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CodeOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
} from "@ant-design/icons";
import axios from "axios";

function SignUp() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (response.data.ok) {
        setSuccess(true);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred during registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor:
            theme.palette.mode === "light" ? "grey.50" : "background.default",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: theme.palette.background.paper,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <MailOutlined
                style={{
                  fontSize: "64px",
                  color: theme.palette.primary.main,
                  marginBottom: "24px",
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Verify Your Email
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              We've sent a verification email to{" "}
              <strong>{formData.email}</strong>. Please check your inbox and
              follow the instructions to verify your account.
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 4, fontSize: "0.9rem" }}
            >
              If you don't see the email, please check your spam folder.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate("/login")}
              sx={{ mb: 2 }}
            >
              Go to Login
            </Button>
            <Button
              variant="text"
              fullWidth
              size="large"
              onClick={() => setSuccess(false)}
            >
              Back to Sign Up
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : "background.default",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: theme.palette.background.paper,
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          {/* Logo and Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <CodeOutlined
                style={{
                  fontSize: "32px",
                  color: theme.palette.primary.main,
                  marginRight: "8px",
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.5px",
                  fontSize: "1.5rem",
                }}
              >
                CodeSprint
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{ mb: 1, fontWeight: 600, fontSize: "2rem" }}
            >
              Create an Account
            </Typography>
            <Typography color="text.secondary">
              Join our community of developers and clients
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              required
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <EyeInvisibleOutlined />
                      ) : (
                        <EyeOutlined />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              variant="outlined"
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mb: 3 }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignUp;
