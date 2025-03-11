import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CodeOutlined } from "@ant-design/icons";
import axios from "axios";

function VerifyEmail() {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  // Get token from URL parameters
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`/api/auth/verify/${token}`);

      if (response.data.ok) {
        setVerified(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000); // Redirect to login after 3 seconds
      } else {
        setError(
          response.data.message || "Verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred during verification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
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
                background: "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.5px",
                fontSize: "1.5rem",
              }}
            >
              CodeSprint
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Verify Your Email
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {verified ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your email has been verified successfully!
              </Alert>
              <Typography color="text.secondary">
                Redirecting you to login...
              </Typography>
            </>
          ) : (
            <>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Click the button below to verify your email address and activate
                your account.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={handleVerify}
                disabled={loading || !token}
                sx={{ minWidth: 200 }}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default VerifyEmail;
