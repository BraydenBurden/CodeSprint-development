require("dotenv").config();

const express = require("express");
const cron = require("node-cron");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 5000;

const con = require("./db");

// Setup request logging
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]")
);

const allowedOrigins = [
  "http://localhost:3000", // Frontend development
  "http://localhost:5173", // Vite default port
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: [
      "Access-Control-Allow-Origin",
      "Content-Length",
      "Content-Range",
      "X-Content-Range",
      "OPTIONS",
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
    ],
  })
);

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`CodeSprint server listening on port ${port}`);
});
