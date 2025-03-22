const express = require("express");
const router = express.Router();
const db = require("../db");
const { getIO } = require("../services/socketService");
const multer = require("multer");
const moment = require("moment");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|txt)$/)) {
      return cb(new Error("Only image and document files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Get all conversations for a user
router.get("/conversations/:userId", (req, res) => {
  const con = db.getConnection();
  const { userId } = req.params;

  const sql = `
    SELECT DISTINCT c.*, 
           cp.last_read_at,
           u.firstName, u.lastName, u.email,
           (SELECT content FROM messages 
            WHERE conversation_id = c.id 
            ORDER BY created_at DESC LIMIT 1) as last_message,
           (SELECT created_at FROM messages 
            WHERE conversation_id = c.id 
            ORDER BY created_at DESC LIMIT 1) as last_message_time
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    JOIN users u ON cp.user_id = u.id
    WHERE c.id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = ?
    )
    AND cp.user_id != ?
    ORDER BY COALESCE(last_message_time, c.created_at) DESC
  `;

  con.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching conversations:", err);
      return res.status(500).json({
        ok: false,
        message: "Error fetching conversations",
      });
    }

    console.log("Raw conversation results:", results);

    // Format the results
    const conversations = results.map((conv) => ({
      ...conv,
      last_message_time: conv.last_message_time
        ? moment(conv.last_message_time).fromNow()
        : "Just now",
      participant: {
        id: conv.user_id,
        firstName: conv.firstName,
        lastName: conv.lastName,
        email: conv.email,
      },
    }));

    console.log("Formatted conversations:", conversations);

    res.json({
      ok: true,
      conversations,
    });
  });
});

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", (req, res) => {
  const con = db.getConnection();
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT m.*, 
           u.firstName, u.lastName, u.email
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `;

  con.query(sql, [conversationId, parseInt(limit), offset], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({
        ok: false,
        message: "Error fetching messages",
      });
    }

    // Format the results
    const messages = results.map((msg) => ({
      ...msg,
      created_at: moment(msg.created_at).format("YYYY-MM-DD HH:mm:ss"),
      sender: {
        id: msg.sender_id,
        firstName: msg.firstName,
        lastName: msg.lastName,
        email: msg.email,
      },
    }));

    res.json({
      ok: true,
      messages: messages.reverse(), // Reverse to show oldest first
    });
  });
});

// Create a new conversation
router.post("/conversations", (req, res) => {
  const con = db.getConnection();
  const { userId, participantId } = req.body;

  // Check if conversation already exists
  const checkSql = `
    SELECT c.id 
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE cp1.user_id = ? AND cp2.user_id = ?
    AND c.is_group = false
  `;

  con.query(checkSql, [userId, participantId], (err, results) => {
    if (err) {
      console.error("Error checking existing conversation:", err);
      return res.status(500).json({
        ok: false,
        message: "Error checking existing conversation",
      });
    }

    if (results.length > 0) {
      return res.json({
        ok: true,
        conversationId: results[0].id,
      });
    }

    // Create new conversation
    const createSql = "INSERT INTO conversations (created_at) VALUES (NOW())";
    con.query(createSql, (err, result) => {
      if (err) {
        console.error("Error creating conversation:", err);
        return res.status(500).json({
          ok: false,
          message: "Error creating conversation",
        });
      }

      const conversationId = result.insertId;

      // Add participants
      const participantsSql = `
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?), (?, ?)
      `;

      con.query(
        participantsSql,
        [conversationId, userId, conversationId, participantId],
        (err) => {
          if (err) {
            console.error("Error adding participants:", err);
            return res.status(500).json({
              ok: false,
              message: "Error adding participants",
            });
          }

          res.status(201).json({
            ok: true,
            conversationId,
          });
        }
      );
    });
  });
});

// Send a new message
router.post("/conversations/:conversationId/messages", (req, res) => {
  const con = db.getConnection();
  const { conversationId } = req.params;
  const { senderId, content } = req.body;

  const sql = `
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (?, ?, ?)
  `;

  con.query(sql, [conversationId, senderId, content], (err, result) => {
    if (err) {
      console.error("Error sending message:", err);
      return res.status(500).json({
        ok: false,
        message: "Error sending message",
      });
    }

    // Update conversation's last_message_at
    const updateSql =
      "UPDATE conversations SET last_message_at = NOW() WHERE id = ?";
    con.query(updateSql, [conversationId]);

    // Get the created message with sender info
    const getMessageSql = `
      SELECT m.*, u.firstName, u.lastName, u.email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `;

    con.query(getMessageSql, [result.insertId], (err, results) => {
      if (err) {
        console.error("Error fetching created message:", err);
        return res.status(500).json({
          ok: false,
          message: "Error fetching created message",
        });
      }

      const message = {
        ...results[0],
        created_at: moment(results[0].created_at).format("YYYY-MM-DD HH:mm:ss"),
        sender: {
          id: results[0].sender_id,
          firstName: results[0].firstName,
          lastName: results[0].lastName,
          email: results[0].email,
        },
      };

      // Emit the new message to all participants
      const io = getIO();
      io.to(`conversation_${conversationId}`).emit("new_message", message);

      res.status(201).json({
        ok: true,
        message,
      });
    });
  });
});

// Mark messages as read
router.post("/conversations/:conversationId/read", (req, res) => {
  const con = db.getConnection();
  const { conversationId } = req.params;
  const { userId } = req.body;

  const sql = `
    UPDATE conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = ? AND user_id = ?
  `;

  con.query(sql, [conversationId, userId], (err) => {
    if (err) {
      console.error("Error marking messages as read:", err);
      return res.status(500).json({
        ok: false,
        message: "Error marking messages as read",
      });
    }

    // Emit read status to other participants
    const io = getIO();
    io.to(`conversation_${conversationId}`).emit("messages_read", {
      userId,
      conversationId,
    });

    res.json({
      ok: true,
      message: "Messages marked as read",
    });
  });
});

// Upload attachment
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No file uploaded",
      });
    }

    // TODO: Implement file upload to Cloudinary
    // For now, just return a mock response
    res.json({
      ok: true,
      file: {
        url: "https://example.com/file.jpg",
        type: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      ok: false,
      message: "Error uploading file",
    });
  }
});

module.exports = router;
