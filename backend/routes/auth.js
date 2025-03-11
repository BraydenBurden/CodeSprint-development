const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const db = require("../db");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/register", async (req, res) => {
  const con = db.getConnection();
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const checkUserSql = "SELECT * FROM users WHERE email = ?";
  con.query(checkUserSql, [email], async (err, users) => {
    if (err) {
      console.error("Error checking existing user:", err);
      return res.status(500).json({
        ok: false,
        message: "Internal server error",
      });
    }

    if (users.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "User already exists with this email",
      });
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const insertUserSql = `
        INSERT INTO users (firstName, lastName, password, email, createdDate, verified, client, developer)
        VALUES (?, ?, ?, ?, NOW(), false, 1, 0)
      `;

      con.query(
        insertUserSql,
        [firstName, lastName, hashedPassword, email],
        async (err, result) => {
          if (err) {
            console.error("Error creating new user:", err);
            return res.status(500).json({
              ok: false,
              message: "Error creating user",
            });
          }

          // Send verification email
          const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:3000";
          const encodedId = Buffer.from(result.insertId.toString()).toString(
            "base64"
          );
          const verificationLink = `${frontendUrl}/verify-email?token=${encodedId}`;

          const mailOptions = {
            from: `CodeSprint <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your CodeSprint account",
            html: `
              <h1>Welcome to CodeSprint!</h1>
              <p>Hi ${firstName},</p>
              <p>Thank you for registering with CodeSprint. Please click the button below to verify your email address:</p>
              <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #0D9488; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p>${verificationLink}</p>
              <p>Best regards,<br>The CodeSprint Team</p>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            res.status(201).json({
              ok: true,
              message:
                "User registered successfully. Please check your email to verify your account.",
              userId: result.insertId,
            });
          } catch (emailError) {
            console.error("Error sending verification email:", emailError);
            res.status(201).json({
              ok: true,
              message:
                "User registered successfully, but there was an error sending the verification email. Please contact support.",
              userId: result.insertId,
            });
          }
        }
      );
    } catch (error) {
      console.error("Error in registration process:", error);
      res.status(500).json({
        ok: false,
        message: "Error during registration",
      });
    }
  });
});

// Email verification endpoint
router.get("/verify/:token", (req, res) => {
  const { token } = req.params;
  const con = db.getConnection();

  try {
    const id = Buffer.from(token, "base64").toString();

    const sql = "UPDATE users SET verified = true WHERE id = ?";
    con.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error verifying email:", err);
        return res.status(500).json({
          ok: false,
          message: "Error verifying email",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          ok: false,
          message: "Invalid verification link",
        });
      }

      res.status(200).json({
        ok: true,
        message: "Email verified successfully. You can now log in.",
      });
    });
  } catch (error) {
    console.error("Error decoding verification token:", error);
    return res.status(400).json({
      ok: false,
      message: "Invalid verification link",
    });
  }
});

router.post("/login", (req, res) => {
  const con = db.getConnection();
  const { email, password } = req.body;

  // Query to fetch user first
  const userQuery = `SELECT * FROM users WHERE email = ?`;

  con.query(userQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Internal server error" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid credentials" });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ ok: false, message: "Invalid credentials" });
      }

      if (!user.verified) {
        return res
          .status(401)
          .json({
            ok: false,
            message: "Please verify your email before logging in",
          });
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      // If user is not a developer, set developer_profile to null
      if (user.developer !== 1) {
        userWithoutPassword.developer_profile = null;
        return res
          .status(200)
          .json({
            ok: true,
            message: "Login successful",
            user: userWithoutPassword,
          });
      }

      // If user is a developer, fetch their profile
      const devQuery = `SELECT displayName, githubUrl, portfolioUrl, yearsOfExperience, primaryLanguage, bio FROM developer_profiles WHERE userId = ?`;

      con.query(devQuery, [user.id], (devErr, devResults) => {
        if (devErr) {
          console.error("Error querying developer profile:", devErr);
          return res
            .status(500)
            .json({ ok: false, message: "Internal server error" });
        }

        userWithoutPassword.developer_profile = devResults[0] || null;

        res
          .status(200)
          .json({
            ok: true,
            message: "Login successful",
            user: userWithoutPassword,
          });
      });
    } catch (error) {
      console.error("Error comparing passwords:", error);
      res.status(500).json({ ok: false, message: "Internal server error" });
    }
  });
});

// Developer profile creation endpoint
router.post("/developer-profile/:userId", (req, res) => {
  const { userId } = req.params;
  const {
    displayName,
    githubUrl,
    portfolioUrl,
    yearsOfExperience,
    primaryLanguage,
    bio,
  } = req.body;
  const con = db.getConnection();

  // First update the user's developer status
  const updateUserSql = "UPDATE users SET developer = 1 WHERE id = ?";
  con.query(updateUserSql, [userId], (err, result) => {
    if (err) {
      console.error("Error updating user developer status:", err);
      return res.status(500).json({
        ok: false,
        message: "Error updating developer status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Then create the developer profile
    const createProfileSql = `
      INSERT INTO developer_profiles (userId, displayName, githubUrl, portfolioUrl, yearsOfExperience, primaryLanguage, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(
      createProfileSql,
      [
        userId,
        displayName,
        githubUrl,
        portfolioUrl,
        yearsOfExperience,
        primaryLanguage,
        bio,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating developer profile:", err);
          return res.status(500).json({
            ok: false,
            message: "Error creating developer profile",
          });
        }

        // Return the created profile data
        res.status(201).json({
          ok: true,
          message: "Developer profile created successfully",
          displayName,
          githubUrl,
          portfolioUrl,
          yearsOfExperience,
          primaryLanguage,
          bio,
        });
      }
    );
  });
});

module.exports = router;
