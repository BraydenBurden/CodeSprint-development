const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

router.post("/createproject", (req, res) => {
  const con = db.getConnection();
  const { requestor_id, requestor_name, title, description } = req.body;

  if (!requestor_id || !title) {
    return res.status(400).json({
      ok: false,
      message: "Missing required fields",
    });
  }

  const sql = `
    INSERT INTO jobs (
      requestor_id, requestor_name, title, description, created_at, updated_at, status
    ) VALUES (?, ?, ?, ?, NOW(), NOW(), 'Bidding')
  `;

  con.query(
    sql,
    [requestor_id, requestor_name, title, description || null],
    (err, result) => {
      if (err) {
        console.error("Error creating job:", err);
        return res.status(500).json({
          ok: false,
          message: "Error creating job",
        });
      }

      // Fetch and return the newly created job
      const getJobSql = `SELECT * FROM jobs WHERE id = ?`;
      con.query(getJobSql, [result.insertId], (err, results) => {
        if (err) {
          console.error("Error fetching created job:", err);
          return res.status(500).json({
            ok: false,
            message: "Error fetching created job",
          });
        }

        return res.status(201).json({
          ok: true,
          message: "Job created successfully",
          job: results[0],
        });
      });
    }
  );
});

router.get("/myjobs/:userId", (req, res) => {
  const con = db.getConnection();
  const userId = req.params.userId;
  console.log(userId, "jhsfgyfi");

  if (!userId) {
    return res.status(400).json({
      ok: false,
      message: "User ID is required",
    });
  }

  const sql = `
    SELECT * FROM jobs
    WHERE requestor_id = ?
    ORDER BY id DESC
  `;

  con.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user jobs:", err);
      return res.status(500).json({
        ok: false,
        message: "Error fetching jobs",
      });
    }
    console.log(results, "fsfuihiwef");

    res.json({
      ok: true,
      jobs: results,
    });
  });
});

router.get("/otherjobs/:userId", (req, res) => {
  const con = db.getConnection();
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      message: "User ID is required",
    });
  }

  const sql = `
    SELECT * FROM jobs
    WHERE requestor_id != ?
    ORDER BY id DESC
  `;

  con.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching other jobs:", err);
      return res.status(500).json({
        ok: false,
        message: "Error fetching jobs",
      });
    }

    res.json({
      ok: true,
      jobs: results,
    });
  });
});

router.put("/updatejob/:id", (req, res) => {
  const con = db.getConnection();
  const jobId = req.params.id;

  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      ok: false,
      message: "Job title is required",
    });
  }

  const sql = `
    UPDATE jobs
    SET title = ?, description = ?, updated_at = NOW()
    WHERE id = ?
  `;

  con.query(sql, [title.trim(), description || null, jobId], (err, result) => {
    if (err) {
      console.error("Error updating job:", err);
      return res.status(500).json({
        ok: false,
        message: "Error updating job",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Job not found",
      });
    }

    // Fetch updated job to return
    const fetchSql = "SELECT * FROM jobs WHERE id = ?";
    con.query(fetchSql, [jobId], (err, results) => {
      if (err || results.length === 0) {
        console.error("Error fetching updated job:", err);
        return res.status(500).json({
          ok: false,
          message: "Error fetching updated job",
        });
      }

      res.json({
        ok: true,
        message: "Job updated successfully",
        job: results[0],
      });
    });
  });
});

module.exports = router;
