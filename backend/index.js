require("dotenv").config();

const express = require("express");
const cron = require("node-cron");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const con = require("./db");
const { initializeSocket } = require("./services/socketService");

// Initialize Socket.IO
initializeSocket(server);

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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is allowed
      if (allowedOrigins.indexOf(origin) === -1) {
        // If it's not in allowedOrigins but has the same IP as the server
        // This allows access from any port on development machines
        const requestOriginUrl = new URL(origin);
        if (process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
      }

      return callback(null, true);
    },
    credentials: true,
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
const eventRoutes = require("./routes/events");
const chatRoutes = require("./routes/chat");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chat", chatRoutes);

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

server.listen(port, () => {
  console.log(`CodeSprint server listening on port ${port}`);
});
