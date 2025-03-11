import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import "antd/dist/reset.css";
import { createTheme } from "@mui/material/styles";
import { createContext, useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import HowItWorks from "./pages/HowItWorks";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { UserProvider } from "./contexts/UserContext";

// Configure axios defaults
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8080";
  }
  // When accessing from other devices in the network
  return `http://${hostname}:8080`;
};

axios.defaults.baseURL = getBaseUrl();

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create Theme Context
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

// Routes that should not display the navbar
const noNavbarRoutes = ["/signup", "/login", "/verify-email"];

// Load theme mode from localStorage or default to 'light'
const getInitialMode = () => {
  const savedMode = localStorage.getItem("themeMode");
  return savedMode || "light";
};

function AppContent() {
  const location = useLocation();
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showNavbar && <Navbar />}
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  const [mode, setMode] = useState(getInitialMode);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode);
          return newMode;
        });
      },
    }),
    []
  );

  // Effect to sync theme mode with localStorage
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#0D9488",
            light: "#14B8A6",
            dark: "#0B7A71",
          },
          secondary: {
            main: "#f50057",
            light: "#ff4081",
            dark: "#c51162",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
        typography: {
          fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
          ].join(","),
          h1: {
            fontSize: "2.5rem",
            fontWeight: 600,
          },
          h2: {
            fontSize: "2rem",
            fontWeight: 600,
          },
          h3: {
            fontSize: "1.75rem",
            fontWeight: 600,
          },
          h4: {
            fontSize: "1.5rem",
            fontWeight: 500,
          },
          h5: {
            fontSize: "1.25rem",
            fontWeight: 500,
          },
          h6: {
            fontSize: "1rem",
            fontWeight: 500,
          },
          button: {
            textTransform: "none",
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: "8px 16px",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow:
                  mode === "light"
                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "0 4px 6px rgba(0, 0, 0, 0.3)",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <Router>
            <AppContent />
          </Router>
        </UserProvider>
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
