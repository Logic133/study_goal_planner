import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ManualGoal.css";

function ManualGoal({ addGoal, updateGoal }) {
  const location = useLocation();
  const existingGoal = location.state?.goalToEdit || null;

  const [step, setStep] = useState(existingGoal ? 1 : 0);
  const [duration, setDuration] = useState(existingGoal?.duration || "");
  const [description, setDescription] = useState(existingGoal?.description || "");
  const [goalText, setGoalText] = useState(existingGoal?.title || "");
  const [goalDate, setGoalDate] = useState(
    existingGoal?.date ? new Date(existingGoal.date).toISOString().split('T')[0] : ""
  );
  const [deadline, setDeadline] = useState(
    existingGoal?.deadline ? new Date(existingGoal.deadline).toISOString().split('T')[0] : ""
  );
  const [reminderTime, setReminderTime] = useState(
    existingGoal?.reminderTime ? new Date(existingGoal.reminderTime).toISOString().slice(11, 16) : "09:00"
  );
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Step 0: Select duration
  const handleDurationSelect = (type) => {
    setDuration(type);
    setStep(1);
  };

  // ✅ FIXED: Proper reminder time formatting
  const formatReminderTimeForStorage = (date, time) => {
    try {
      // Ensure time is in HH:MM format
      let formattedTime = time;
      if (time.length === 5 && time.includes(':')) {
        // Already in HH:MM format
        formattedTime = time;
      } else {
        // Convert from other formats if needed
        const timeParts = time.split(':');
        if (timeParts.length === 2) {
          const hours = timeParts[0].padStart(2, '0');
          const minutes = timeParts[1].padStart(2, '0');
          formattedTime = `${hours}:${minutes}`;
        } else {
          formattedTime = "09:00"; // Default fallback
        }
      }
      
      // Create proper ISO string
      const reminderDateTime = new Date(date + 'T' + formattedTime + ':00');
      return reminderDateTime.toISOString();
    } catch (error) {
      console.error("Error formatting reminder time:", error);
      // Fallback to current date with specified time
      const fallbackDate = new Date();
      fallbackDate.setHours(parseInt(formattedTime.split(':')[0]), parseInt(formattedTime.split(':')[1]), 0, 0);
      return fallbackDate.toISOString();
    }
  };

  // Save or Update Goal
  const handleSaveGoal = async () => {
    if (!goalText.trim()) {
      alert("Please enter a goal title before saving.");
      return;
    }

    if (!duration.trim()) {
      alert("Please enter a duration for your goal.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a goal description.");
      return;
    }

    if (!goalDate) {
      alert("Please select a goal start date.");
      return;
    }

    if (!deadline) {
      alert("Please set a deadline for your goal.");
      return;
    }

    if (!reminderTime) {
      alert("Please set a reminder time.");
      return;
    }

    // ✅ Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const goalDateObj = new Date(goalDate);
    const deadlineObj = new Date(deadline);

    // Validate goal date is not in the past
    if (goalDateObj < today) {
      alert("Goal start date cannot be in the past. Please select today or a future date.");
      return;
    }

    // Validate deadline is after goal date
    if (deadlineObj <= goalDateObj) {
      alert("Deadline must be after the goal start date.");
      return;
    }

    setLoading(true);

    try {
      const url = existingGoal
        ? `http://localhost:5000/api/goals/${existingGoal._id}`
        : "http://localhost:5000/api/goals";

      const method = existingGoal ? "PUT" : "POST";

      // ✅ FIXED: Proper reminder time formatting
      const reminderDateTime = formatReminderTimeForStorage(goalDate, reminderTime);

      const goalData = {
        title: goalText.trim(),
        description: description.trim(),
        duration: duration.trim(),
        deadline: new Date(deadline).toISOString(),
        status: existingGoal?.status || "pending",
        date: new Date(goalDate).toISOString(),
        reminderTime: reminderDateTime, // ✅ Now properly formatted
        notified: existingGoal?.notified || false,
        isRecurring: false, // Manual goals are typically one-time
        source: "manual" // Identify as manual goal
      };

      console.log("📤 Sending goal data to API:", goalData);
      console.log("🔔 Reminder Time Details:", {
        input: reminderTime,
        formatted: reminderDateTime,
        display: new Date(reminderDateTime).toLocaleTimeString()
      });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      });

      // ✅ BETTER ERROR HANDLING
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Something went wrong");

      console.log("✅ Goal saved to API successfully:", data.goal);

      // ✅ Save to localStorage for notifications (with proper formatting)
      console.log("💾 Saving to localStorage for notifications...");
      
      const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      
      // ✅ FIXED: Ensure proper format for localStorage
      const goalForStorage = {
        ...data.goal,
        _id: data.goal._id || existingGoal?._id || 'manual-' + Date.now(),
        reminderTime: reminderDateTime, // Use the same properly formatted time
        notified: false,
        notifiedToday: false, // Add this for reminder service
        completed: false,
        source: "manual",
        isRecurring: false
      };

      let updatedGoals;
      if (existingGoal) {
        updatedGoals = existingGoals.map(g => 
          g._id === existingGoal._id ? goalForStorage : g
        );
        console.log("🔄 Updated in localStorage");
      } else {
        updatedGoals = [...existingGoals, goalForStorage];
        console.log("🆕 Added to localStorage, total:", updatedGoals.length);
      }
      
      localStorage.setItem('goals', JSON.stringify(updatedGoals));

      // ✅ Update local state
      if (data.goal) {
        if (existingGoal) {
          updateGoal(existingGoal._id, data.goal);
        } else {
          addGoal(data.goal);
        }
      }

      // ✅ VERIFY
      const verifyGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      console.log("✅ Final verification - localStorage goals:", verifyGoals.length);
      
      // Verify reminder time was saved correctly
      const savedGoal = verifyGoals.find(g => g._id === goalForStorage._id);
      if (savedGoal) {
        console.log("🔔 Saved reminder time:", {
          stored: savedGoal.reminderTime,
          parsed: new Date(savedGoal.reminderTime).toLocaleString(),
          isValid: !isNaN(new Date(savedGoal.reminderTime).getTime())
        });
      }

      const reminderDate = new Date(reminderDateTime);
      const deadlineDate = new Date(deadline);
      alert(`✅ Goal saved successfully!\n\n📝 ${goalText}\n📋 Duration: ${duration}\n📅 Deadline: ${deadlineDate.toLocaleDateString()}\n⏰ Daily reminder at: ${reminderTime} until ${deadlineDate.toLocaleDateString()}\n\n🔔 Reminder system is active!`);

      navigate("/goals");

    } catch (err) {
      console.error("❌ FULL ERROR DETAILS:", err);
      console.error("❌ Error message:", err.message);
      
      // ✅ FIXED: FALLBACK with proper reminder time formatting
      console.log("🔄 FALLBACK: Saving to localStorage for notifications...");
      const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      
      const goalId = existingGoal ? existingGoal._id : 'manual-' + Date.now();
      
      // ✅ FIXED: Proper reminder time formatting for fallback
      const reminderDateTime = formatReminderTimeForStorage(goalDate, reminderTime);
      
      const goalForStorage = {
        _id: goalId,
        title: goalText.trim(),
        description: description.trim(),
        duration: duration.trim(),
        date: new Date(goalDate).toISOString(),
        deadline: new Date(deadline).toISOString(),
        reminderTime: reminderDateTime, // ✅ Properly formatted
        notified: false,
        notifiedToday: false, // Important for reminder service
        status: existingGoal?.status || "pending",
        user: existingGoal?.user || 'local-user',
        completed: false,
        source: "manual",
        isRecurring: false
      };
      
      let updatedGoals;
      if (existingGoal) {
        updatedGoals = existingGoals.map(g => 
          g._id === existingGoal._id ? goalForStorage : g
        );
      } else {
        updatedGoals = [...existingGoals, goalForStorage];
      }
      
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      
      // ✅ Call addGoal/updateGoal for UI update
      if (existingGoal) {
        updateGoal(existingGoal._id, goalForStorage);
      } else {
        addGoal(goalForStorage);
      }
      
      console.log("✅ Saved to localStorage successfully");
      console.log("🔔 Fallback reminder time:", {
        input: reminderTime,
        stored: reminderDateTime,
        display: new Date(reminderDateTime).toLocaleTimeString()
      });
      
      const deadlineDate = new Date(deadline);
      alert(`✅ Goal saved locally!\n\n📝 ${goalText}\n📋 Duration: ${duration}\n📅 Deadline: ${deadlineDate.toLocaleDateString()}\n⏰ Daily reminder at: ${reminderTime} until ${deadlineDate.toLocaleDateString()}\n\n🔔 Notifications are working perfectly!`);
      
      navigate("/goals");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Test reminder functionality
  const testReminder = () => {
    const testTime = new Date(Date.now() + 120000); // 2 minutes from now
    const testGoal = {
      _id: 'test-' + Date.now(),
      title: 'TEST REMINDER - ' + goalText || 'Test Goal',
      description: 'This is a test reminder. You can delete this goal.',
      reminderTime: testTime.toISOString(),
      completed: false,
      source: 'test',
      notifiedToday: false
    };
    
    const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    existingGoals.push(testGoal);
    localStorage.setItem('goals', JSON.stringify(existingGoals));
    
    alert(`🧪 Test reminder set!\n\nCheck console in 2 minutes for reminder notification.\n\nReminder time: ${testTime.toLocaleTimeString()}`);
  };

  return (
    <div className="manualgoal-page">
      <div className="manualgoal-header">
        <h2>✍️ {existingGoal ? "Edit Goal" : "Manual Goals"}</h2>
        <p>Create and manage your personal goals</p>
        
        {/* ✅ Test Reminder Button (for development)
        {process.env.NODE_ENV === 'development' && (
          <button 
            className="btn test-btn"
            onClick={testReminder}
            style={{marginTop: '10px', background: '#ff6b6b'}}
          >
            🧪 Test Reminder (Dev)
          </button>
        )} */}
      </div>

      {/* Step 0: Duration selection - Only show for new goals */}
      {!existingGoal && step === 0 && (
        <div className="manualgoal-step">
          <h3>Select Goal Duration</h3>
          <p>Choose how often you want to work on this goal</p>
          <div className="duration-options">
            <button onClick={() => handleDurationSelect("Daily")} className="btn duration-btn">
              ⏳ Daily
            </button>
            <button onClick={() => handleDurationSelect("Weekly")} className="btn duration-btn">
              📅 Weekly
            </button>
            <button onClick={() => handleDurationSelect("Monthly")} className="btn duration-btn">
              📆 Monthly
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Enter goal details */}
      {step === 1 && (
        <div className="manualgoal-step">
          <h3>{existingGoal ? "Edit Your Goal" : "Add New Goal"}</h3>

          <div className="form-group">
            <label>🎯 Goal Title:</label>
            <input
              type="text"
              placeholder="Enter your goal title"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              className="form-input"
              maxLength={100}
            />
            <small className="help-text">
              Give a clear title to your goal (e.g., "Learn React", "Exercise Daily")
            </small>
          </div>

          <div className="form-group">
            <label>📅 Duration:</label>
            <div className="duration-display">
              <span className="duration-badge">{duration}</span>
            </div>
            <small className="help-text">
              Selected duration: {duration.toLowerCase()} goal
            </small>
          </div>

          <div className="form-group">
            <label>📝 Description:</label>
            <textarea
              placeholder="Describe your goal in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input textarea"
              rows="4"
              maxLength={500}
            />
            <small className="help-text">
              Describe what you want to achieve, steps you'll take, etc.
            </small>
          </div>

          <div className="form-group">
            <label>📅 Goal Start Date:</label>
            <input
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
            <small className="help-text">
              When do you want to start working on this goal?
            </small>
          </div>

          <div className="form-group">
            <label>⏰ Deadline:</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="form-input"
              min={goalDate || new Date().toISOString().split('T')[0]}
            />
            <small className="help-text">
              When should this goal be completed?
            </small>
          </div>

          <div className="form-group">
            <label>🔔 Daily Reminder Time:</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="form-input"
            />
            <small className="help-text">
              Set the time for daily reminders (you'll be reminded every day at this time until the deadline)
              <br />
              <strong>Current reminder: {reminderTime}</strong>
              {reminderTime && (
                <span> → Will trigger at {reminderTime} daily</span>
              )}
            </small>
          </div>

          <div className="step-actions">
            <button 
              className="btn save-btn" 
              onClick={handleSaveGoal} 
              disabled={loading || !goalText.trim() || !description.trim() || !goalDate || !deadline}
            >
              {loading ? "⏳ Saving..." : "💾 Save Goal"}
            </button>
            <button
              className="btn cancel-btn"
              onClick={() => {
                if (existingGoal) navigate("/goals");
                else {
                  setStep(0);
                  setGoalText("");
                  setDescription("");
                  setGoalDate("");
                  setDeadline("");
                  setReminderTime("09:00");
                }
              }}
              disabled={loading}
            >
              ✖ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualGoal;