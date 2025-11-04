

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { playNotificationSound } from "./components/NotificationSound";
import clientReminderService from "../bd/services/clientReminderService";
import Header from "./components/Header";
import ProfileSidebar from "./components/ProfileSidebar";
import Dashboard from "./components/Dashboard";
import BottomNav from "./components/BottomNav";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Progress from "./components/Progress";
import GoalBox from "./components/GoalBox.jsx";
import ManualGoal from "./components/ManualGoal";
import Goals from "./components/Goals";
import Goodies from "./components/Goodies";
import Settings from "./components/Settings";
import ChatBox from "./components/ChatBox";

import "./App.css";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [goals, setGoals] = useState([]);

  // ✅ LOAD GOALS ON APP START
  useEffect(() => {
    const loadGoals = () => {
      try {
        const goalsData = localStorage.getItem('goals');
        if (goalsData) {
          const parsedGoals = JSON.parse(goalsData);
          setGoals(parsedGoals);
          console.log(`📥 Loaded ${parsedGoals.length} goals from localStorage`);
        }
      } catch (error) {
        console.error("❌ Error loading goals:", error);
      }
    };

    loadGoals();
  }, []);

  // ✅ LISTEN FOR CHATBOT GOALS SAVE EVENT
  useEffect(() => {
    const handleChatbotGoalsSave = (event) => {
      console.log("🤖 Chatbot goals save event received:", event.detail);
      const { goals: chatbotGoals } = event.detail;

      if (chatbotGoals && Array.isArray(chatbotGoals)) {
        // Add chatbot goals to existing goals
        setGoals(prevGoals => {
          const updatedGoals = [...prevGoals, ...chatbotGoals];

          // Update localStorage
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
          console.log(`✅ ${chatbotGoals.length} chatbot goals added to storage`);

          return updatedGoals;
        });

        // Show success notification
        showNotification(
          "Goals Saved Successfully! 🎉",
          `${chatbotGoals.length} goal(s) from chatbot have been added to your dashboard.`
        );
      }
    };

    window.addEventListener('chatbotGoalsSaved', handleChatbotGoalsSave);

    return () => {
      window.removeEventListener('chatbotGoalsSaved', handleChatbotGoalsSave);
    };
  }, []);

  // ✅ START ENHANCED REMINDER SYSTEM
  useEffect(() => {
    console.log("🚀 Starting enhanced reminder system...");

    // Start the client reminder service
    clientReminderService.init();

    // Listen for reminder events from the service
    const handleReminderEvent = (event) => {
      console.log('📱 Reminder received in App:', event.detail);
      const { goal } = event.detail;

      // Play notification sound
      playNotificationSound(`🔔 Reminder: ${goal.title}`);

      // Show your custom alert dialog
      showCustomReminderAlert(goal);
    };

    window.addEventListener('goalReminderTriggered', handleReminderEvent);

    return () => {
      console.log("🛑 Stopping reminder system");
      clientReminderService.stop();
      window.removeEventListener('goalReminderTriggered', handleReminderEvent);
    };
  }, []);

  // ✅ CUSTOM REMINDER ALERT DIALOG
  const showCustomReminderAlert = (goal) => {
    const formatTime = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        return "Now";
      }
    };

    // Create custom modal/dialog
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-reminder-alert';
    alertDiv.innerHTML = `
      <div class="reminder-alert-overlay">
        <div class="reminder-alert-content">
          <div class="reminder-header">
            <h3>🔔 Study Planner Reminder</h3>
          </div>
          <div class="reminder-body">
            <div class="reminder-title">${goal.title}</div>
            <div class="reminder-time">${formatTime(goal.reminderTime)}</div>
            ${goal.description ? `<div class="reminder-desc">${goal.description}</div>` : ''}
          </div>
          <div class="reminder-actions">
            <button class="snooze-btn">⏰ Snooze (10 min)</button>
            <button class="cancel-btn">❌ Cancel Reminder</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(alertDiv);

    // Add event listeners
    const snoozeBtn = alertDiv.querySelector('.snooze-btn');
    const cancelBtn = alertDiv.querySelector('.cancel-btn');

    snoozeBtn.onclick = () => {
      document.body.removeChild(alertDiv);
      snoozeReminder(goal);
    };

    cancelBtn.onclick = () => {
      document.body.removeChild(alertDiv);
      cancelReminder(goal);
    };

    // Auto-close after 2 minutes if no action
    setTimeout(() => {
      if (document.body.contains(alertDiv)) {
        document.body.removeChild(alertDiv);
        markReminderAsMissed(goal);
      }
    }, 120000); // 2 minutes
  };

  // ✅ SNOOZE REMINDER (10 minutes later)
  const snoozeReminder = (goal) => {
    console.log(`⏰ Snoozing reminder: ${goal.title}`);

    const newReminderTime = new Date();
    newReminderTime.setMinutes(newReminderTime.getMinutes() + 10);

    // Update goal with new reminder time
    const updatedGoal = {
      ...goal,
      reminderTime: newReminderTime.toISOString(),
      reminderStatus: 'scheduled',
      notified: false,
      notifiedToday: false,
      snoozeCount: (goal.snoozeCount || 0) + 1
    };

    // Update storage
    updateGoalInStorage(updatedGoal);

    // Show snooze confirmation
    showNotification("Reminder Snoozed ⏰",
      `${goal.title}\nNext reminder at: ${newReminderTime.toLocaleTimeString()}`);

    console.log(`✅ Reminder snoozed to: ${newReminderTime.toLocaleString()}`);
  };

  // ✅ CANCEL REMINDER
  const cancelReminder = (goal) => {
    console.log(`❌ Cancelling reminder: ${goal.title}`);

    // Mark reminder as cancelled
    const updatedGoal = {
      ...goal,
      reminderStatus: 'cancelled',
      notified: true,
      notifiedToday: true,
      cancelledAt: new Date().toISOString()
    };

    // Update storage
    updateGoalInStorage(updatedGoal);

    // Show cancellation confirmation
    showNotification("Reminder Cancelled ❌",
      `${goal.title}\nReminder has been cancelled!`);

    console.log(`✅ Reminder cancelled: ${goal.title}`);
  };

  // ✅ MARK REMINDER AS MISSED
  const markReminderAsMissed = (goal) => {
    console.log(`😞 Reminder missed: ${goal.title}`);

    const updatedGoal = {
      ...goal,
      reminderStatus: 'missed',
      missedAt: new Date().toISOString(),
      notified: true,
      notifiedToday: true
    };

    // Update storage
    updateGoalInStorage(updatedGoal);

    // Add to missed reminders for bell count
    addToMissedReminders(goal);
  };

  // ✅ UPDATE GOAL IN STORAGE
  const updateGoalInStorage = (updatedGoal) => {
    try {
      const storedGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      const updatedGoals = storedGoals.map(goal =>
        goal._id === updatedGoal._id ? updatedGoal : goal
      );
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
      console.log(`✅ Updated goal in storage: ${updatedGoal.title}`);
    } catch (error) {
      console.error("❌ Error updating goal in storage:", error);
    }
  };

  // ✅ ADD TO MISSED REMINDERS LIST
  const addToMissedReminders = (goal) => {
    const missedReminder = {
      id: Date.now(),
      goalId: goal._id || goal.id,
      title: goal.title,
      reminderTime: goal.reminderTime,
      missedAt: new Date().toISOString(),
      formattedTime: new Date(goal.reminderTime).toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      formattedMissedAt: "Just now"
    };

    const existingMissed = JSON.parse(localStorage.getItem('missedReminders') || '[]');
    const updatedMissed = [missedReminder, ...existingMissed];

    localStorage.setItem('missedReminders', JSON.stringify(updatedMissed));

    console.log(`📝 Added to missed reminders: ${goal.title}`);
  };

  // ✅ SHOW NOTIFICATION (Browser or Fallback)
  const showNotification = (title, body) => {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: "/logo.png"
      });
    } else {
      // Fallback to alert
      alert(`${title}\n\n${body}`);
    }
  };

  // ✅ ADD GOAL FUNCTION (ENHANCED FOR BOTH MANUAL AND CHATBOT GOALS)
  const addGoal = (newGoal) => {
    console.log("🎯 addGoal function CALLED with:", newGoal);

    if (!newGoal.title || newGoal.title.trim() === "") return;

    const goalWithNotification = {
      ...newGoal,
      _id: newGoal._id || newGoal.id || 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      id: newGoal.id || newGoal._id || 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      reminderStatus: 'scheduled',
      notified: false,
      notifiedToday: false,
      snoozeCount: 0,
      createdAt: new Date().toISOString(),
      source: newGoal.source || 'manual',
      // Ensure proper reminder time format for chatbot goals
      reminderTime: newGoal.reminderTime || new Date().toISOString(),
      displayReminderTime: newGoal.displayReminderTime || "6:00 PM"
    };

    // ✅ Update state
    setGoals((prevGoals) => {
      const updatedState = [...prevGoals, goalWithNotification];
      console.log("🔄 State updated to:", updatedState.length, "goals");
      return updatedState;
    });

    // ✅ Update localStorage
    try {
      const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      const updatedStorage = [...existingGoals, goalWithNotification];

      console.log("📦 Saving to localStorage:", goalWithNotification.title);
      localStorage.setItem('goals', JSON.stringify(updatedStorage));

      // ✅ Trigger storage event for reminder service
      window.dispatchEvent(new Event('storage'));

      // ✅ Immediate verification
      const verifyGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      console.log("✅ IMMEDIATE VERIFICATION - localStorage goals:", verifyGoals.length);

    } catch (error) {
      console.error("❌ localStorage save error:", error);
    }

    console.log("🎯 Goal addition COMPLETE");
  };

  // ✅ BULK ADD GOALS FUNCTION FOR CHATBOT
  const addChatbotGoals = (chatbotGoals) => {
    console.log("🤖 Bulk adding chatbot goals:", chatbotGoals);

    if (!Array.isArray(chatbotGoals) || chatbotGoals.length === 0) return;

    const goalsWithIds = chatbotGoals.map(goal => ({
      ...goal,
      _id: goal._id || 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      id: goal.id || goal._id || 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      reminderStatus: 'scheduled',
      notified: false,
      notifiedToday: false,
      snoozeCount: 0,
      createdAt: new Date().toISOString(),
      source: 'chatbot',
      // Ensure proper reminder time format
      reminderTime: goal.reminderTime || new Date().toISOString(),
      displayReminderTime: goal.displayReminderTime || "6:00 PM"
    }));

    // ✅ Update state
    setGoals((prevGoals) => {
      const updatedState = [...prevGoals, ...goalsWithIds];
      console.log("🔄 State updated with chatbot goals. Total:", updatedState.length, "goals");
      return updatedState;
    });

    // ✅ Update localStorage
    try {
      const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      const updatedStorage = [...existingGoals, ...goalsWithIds];

      localStorage.setItem('goals', JSON.stringify(updatedStorage));
      console.log(`✅ ${goalsWithIds.length} chatbot goals saved to localStorage`);

      // ✅ Trigger storage event for reminder service
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      console.error("❌ Error saving chatbot goals to localStorage:", error);
    }

    // ✅ Show success notification
    showNotification(
      "Chatbot Goals Saved! 🎉",
      `${goalsWithIds.length} goal(s) have been added to your dashboard.`
    );
  };

  const updateGoal = (goalId, updatedGoal) => {
    console.log("🔄 updateGoal called for:", goalId);
    setGoals((prevGoals) => {
      const newGoals = prevGoals.map(goal =>
        (goal._id === goalId || goal.id === goalId) ? updatedGoal : goal
      );

      // Update localStorage
      localStorage.setItem('goals', JSON.stringify(newGoals));

      // Trigger storage event
      window.dispatchEvent(new Event('storage'));

      return newGoals;
    });
  };

  const deleteGoal = (goalId) => {
    console.log("🗑️ deleteGoal called for:", goalId);
    setGoals((prevGoals) => {
      const newGoals = prevGoals.filter(goal =>
        goal._id !== goalId && goal.id !== goalId
      );

      // Update localStorage
      localStorage.setItem('goals', JSON.stringify(newGoals));

      // Trigger storage event
      window.dispatchEvent(new Event('storage'));

      return newGoals;
    });
  };

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app-container">
        <Header onProfileClick={() => setSidebarOpen(true)} />

        <ProfileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  goals={goals}
                  addGoal={addGoal}
                  updateGoal={updateGoal}
                  deleteGoal={deleteGoal}
                  addChatbotGoals={addChatbotGoals} // ✅ Pass chatbot function
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-goal"
            element={
              <ProtectedRoute>
                <GoalBox addGoal={addGoal} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manual-goal"
            element={
              <ProtectedRoute>
                <ManualGoal addGoal={addGoal} updateGoal={updateGoal} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals goals={goals} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goodies"
            element={
              <ProtectedRoute>
                <Goodies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatBox onBack={() => window.history.back()} />
              </ProtectedRoute>
            }
          />


        </Routes>

        <BottomNav />
      </div>
    </Router>
  );
}

export default App;