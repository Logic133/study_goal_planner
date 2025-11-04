import express from "express";
import { auth } from "../middleware/authMiddleware.js"; // ✅ Fixed import path
import Goal from "../models/Goal.js";

const router = express.Router();

// ---------------- GET all goals for the logged-in user ----------------
router.get("/", auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch goals" });
  }
});

// ---------------- CREATE goal ----------------
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      deadline,
      date,
      reminderTime,
      isRecurring = false,
      frequency = "Daily",
      tasks = "",
      source = "manual"
    } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !deadline || !date || !reminderTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const goal = new Goal({
      title,
      description,
      duration,
      deadline: new Date(deadline),
      date: new Date(date),
      reminderTime: new Date(reminderTime),
      isRecurring,
      frequency,
      tasks,
      source,
      user: req.user.id,
      currentInstanceDate: isRecurring ? new Date(date) : null
    });

    await goal.save();
    
    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal
    });

  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create goal"
    });
  }
});

// ---------------- UPDATE a goal ----------------
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      deadline,
      date,
      reminderTime,
      isRecurring,
      frequency,
      tasks
    } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    // Update fields
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (duration !== undefined) goal.duration = duration;
    if (deadline !== undefined) goal.deadline = new Date(deadline);
    if (date !== undefined) goal.date = new Date(date);
    if (reminderTime !== undefined) goal.reminderTime = new Date(reminderTime);
    if (isRecurring !== undefined) goal.isRecurring = isRecurring;
    if (frequency !== undefined) goal.frequency = frequency;
    if (tasks !== undefined) goal.tasks = tasks;

    await goal.save();
    
    res.json({
      success: true,
      message: "Goal updated successfully",
      goal
    });
  } catch (err) {
    console.error("Update goal error:", err);
    res.status(500).json({ success: false, message: "Failed to update goal" });
  }
});

// ---------------- DELETE a goal ----------------
router.delete("/:id", auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    res.json({
      success: true,
      message: "Goal deleted successfully"
    });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({ success: false, message: "Failed to delete goal" });
  }
});

// ---------------- MARK goal as completed (for one-time goals) ----------------
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    // If it's a recurring goal, use the complete-recurring endpoint instead
    if (goal.isRecurring) {
      return res.status(400).json({
        success: false,
        message: "This is a recurring goal. Use the complete-recurring endpoint instead."
      });
    }

    goal.completed = true;
    goal.status = 'completed';
    await goal.save();

    res.json({
      success: true,
      message: "Goal completed successfully",
      goal
    });
  } catch (err) {
    console.error("Complete goal error:", err);
    res.status(500).json({ success: false, message: "Failed to mark goal completed" });
  }
});

// ---------------- COMPLETE RECURRING GOAL INSTANCE ----------------
router.put("/:id/complete-recurring", auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    // If it's not a recurring goal, use the normal complete endpoint
    if (!goal.isRecurring) {
      return res.status(400).json({
        success: false,
        message: "This is not a recurring goal. Use the complete endpoint instead."
      });
    }

    // Mark today as completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize completedDates array if it doesn't exist
    if (!goal.completedDates) {
      goal.completedDates = [];
    }

    // Check if today is already completed
    const todayCompleted = goal.completedDates.some(completed => {
      const completedDate = new Date(completed.date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    if (todayCompleted) {
      return res.status(400).json({
        success: false,
        message: "Goal already completed for today"
      });
    }

    // Add today to completed dates
    goal.completedDates.push({
      date: today,
      completedAt: new Date()
    });

    // Calculate next instance based on frequency
    let nextDate = new Date(goal.currentInstanceDate || goal.date);
    
    switch (goal.frequency) {
      case "Daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "Weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "Monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
    }

    // Check if we've reached the end date
    const endDate = new Date(goal.deadline);
    endDate.setHours(23, 59, 59, 999);

    if (nextDate > endDate) {
      goal.completed = true;
      goal.status = 'completed';
      goal.currentInstanceDate = null;
    } else {
      goal.currentInstanceDate = nextDate;
    }

    await goal.save();

    res.json({
      success: true,
      message: "Recurring goal instance completed successfully",
      goal: {
        _id: goal._id,
        title: goal.title,
        currentInstanceDate: goal.currentInstanceDate,
        completedDates: goal.completedDates,
        completed: goal.completed,
        nextInstance: !goal.completed ? goal.currentInstanceDate : null
      }
    });

  } catch (error) {
    console.error("Complete recurring goal error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete goal instance"
    });
  }
});

