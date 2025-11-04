import Goal from "../models/Goal.js";
import Reminder from "../models/Reminder.js";
import { scheduleReminder } from "./reminderScheduler.js";

export const createGoal = async (req, res) => {
  try {
    const { title, description, duration, deadline, date, reminderTime } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, description, and duration are required" 
      });
    }

    // ✅ Determine if it's a recurring goal
    const isRecurring = ["daily", "weekly", "monthly"].includes(duration.toLowerCase());
    
    // ✅ Calculate dates
    const startDate = date ? new Date(date) : new Date();
    const deadlineDate = new Date(deadline);
    
    // For recurring goals, set current instance to today
    let currentInstanceDate = startDate;
    if (isRecurring) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      currentInstanceDate = today;
    }

    // ✅ Create goal
    const goalData = {
      title, 
      description, 
      duration: duration.toLowerCase(),
      deadline: deadlineDate,
      date: startDate,
      reminderTime: reminderTime || "09:00 AM",
      user: req.user.id,
      status: 'pending',
      completed: false,
      
      // ✅ Recurring fields
      isRecurring: isRecurring,
      startDate: startDate,
      currentInstanceDate: currentInstanceDate,
      completedDates: []
    };

    const goal = new Goal(goalData);
    await goal.save();

    // ✅ Create reminder
    const reminder = new Reminder({
      title: `Goal Reminder: ${title}`,
      goal: goal._id,
      user: req.user.id,
      time: goalData.reminderTime,
      frequency: goalData.duration,
    });
    await reminder.save();

    scheduleReminder(reminder);

    res.json({ 
      success: true, 
      message: isRecurring ? 
        "Recurring goal created! It will reset automatically." : 
        "Goal created successfully!",
      goal
    });
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // ✅ TODAY'S DATE
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Add today's status for each goal
    const goalsWithStatus = goals.map(goal => {
      const goalObj = goal.toObject();
      
      if (goalObj.isRecurring && !goalObj.completed) {
        const instanceDate = new Date(goalObj.currentInstanceDate);
        instanceDate.setHours(0, 0, 0, 0);
        
        goalObj.isActiveToday = instanceDate.getTime() === today.getTime();
        goalObj.isUpcoming = instanceDate.getTime() > today.getTime();
        goalObj.isPastInstance = instanceDate.getTime() < today.getTime();
      } else {
        // One-time goals
        const deadline = new Date(goalObj.deadline);
        deadline.setHours(0, 0, 0, 0);
        
        goalObj.isActiveToday = !goalObj.completed && deadline.getTime() === today.getTime();
        goalObj.isUpcoming = !goalObj.completed && deadline.getTime() > today.getTime();
        goalObj.isPastInstance = false;
      }
      
      return goalObj;
    });

    res.json({ success: true, goals: goalsWithStatus });
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ COMPLETE RECURRING GOAL INSTANCE (FIXED)
export const completeRecurringInstance = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    if (!goal.isRecurring) {
      return res.status(400).json({ 
        success: false, 
        message: "This is not a recurring goal" 
      });
    }

    // ✅ TODAY'S DATE
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Check if current instance is today
    const instanceDate = new Date(goal.currentInstanceDate);
    instanceDate.setHours(0, 0, 0, 0);
    
    if (instanceDate.getTime() !== today.getTime()) {
      return res.status(400).json({ 
        success: false, 
        message: "This goal is not active today" 
      });
    }

    // ✅ Mark today as completed
    if (!goal.completedDates) {
      goal.completedDates = [];
    }

    goal.completedDates.push({
      date: today,
      completedAt: new Date()
    });

    // ✅ CALCULATE NEXT INSTANCE
    let nextDate = new Date(goal.currentInstanceDate);
    
    switch (goal.duration) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    // ✅ CHECK IF END DATE REACHED
    const endDate = new Date(goal.deadline);
    endDate.setHours(23, 59, 59, 999);

    if (nextDate > endDate) {
      goal.completed = true;
      goal.status = 'completed';
      goal.currentInstanceDate = endDate;
    } else {
      goal.currentInstanceDate = nextDate;
    }

    await goal.save();

    res.json({
      success: true,
      message: "✅ Goal completed for today! Next instance scheduled.",
      currentInstanceDate: goal.currentInstanceDate,
      completedDates: goal.completedDates,
      completed: goal.completed,
      isActiveToday: false, // ✅ Immediately mark as not active today
      nextInstance: !goal.completed ? {
        date: goal.currentInstanceDate,
        reminderTime: goal.reminderTime
      } : null
    });

  } catch (error) {
    console.error("Complete recurring instance error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to complete goal instance" 
    });
  }
};

// ✅ GET TODAY'S ACTIVE GOALS (FIXED)
export const getTodaysGoals = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goals = await Goal.find({ 
      user: req.user.id,
      completed: false
    });

    // ✅ Filter goals that are ACTIVE TODAY
    const todaysGoals = goals.filter(goal => {
      if (goal.isRecurring) {
        const instanceDate = new Date(goal.currentInstanceDate);
        instanceDate.setHours(0, 0, 0, 0);
        return instanceDate.getTime() === today.getTime();
      } else {
        // One-time goals: active if deadline is today
        const deadline = new Date(goal.deadline);
        deadline.setHours(0, 0, 0, 0);
        return deadline.getTime() === today.getTime();
      }
    });

    res.json({ 
      success: true, 
      goals: todaysGoals,
      count: todaysGoals.length,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("Get today's goals error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch today's goals" });
  }
};