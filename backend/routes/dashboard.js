const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Feedback = require("../models/Feedback");

/**
 * GET /api/dashboard
 * Returns user-scoped dashboard metrics, chart data and recent feedback.
 * Roles we support: ADMIN, MIT_CORDINATOR, LECTURER, STUDENT, PARENT
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // -------- Scope query by role --------
    let scopeQuery = {};
    if (role === "ADMIN" || role === "MIT_CORDINATOR") {
      // see everything
      scopeQuery = {};
    } else if (role === "LECTURER") {
      // see assigned to me OR ones I created
      scopeQuery = { $or: [{ assignedTo: userId }, { createdBy: userId }] };
    } else if (role === "STUDENT" || role === "PARENT" || role === "STAFF") {
      // (STAFF listed just in case your DB still has some)
      scopeQuery = { createdBy: userId };
    }

    // -------- Fetch scoped feedback --------
    const scoped = await Feedback.find(scopeQuery)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    // Metrics
    const total = scoped.length;
    const pending = scoped.filter((f) => f.status === "PENDING").length;
    const reviewed = scoped.filter((f) => f.status === "REVIEWED").length;
    const resolved = scoped.filter((f) => f.status === "RESOLVED").length;

    // Avg resolution time (use updatedAt as proxy for resolvedAt)
    const resolvedDocs = scoped.filter((f) => f.status === "RESOLVED");
    let avgResolution = "—";
    if (resolvedDocs.length > 0) {
      const ms = resolvedDocs.reduce((sum, f) => {
        const created = new Date(f.createdAt).getTime();
        const updated = new Date(f.updatedAt).getTime();
        return sum + Math.max(0, updated - created);
      }, 0);
      const avgMs = ms / resolvedDocs.length;
      const days = avgMs / (1000 * 60 * 60 * 24);
      avgResolution =
        days >= 1 ? `${days.toFixed(1)} day(s)` : `${(days * 24).toFixed(1)} hr(s)`;
    }

    // Extra counters
    let unassigned = undefined;
    let assignedToMe = undefined;

    if (role === "ADMIN" || role === "MIT_CORDINATOR") {
      unassigned = await Feedback.countDocuments({ assignedTo: { $in: [null, undefined] } });
    }
    if (role === "LECTURER") {
      assignedToMe = await Feedback.countDocuments({ assignedTo: userId });
    }

    // Status chart (scoped)
    const statusCounts = {
      PENDING: pending,
      REVIEWED: reviewed,
      RESOLVED: resolved,
    };

    // Category chart (scoped)
    const catCounts = scoped.reduce(
      (acc, f) => {
        const key = f.category || "OTHER";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      /** @type {Record<string, number>} */ ({})
    );

    // Recent feedback (scoped)
    const recentFeedback = scoped.slice(0, 8).map((fb) => ({
      id: fb._id,
      type: fb.category, // FEEDBACK or SUGGESTION
      category: fb.category,
      submittedBy: fb.isAnonymous ? "Anonymous" : (fb.createdBy?.name || "Unknown"),
      status: fb.status,
      date: fb.createdAt,
    }));

    res.json({
      metrics: {
        total,
        pending,
        resolved,
        avgResolution,
        unassigned,
        assignedToMe,
      },
      charts: {
        statusCounts,
        categoryCounts: catCounts,
      },
      recentFeedback,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
