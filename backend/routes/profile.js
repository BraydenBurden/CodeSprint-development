const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const ProfilePictureService = require("../services/profilePictureService");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Update user profile
router.put("/user/:userId", (req, res) => {
  const con = db.getConnection();
  const { firstName, lastName, phoneNumber } = req.body;
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    console.log("Backend - Invalid user ID detected");
    return res.status(400).json({
      ok: false,
      message: "Invalid user ID",
    });
  }

  // Update user details
  const updateUserSql =
    "UPDATE users SET firstName = ?, lastName = ?, phoneNumber = ? WHERE id = ?";

  con.query(
    updateUserSql,
    [firstName, lastName, phoneNumber, userId],
    (err, result) => {
      if (err) {
        console.error("Backend - Error updating user profile:", err);
        return res.status(500).json({
          ok: false,
          message: "Error updating profile",
        });
      }

      // Fetch updated user data
      const getUserSql = `
      SELECT u.id, u.firstName, u.lastName, u.email, u.phoneNumber, u.createdDate, u.developer,
             dp.displayName, dp.githubUrl, dp.portfolioUrl, dp.yearsOfExperience, dp.primaryLanguage, dp.bio
      FROM users u
      LEFT JOIN developer_profiles dp ON u.id = dp.userId AND u.developer = 1
      WHERE u.id = ?
    `;

      con.query(getUserSql, [userId], (err, results) => {
        if (err) {
          console.error("Backend - Error fetching updated user data:", err);
          return res.status(500).json({
            ok: false,
            message: "Error fetching updated profile",
          });
        }

        if (results.length === 0) {
          console.log("Backend - No user found with ID:", userId);
          return res.status(404).json({
            ok: false,
            message: "User not found",
          });
        }

        const user = results[0];

        // If user is a developer, format the developer profile data
        if (user.developer === 1) {
          const developerProfile = {
            displayName: user.displayName,
            githubUrl: user.githubUrl,
            portfolioUrl: user.portfolioUrl,
            yearsOfExperience: user.yearsOfExperience,
            primaryLanguage: user.primaryLanguage,
            bio: user.bio,
          };

          // Remove developer profile fields from main user object
          delete user.displayName;
          delete user.githubUrl;
          delete user.portfolioUrl;
          delete user.yearsOfExperience;
          delete user.primaryLanguage;
          delete user.bio;

          // Add developer_profile to user object
          user.developer_profile = developerProfile;
        }

        res.json({
          ok: true,
          message: "Profile updated successfully",
          user,
        });
      });
    }
  );
});

// Update developer profile
router.put("/developer/:userId", (req, res) => {
  const con = db.getConnection();
  const { displayName, primaryLanguage, bio, githubUrl, portfolioUrl } =
    req.body;
  const userId = parseInt(req.params.userId, 10); // Convert to number
  console.log(userId);
  if (isNaN(userId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid user ID",
    });
  }

  // Check if developer profile exists
  const checkProfileSql = "SELECT * FROM developer_profiles WHERE userId = ?";
  con.query(checkProfileSql, [userId], (err, profiles) => {
    if (err) {
      console.error("Error checking developer profile:", err);
      return res.status(500).json({
        ok: false,
        message: "Error checking developer profile",
      });
    }

    if (profiles.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Developer profile not found",
      });
    }

    // Update developer profile
    const updateProfileSql = `
      UPDATE developer_profiles 
      SET displayName = ?, primaryLanguage = ?, bio = ?, githubUrl = ?, portfolioUrl = ?
      WHERE userId = ?
    `;

    con.query(
      updateProfileSql,
      [displayName, primaryLanguage, bio, githubUrl, portfolioUrl, userId],
      (err, result) => {
        if (err) {
          console.error("Error updating developer profile:", err);
          return res.status(500).json({
            ok: false,
            message: "Error updating developer profile",
          });
        }

        // Fetch updated user data with developer profile
        const getUserSql = `
          SELECT u.id, u.firstName, u.lastName, u.email, u.phoneNumber, u.createdDate, u.developer,
                 dp.displayName, dp.githubUrl, dp.portfolioUrl, dp.yearsOfExperience, dp.primaryLanguage, dp.bio
          FROM users u
          LEFT JOIN developer_profiles dp ON u.id = dp.userId AND u.developer = 1
          WHERE u.id = ?
        `;

        con.query(getUserSql, [userId], (err, results) => {
          if (err) {
            console.error("Error fetching updated user data:", err);
            return res.status(500).json({
              ok: false,
              message: "Error fetching updated profile",
            });
          }

          const user = results[0];

          // Format the developer profile data
          const developerProfile = {
            displayName: user.displayName,
            githubUrl: user.githubUrl,
            portfolioUrl: user.portfolioUrl,
            yearsOfExperience: user.yearsOfExperience,
            primaryLanguage: user.primaryLanguage,
            bio: user.bio,
          };

          // Remove developer profile fields from main user object
          delete user.displayName;
          delete user.githubUrl;
          delete user.portfolioUrl;
          delete user.yearsOfExperience;
          delete user.primaryLanguage;
          delete user.bio;

          // Add developer_profile to user object
          user.developer_profile = developerProfile;

          res.json({
            ok: true,
            message: "Developer profile updated successfully",
            user,
          });
        });
      }
    );
  });
});

