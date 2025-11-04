// services/goalReminderScheduler.js
import Goal from "../models/Goal.js";
import { SimpleReminderService } from "./simpleReminderService.js"; // ✅ IMPORT ADD KARO

class GoalReminderScheduler {
  constructor() {
    this.scheduledReminders = new Map();
    this.checkInterval = null;
    this.isRunning = false;
    this.lastCheckTime = null;
  }

  // ✅ Start the reminder scheduler
  start() {
    if (this.isRunning) return;
    
    console.log('🔄 Starting Goal Reminder Scheduler...');
    this.isRunning = true;
    
    // Check every 30 seconds for due reminders
    this.checkInterval = setInterval(() => {
      this.checkDueReminders();
    }, 30000); // 30 seconds
    
    // Initial check
    this.checkDueReminders();
    
    console.log('✅ Goal Reminder Scheduler started');
  }

  // ✅ Stop the scheduler
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Goal Reminder Scheduler stopped');
  }

  // ✅ Enhanced: Check for due reminders
  async checkDueReminders() {
    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      
      console.log(`⏰ [${now.toLocaleString('en-IN')}] Checking for due reminders...`);
      
      // Find goals with reminders due in next 5 minutes
      const dueGoals = await Goal.find({
        completed: false,
        notified: false,
        reminderTime: {
          $gte: now,
          $lte: fiveMinutesFromNow
        }
      }).populate('user', 'name email');

      console.log(`📊 Found ${dueGoals.length} goals due soon`);

      for (const goal of dueGoals) {
        const timeUntilReminder = new Date(goal.reminderTime) - now;
        
        console.log(`🎯 Goal: ${goal.title}`);
        console.log(`   ⏰ Reminder: ${new Date(goal.reminderTime).toLocaleString('en-IN')}`);
        console.log(`   ⏳ Time until: ${Math.round(timeUntilReminder / 1000)} seconds`);
        
        // If reminder is within 1 minute, trigger it
        if (timeUntilReminder <= 60000 && timeUntilReminder > 0) {
          await this.triggerReminder(goal);
        } else if (timeUntilReminder <= 0) {
          // If reminder time passed but not notified
          console.log(`🚨 Late reminder for: ${goal.title}`);
          await this.triggerReminder(goal);
        }
      }

      this.lastCheckTime = now;
      
    } catch (error) {
      console.error('❌ Error checking due reminders:', error);
    }
  }

  // ✅ Enhanced: Trigger reminder for a goal
  async triggerReminder(goal) {
    try {
      console.log(`\n🔔 ================================`);
      console.log(`🔔 GOAL REMINDER TRIGGERED - SERVER`);
      console.log(`🔔 Title: ${goal.title}`);
      console.log(`🔔 Description: ${goal.description}`);
      console.log(`🔔 Scheduled: ${new Date(goal.reminderTime).toLocaleString('en-IN')}`);
      console.log(`🔔 Triggered: ${new Date().toLocaleString('en-IN')}`);
      console.log(`🔔 User: ${goal.user?.name || goal.user?.email}`);
      console.log(`🔔 ================================\n`);

      // Mark as notified to prevent duplicate reminders
      goal.notified = true;
      goal.lastReminded = new Date();
      goal.reminderCount = (goal.reminderCount || 0) + 1;
      
      await goal.save();

      // ✅ Send server-side notification
      await SimpleReminderService.sendConsoleReminder(goal);

      // ✅ Log to database or external service
      await this.logReminderEvent(goal);

    } catch (error) {
      console.error('❌ Error triggering reminder:', error);
    }
  }

  // ✅ NEW: Log reminder events
  async logReminderEvent(goal) {
    try {
      // ✅ Dynamic import - agar ReminderLog model available nahi hai to skip karo
      const { default: ReminderLog } = await import("../models/ReminderLog.js");
      
      const logEntry = new ReminderLog({
        goal: goal._id,
        user: goal.user._id,
        reminderTime: goal.reminderTime,
        triggeredAt: new Date(),
        status: 'sent'
      });
      
      await logEntry.save();
      console.log(`📝 Reminder logged for: ${goal.title}`);
    } catch (error) {
      // ✅ Agar ReminderLog model nahi hai to error show mat karo
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log(`📝 Reminder logging skipped - ReminderLog model not available`);
      } else {
        console.error('❌ Error logging reminder:', error);
      }
    }
  }

  // ✅ NEW: Get upcoming reminders
  async getUpcomingReminders(userId, hours = 24) {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
      
      const upcomingReminders = await Goal.find({
        user: userId,
        completed: false,
        reminderTime: {
          $gte: now,
          $lte: futureTime
        }
      }).populate('user', 'name email')
        .sort({ reminderTime: 1 })
        .select('title description reminderTime');
      
      return upcomingReminders;
    } catch (error) {
      console.error('❌ Error getting upcoming reminders:', error);
      return [];
    }
  }

  // ✅ Manually schedule a reminder check
  async manualCheck() {
    console.log('🔍 Manual reminder check triggered');
    await this.checkDueReminders();
  }

  // ✅ Enhanced: Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledReminders: this.scheduledReminders.size,
      lastCheck: this.lastCheckTime ? this.lastCheckTime.toLocaleString('en-IN') : 'Never',
      uptime: this.isRunning ? 'Running' : 'Stopped'
    };
  }
}

// Create singleton instance
const goalReminderScheduler = new GoalReminderScheduler();
export default goalReminderScheduler;