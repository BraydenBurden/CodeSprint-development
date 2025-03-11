import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Modal } from "antd";
import {
  CodeOutlined,
  TeamOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../theme";

function LandingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const features = [
    {
      icon: (
        <CodeOutlined
          style={{ fontSize: "2rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Expert Developers",
      description:
        "Connect with skilled developers specializing in various technologies and domains.",
    },
    {
      icon: (
        <TeamOutlined
          style={{ fontSize: "2rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Perfect Match",
      description:
        "Our matching system ensures you find the right developer for your specific needs.",
    },
    {
      icon: (
        <DollarOutlined
          style={{ fontSize: "2rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Competitive Rates",
      description:
        "Transparent pricing and competitive rates for quality development work.",
    },
    {
      icon: (
        <SafetyCertificateOutlined
          style={{ fontSize: "2rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Secure Platform",
      description: "Safe and secure platform for collaboration and payments.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background:
            "linear-gradient(45deg, rgba(13,148,136,0.1) 0%, rgba(20,184,166,0.1) 100%)",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Developer Marketplace
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 2, mb: 4, color: "text.secondary" }}
              >
                Connect with top developers and bring your projects to life
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/signup")}
                  startIcon={<CodeOutlined />}
                >
                  Find Developers
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  color="primary"
                  onClick={() => navigate("/signup")}
                >
                  Post a Project
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800"
                alt="Developers collaborating"
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" align="center" sx={{ mb: 6 }}>
          Why Choose Our Platform
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  {feature.icon}
                  <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            align="center"
            sx={{ color: "white", mb: 3 }}
          >
            Ready to Get Started?
          </Typography>
          <Typography align="center" sx={{ mb: 4 }}>
            Join our community of developers and clients to create amazing
            projects together
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              gap: 2,
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate("/signup")}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate("/login")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "grey.100",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      <Modal
        title="Welcome to Developer Marketplace"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>This is an Ant Design Modal with MUI-styled content</p>
        <Typography color="primary" sx={{ mt: 2 }}>
          You can mix and match components from both libraries!
        </Typography>
      </Modal>
    </>
  );
}

export default LandingPage;
