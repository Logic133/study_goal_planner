// services/clientReminderService.js
class ClientReminderService {
  constructor() {
    this.checkInterval = null;
    this.isRunning = false;
    this.lastCheckDate = new Date().toDateString();
  }

  // Initialize the reminder service
  init() {
    if (this.isRunning) return;
    
    console.log("🔔 Initializing Client Reminder Service...");
    this.isRunning = true;

    // Check for reminders every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkAllReminders();
    }, 30000);

    // Request notification permission
    this.requestNotificationPermission();

    // Initial check
    this.checkAllReminders();
    
    // Setup daily reset
    this.setupDailyReset();
    
    console.log("✅ Client Reminder Service Started");
  }

  // Stop the service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.isRunning = false;
    console.log("🔔 Client Reminder Service Stopped");
  }

  // Request notification permission
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log("🔔 Notification permission:", permission);
      });
    }
  }

  // Setup daily reset at midnight
  setupDailyReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;

    setTimeout(() => {
      this.resetDailyNotifications();
      setInterval(() => {
        this.resetDailyNotifications();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  // Reset daily notification flags
  resetDailyNotifications() {
    try {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]');
      const updatedGoals = goals.map(goal => ({
        ...goal,
        notifiedToday: false
      }));
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      console.log("🔄 Reset daily notifications for all goals");
    } catch (error) {
      console.error('❌ Error resetting daily notifications:', error);
    }
  }

  // services/clientReminderService.js - checkAllReminders function
checkAllReminders() {
  try {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const now = new Date();
    
    console.log(`🔔 Checking ${goals.length} goals for reminders at ${now.toLocaleTimeString()}...`);

    // ✅ DEBUG: Show all chatbot goals
    const chatbotGoals = goals.filter(g => g.source === 'chatbot');
    console.log(`🤖 Chatbot goals: ${chatbotGoals.length}`);
    
    chatbotGoals.forEach(goal => {
      console.log(`   🤖 "${goal.title}": ${goal.reminderTime ? new Date(goal.reminderTime).toLocaleString() : 'NO REMINDER TIME'}`);
    });

    let triggeredCount = 0;

    goals.forEach(goal => {
      if (this.shouldTriggerReminder(goal, now)) {
        console.log(`🎯 TRIGGERING REMINDER: ${goal.title}`);
        this.triggerReminder(goal);
        triggeredCount++;
      }
    });

    if (triggeredCount > 0) {
      console.log(`✅ Triggered ${triggeredCount} reminders`);
    }

  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
}

  // Check if goal should trigger reminder
  shouldTriggerReminder(goal, currentTime) {
    // Skip completed goals
    if (goal.completed) return false;
    
    // Skip if already notified today
    if (goal.notifiedToday) return false;

    // Skip goals without reminder time
    if (!goal.reminderTime) return false;

    try {
      // Parse reminder time (works for both ISO format and time strings)
      let reminderDateTime;
      
      if (goal.reminderTime.includes('T')) {
        // ISO format (from localStorage)
        reminderDateTime = new Date(goal.reminderTime);
      } else {
        // Time string format (HH:MM)
        const [hours, minutes] = goal.reminderTime.split(':');
        const today = new Date();
        reminderDateTime = new Date(today);
        reminderDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      if (isNaN(reminderDateTime.getTime())) {
        console.error(`❌ Invalid reminder time for ${goal.title}:`, goal.reminderTime);
        return false;
      }

      const current = new Date(currentTime);
      const timeDiff = Math.abs(reminderDateTime - current);
      
      // Check if it's time for reminder (within 1 minute tolerance)
      return timeDiff <= 60000;

    } catch (error) {
      console.error(`❌ Error checking reminder for ${goal.title}:`, error);
      return false;
    }
  }

  // Trigger reminder for a goal
  triggerReminder(goal) {
    console.log(`\n🎯 ================================`);
    console.log(`🎯 GOAL REMINDER TRIGGERED!`);
    console.log(`🎯 Title: ${goal.title}`);
    console.log(`🎯 Description: ${goal.description || goal.tasks || 'No description'}`);
    console.log(`🎯 Time: ${new Date().toLocaleString()}`);
    console.log(`🎯 Source: ${goal.source || 'manual'}`);
    console.log(`🎯 Frequency: ${goal.duration || goal.frequency || 'Daily'}`);
    console.log(`🎯 ================================\n`);

    // Show browser notification
    this.showBrowserNotification(goal);

    // Show in-app notification
    this.showInAppNotification(goal);

    // Mark as notified for today
    this.markGoalAsNotified(goal._id);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('goalReminderTriggered', {
      detail: { 
        goal, 
        type: 'reminder', 
        timestamp: new Date(),
        source: goal.source || 'manual'
      }
    }));
  }

  // Show browser notification
  showBrowserNotification(goal) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`🔔 Goal Reminder: ${goal.title}`, {
        body: `Time to work on your ${goal.duration || goal.frequency} goal!\n\n${goal.description || goal.tasks || 'Stay consistent and achieve your goals!'}`,
        icon: '/favicon.ico',
        tag: goal._id,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to goals page
        if (window.location.pathname !== '/goals') {
          window.dispatchEvent(new CustomEvent('navigateTo', { 
            detail: { path: '/goals' } 
          }));
        }
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

    } else {
      console.log("🔔 Browser notifications not available or permission denied");
    }
  }

  // Show in-app notification
  showInAppNotification(goal) {
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.className = 'goal-reminder-notification';
    notificationEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-left: 4px solid #4CAF50;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
    `;

    notificationEl.innerHTML = `
      <div class="reminder-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #4CAF50;">
        <span style="font-size: 20px;">🔔</span>
        <strong style="font-size: 16px;">Goal Reminder</strong>
        <button class="close-btn" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">&times;</button>
      </div>
      <div class="reminder-body">
        <h4 style="margin: 0 0 8px 0; color: #333;">${goal.title}</h4>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${goal.description || goal.tasks || 'Time to work on your goal!'}</p>
        <p style="margin: 0; font-size: 12px; color: #888;">
          ⏰ ${this.formatReminderTime(goal.reminderTime)} | 
          🔄 ${goal.duration || goal.frequency || 'Daily'}
        </p>
      </div>
      <button class="reminder-dismiss" style="margin-top: 10px; background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; width: 100%;">
        Got it!
      </button>
    `;

    // Add CSS animation
    if (!document.querySelector('#reminder-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'reminder-styles';
      styleEl.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .goal-reminder-notification {
          font-family: Arial, sans-serif;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Add event listeners
    notificationEl.querySelector('.close-btn').onclick = () => {
      notificationEl.remove();
    };

    notificationEl.querySelector('.reminder-dismiss').onclick = () => {
      notificationEl.remove();
    };

    // Auto remove after 15 seconds
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.remove();
      }
    }, 15000);

    document.body.appendChild(notificationEl);
  }

  // Format reminder time for display
  formatReminderTime(reminderTime) {
    try {
      if (!reminderTime) return "Unknown time";
      
      if (reminderTime.includes('T')) {
        const date = new Date(reminderTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        // Time string format
        const [hours, minutes] = reminderTime.split(':');
        const hourNum = parseInt(hours);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
      }
    } catch (error) {
      return "Invalid time";
    }
  }

  // Mark goal as notified for today
  markGoalAsNotified(goalId) {
    try {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]');
      const updatedGoals = goals.map(goal => 
        goal._id === goalId 
          ? { 
              ...goal, 
              notifiedToday: true,
              lastNotified: new Date().toISOString()
            }
          : goal
      );
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      console.log(`✅ Marked goal as notified: ${goalId}`);
    } catch (error) {
      console.error('❌ Error marking goal as notified:', error);
    }
  }

  // Manual check (for testing)
  manualCheck() {
    console.log("🔍 Manual reminder check triggered");
    this.checkAllReminders();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckDate: this.lastCheckDate,
      notificationPermission: Notification.permission
    };
  }
}

// Create singleton instance
const clientReminderService = new ClientReminderService();
export default clientReminderService;