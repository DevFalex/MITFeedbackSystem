const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const FeedbackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ["FEEDBACK", "SUGGESTION"],
      default: "FEEDBACK",
    },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "RESOLVED"],
      default: "PENDING",
    },
    attachment: { type: String, default: null },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedRole: {
      type: String,
      enum: ["LECTURER", "MIT_COORDINATOR", "ADMIN"],
      default: null,
    },

    comments: [CommentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
