// routes/reminderRoutes.js
import express from "express";
import Reminder from "../models/Reminder.js";
import { auth } from "../middleware/authMiddleware.js";
import goalReminderScheduler from "../services/goalReminderScheduler.js"; // ✅ Import scheduler

const router = express.Router();

// ✅ GET all reminders for logged-in user (WITH FILTERS)
router.get("/my", auth, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.reminderTime = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const reminders = await Reminder.find(query)
      .populate('goal', 'title description duration')
      .sort({ reminderTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Reminder.countDocuments(query);
    
    res.json({ 
      success: true, 
      reminders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("Failed to fetch reminders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch reminders" });
  }
});

// ✅ CREATE a new reminder (ENHANCED)
router.post("/", auth, async (req, res) => {
  try {
    const { 
      goalId, 
      title, 
      reminderTime, 
      frequency = "once",
      recurrencePattern,
      timezone = "Asia/Kolkata",
      source = "manual"
    } = req.body;
    
    if (!title || !reminderTime) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and reminderTime are required" 
      });
    }

    const reminderData = {
      goal: goalId,
      user: req.user.id,
      title,
      reminderTime: new Date(reminderTime),
      frequency,
      timezone,
      source,
      status: "scheduled"
    };

    // Add recurrence pattern if provided
    if (recurrencePattern) {
      reminderData.recurrencePattern = recurrencePattern;
    }

    // Add goal details if available
    if (goalId) {
      const Goal = await import("../models/Goal.js").then(mod => mod.default);
      const goal = await Goal.findById(goalId);
      if (goal) {
        reminderData.goalTitle = goal.title;
        reminderData.goalDescription = goal.description;
      }
    }

    const reminder = new Reminder(reminderData);
    await reminder.save();

    // ✅ Trigger immediate scheduler check
    goalReminderScheduler.manualCheck();

    res.json({ 
      success: true, 
      reminder,
      message: "Reminder created successfully"
    });
  } catch (err) {
    console.error("Failed to create reminder:", err);
    res.status(500).json({ success: false, message: "Failed to create reminder" });
  }
});

// ✅ UPDATE reminder
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, reminderTime, frequency, status } = req.body;
    
    const reminder = await Reminder.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: "Reminder not found" 
      });
    }

    if (title) reminder.title = title;
    if (reminderTime) reminder.reminderTime = new Date(reminderTime);
    if (frequency) reminder.frequency = frequency;
    if (status) reminder.status = status;

    await reminder.save();

    res.json({ 
      success: true, 
      reminder,
      message: "Reminder updated successfully" 
    });
  } catch (err) {
    console.error("Failed to update reminder:", err);
    res.status(500).json({ success: false, message: "Failed to update reminder" });
  }
});

// ✅ SNOOZE reminder
router.put("/:id/snooze", auth, async (req, res) => {
  try {
    const { minutes = 10 } = req.body;
    
    const reminder = await Reminder.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: "Reminder not found" 
      });
    }

    await reminder.snooze(minutes);

    res.json({ 
      success: true, 
      reminder,
      message: `Reminder snoozed for ${minutes} minutes` 
    });
  } catch (err) {
    console.error("Failed to snooze reminder:", err);
    res.status(500).json({ success: false, message: "Failed to snooze reminder" });
  }
});

// ✅ CANCEL reminder
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: "Reminder not found" 
      });
    }

    reminder.status = "cancelled";
    await reminder.save();

    res.json({ 
      success: true, 
      reminder,
      message: "Reminder cancelled successfully" 
    });
  } catch (err) {
    console.error("Failed to cancel reminder:", err);
    res.status(500).json({ success: false, message: "Failed to cancel reminder" });
  }
});

// ✅ DELETE reminder
router.delete("/:id", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: "Reminder not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Reminder deleted successfully" 
    });
  } catch (err) {
    console.error("Failed to delete reminder:", err);
    res.status(500).json({ success: false, message: "Failed to delete reminder" });
  }
});

// ✅ GET scheduler status
router.get("/scheduler/status", auth, async (req, res) => {
  try {
    const status = goalReminderScheduler.getStatus();
    res.json({ 
      success: true, 
      status 
    });
  } catch (err) {
    console.error("Failed to get scheduler status:", err);
    res.status(500).json({ success: false, message: "Failed to get scheduler status" });
  }
});

export default router;