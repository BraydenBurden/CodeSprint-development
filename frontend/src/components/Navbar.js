import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
} from "@mui/material";
import {
  CodeOutlined,
  UserOutlined,
  MenuOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CalendarOutlined,
  MessageOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useContext, useState, useEffect } from "react";
import { ColorModeContext } from "../App";
import { useUser } from "../contexts/UserContext";
import DeveloperProfileModal from "./DeveloperProfileModal";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const colorMode = useContext(ColorModeContext);
  const { user, logoutUser, devMode, toggleDevMode } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDevModal, setShowDevModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clear user context when on home page
  useEffect(() => {
    if (location.pathname === "/" && user) {
      logoutUser();
    }
  }, [location.pathname, user, logoutUser]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    handleMenuClose();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (user) {
      logoutUser();
    }
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isLandingPage = location.pathname === "/";

  const handleDevModeToggle = async () => {
    const needsProfile = await toggleDevMode(true);
    if (needsProfile === false) {
      setShowDevModal(true);
    }
  };

  const renderNavLinks = () => (
    <Box sx={{ display: "flex", gap: 2 }}>
      {user ? (
        <>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/dashboard")}
            sx={{
              display: { xs: "none", md: "flex" },
              color:
                location.pathname === "/dashboard"
                  ? "primary.main"
                  : "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/jobs")}
            sx={{
              display: { xs: "none", md: "flex" },
              color:
                location.pathname === "/jobs"
                  ? "primary.main"
                  : "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            {devMode ? "Find Projects" : "My Jobs"}
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/calendar")}
            sx={{
              display: { xs: "none", md: "flex" },
              color:
                location.pathname === "/calendar"
                  ? "primary.main"
                  : "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Calendar
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation("/messages")}
            sx={{
              display: { xs: "none", md: "flex" },
              color:
                location.pathname === "/messages"
                  ? "primary.main"
                  : "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Messages
          </Button>
        </>
      ) : (
        <>
          {isLandingPage ? (
            <>
              <Button
                color="inherit"
                onClick={() => handleNavigation("/signup")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Find Clients
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation("/signup")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Find Developers
              </Button>
            </>
          ) : null}
          <Button
            color="inherit"
            onClick={() => handleNavigation("/how-it-works")}
            sx={{
              display: { xs: "none", md: "flex" },
              color:
                location.pathname === "/how-it-works"
                  ? "primary.main"
                  : "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            How It Works
          </Button>
        </>
      )}
    </Box>
  );

  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: 280,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            cursor: "pointer",
          }}
          onClick={handleLogoClick}
        >
          <CodeOutlined
            style={{
              fontSize: "24px",
              color: theme.palette.primary.main,
              marginRight: "8px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CodeSprint
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {user ? (
          <List>
            <ListItem button onClick={() => handleNavigation("/dashboard")}>
              <ListItemIcon>
                <DashboardOutlined />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("/jobs")}>
              <ListItemIcon>
                <ProjectOutlined />
              </ListItemIcon>
              <ListItemText primary={devMode ? "Find Projects" : "My Jobs"} />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("/calendar")}>
              <ListItemIcon>
                <CalendarOutlined />
              </ListItemIcon>
              <ListItemText primary="Calendar" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("/messages")}>
              <ListItemIcon>
                <MessageOutlined />
              </ListItemIcon>
              <ListItemText primary="Messages" />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={devMode}
                    onChange={handleDevModeToggle}
                    color="primary"
                  />
                }
                label={devMode ? "Developer Mode" : "Client Mode"}
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={theme.palette.mode === "dark"}
                    onChange={colorMode.toggleColorMode}
                    color="primary"
                  />
                }
                label={
                  theme.palette.mode === "dark" ? "Dark Mode" : "Light Mode"
                }
              />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={() => handleNavigation("/profile")}>
              <ListItemIcon>
                <UserOutlined />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlined />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        ) : (
          <List>
            {isLandingPage && (
              <>
                <ListItem button onClick={() => handleNavigation("/signup")}>
                  <ListItemIcon>
                    <TeamOutlined />
                  </ListItemIcon>
                  <ListItemText primary="Find Clients" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation("/signup")}>
                  <ListItemIcon>
                    <CodeOutlined />
                  </ListItemIcon>
                  <ListItemText primary="Find Developers" />
                </ListItem>
              </>
            )}
            <ListItem button onClick={() => handleNavigation("/how-it-works")}>
              <ListItemIcon>
                <QuestionCircleOutlined />
              </ListItemIcon>
              <ListItemText primary="How It Works" />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={theme.palette.mode === "dark"}
                    onChange={colorMode.toggleColorMode}
                    color="primary"
                  />
                }
                label={
                  theme.palette.mode === "dark" ? "Dark Mode" : "Light Mode"
                }
              />
            </ListItem>
          </List>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuOutlined />
              </IconButton>
            )}

            {/* Logo and Brand */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
              onClick={handleLogoClick}
            >
              <CodeOutlined
                style={{
                  fontSize: "24px",
                  color: "#0D9488",
                  marginRight: "8px",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.5px",
                }}
              >
                CodeSprint
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ ml: 4 }}>{renderNavLinks()}</Box>

            {/* Auth Buttons and Theme Toggle */}
            <Box
              sx={{
                ml: "auto",
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              {user ? (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={devMode}
                        onChange={handleDevModeToggle}
                        color="primary"
                      />
                    }
                    label={devMode ? "Developer Mode" : "Client Mode"}
                    sx={{ display: { xs: "none", md: "flex" } }}
                  />

                  <IconButton
                    onClick={colorMode.toggleColorMode}
                    color="inherit"
                    sx={{
                      display: { xs: "none", md: "flex" },
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {theme.palette.mode === "dark" ? (
                      <BulbFilled />
                    ) : (
                      <BulbOutlined />
                    )}
                  </IconButton>

                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ ml: { xs: 0, md: 2 } }}
                    aria-controls={
                      Boolean(anchorEl) ? "account-menu" : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      <UserOutlined />
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={() => handleNavigation("/profile")}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation("/settings")}>
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={colorMode.toggleColorMode}
                    color="inherit"
                    sx={{
                      display: { xs: "none", md: "flex" },
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {theme.palette.mode === "dark" ? (
                      <BulbFilled />
                    ) : (
                      <BulbOutlined />
                    )}
                  </IconButton>
                  <Button
                    variant="outlined"
                    onClick={() => handleNavigation("/login")}
                    sx={{
                      borderRadius: 1,
                      display: { xs: "none", md: "flex" },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleNavigation("/signup")}
                    sx={{
                      borderRadius: 1,
                      display: { xs: "none", md: "flex" },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      {renderMobileDrawer()}

      {/* Developer Profile Modal */}
      <DeveloperProfileModal
        open={showDevModal}
        onClose={() => setShowDevModal(false)}
      />
    </>
  );
}

export default Navbar;
