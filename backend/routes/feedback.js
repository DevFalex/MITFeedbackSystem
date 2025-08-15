const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/feedback directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "feedback");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/feedback");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Submit feedback/suggestion
router.post(
  "/",
  authMiddleware,
  upload.single("attachment"),
  async (req, res) => {
    const { title, description, category, isAnonymous } = req.body;
    try {
      const feedback = new Feedback({
        title,
        description,
        category,
        isAnonymous: isAnonymous === "true",
        createdBy: req.user.id,
        attachment: req.file ? req.file.filename : null,
      });
      await feedback.save();
      const populated = await Feedback.findById(feedback._id)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role");
      res.status(201).json(populated);
      //res.status(201).json(feedback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get all feedbacks (Admin, MIT_CORDINATOR, LECTURER)
router.get(
  "/allfeeds",
  authMiddleware,
  roleMiddleware(["ADMIN", "MIT_CORDINATOR", "LECTURER"]),
  async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .sort({ createdAt: -1 });
      res.json(feedbacks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get my feedbacks (for logged-in user)
router.get("/myfeeds", authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ createdBy: req.user.id })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({
        createdAt: -1,
      });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update feedback status (Admin, MIT_CORDINATOR, LECTURER)
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "MIT_CORDINATOR", "LECTURER"]),
  async (req, res) => {
    const { status } = req.body;
    const allowed = ["PENDING", "REVIEWED", "RESOLVED"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    try {
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role");

      if (!feedback)
        return res.status(404).json({ message: "Feedback not found" });
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Add comment (any authenticated user)
router.post("/:id/comment", authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Comment text is required" });
  }
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    feedback.comments.push({ text, user: req.user.id });
    await feedback.save();

    const populated = await Feedback.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("comments.user", "name email role");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update feedback (only creator & if pending)
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    if (feedback.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (feedback.status !== "PENDING")
      return res
        .status(400)
        .json({ message: "Cannot edit feedback after review" });

    feedback.title = title || feedback.title;
    feedback.description = description || feedback.description;
    feedback.category = category || feedback.category;

    if (req.file) {
      feedback.attachment = req.file.filename;
    }

    await feedback.save();
    const populated = await Feedback.findById(feedback._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete feedback
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    if (feedback.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (feedback.status !== "PENDING")
      return res
        .status(400)
        .json({ message: "Cannot delete feedback after review" });

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Assign feedback (Admin, MIT_CORDINATOR)
router.put(
  "/:id/assign",
  authMiddleware,
  roleMiddleware(["ADMIN", "MIT_CORDINATOR", "LECTURER"]),
  async (req, res) => {
    try {
      const { role, assignee } = req.body; // role is for display; assignee is a User _id
      if (!assignee)
        return res.status(400).json({ message: "assignee is required" });

      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        { assignedTo: assignee, assignedRole: role || null },
        { new: true }
      )
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role");

      if (!feedback)
        return res.status(404).json({ message: "Feedback not found" });
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
// Add comment to feedback
router.post("/:id/comments", authMiddleware, async (req, res) => {
  const { text } = req.body;

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Push comment
    feedback.comments.push({
      text,
      user: req.user.id,
    });

    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update feedback category (ADMIN, MIT_CORDINATOR only)
router.put(
  "/:id/category",
  authMiddleware,
  roleMiddleware(["ADMIN", "MIT_CORDINATOR"]),
  async (req, res) => {
    const { category } = req.body;

    try {
      const feedback = await Feedback.findById(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      feedback.category = category || feedback.category;
      await feedback.save();

      res.json(feedback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
// Get feedback assigned to logged-in user
router.get("/assigned/me", authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ assignedTo: req.user.id })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// // Update feedback (owner can update their feedback)
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const feedback = await Feedback.findById(req.params.id);
//     if (!feedback) return res.status(404).json({ message: "Feedback not found" });
//     if (feedback.createdBy.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized to update this feedback" });
//     }

//     // Handle file upload if present
//     if (req.files && req.files.attachment) {
//       const file = req.files.attachment;
//       const uploadPath = `uploads/feedback/${file.name}`;
//       await file.mv(uploadPath);
//       feedback.attachment = file.name;
//     }

//     feedback.title = req.body.title || feedback.title;
//     feedback.description = req.body.description || feedback.description;
//     feedback.category = req.body.category || feedback.category;

//     await feedback.save();
//     res.json(feedback);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Delete feedback (owner or admin)
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const feedback = await Feedback.findById(req.params.id);
//     if (!feedback) return res.status(404).json({ message: "Feedback not found" });

//     if (feedback.createdBy.toString() !== req.user.id && req.user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Not authorized to delete this feedback" });
//     }

//     await feedback.deleteOne();
//     res.json({ message: "Feedback deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
