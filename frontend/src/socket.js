import { io } from "socket.io-client";
import config from "./config";

// Create a socket instance with more robust configuration
const socket = io(config.SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
  forceNew: true,
  multiplex: false,
  path: "/socket.io/",
  withCredentials: true,
});

let reconnectTimer = null;

// Add event listeners for connection status
socket.on("connect", () => {
  console.log(
    "%cSocket connected successfully",
    "color: green; font-weight: bold"
  );
  console.log("Socket ID:", socket.id);
  console.log("Transport:", socket.io.engine.transport.name);
  console.log("Connected to:", config.SOCKET_URL);

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
});

socket.on("disconnect", (reason) => {
  console.log("%cSocket disconnected", "color: red; font-weight: bold");
  console.log("Disconnect reason:", reason);

  // Attempt to reconnect on certain disconnect reasons
  if (reason === "io server disconnect" || reason === "transport close") {
    reconnectTimer = setTimeout(() => {
      console.log("Attempting to reconnect...");
      socket.connect();
    }, 1000);
  }
});

socket.on("connect_error", (error) => {
  console.error("%cSocket connection error", "color: red; font-weight: bold");
  console.error("Error details:", error);
  console.error("Attempted URL:", config.SOCKET_URL);

  // Attempt to reconnect with exponential backoff
  const backoffDelay = Math.min(
    1000 * Math.pow(2, socket.io.engine.reconnectionAttempts || 0),
    10000
  );
  setTimeout(() => {
    console.log(`Attempting to reconnect after ${backoffDelay}ms...`);
    socket.connect();
  }, backoffDelay);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("%cSocket reconnected", "color: green; font-weight: bold");
  console.log("Attempts:", attemptNumber);
  console.log("New socket ID:", socket.id);
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log("%cReconnection attempt", "color: orange; font-weight: bold");
  console.log("Attempt number:", attemptNumber);
  console.log("Connecting to:", config.SOCKET_URL);
});

socket.on("error", (error) => {
  console.error("%cSocket error", "color: red; font-weight: bold");
  console.error("Error details:", error);
});

// Debug: Log initial connection state
console.log("%cInitial socket state", "color: blue; font-weight: bold", {
  connected: socket.connected,
  id: socket.id,
  transport: socket.io?.engine?.transport?.name,
  options: socket.io?.opts,
  url: config.SOCKET_URL,
});

export { socket };
