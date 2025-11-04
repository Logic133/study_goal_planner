import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String, 
    required: true,
    enum: ["Daily", "Weekly", "Monthly"]
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  reminderTime: { 
    type: Date,
    required: true 
  },
  status: { 
    type: String, 
    default: 'pending',
    enum: ["pending", "completed"]
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  notified: { 
    type: Boolean, 
    default: false 
  },
  
  // RECURRING GOALS FIELDS
  isRecurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ["Daily", "Weekly", "Monthly"],
    default: "Daily"
  },
  currentInstanceDate: {
    type: Date,
    default: function() { return this.startDate; }
  },
  completedDates: [{
    date: {
      type: Date,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // CHATBOT SPECIFIC FIELDS
  source: {
    type: String,
    enum: ["manual", "chatbot"],
    default: "manual"
  },
  tasks: {
    type: String,
    default: ""
  },
  
  // REMINDER SPECIFIC FIELDS
  reminderScheduled: {
    type: Boolean,
    default: false
  },
  lastReminded: {
    type: Date
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, { 
  timestamps: true 
});

// Virtual for formatted reminder time display
goalSchema.virtual('displayTime').get(function() {
  if (!this.reminderTime) return "9:00 AM";
  
  const time = new Date(this.reminderTime);
  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  
  return `${displayHour}:${minutes} ${period}`;
});

// Virtual for HH:MM format
goalSchema.virtual('timeString').get(function() {
  if (!this.reminderTime) return "09:00";
  
  const time = new Date(this.reminderTime);
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
});

// Pre-save middleware
goalSchema.pre('save', function(next) {
  // Set frequency based on duration for recurring goals
  if (this.isRecurring && !this.frequency) {
    this.frequency = this.duration;
  }
  
  // Ensure currentInstanceDate is set for recurring goals
  if (this.isRecurring && !this.currentInstanceDate) {
    this.currentInstanceDate = this.startDate;
  }

  // ✅ AUTO-SCHEDULE REMINDER FOR NEW GOALS
  if (this.isNew && !this.reminderScheduled) {
    const reminderTime = new Date(this.reminderTime);
    const now = new Date();
    
    // Only auto-schedule if reminder is at least 5 minutes in future
    if (reminderTime - now > 5 * 60 * 1000) {
      this.reminderScheduled = true;
      console.log(`✅ Auto-scheduled reminder for new goal: "${this.title}"`);
    }
  }
  
  next();
});

// Method to calculate next instance date
goalSchema.methods.calculateNextInstance = function() {
  if (!this.isRecurring) return null;
  
  const currentDate = new Date(this.currentInstanceDate || this.startDate);
  let nextDate = new Date(currentDate);
  
  switch (this.frequency) {
    case "Daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "Weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "Monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  return nextDate;
};

// Method to check if goal is active for today
goalSchema.methods.isActiveToday = function() {
  if (this.completed) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.isRecurring) {
    if (!this.currentInstanceDate) return false;
    
    const currentInstance = new Date(this.currentInstanceDate);
    currentInstance.setHours(0, 0, 0, 0);
    
    return currentInstance.getTime() === today.getTime();
  } else {
    const deadline = new Date(this.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() >= today.getTime();
  }
};

// Method to check if reminder should be scheduled
goalSchema.methods.shouldScheduleReminder = function() {
  if (this.completed || this.notified || this.reminderScheduled) return false;
  
  const reminderTime = new Date(this.reminderTime);
  const now = new Date();
  const diff = reminderTime - now;
  
  // Only schedule if reminder is at least 5 minutes in future
  return diff > 5 * 60 * 1000;
};

// ✅ NEW: Method to mark reminder as triggered
goalSchema.methods.markReminderTriggered = function() {
  this.notified = true;
  this.lastReminded = new Date();
  this.reminderCount += 1;
  return this;
};

// ✅ NEW: Method to check if reminder is due soon (within 5 minutes)
goalSchema.methods.isReminderDueSoon = function() {
  if (this.completed || this.notified) return false;
  
  const reminderTime = new Date(this.reminderTime);
  const now = new Date();
  const diff = reminderTime - now;
  
  // Check if reminder is due within next 5 minutes
  return diff > 0 && diff <= 5 * 60 * 1000;
};

// ✅ NEW: Static method to get goals with upcoming reminders
goalSchema.statics.getUpcomingReminders = function(minutes = 5) {
  const now = new Date();
  const futureTime = new Date(now.getTime() + minutes * 60 * 1000);
  
  return this.find({
    completed: false,
    notified: false,
    reminderTime: {
      $gte: now,
      $lte: futureTime
    }
  }).populate('user', 'name email');
};

// ✅ NEW: Static method to get missed reminders
goalSchema.statics.getMissedReminders = function() {
  const now = new Date();
  
  return this.find({
    completed: false,
    notified: false,
    reminderTime: { $lt: now }
  }).populate('user', 'name email');
};

// Indexes
goalSchema.index({ user: 1, createdAt: -1 });
goalSchema.index({ user: 1, isRecurring: 1 });
goalSchema.index({ user: 1, completed: 1 });
goalSchema.index({ user: 1, currentInstanceDate: 1 });
goalSchema.index({ user: 1, reminderTime: 1 });
goalSchema.index({ user: 1, notified: 1 }); // ✅ Added for reminder queries
goalSchema.index({ reminderTime: 1, notified: 1 }); // ✅ Compound index for reminder checks

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;