import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [goals, setGoals] = useState([]);
  const [todaysCompletedCount, setTodaysCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [greeting, setGreeting] = useState("Good Morning");
  const navigate = useNavigate();

  const quotes = [
    "🌟 Focus and determination beat talent.",
    "💡 Small steps lead to big results.",
    "🔥 Consistency is the key to success.",
    "✨ Believe in yourself and keep going.",
    "📚 One page a day keeps failure away.",
  ];

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || { name: "User" };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // ✅ FIXED: Remove duplicate goals
  const removeDuplicateGoals = (allGoals) => {
    const uniqueGoals = [];
    const seenIds = new Set();
    
    allGoals.forEach(goal => {
      if (!seenIds.has(goal._id)) {
        seenIds.add(goal._id);
        uniqueGoals.push(goal);
      } else {
        console.log("🚫 Removing duplicate goal:", goal.title, goal._id);
      }
    });
    
    return uniqueGoals;
  };

  // ✅ Calculate today's completed goals
  const getTodaysCompletedGoals = (allGoals) => {
    const today = new Date().toISOString().split('T')[0];
    
    return allGoals.filter(goal => {
      if (goal.completed && !goal.isRecurring) {
        const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
        return completedDate === today;
      }
      
      if (goal.isRecurring && goal.completedDates) {
        return goal.completedDates.some(completed => completed.date === today);
      }
      
      return false;
    });
  };

  // ✅ SIMPLIFIED: Show goals that should be active TODAY
  const getTodaysPendingGoals = (allGoals) => {
    const today = new Date().toISOString().split('T')[0];
    
    return allGoals.filter(goal => {
      // Skip completed goals
      if (goal.completed) return false;
      
      // Skip if completed today
      const isCompletedToday = isGoalCompletedToday(goal);
      if (isCompletedToday) return false;
      
      // ✅ CHATBOT GOALS: Always show (they're daily)
      if (goal.source === 'chatbot') {
        return true;
      }
      
      // ✅ MANUAL GOALS: Simple logic - show if should be active today
      if (goal.isRecurring) {
        // If has current instance date, check if it's today
        if (goal.currentInstanceDate) {
          return goal.currentInstanceDate === today;
        }
        
        // For goals without instance date
        const startDate = goal.date ? new Date(goal.date).toISOString().split('T')[0] : today;
        const deadline = goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : null;
        
        // Don't show if deadline passed
        if (deadline && today > deadline) return false;
        
        // Show if started and not ended
        return today >= startDate;
        
      } else {
        // One-time goals - show if deadline is today or in future
        if (!goal.deadline) return true;
        
        const deadline = new Date(goal.deadline).toISOString().split('T')[0];
        return deadline >= today;
      }
    });
  };

  // ✅ Check if goal is completed today
  const isGoalCompletedToday = (goal) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (goal.completed && !goal.isRecurring) {
      const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
      return completedDate === today;
    }
    
    if (goal.isRecurring && goal.completedDates) {
      return goal.completedDates.some(completed => completed.date === today);
    }
    
    return false;
  };

  // ✅ FIXED: Properly merge goals without duplicates
  const fetchGoals = async () => {
    if (!token) return;

    try {
      let apiGoals = [];
      let localGoals = [];
      
      // ✅ Fetch from API (MANUAL GOALS)
      try {
        const res = await fetch("http://localhost:5000/api/goals", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          apiGoals = data.goals || [];
        }
      } catch (apiError) {
        console.error("API fetch failed:", apiError);
      }
      
      // ✅ Fetch from LOCALSTORAGE (CHATBOT GOALS)
      try {
        localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      } catch (localError) {
        console.error("Local storage error:", localError);
        localGoals = [];
      }
      
      // ✅ MERGE GOALS PROPERLY (avoid duplicates)
      const allGoals = [...apiGoals]; // Start with API goals
      
      // Add local goals only if they don't exist in API goals
      localGoals.forEach(localGoal => {
        const exists = apiGoals.some(apiGoal => apiGoal._id === localGoal._id);
        if (!exists) {
          allGoals.push(localGoal);
        }
      });
      
      // ✅ Remove any remaining duplicates
      const uniqueGoals = removeDuplicateGoals(allGoals);
      
      // ✅ Calculate today's counts
      const todaysCompleted = getTodaysCompletedGoals(uniqueGoals);
      const todaysPending = getTodaysPendingGoals(uniqueGoals);
      
      setTodaysCompletedCount(todaysCompleted.length);
      setPendingCount(todaysPending.length);
      setGoals(todaysPending);
      
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  // ✅ Get frequency display text
  const getFrequencyDisplay = (goal) => {
    if (!goal.isRecurring) return '⏰ Once';
    
    if (goal.frequency) {
      const freq = goal.frequency.toLowerCase();
      if (freq === 'daily') return '📅 Daily';
      if (freq === 'weekly') return '📅 Weekly';
      if (freq === 'monthly') return '📅 Monthly';
    }
    
    return '🔄 Recurring';
  };

  // ✅ Get deadline display
  const getDeadlineDisplay = (goal) => {
    if (!goal.deadline) return 'No deadline';
    
    const deadline = new Date(goal.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `${diffDays} days left`;
    if (diffDays < 0) return 'Overdue';
    
    return deadline.toLocaleDateString();
  };

  useEffect(() => {
    fetchGoals();
    
    const handleStorageChange = () => {
      fetchGoals();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>{greeting}, {user.name}! {greeting === "Good Morning" ? "🌞" : greeting === "Good Afternoon" ? "☀️" : greeting === "Good Evening" ? "🌙" : "🌙"}</h1>
        <p className="dashboard-quote">{quotes[quoteIndex]}</p>
      </div>

      <div className="status-container">
        <div className="status-box">
          <div className="circle completed">{todaysCompletedCount}</div>
          <span className="status-label">Completed Today</span>
        </div>
        <div className="status-box">
          <div className="circle pending">{pendingCount}</div>
          <span className="status-label">Pending Today</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>🎯 Today's Goals</h3>
        {goals.length === 0 ? (
          <div className="no-goals-container">
            <p className="no-goals-text">🎉 No goals for today!</p>
            <p className="no-goals-subtext">
              {todaysCompletedCount > 0 
                ? `You've completed ${todaysCompletedCount} goal${todaysCompletedCount > 1 ? 's' : ''} today!` 
                : "Enjoy your day or create new goals!"}
            </p>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map((goal) => (
              <div key={goal._id} className="goal-card">
                <div className="goal-header">
                  <p className="goal-title"><strong>{goal.title}</strong></p>
                  <span className="goal-type">
                    {getFrequencyDisplay(goal)}
                    {goal.source === 'chatbot' && ' 🤖'}
                    {(!goal.source || goal.source === 'manual') && ' ✍️'}
                  </span>
                </div>
                <div className="goal-details">
                  <span className="goal-time">⏰ {goal.reminderTime || "No reminder"}</span>
                  <span className="goal-deadline">
                    {getDeadlineDisplay(goal)}
                  </span>
                </div>
                {/* {goal.description && (
                  <div className="goal-description">
                    {goal.description}
                  </div>
                )} */}
              </div>
            ))}
          </div>
        )}
        
        {/* ✅ CREATE NEW GOAL BUTTON ADDED BACK */}
        <button
          type="button"
          className="btn-create-goal"
          onClick={() => navigate("/create-goal")}
        >
          ➕ Create New Goal
        </button>
      </div>

      {/* ✅ Today's Date Display */}
      <div className="today-date">
        📅 {new Date().toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
}

export default Dashboard;