const mysql = require("mysql2");
require("dotenv").config();

let con;
let reconnecting = false; // Flag to avoid multiple reconnection attempts

// Function to create or recreate the database connection
const createConnection = () => {
  con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "codesprint",
  });

  con.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL database: " + err.stack);
      reconnecting = false; // Allow reconnection attempts
      setTimeout(createConnection, 5000); // Reconnect after 5 seconds
    } else {
      console.log(`Successfully connected to codesprint database.`);
      reconnecting = false; // Reset reconnection flag
    }
  });

  con.on("error", (err) => {
    console.error("MySQL error event triggered:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST" && !reconnecting) {
      console.log("MySQL connection lost, attempting to reconnect...");
      reconnecting = true; // Set flag to avoid multiple reconnection attempts
      setTimeout(createConnection, 5000); // Reconnect after 5 seconds
    } else {
      console.error("Unhandled MySQL error:", err);
      throw err; // For other errors, rethrow them
    }
  });
};

// Initial connection
createConnection();

// Export the connection object
module.exports = {
  getConnection: () => con,
};
