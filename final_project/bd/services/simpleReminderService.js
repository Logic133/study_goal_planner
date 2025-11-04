// services/simpleReminderService.js
export class SimpleReminderService {
  static async sendConsoleReminder(goal) {
    console.log(`\n📱 ================================`);
    console.log(`📱 GOAL REMINDER - SERVER SIDE`);
    console.log(`📱 Title: ${goal.title}`);
    console.log(`📱 Description: ${goal.description}`);
    console.log(`📱 Time: ${new Date().toLocaleString('en-IN')}`);
    console.log(`📱 User: ${goal.user?.name || goal.user?.email}`);
    console.log(`📱 ================================\n`);

    // ✅ Enhanced server-side logging
    const reminderLog = {
      type: 'REMINDER_TRIGGERED',
      goalId: goal._id,
      goalTitle: goal.title,
      timestamp: new Date().toISOString(),
      serverTime: new Date().toLocaleString('en-IN'),
      userId: goal.user?._id
    };

    console.log('📊 Reminder Log:', JSON.stringify(reminderLog, null, 2));

    // ✅ You can add webhook or external service calls here
    // await this.sendToWebhook(goal);
    // await this.sendSMSNotification(goal); // For future SMS integration
  }

  static async scheduleGoalReminder(goal) {
    try {
      if (!goal.reminderTime) {
        console.log(`⏰ No reminder time for goal: "${goal.title}"`);
        return false;
      }

      const reminderTime = new Date(goal.reminderTime);
      const now = new Date();
      const diff = reminderTime - now;

      console.log(`🔄 Scheduling reminder for: "${goal.title}"`);
      console.log(`   ⏰ Reminder Time: ${reminderTime.toLocaleString('en-IN')}`);
      console.log(`   ⏳ Time until reminder: ${Math.round(diff / 1000)} seconds`);

      if (diff > 0) {
        // ✅ Server-side timeout (for immediate reminders)
        setTimeout(() => {
          this.sendConsoleReminder(goal);
        }, diff);

        console.log(`✅ Server reminder scheduled for: "${goal.title}"`);
        return true;
      } else {
        console.log(`⏰ Reminder time passed for: "${goal.title}"`);
        
        // ✅ If reminder time passed, send immediately
        if (diff > -300000) { // Within 5 minutes of passed time
          console.log(`🚨 Sending immediate reminder for passed time: "${goal.title}"`);
          this.sendConsoleReminder(goal);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Scheduling reminder failed:', error);
      return false;
    }
  }

  // ✅ NEW: Batch schedule reminders
  static async scheduleMultipleReminders(goals) {
    try {
      console.log(`🔄 Batch scheduling ${goals.length} reminders...`);
      
      const results = await Promise.allSettled(
        goals.map(goal => this.scheduleGoalReminder(goal))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.length - successful;
      
      console.log(`📊 Batch scheduling complete: ${successful} successful, ${failed} failed`);
      
      return {
        total: goals.length,
        successful,
        failed
      };
    } catch (error) {
      console.error('❌ Batch scheduling failed:', error);
      return { total: goals.length, successful: 0, failed: goals.length };
    }
  }

  // ✅ NEW: For future integrations
  static async sendToWebhook(goal) {
    // Implement webhook calls to external services
    // Example: Send to Slack, Discord, etc.
  }

  static async sendSMSNotification(goal) {
    // Implement SMS notifications
    // Example: Using Twilio or other SMS services
  }
}