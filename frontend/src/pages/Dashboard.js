import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Avatar,
  Divider,
  useTheme,
  Link,
  Chip,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
  GithubOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logoutUser, devMode } = useUser();

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

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(99vh - 64px)", // Account for navbar
        py: 4,
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : "background.default",
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={user?.profile_picture_url}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <UserOutlined style={{ fontSize: "1.5rem" }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Welcome,{" "}
                  {devMode && user.developer_profile?.displayName
                    ? user.developer_profile.displayName
                    : user.firstName}
                  !
                </Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutOutlined />}
              onClick={handleLogout}
              sx={{
                ml: { sm: "auto" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {devMode ? "Developer Profile" : "Account Overview"}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {devMode && user.developer_profile ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Display Name
                    </Typography>
                    <Typography>
                      {user.developer_profile.displayName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Primary Language
                    </Typography>
                    <Chip
                      label={user.developer_profile.primaryLanguage}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Links
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {user.developer_profile.githubUrl && (
                        <Link
                          href={user.developer_profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <GithubOutlined /> GitHub
                        </Link>
                      )}
                      {user.developer_profile.portfolioUrl && (
                        <Link
                          href={user.developer_profile.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <GlobalOutlined /> Portfolio
                        </Link>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Bio
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "text.secondary",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {user.developer_profile.bio}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Name
                    </Typography>
                    <Typography>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography>{user.email}</Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Member Since
                    </Typography>
                    <Typography>{formatDate(user.createdDate)}</Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {devMode ? "Available Projects" : "Recent Activity"}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 200,
                }}
              >
                <Typography color="text.secondary">
                  {devMode
                    ? "No available projects found"
                    : "No recent activity to display"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
