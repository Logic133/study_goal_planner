import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Goals.css";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showFlowers, setShowFlowers] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ IMPROVED: Better goal detection
  const isChatbotGoal = (goal) => {
    return goal.source === 'chatbot' || goal.isLocal;
  };

  const isManualGoal = (goal) => {
    return goal.source === 'manual' || (!goal.source && !goal.isLocal);
  };

  // ✅ IMPROVED: Fetch goals from both API and localStorage
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      let apiGoals = [];
      
      // Fetch from API
      try {
        const res = await fetch("http://localhost:5000/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            apiGoals = data.goals;
            console.log("📥 API Goals:", apiGoals.length);
          }
        }
      } catch (apiError) {
        console.error("API fetch failed, using localStorage:", apiError);
      }

      // ✅ GET LOCALSTORAGE GOALS (INCLUDING CHATBOT)
      const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      console.log("📥 LocalStorage Goals:", localGoals.length);
      
      // Merge goals - prioritize API goals, add unique localStorage goals
      const allGoals = [...apiGoals];
      
      localGoals.forEach(localGoal => {
        const exists = apiGoals.some(apiGoal => 
          apiGoal._id === localGoal._id
        );
        
        if (!exists) {
          allGoals.push({
            ...localGoal,
            isLocal: true
          });
        }
      });

      console.log("📊 Total Merged Goals:", allGoals.length);
      
      const chatbotGoals = allGoals.filter(g => isChatbotGoal(g));
      const manualGoals = allGoals.filter(g => isManualGoal(g));
      
      console.log("🤖 Chatbot Goals Found:", chatbotGoals.length);
      console.log("✍️ Manual Goals Found:", manualGoals.length);
      
      chatbotGoals.forEach(goal => {
        console.log("  -", goal.title, "| Active:", isGoalActiveToday(goal), "| Completed:", isGoalCompletedToday(goal));
      });

      setGoals(allGoals);

    } catch (err) {
      console.error("Error fetching goals:", err);
      // Fallback to localStorage only
      const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      setGoals(localGoals.map(goal => ({ ...goal, isLocal: true })));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGoals();
    
    const handleStorageChange = () => {
      console.log("🔄 Storage changed, refreshing goals...");
      fetchGoals();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchGoals]);

  // ✅ IMPROVED: Handle recurring goal completion (INCLUDES CHATBOT)
  const handleRecurringGoalDone = async (goalId) => {
    try {
      const goal = goals.find(g => g._id === goalId);
      const today = new Date().toISOString().split('T')[0];
      
      if (isChatbotGoal(goal)) {
        const updatedGoals = goals.map(g => {
          if (g._id === goalId) {
            const completedDates = [...(g.completedDates || []), { date: today }];
            
            // Calculate next instance date
            const nextInstanceDate = getNextInstanceDate(g.frequency, today);
            
            return {
              ...g,
              completedDates,
              currentInstanceDate: nextInstanceDate,
              updatedAt: new Date().toISOString()
            };
          }
          return g;
        });
        
        setGoals(updatedGoals);
        localStorage.setItem('goals', JSON.stringify(updatedGoals.filter(g => isChatbotGoal(g))));
        
        // Trigger storage event for dashboard
        window.dispatchEvent(new Event('storage'));
        
        setShowCongrats(true);
        setShowFlowers(true);
        setTimeout(() => {
          setShowCongrats(false);
          setShowFlowers(false);
        }, 2500);
        
        return;
      }

      // API goal handling (manual goals)
      const res = await fetch(`http://localhost:5000/api/goals/${goalId}/complete-recurring`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      
      const data = await res.json();
      if (data.success) {
        await fetchGoals();
        setShowCongrats(true);
        setShowFlowers(true);
        setTimeout(() => {
          setShowCongrats(false);
          setShowFlowers(false);
        }, 2500);
      } else {
        alert(data.message || "Failed to complete goal");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark goal as done");
    }
  };

  // ✅ IMPROVED: Handle one-time goal completion (INCLUDES CHATBOT)
  const handleOneTimeGoalDone = async (goalId) => {
    try {
      const goal = goals.find(g => g._id === goalId);
      
      if (isChatbotGoal(goal)) {
        const updatedGoals = goals.map(g => 
          g._id === goalId ? { 
            ...g, 
            completed: true,
            updatedAt: new Date().toISOString()
          } : g
        );
        
        setGoals(updatedGoals);
        localStorage.setItem('goals', JSON.stringify(updatedGoals.filter(g => isChatbotGoal(g))));
        
        // Trigger storage event for dashboard
        window.dispatchEvent(new Event('storage'));
        
        setShowCongrats(true);
        setShowFlowers(true);
        setTimeout(() => {
          setShowCongrats(false);
          setShowFlowers(false);
        }, 2500);
        
        return;
      }

      // API goal handling (manual goals)
      const res = await fetch(`http://localhost:5000/api/goals/${goalId}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchGoals();
        setShowCongrats(true);
        setShowFlowers(true);
        setTimeout(() => {
          setShowCongrats(false);
          setShowFlowers(false);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkDone = async (goal) => {
    if (goal.isRecurring) {
      await handleRecurringGoalDone(goal._id);
    } else {
      await handleOneTimeGoalDone(goal._id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    
    try {
      const goal = goals.find(g => g._id === id);
      
      if (isChatbotGoal(goal)) {
        const updatedGoals = goals.filter(g => g._id !== id);
        setGoals(updatedGoals);
        localStorage.setItem('goals', JSON.stringify(updatedGoals.filter(g => isChatbotGoal(g))));
        
        // Trigger storage event for dashboard
        window.dispatchEvent(new Event('storage'));
        return;
      }

      // API goal handling (manual goals)
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setGoals((prev) => prev.filter((g) => g._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIXED: Edit button logic
  const handleEdit = (goal) => {
    if (isChatbotGoal(goal)) {
      alert("Chatbot goals cannot be edited manually. Please create a new goal instead.");
      return;
    }
    navigate("/manual-goal", { state: { goalToEdit: goal } });
  };

  const toggleDescription = (goalId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getDurationDisplay = (goal) => {
    if (goal.duration) return goal.duration;
    if (goal.frequency) return goal.frequency;
    return "Custom";
  };

  // ✅ IMPROVED: Calculate next instance date
  const getNextInstanceDate = (frequency, startDate) => {
    const date = new Date(startDate);
    
    switch (frequency?.toLowerCase()) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        date.setDate(date.getDate() + 1); // Default to daily
    }
    
    return date.toISOString().split('T')[0];
  };

  // ✅ IMPROVED: Check if goal is active today (INCLUDES CHATBOT)
  const isGoalActiveToday = (goal) => {
    if (goal.completed) return false;
    
    const today = new Date().toISOString().split('T')[0];
    
    // ✅ CHATBOT GOALS: Always active today unless completed
    if (isChatbotGoal(goal)) {
      const isCompletedToday = isGoalCompletedToday(goal);
      return !isCompletedToday;
    }
    
    if (goal.isRecurring) {
      if (goal.currentInstanceDate) {
        return goal.currentInstanceDate === today;
      }
      
      // Fallback for recurring goals without instance date
      if (goal.date) {
        const startDate = new Date(goal.date).toISOString().split('T')[0];
        return startDate <= today;
      }
      
      return true;
    } else {
      if (!goal.deadline) return true;
      
      const deadline = new Date(goal.deadline).toISOString().split('T')[0];
      return deadline >= today && !goal.completed;
    }
  };

  // ✅ IMPROVED: Check if goal is completed today (INCLUDES CHATBOT)
  const isGoalCompletedToday = (goal) => {
    if (goal.completed) return true;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (goal.isRecurring && goal.completedDates) {
      const todayCompleted = goal.completedDates.some(completed => 
        completed.date === today
      );
      return todayCompleted;
    }
    
    return goal.completed;
  };

  // ✅ FIXED: Get reminder time display for BOTH manual and chatbot goals
  const getReminderTimeDisplay = (goal) => {
    if (!goal.reminderTime) return "No reminder";
    
    try {
      // Pehle check karo agar ISO string hai (manual goals)
      const reminderDate = new Date(goal.reminderTime);
      if (!isNaN(reminderDate.getTime())) {
        return reminderDate.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      // Agar ISO string nahi hai, toh simple time string hai (chatbot goals)
      if (typeof goal.reminderTime === 'string') {
        const timeStr = goal.reminderTime.trim();
        
        // Simple time format check: "9:00 AM", "6:30 PM"
        const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i;
        const match = timeStr.match(timeRegex);
        
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          let period = match[3] ? match[3].toUpperCase() : 'AM';
          
          // Validate and format properly
          if (hours > 12 && !match[3]) {
            period = hours >= 12 ? 'PM' : 'AM';
            hours = hours > 12 ? hours - 12 : hours;
          }
          
          return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
        
        // Return original string if format samajh nahi aaya
        return timeStr;
      }
      
      return "Invalid time";
    } catch (error) {
      console.error("Error parsing reminder time:", error, goal.reminderTime);
      return "Error";
    }
  };

  // ✅ IMPROVED: Get upcoming recurring goals (EXCLUDES CHATBOT - they're always today)
  const getUpcomingRecurringGoals = () => {
    const today = new Date().toISOString().split('T')[0];

    return goals.filter(goal => {
      if (!goal.isRecurring || goal.completed) return false;
      
      // ✅ CHATBOT GOALS: Don't show in upcoming - they're always today's goals
      if (isChatbotGoal(goal)) return false;
      
      if (!goal.currentInstanceDate) {
        if (goal.date) {
          const startDate = new Date(goal.date).toISOString().split('T')[0];
          return startDate > today;
        }
        return false;
      }
      
      const instanceDate = goal.currentInstanceDate;
      const isUpcoming = instanceDate > today;
      const isCompletedToday = isGoalCompletedToday(goal);
      
      return isUpcoming && !isCompletedToday;
    });
  };

  // ✅ IMPROVED: Filter goals for different sections
  const todaysActiveGoals = goals.filter(goal => 
    isGoalActiveToday(goal) && !isGoalCompletedToday(goal)
  );
  
  const upcomingRecurringGoals = getUpcomingRecurringGoals();
  
  const completedGoals = goals.filter(goal => 
    goal.completed || isGoalCompletedToday(goal)
  );

  // ✅ ADDED: Get counts for dashboard consistency
  const getDashboardCounts = () => {
    const pendingGoals = goals.filter(goal => 
      !goal.completed && !isGoalCompletedToday(goal) && isGoalActiveToday(goal)
    );
    
    const completedGoalsCount = goals.filter(goal => 
      goal.completed || isGoalCompletedToday(goal)
    ).length;

    console.log("📊 Dashboard Counts - Pending:", pendingGoals.length, "Completed:", completedGoalsCount);
    
    return { pending: pendingGoals.length, completed: completedGoalsCount };
  };

  const getCompletionCount = (goal) => {
    if (!goal.isRecurring) return 0;
    return goal.completedDates?.length || 0;
  };

  const getSourceBadge = (goal) => {
    if (isChatbotGoal(goal)) return '🤖 Chatbot';
    if (isManualGoal(goal)) return '✍️ Manual';
    return '🎯 Goal';
  };

  // Debug function
  const debugGoals = () => {
    const counts = getDashboardCounts();
    console.log("🐛 DEBUG All Goals:", goals);
    console.log("🤖 Chatbot Goals:", goals.filter(g => isChatbotGoal(g)));
    console.log("✍️ Manual Goals:", goals.filter(g => isManualGoal(g)));
    console.log("✅ Today's Active:", todaysActiveGoals.length);
    console.log("📋 Upcoming:", upcomingRecurringGoals.length);
    console.log("🎯 Completed:", completedGoals.length);
    console.log("📊 Dashboard Counts - Pending:", counts.pending, "Completed:", counts.completed);
  };

  // ✅ ADDED: Debug reminders function
  const debugReminders = () => {
    console.log("🐛 DEBUG REMINDERS:");
    goals.forEach(goal => {
      const isChatbot = isChatbotGoal(goal);
      console.log(`   ${isChatbot ? '🤖' : '✍️'} "${goal.title}":`, {
        reminderTime: goal.reminderTime,
        display: getReminderTimeDisplay(goal),
        source: goal.source,
        isChatbot: isChatbot,
        activeToday: isGoalActiveToday(goal)
      });
    });
  };

  // ✅ ADDED: Update dashboard counts when goals change
  useEffect(() => {
    if (goals.length > 0) {
      getDashboardCounts();
    }
  }, [goals]);

  return (
    <div className="goals-page">
      <div className="goals-header">
        <h2>🎯 Your Goals</h2>
        {/* <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={fetchGoals}
            title="Refresh goals"
          >
            🔄 Refresh
          </button>
          <button 
            className="debug-btn"
            onClick={debugGoals}
            title="Debug goals"
          >
            🐛 Debug Goals
          </button>
          <button 
            className="debug-btn"
            onClick={debugReminders}
            title="Debug reminders"
          >
            ⏰ Debug Reminders
          </button>
        </div> */}
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="no-goals">
          <p>📝 No goals yet. Add your first one!</p>
          <div className="no-goals-actions">
            <button onClick={() => navigate("/manual-goal")} className="btn-primary">
              ✍️ Add Manual Goal
            </button>
            <button onClick={() => navigate("/chatbot")} className="btn-secondary">
              🤖 Use Chatbot
            </button>
          </div>
        </div>
      ) : (
        <div className="goals-container">
          {/* Today's Active Goals */}
          {todaysActiveGoals.length > 0 && (
            <div className="goals-section">
              <h3 className="section-title">
                📅 Today's Goals ({todaysActiveGoals.length})
              </h3>
              <div className="goals-list">
                {todaysActiveGoals.map((goal) => {
                  const isExpanded = expandedDescriptions[goal._id];
                  const displayDescription = isExpanded 
                    ? goal.description 
                    : truncateText(goal.description, 80);
                  const durationDisplay = getDurationDisplay(goal);
                  const completionCount = getCompletionCount(goal);
                  const sourceBadge = getSourceBadge(goal);
                  const reminderDisplay = getReminderTimeDisplay(goal);
                  const isChatbot = isChatbotGoal(goal);

                  return (
                    <div
                      key={goal._id}
                      className={`goal-card active ${goal.isRecurring ? 'recurring' : 'onetime'} ${isChatbot ? 'chatbot-goal' : ''}`}
                    >
                      <div className="goal-info">
                        <div className="goal-header">
                          <div className="goal-title-section">
                            <p className="goal-title">{goal.title}</p>
                            <span className="goal-source">{sourceBadge}</span>
                          </div>
                          <span className={`goal-duration ${goal.isRecurring ? 'recurring-badge' : 'onetime-badge'}`}>
                            {goal.isRecurring ? '🔄 '+durationDisplay : '⏰ ' + durationDisplay}
                          </span>
                        </div>
                        
                        <div 
                          className={`goal-desc ${isExpanded ? 'expanded' : 'collapsed'}`}
                          onClick={() => toggleDescription(goal._id)}
                        >
                          {displayDescription}
                          {goal.description && goal.description.length > 80 && (
                            <span className="read-more">
                              {isExpanded ? " ^" : " >"}
                            </span>
                          )}
                        </div>

                        <div className="goal-metadata">
                          <small>🔔 {reminderDisplay}</small>
                          {goal.deadline && (
                            <small>📅 {new Date(goal.deadline).toLocaleDateString()}</small>
                          )}
                          {/* {goal.currentInstanceDate && goal.isRecurring && (
                            <small>🗓️ Today's Instance</small>
                          )} */}
                        </div>

                        {/* {goal.tasks && (
                          <div className="goal-tasks">
                            <small>📋 Tasks: {goal.tasks}</small>
                          </div>
                        )} */}

                        {goal.isRecurring && completionCount > 0 && (
                          <div className="completion-info">
                            <small>✅ Completed {completionCount} times</small>
                          </div>
                        )}
                      </div>
                      
                      <div className="goal-actions">
                        {/* ✅ FIXED: Show edit button for manual goals only */}
                        {!isChatbot && (
                          <button className="goal-btn edit-btn" onClick={() => handleEdit(goal)}>
                            ✏️
                          </button>
                        )}
                        <button
                          className="goal-btn done-btn"
                          onClick={() => handleMarkDone(goal)}
                        >
                          {goal.isRecurring ? '✔️ Done Today' : '✔️ Complete'}
                        </button>
                        <button
                          className="goal-btn delete-btn"
                          onClick={() => handleDelete(goal._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Recurring Goals */}
          {upcomingRecurringGoals.length > 0 && (
            <div className="goals-section upcoming-section">
              <h3 className="section-title upcoming-title">
                📋 Upcoming Goals ({upcomingRecurringGoals.length})
              </h3>
              <div className="goals-list">
                {upcomingRecurringGoals.map((goal) => {
                  const isExpanded = expandedDescriptions[goal._id];
                  const displayDescription = isExpanded 
                    ? goal.description 
                    : truncateText(goal.description, 80);
                  const durationDisplay = getDurationDisplay(goal);
                  const completionCount = getCompletionCount(goal);
                  const sourceBadge = getSourceBadge(goal);
                  const reminderDisplay = getReminderTimeDisplay(goal);
                  const isChatbot = isChatbotGoal(goal);

                  return (
                    <div
                      key={goal._id}
                      className="goal-card upcoming"
                    >
                      <div className="goal-info">
                        <div className="goal-header">
                          <div className="goal-title-section">
                            <p className="goal-title">{goal.title}</p>
                            <span className="goal-source">{sourceBadge}</span>
                          </div>
                          <span className="goal-duration recurring-badge">
                            🔄 {durationDisplay}
                          </span>
                        </div>
                        
                        <div 
                          className={`goal-desc ${isExpanded ? 'expanded' : 'collapsed'}`}
                          onClick={() => toggleDescription(goal._id)}
                        >
                          {displayDescription}
                          {goal.description && goal.description.length > 80 && (
                            <span className="read-more">
                              {isExpanded ? " Read less" : " Read more"}
                            </span>
                          )}
                        </div>

                        <div className="goal-metadata">
                          <small>🔔 {reminderDisplay}</small>
                          {goal.currentInstanceDate && (
                            <small>📅 Next: {new Date(goal.currentInstanceDate).toLocaleDateString()}</small>
                          )}
                        </div>

                        {goal.tasks && (
                          <div className="goal-tasks">
                            <small>📋 Tasks: {goal.tasks}</small>
                          </div>
                        )}

                        {completionCount > 0 && (
                          <div className="completion-info">
                            <small>✅ Completed {completionCount} times</small>
                          </div>
                        )}
                      </div>
                      
                      <div className="goal-actions">
                        {/* ✅ FIXED: Show edit button for manual goals only */}
                        {!isChatbot && (
                          <button className="goal-btn edit-btn" onClick={() => handleEdit(goal)}>
                            ✏️
                          </button>
                        )}
                        <button className="goal-btn skip-btn" disabled>
                          ⏭️ Upcoming
                        </button>
                        <button
                          className="goal-btn delete-btn"
                          onClick={() => handleDelete(goal._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="goals-section completed-section">
              <h3 className="section-title completed-title">
                ✅ Completed Goals ({completedGoals.length})
              </h3>
              <div className="goals-list completed-list">
                {completedGoals.map((goal) => {
                  const isExpanded = expandedDescriptions[goal._id];
                  const displayDescription = isExpanded 
                    ? goal.description 
                    : truncateText(goal.description, 80);
                  const durationDisplay = getDurationDisplay(goal);
                  const completionCount = getCompletionCount(goal);
                  const sourceBadge = getSourceBadge(goal);
                  const isChatbot = isChatbotGoal(goal);

                  return (
                    <div
                      key={goal._id}
                      className="goal-card completed"
                    >
                      <div className="goal-info">
                        <div className="goal-header">
                          <div className="goal-title-section">
                            <p className="goal-title">{goal.title}</p>
                            <span className="goal-source">{sourceBadge}</span>
                          </div>
                          <span className={`goal-duration ${goal.isRecurring ? 'recurring-badge' : 'onetime-badge'}`}>
                            {goal.isRecurring ? '🔄 ' + durationDisplay : '⏰ ' + durationDisplay}
                          </span>
                        </div>
                        
                        {goal.isRecurring && completionCount > 0 && (
                          <div className="completion-info">
                            <small>✅ Completed {completionCount} times total</small>
                          </div>
                        )}
                        
                        <div 
                          className={`goal-desc ${isExpanded ? 'expanded' : 'collapsed'}`}
                          onClick={() => toggleDescription(goal._id)}
                        >
                          {displayDescription}
                          {goal.description && goal.description.length > 80 && (
                            <span className="read-more">
                              {isExpanded ? " Read less" : " Read more"}
                            </span>
                          )}
                        </div>

                        {goal.tasks && (
                          <div className="goal-tasks">
                            <small>📋 Tasks: {goal.tasks}</small>
                          </div>
                        )}

                        <div className="goal-metadata">
                          <small>🏁 Completed on: {new Date(goal.updatedAt || goal.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                      
                      <div className="goal-actions">
                        <button
                          className="goal-btn delete-btn"
                          onClick={() => handleDelete(goal._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Goals Today Message */}
          {todaysActiveGoals.length === 0 && upcomingRecurringGoals.length === 0 && completedGoals.length === 0 && (
            <div className="no-goals-today">
              <p>🎉 No goals for today! Enjoy your day or add new goals.</p>
              <div className="no-goals-actions">
                <button onClick={() => navigate("/manual-goal")} className="btn-primary">
                  ✍️ Add Manual Goal
                </button>
                <button onClick={() => navigate("/chatbot")} className="btn-secondary">
                  🤖 Use Chatbot
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Congratulations Overlay */}
      {showCongrats && (
        <div className="congrats-overlay">
          <div className="congrats-content">
            <div className="congrats-text">🎉 Congratulations! 🎉</div>
            <div className="congrats-subtext">You've completed another goal! 🌟</div>
          </div>
        </div>
      )}

      {/* Flowers Animation */}
      {showFlowers && (
        <div className="flowers-overlay">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flower" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}>
              {['🌸', '🌺', '🌷', '💮', '🏵️', '🌻', '🌼', '🥀'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Goals;