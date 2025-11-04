// models/reminder.js
import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    goal: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Goal" 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // ✅ IMPROVED: Add goal details for easier access
    goalTitle: { type: String },
    goalDescription: { type: String },
    
    // ✅ IMPROVED: Better time handling
    reminderTime: { 
      type: Date, 
      required: true,
      index: true // Add index for faster queries
    },
    
    // ✅ IMPROVED: Add timezone support
    timezone: { 
      type: String, 
      default: "Asia/Kolkata" 
    },
    
    // ✅ IMPROVED: Enhanced frequency options
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly", "custom"],
      default: "once",
    },
    
    // ✅ NEW: For recurring reminders
    recurrencePattern: {
      daysOfWeek: [Number], // [0,1,2,3,4,5,6] for days
      interval: Number, // Every X days/weeks
      endDate: Date // When to stop recurring
    },

    // ✅ IMPROVED: Status tracking
    status: {
      type: String,
      enum: ["scheduled", "sent", "cancelled", "missed", "snoozed"],
      default: "scheduled",
    },
    
    // ✅ NEW: For notification tracking
    notificationSent: { type: Boolean, default: false },
    sentAt: Date,
    
    // ✅ NEW: Snooze functionality
    snoozeCount: { type: Number, default: 0 },
    lastSnoozedAt: Date,
    
    // ✅ NEW: For client-side sync
    clientId: String, // To sync with client-side goals
    source: {
      type: String,
      enum: ["manual", "chatbot", "api"],
      default: "manual"
    }
  },
  { 
    timestamps: true 
  }
);

// ✅ ADD INDEXES for better performance
reminderSchema.index({ user: 1, reminderTime: 1 });
reminderSchema.index({ status: 1, reminderTime: 1 });
reminderSchema.index({ user: 1, status: 1 });

// ✅ ADD METHOD to check if reminder is due
reminderSchema.methods.isDue = function() {
  const now = new Date();
  return this.reminderTime <= now && this.status === 'scheduled';
};

// ✅ ADD METHOD to mark as sent
reminderSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.notificationSent = true;
  this.sentAt = new Date();
  return this.save();
};

// ✅ ADD METHOD to snooze reminder
reminderSchema.methods.snooze = function(minutes = 10) {
  this.status = 'snoozed';
  this.snoozeCount += 1;
  this.lastSnoozedAt = new Date();
  this.reminderTime = new Date(Date.now() + minutes * 60000);
  return this.save();
};

export default mongoose.model("Reminder", reminderSchema);