// Upload profile picture
router.post(
  "/user/:userId/profile-picture",
  upload.single("profilePicture"),
  (req, res) => {
    console.log("Profile picture upload route hit");
    console.log("Request params:", req.params);
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);

    try {
      const userId = parseInt(req.params.userId, 10);
      console.log("Parsed userId:", userId);

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({
          ok: false,
          message: "No file uploaded",
        });
      }

      // Upload to Cloudinary
      ProfilePictureService.uploadProfilePicture(req.file, userId)
        .then((downloadURL) => {
          console.log("Cloudinary upload successful, URL:", downloadURL);
          // Update user's profile picture URL in database
          const con = db.getConnection();
          const updateSql =
            "UPDATE users SET profile_picture_url = ? WHERE id = ?";
          con.query(updateSql, [downloadURL, userId], (err) => {
            if (err) {
              console.error("Error updating profile picture URL:", err);
              return res.status(500).json({
                ok: false,
                message: "Error updating profile picture URL",
              });
            }

            console.log("Database update successful");
            res.json({
              ok: true,
              message: "Profile picture uploaded successfully",
              profilePictureUrl: downloadURL,
            });
          });
        })
        .catch((error) => {
          console.error("Error uploading to Cloudinary:", error);
          res.status(500).json({
            ok: false,
            message: "Error uploading profile picture",
          });
        });
    } catch (error) {
      console.error("Error in profile picture upload route:", error);
      res.status(500).json({
        ok: false,
        message: "Error uploading profile picture",
      });
    }
  }
);

// Delete profile picture
router.delete("/user/:userId/profile-picture", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const con = db.getConnection();

    // Get current profile picture URL
    const [user] = await con.query(
      "SELECT profile_picture_url FROM users WHERE id = ?",
      [userId]
    );

    if (!user || !user.profile_picture_url) {
      return res.status(404).json({
        ok: false,
        message: "No profile picture found",
      });
    }

    // Delete from Cloudinary
    await ProfilePictureService.deleteProfilePicture(userId);

    // Update database to remove profile picture URL
    await con.query(
      "UPDATE users SET profile_picture_url = NULL WHERE id = ?",
      [userId]
    );

    res.json({
      ok: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({
      ok: false,
      message: "Error deleting profile picture",
    });
  }
});

// Get profile picture URL
router.get("/user/:userId/profile-picture", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const con = db.getConnection();

    const [user] = await con.query(
      "SELECT profile_picture_url FROM users WHERE id = ?",
      [userId]
    );

    if (!user || !user.profile_picture_url) {
      return res.status(404).json({
        ok: false,
        message: "No profile picture found",
      });
    }

    res.json({
      ok: true,
      profilePictureUrl: user.profile_picture_url,
    });
  } catch (error) {
    console.error("Error getting profile picture:", error);
    res.status(500).json({
      ok: false,
      message: "Error getting profile picture",
    });
  }
});

module.exports = router;
