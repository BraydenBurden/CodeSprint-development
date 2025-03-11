import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  useTheme,
} from "@mui/material";
import {
  FileAddOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function HowItWorks() {
  const navigate = useNavigate();
  const theme = useTheme();

  const steps = [
    {
      icon: (
        <FileAddOutlined
          style={{ fontSize: "2.5rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Post Your Project",
      description:
        "Clients describe their app or project requirements, including budget, timeline, and specific technical needs.",
      details: [
        "Detailed project specifications",
        "Budget range",
        "Timeline expectations",
        "Required technologies",
      ],
    },
    {
      icon: (
        <TeamOutlined
          style={{ fontSize: "2.5rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Receive Developer Bids",
      description:
        "Qualified developers review your project and submit their proposals with timelines and cost estimates.",
      details: [
        "Competitive developer bids",
        "Developer profiles and portfolios",
        "Previous work examples",
        "Proposed timelines",
      ],
    },
    {
      icon: (
        <CheckCircleOutlined
          style={{ fontSize: "2.5rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Select and Begin",
      description:
        "Review bids, select the best developer for your project, and kick off the development process.",
      details: [
        "Compare developer proposals",
        "Review developer ratings",
        "Secure payment system",
        "Project milestone tracking",
      ],
    },
    {
      icon: (
        <CodeOutlined
          style={{ fontSize: "2.5rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Complete Your Project",
      description:
        "Work closely with your chosen developer to bring your project to life and achieve your goals.",
      details: [
        "Regular progress updates",
        "Quality assurance",
        "Milestone payments",
        "Project completion and delivery",
      ],
    },
  ];

  return (
    <Box
      sx={{
        py: 8,
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : "background.default",
        transition: "background-color 0.3s ease",
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How CodeSprint Works
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Your project journey from idea to reality
          </Typography>
        </Box>

        {/* Steps Grid */}
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: theme.palette.background.paper,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                      theme.palette.mode === "light"
                        ? "0 4px 20px rgba(0,0,0,0.1)"
                        : "0 4px 20px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {step.icon}
                  <Typography variant="h4" sx={{ ml: 2, fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {step.description}
                </Typography>
                <Box
                  sx={{
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "grey.50"
                        : "background.default",
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  {step.details.map((detail, idx) => (
                    <Typography
                      key={idx}
                      sx={{
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        "&:before": {
                          content: '"•"',
                          color: "primary.main",
                          fontWeight: "bold",
                          marginRight: 1,
                        },
                        "&:not(:last-child)": {
                          mb: 1,
                        },
                      }}
                    >
                      {detail}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Bottom CTA */}
        <Box
          sx={{
            textAlign: "center",
            mt: 8,
            p: 6,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "light"
                ? "0 4px 20px rgba(0,0,0,0.05)"
                : "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Ready to Get Started?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Join our community and turn your ideas into reality
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate("/signup")}
            >
              Sign Up Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HowItWorks;
