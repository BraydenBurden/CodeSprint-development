const cloudinary = require("../config/cloudinary");
const path = require("path");

class ProfilePictureService {
  static async uploadProfilePicture(file, userId) {
    try {
      // Convert buffer to base64
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "profile-pictures",
        public_id: `user-${userId}`,
        resource_type: "auto",
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" },
        ],
      });

      return result.secure_url;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  }

  static async deleteProfilePicture(userId) {
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(`profile-pictures/user-${userId}`);
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      throw error;
    }
  }

  static async getProfilePictureUrl(userId) {
    try {
      // Get the URL from Cloudinary
      const result = await cloudinary.url(`profile-pictures/user-${userId}`, {
        secure: true,
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" },
        ],
      });
      return result;
    } catch (error) {
      console.error("Error getting profile picture URL:", error);
      throw error;
    }
  }
}

module.exports = ProfilePictureService;
