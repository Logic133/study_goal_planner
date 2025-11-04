import React, { useEffect, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { FaUser, FaPlus, FaBell } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5"; // ✅ Added close icon

function Header({ onProfileClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [missedReminders, setMissedReminders] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
    loadMissedReminders();
    window.addEventListener("storage", checkLogin);
    window.addEventListener("reminderMissed", loadMissedReminders);
    const interval = setInterval(checkLogin, 1000);
    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("reminderMissed", loadMissedReminders);
      clearInterval(interval);
    };
  }, []);

  const loadMissedReminders = () => {
    const saved = localStorage.getItem("missedReminders");
    if (saved) {
      try {
        const reminders = JSON.parse(saved);
        const formattedReminders = reminders.map(reminder => ({
          ...reminder,
          formattedTime: formatReminderTime(reminder.reminderTime),
          formattedMissedAt: formatReminderTime(reminder.missedAt)
        }));
        setMissedReminders(formattedReminders);
      } catch (error) {
        console.error("❌ Error loading missed reminders:", error);
        setMissedReminders([]);
      }
    }
  };

  const formatReminderTime = (dateString) => {
    if (!dateString) return "Unknown Time";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Time";
      return date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Time Error";
    }
  };

  const formatMissedTime = (dateString) => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Recently";
    }
  };

  const removeMissedReminder = (id) => {
    const updated = missedReminders.filter(r => r.id !== id);
    setMissedReminders(updated);
    localStorage.setItem("missedReminders", JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setMissedReminders([]);
    localStorage.removeItem("missedReminders");
  };

  return (
    <header>
      <div className="logo">
        <img src="/logo.png" alt="logo" />
        StudyPlanner
      </div>

      <div className="right-buttons">
        <Link to="/create-goal" className="goal-link">
          <FaPlus />
        </Link>

        <Link to="/settings" className="settings-link" title="Settings">
          ⚙️ Settings
        </Link>

        {/* 🔔 Notification bell */}
        <div className="bell-container">
          <div
            className="bell-icon"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
          >
            <FaBell />
            {missedReminders.length > 0 && (
              <span className="notification-count">{missedReminders.length}</span>
            )}
          </div>

          {/* 📩 Notification panel with Close button */}
          {showNotificationPanel && (
            <div className="notification-panel">
              <div className="notification-header">
                <h3>Missed Reminders ({missedReminders.length})</h3>

                {/* ❌ Close Button */}
                <button
                  className="close-panel-btn"
                  onClick={() => setShowNotificationPanel(false)}
                  title="Close panel"
                >
                  <IoCloseSharp />
                </button>

                {missedReminders.length > 0 && (
                  <button className="clear-all-btn" onClick={clearAllNotifications}>
                    Clear All
                  </button>
                )}
              </div>

              <div className="notification-list">
                {missedReminders.length === 0 ? (
                  <p className="no-notifications">No missed reminders 🎉</p>
                ) : (
                  missedReminders.map((reminder) => (
                    <div key={reminder.id} className="notification-item">
                      <div className="notification-content">
                        <h4>{reminder.title}</h4>
                        <p className="reminder-time">
                          ⏰ {reminder.formattedTime}
                        </p>
                        <p className="missed-time">
                          ❌ Missed: {reminder.formattedMissedAt}
                        </p>
                      </div>
                      <button
                        className="remove-notification"
                        onClick={() => removeMissedReminder(reminder.id)}
                        title="Remove notification"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {!isLoggedIn && (
          <>
            <Link to="/login">
              <button className="btn btn-login">Login</button>
            </Link>
            <Link to="/signup">
              <button className="btn btn-signup">Signup</button>
            </Link>
          </>
        )}

        {isLoggedIn && (
          <div className="profile-btn" onClick={onProfileClick}>
            <FaUser />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
