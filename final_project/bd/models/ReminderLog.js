// models/ReminderLog.js
import mongoose from "mongoose";

const reminderLogSchema = new mongoose.Schema({
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  reminderTime: {
    type: Date,
    required: true
  },
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["sent", "failed", "cancelled"],
    default: "sent"
  },
  deliveryMethod: {
    type: String,
    enum: ["browser", "email", "sms", "push"],
    default: "browser"
  },
  response: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Add indexes for better performance
reminderLogSchema.index({ user: 1, triggeredAt: -1 });
reminderLogSchema.index({ goal: 1 });

export default mongoose.model("ReminderLog", reminderLogSchema);