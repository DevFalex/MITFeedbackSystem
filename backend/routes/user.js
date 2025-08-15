const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

// Get all users (Admin only)
router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get users by role (Admin, MIT_CORDINATOR can fetch to assign)
router.get(
  "/role/:role",
  authMiddleware,
  roleMiddleware(["ADMIN", "MIT_CORDINATOR", "LECTURER"]),
  async (req, res) => {
    const { role } = req.params;
    try {
      const allowed = [
        "LECTURER",
        "MIT_COORDINATOR",
        "ADMIN",
        "STAFF",
        "STUDENT",
        "PARENT",
      ];
      if (!allowed.includes(role))
        return res.status(400).json({ message: "Invalid role" });

      const users = await User.find({ role }).select(
        "name username email role"
      );
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
