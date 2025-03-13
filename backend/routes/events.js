const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all events for a user
router.get("/", (req, res) => {
  const con = db.getConnection();
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      message: "User ID is required",
    });
  }

  const sql = "SELECT * FROM events WHERE user_id = ? ORDER BY start ASC";
  con.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({
        ok: false,
        message: "Error fetching events",
      });
    }

    res.json({
      ok: true,
      events: results,
    });
  });
});

// Create a new event
router.post("/", (req, res) => {
  const con = db.getConnection();
  const {
    title,
    start,
    end,
    description,
    type,
    all_day,
    background_color,
    text_color,
    user_id,
  } = req.body;

  if (!title || !start || !end || !user_id) {
    return res.status(400).json({
      ok: false,
      message: "Missing required fields",
    });
  }

  const sql = `
    INSERT INTO events (
      title, start, end, description, type, all_day, 
      background_color, text_color, user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  con.query(
    sql,
    [
      title,
      start,
      end,
      description || null,
      type || "meeting",
      all_day || false,
      background_color || null,
      text_color || null,
      user_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating event:", err);
        return res.status(500).json({
          ok: false,
          message: "Error creating event",
        });
      }

      // Fetch the created event
      const getEventSql = "SELECT * FROM events WHERE id = ?";
      con.query(getEventSql, [result.insertId], (err, results) => {
        if (err) {
          console.error("Error fetching created event:", err);
          return res.status(500).json({
            ok: false,
            message: "Error fetching created event",
          });
        }

        res.status(201).json({
          ok: true,
          message: "Event created successfully",
          event: results[0],
        });
      });
    }
  );
});

// Update an event
router.put("/:eventId", (req, res) => {
  const con = db.getConnection();
  const { eventId } = req.params;
  const updateFields = [];
  const updateValues = [];

  // Build the update query dynamically based on provided fields
  if (req.body.background_color !== undefined) {
    updateFields.push("background_color = ?");
    updateValues.push(req.body.background_color);
  }
  if (req.body.text_color !== undefined) {
    updateFields.push("text_color = ?");
    updateValues.push(req.body.text_color);
  }
  if (req.body.completed !== undefined) {
    updateFields.push("completed = ?");
    updateValues.push(req.body.completed);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      ok: false,
      message: "No fields to update",
    });
  }

  const sql = `
    UPDATE events 
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;

  // Add eventId to the values array
  updateValues.push(eventId);

  con.query(sql, updateValues, (err, result) => {
    if (err) {
      console.error("Error updating event:", err);
      return res.status(500).json({
        ok: false,
        message: "Error updating event",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Event not found",
      });
    }

    // Fetch the updated event
    const getEventSql = "SELECT * FROM events WHERE id = ?";
    con.query(getEventSql, [eventId], (err, results) => {
      if (err) {
        console.error("Error fetching updated event:", err);
        return res.status(500).json({
          ok: false,
          message: "Error fetching updated event",
        });
      }

      res.json({
        ok: true,
        message: "Event updated successfully",
        event: results[0],
      });
    });
  });
});

// Delete an event
router.delete("/:eventId", (req, res) => {
  const con = db.getConnection();
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({
      ok: false,
      message: "Event ID is required",
    });
  }

  const sql = "DELETE FROM events WHERE id = ?";
  con.query(sql, [eventId], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({
        ok: false,
        message: "Error deleting event",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Event not found",
      });
    }

    res.json({
      ok: true,
      message: "Event deleted successfully",
    });
  });
});

module.exports = router;