// ---------------- GET TODAY'S ACTIVE GOALS ----------------
router.get("/today/active", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const goals = await Goal.find({
      user: req.user.id,
      completed: false,
      $or: [
        // Recurring goals with current instance today
        {
          isRecurring: true,
          currentInstanceDate: {
            $gte: today,
            $lt: tomorrow
          }
        },
        // One-time goals with deadline today or future
        {
          isRecurring: false,
          deadline: { $gte: today }
        }
      ]
    }).sort({ reminderTime: 1 });

    res.json({ success: true, goals });
  } catch (error) {
    console.error("Get today's goals error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch today's goals" });
  }
});

// ---------------- AUTO-RESET RECURRING GOALS (for cron job) ----------------
router.post("/auto-reset", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find recurring goals that have current instance date in past and are not completed
    const goalsToReset = await Goal.find({
      isRecurring: true,
      completed: false,
      $or: [
        { currentInstanceDate: { $lt: today } },
        { currentInstanceDate: { $exists: false } }
      ]
    });

    let resetCount = 0;

    for (const goal of goalsToReset) {
      const instanceDate = new Date(goal.currentInstanceDate || goal.date);
      instanceDate.setHours(0, 0, 0, 0);

      // If instance date is in past and goal is not completed for today, update to today
      if (instanceDate < today) {
        // Check if goal was already completed today
        const todayCompleted = goal.completedDates?.some(completed => {
          const completedDate = new Date(completed.date);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === today.getTime();
        });

        if (!todayCompleted) {
          goal.currentInstanceDate = today;
          await goal.save();
          resetCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Auto-reset ${resetCount} recurring goals for today`,
      resetCount
    });

  } catch (error) {
    console.error("Auto-reset error:", error);
    res.status(500).json({ success: false, message: "Auto-reset failed" });
  }
});

// ---------------- GET GOAL STATISTICS ----------------
router.get("/stats", auth, async (req, res) => {
  try {
    const totalGoals = await Goal.countDocuments({ user: req.user.id });
    const completedGoals = await Goal.countDocuments({
      user: req.user.id,
      completed: true
    });
    const recurringGoals = await Goal.countDocuments({
      user: req.user.id,
      isRecurring: true
    });
    
    // Calculate total completions for recurring goals
    const recurringGoalsData = await Goal.find({
      user: req.user.id,
      isRecurring: true
    });
    
    let totalCompletions = 0;
    recurringGoalsData.forEach(goal => {
      totalCompletions += goal.completedDates?.length || 0;
    });

    // Calculate today's completions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompletions = recurringGoalsData.reduce((count, goal) => {
      const todayCompleted = goal.completedDates?.some(completed => {
        const completedDate = new Date(completed.date);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === today.getTime();
      });
      return todayCompleted ? count + 1 : count;
    }, 0);

    res.json({
      success: true,
      stats: {
        totalGoals,
        completedGoals,
        recurringGoals,
        totalCompletions,
        todayCompletions,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch statistics" });
  }
});

// ---------------- GET GOALS BY SOURCE ----------------
router.get("/source/:source", auth, async (req, res) => {
  try {
    const { source } = req.params;
    const goals = await Goal.find({
      user: req.user.id,
      source: source
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      goals,
      count: goals.length
    });
  } catch (error) {
    console.error("Get goals by source error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch goals by source" });
  }
});

export default router;