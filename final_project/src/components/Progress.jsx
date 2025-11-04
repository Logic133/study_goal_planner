// import React, { useEffect, useState } from "react";
// import "./Progress.css";

// function Progress() {
//   const [todaysCompletedGoals, setTodaysCompletedGoals] = useState([]);
//   const [todaysPendingGoals, setTodaysPendingGoals] = useState([]);
//   const [dayStreak, setDayStreak] = useState(0);
//   const [allGoals, setAllGoals] = useState([]);

//   const token = localStorage.getItem("token");

//   const fetchGoals = async () => {
//     try {
//       let allGoals = [];
      
//       // Fetch from API (Manual Goals)
//       try {
//         const res = await fetch("http://localhost:5000/api/goals", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();

//         if (data.success) {
//           allGoals = [...data.goals];
//           console.log("📥 Manual Goals from API:", allGoals.length);
//         }
//       } catch (apiError) {
//         console.error("API fetch failed:", apiError);
//       }

//       // ✅ ADD CHATBOT GOALS from localStorage
//       const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
//       console.log("🤖 Chatbot Goals from localStorage:", localGoals.length);
      
//       // ✅ MERGE GOALS PROPERLY - avoid duplicates
//       const mergedGoals = [...allGoals];
//       localGoals.forEach(localGoal => {
//         const exists = allGoals.some(apiGoal => apiGoal._id === localGoal._id);
//         if (!exists) {
//           mergedGoals.push(localGoal);
//         }
//       });
      
//       console.log("📊 TOTAL MERGED GOALS:", mergedGoals.length);
//       setAllGoals(mergedGoals);

//       // ✅ Calculate TODAY'S goals only
//       calculateTodaysGoals(mergedGoals);
//       calculateStreak(mergedGoals);
      
//     } catch (err) {
//       console.error("❌ Progress Error:", err);
//     }
//   };

//   const calculateTodaysGoals = (allGoals) => {
//     const today = new Date().toISOString().split('T')[0];
    
//     console.log("🔍 CALCULATING TODAY'S GOALS...");
//     console.log("📅 Today's date:", today);
//     console.log("🎯 Total goals to check:", allGoals.length);

//     // ✅ Remove duplicate goals first
//     const uniqueGoals = [];
//     const seenIds = new Set();
    
//     allGoals.forEach(goal => {
//       if (!seenIds.has(goal._id)) {
//         seenIds.add(goal._id);
//         uniqueGoals.push(goal);
//       } else {
//         console.log(`🚫 DUPLICATE REMOVED: ${goal.title}`);
//       }
//     });

//     console.log("🎯 UNIQUE GOALS AFTER DEDUPLICATION:", uniqueGoals.length);

//     // ✅ ONLY TODAY'S COMPLETED GOALS
//     const todaysCompleted = uniqueGoals.filter(goal => {
//       // One-time goals completed TODAY
//       if (goal.completed && !goal.isRecurring) {
//         const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
//         const isCompletedToday = completedDate === today;
//         if (isCompletedToday) {
//           console.log(`✅ COMPLETED TODAY: "${goal.title}" (one-time)`);
//         }
//         return isCompletedToday;
//       }
      
//       // Recurring goals completed TODAY
//       if (goal.isRecurring && goal.completedDates) {
//         const completedToday = goal.completedDates.some(completed => completed.date === today);
//         if (completedToday) {
//           console.log(`✅ COMPLETED TODAY: "${goal.title}" (recurring)`);
//         }
//         return completedToday;
//       }
      
//       return false;
//     });

//     // ✅ ONLY TODAY'S PENDING GOALS (active today)
//     const todaysPending = uniqueGoals.filter(goal => {
//       // Skip completed goals
//       if (goal.completed) {
//         return false;
//       }
      
//       // Skip if completed today (already counted in todaysCompleted)
//       const isCompletedToday = isGoalCompletedToday(goal);
//       if (isCompletedToday) {
//         return false;
//       }
      
//       // ✅ CHATBOT GOALS: Always active today
//       if (goal.source === 'chatbot') {
//         console.log(`⏳ PENDING TODAY: "${goal.title}" (chatbot)`);
//         return true;
//       }
      
//       // ✅ MANUAL GOALS: Check if active today (SIMPLE LOGIC)
//       if (goal.isRecurring) {
//         // Recurring manual goal: active if instance date matches today
//         if (goal.currentInstanceDate === today) {
//           console.log(`⏳ PENDING TODAY: "${goal.title}" (manual recurring - instance today)`);
//           return true;
//         }
//         return false;
//       } else {
//         // One-time manual goal: active if deadline is today or in future, OR no deadline
//         if (!goal.deadline) {
//           console.log(`⏳ PENDING TODAY: "${goal.title}" (manual one-time - no deadline)`);
//           return true;
//         }
        
//         const deadline = new Date(goal.deadline).toISOString().split('T')[0];
//         const isActive = deadline >= today;
//         if (isActive) {
//           console.log(`⏳ PENDING TODAY: "${goal.title}" (manual one-time - deadline ${deadline})`);
//         }
//         return isActive;
//       }
//     });

//     console.log("🎯 FINAL COUNTS:");
//     console.log("✅ Today's Completed:", todaysCompleted.length);
//     console.log("⏳ Today's Pending:", todaysPending.length);
//     console.log("📊 Today's Total:", todaysCompleted.length + todaysPending.length);

//     // ✅ Debug: Show all counted goals
//     console.log("📝 COMPLETED GOALS:", todaysCompleted.map(g => g.title));
//     console.log("📝 PENDING GOALS:", todaysPending.map(g => g.title));

//     setTodaysCompletedGoals(todaysCompleted);
//     setTodaysPendingGoals(todaysPending);
//   };

//   const isGoalCompletedToday = (goal) => {
//     const today = new Date().toISOString().split('T')[0];
    
//     if (goal.completed && !goal.isRecurring) {
//       const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
//       return completedDate === today;
//     }
    
//     if (goal.isRecurring && goal.completedDates) {
//       return goal.completedDates.some(completed => completed.date === today);
//     }
    
//     return false;
//   };

//   const calculateStreak = (allGoals) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const completionDates = new Set();
    
//     allGoals.forEach(goal => {
//       if (goal.completed && !goal.isRecurring) {
//         const completedDate = goal.updatedAt || goal.createdAt;
//         if (completedDate) {
//           const date = new Date(completedDate);
//           date.setHours(0, 0, 0, 0);
//           completionDates.add(date.getTime());
//         }
//       }
      
//       if (goal.isRecurring && goal.completedDates) {
//         goal.completedDates.forEach(completed => {
//           if (completed.date) {
//             const date = new Date(completed.date);
//             date.setHours(0, 0, 0, 0);
//             completionDates.add(date.getTime());
//           }
//         });
//       }
//     });

//     const uniqueDates = Array.from(completionDates).sort((a, b) => b - a);

//     let streak = 0;
//     let currentDate = today.getTime();
    
//     const todayHasCompletion = uniqueDates.includes(currentDate);
    
//     if (todayHasCompletion) {
//       streak = 1;
      
//       for (let day = 1; day <= 365; day++) {
//         const previousDate = currentDate - (day * 24 * 60 * 60 * 1000);
        
//         if (uniqueDates.includes(previousDate)) {
//           streak++;
//         } else {
//           break;
//         }
//       }
//     } else {
//       streak = 0;
//     }
    
//     setDayStreak(streak);
//   };

//   useEffect(() => {
//     fetchGoals();
    
//     const handleGoalChange = () => {
//       console.log("🔄 Goal changed, refreshing progress...");
//       fetchGoals();
//     };
    
//     window.addEventListener('storage', handleGoalChange);
//     window.addEventListener('goalUpdated', handleGoalChange);
    
//     const interval = setInterval(fetchGoals, 30000);
    
//     return () => {
//       window.removeEventListener('storage', handleGoalChange);
//       window.removeEventListener('goalUpdated', handleGoalChange);
//       clearInterval(interval);
//     };
//   }, [token]);

//   // ✅ TOTAL GOALS = Today's Completed + Today's Pending
//   const totalTodaysGoals = todaysCompletedGoals.length + todaysPendingGoals.length;
//   const todaysSuccessRate = totalTodaysGoals === 0 ? 0 : Math.round((todaysCompletedGoals.length / totalTodaysGoals) * 100);

//   // ✅ SIMPLE: For today's date, use the same counts as upper stats
//   const getGoalsForDate = (date) => {
//     const dateString = date.toISOString().split('T')[0];
//     const todayString = new Date().toISOString().split('T')[0];

//     // ✅ FOR TODAY'S DATE: Use the same counts as upper stats
//     if (dateString === todayString) {
//       return { 
//         total: totalTodaysGoals, 
//         completed: todaysCompletedGoals.length,
//         status: todaysCompletedGoals.length === totalTodaysGoals ? "Done" : "Pending"
//       };
//     }

//     // ✅ FOR OTHER DATES: Calculate actual completions for that date
//     let completedForDate = 0;
//     let totalForDate = 0;

//     allGoals.forEach(goal => {
//       // Count completions for this specific date
//       if (goal.completed && !goal.isRecurring) {
//         const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
//         if (completedDate === dateString) {
//           completedForDate++;
//           totalForDate++;
//         }
//       }
      
//       if (goal.isRecurring && goal.completedDates) {
//         const completionsOnDate = goal.completedDates.filter(completed => 
//           completed.date === dateString
//         ).length;
//         completedForDate += completionsOnDate;
//         if (completionsOnDate > 0) {
//           totalForDate += completionsOnDate;
//         }
//       }
//     });

//     let status = "";
//     if (totalForDate === 0) {
//       status = "No goals";
//     } else if (completedForDate === totalForDate) {
//       status = "Done";
//     } else {
//       if (dateString === todayString) {
//         status = "Pending";
//       } else if (dateString < todayString) {
//         status = "Missed";
//       } else {
//         status = "Upcoming";
//       }
//     }

//     return { 
//       total: totalForDate, 
//       completed: completedForDate,
//       status: status
//     };
//   };

//   const getWeekDates = () => {
//     const today = new Date();
//     const dayIndex = today.getDay();
//     const sunday = new Date(today);
//     sunday.setDate(today.getDate() - dayIndex);

//     const week = [];
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(sunday);
//       date.setDate(sunday.getDate() + i);
//       week.push(date);
//     }
//     return week;
//   };

//   const weekDates = getWeekDates();

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "Done":
//         return "done";
//       case "Pending":
//         return "pending";
//       case "Missed":
//         return "missed";
//       case "Upcoming":
//         return "upcoming";
//       case "No goals":
//         return "no-goals";
//       default:
//         return "";
//     }
//   };

//   return (
//     <div className="progress-page">
//       <div className="progress-header">
//         <h1>📊 Progress Analytics</h1>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-number">{totalTodaysGoals}</div>
//           <div className="stat-label">Today's Goals</div>
//           {/* <div className="stat-subtext">
//             ({todaysCompletedGoals.length} completed + {todaysPendingGoals.length} pending)
//           </div> */}
//         </div>
//         <div className="stat-card">
//           <div className="stat-number">{todaysCompletedGoals.length}</div>
//           <div className="stat-label">Completed Today</div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-number streak-number">{dayStreak}</div>
//           <div className="stat-label">Day Streak</div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-number">{todaysSuccessRate}%</div>
//           <div className="stat-label">Today's Success</div>
//         </div>
//       </div>

//       <div className="week-performance-card">
//         <h3>📅 This Week's Performance</h3>
//         <div className="week-days">
//           {weekDates.map((date) => {
//             const { total, completed, status } = getGoalsForDate(date);
//             const dayAbbr = date.toLocaleDateString("en-US", { weekday: "short" });
            
//             return (
//               <div key={date} className="day-card">
//                 <div className="date-info">
//                   <span className="day-name">{dayAbbr}</span>
//                   <span className="date-number">{date.getDate()}</span>
//                   <span className="month-name">{date.toLocaleDateString("en-US", { month: "short" })}</span>
//                 </div>
//                 <div className={`status-indicator ${getStatusClass(status)}`}>
//                   <span className="status-text">{status}</span>
//                   {total > 0 && (
//                     <span className="goals-count">
//                       {completed}/{total}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div style={{ textAlign: 'center', marginTop: '20px' }}>
//         <button 
//           onClick={fetchGoals}
//           className="refresh-btn"
//         >
//           🔄 Refresh Now
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Progress;














import React, { useEffect, useState } from "react";
import "./Progress.css";

function Progress() {
  const [todaysCompletedGoals, setTodaysCompletedGoals] = useState([]);
  const [todaysPendingGoals, setTodaysPendingGoals] = useState([]);
  const [dayStreak, setDayStreak] = useState(0);
  const [allGoals, setAllGoals] = useState([]);

  const token = localStorage.getItem("token");

  const fetchGoals = async () => {
    try {
      let allGoals = [];
      
      // Fetch from API (Manual Goals)
      try {
        const res = await fetch("http://localhost:5000/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          allGoals = [...data.goals];
          console.log("📥 Manual Goals from API:", allGoals.length);
        }
      } catch (apiError) {
        console.error("API fetch failed:", apiError);
      }

      // ✅ ADD CHATBOT GOALS from localStorage
      const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      console.log("🤖 Chatbot Goals from localStorage:", localGoals.length);
      
      // ✅ MERGE GOALS PROPERLY - avoid duplicates
      const mergedGoals = [...allGoals];
      localGoals.forEach(localGoal => {
        const exists = allGoals.some(apiGoal => apiGoal._id === localGoal._id);
        if (!exists) {
          mergedGoals.push(localGoal);
        }
      });
      
      console.log("📊 TOTAL MERGED GOALS:", mergedGoals.length);
      setAllGoals(mergedGoals);

      // ✅ Calculate TODAY'S goals only
      calculateTodaysGoals(mergedGoals);
      calculateStreak(mergedGoals);
      
    } catch (err) {
      console.error("❌ Progress Error:", err);
    }
  };

  const calculateTodaysGoals = (allGoals) => {
    const today = new Date().toISOString().split('T')[0];
    
    console.log("🔍 CALCULATING TODAY'S GOALS...");
    console.log("📅 Today's date:", today);
    console.log("🎯 Total goals to check:", allGoals.length);

    // ✅ Remove duplicate goals first
    const uniqueGoals = [];
    const seenIds = new Set();
    
    allGoals.forEach(goal => {
      if (!seenIds.has(goal._id)) {
        seenIds.add(goal._id);
        uniqueGoals.push(goal);
      } else {
        console.log(`🚫 DUPLICATE REMOVED: ${goal.title}`);
      }
    });

    console.log("🎯 UNIQUE GOALS AFTER DEDUPLICATION:", uniqueGoals.length);

    // ✅ ONLY TODAY'S COMPLETED GOALS
    const todaysCompleted = uniqueGoals.filter(goal => {
      // One-time goals completed TODAY
      if (goal.completed && !goal.isRecurring) {
        const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
        const isCompletedToday = completedDate === today;
        if (isCompletedToday) {
          console.log(`✅ COMPLETED TODAY: "${goal.title}" (one-time)`);
        }
        return isCompletedToday;
      }
      
      // Recurring goals completed TODAY
      if (goal.isRecurring && goal.completedDates) {
        const completedToday = goal.completedDates.some(completed => completed.date === today);
        if (completedToday) {
          console.log(`✅ COMPLETED TODAY: "${goal.title}" (recurring)`);
        }
        return completedToday;
      }
      
      return false;
    });

    // ✅ ONLY TODAY'S PENDING GOALS (active today)
    const todaysPending = uniqueGoals.filter(goal => {
      // Skip completed goals
      if (goal.completed) {
        return false;
      }
      
      // Skip if completed today (already counted in todaysCompleted)
      const isCompletedToday = isGoalCompletedToday(goal);
      if (isCompletedToday) {
        return false;
      }
      
      // ✅ CHATBOT GOALS: Always active today
      if (goal.source === 'chatbot') {
        console.log(`⏳ PENDING TODAY: "${goal.title}" (chatbot)`);
        return true;
      }
      
      // ✅ MANUAL GOALS: Check if active today (SIMPLE LOGIC)
      if (goal.isRecurring) {
        // Recurring manual goal: active if instance date matches today
        if (goal.currentInstanceDate === today) {
          console.log(`⏳ PENDING TODAY: "${goal.title}" (manual recurring - instance today)`);
          return true;
        }
        return false;
      } else {
        // One-time manual goal: active if deadline is today or in future, OR no deadline
        if (!goal.deadline) {
          console.log(`⏳ PENDING TODAY: "${goal.title}" (manual one-time - no deadline)`);
          return true;
        }
        
        const deadline = new Date(goal.deadline).toISOString().split('T')[0];
        const isActive = deadline >= today;
        if (isActive) {
          console.log(`⏳ PENDING TODAY: "${goal.title}" (manual one-time - deadline ${deadline})`);
        }
        return isActive;
      }
    });

    console.log("🎯 FINAL COUNTS:");
    console.log("✅ Today's Completed:", todaysCompleted.length);
    console.log("⏳ Today's Pending:", todaysPending.length);
    console.log("📊 Today's Total:", todaysCompleted.length + todaysPending.length);

    setTodaysCompletedGoals(todaysCompleted);
    setTodaysPendingGoals(todaysPending);
  };

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

  // 🆕 UPDATED: calculateStreak function with localStorage save
  const calculateStreak = (allGoals) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completionDates = new Set();
    
    allGoals.forEach(goal => {
      if (goal.completed && !goal.isRecurring) {
        const completedDate = goal.updatedAt || goal.createdAt;
        if (completedDate) {
          const date = new Date(completedDate);
          date.setHours(0, 0, 0, 0);
          completionDates.add(date.getTime());
        }
      }
      
      if (goal.isRecurring && goal.completedDates) {
        goal.completedDates.forEach(completed => {
          if (completed.date) {
            const date = new Date(completed.date);
            date.setHours(0, 0, 0, 0);
            completionDates.add(date.getTime());
          }
        });
      }
    });

    const uniqueDates = Array.from(completionDates).sort((a, b) => b - a);

    let streak = 0;
    let currentDate = today.getTime();
    
    const todayHasCompletion = uniqueDates.includes(currentDate);
    
    if (todayHasCompletion) {
      streak = 1;
      
      for (let day = 1; day <= 365; day++) {
        const previousDate = currentDate - (day * 24 * 60 * 60 * 1000);
        
        if (uniqueDates.includes(previousDate)) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }
    
    console.log("🔥 CALCULATED STREAK:", streak);
    setDayStreak(streak);
    
    // 🆕 CRITICAL: Save streak to localStorage for Goodies
    localStorage.setItem('dayStreak', streak.toString());
    console.log("💾 Streak saved to localStorage:", streak);
    
    // 🆕 Trigger custom event for Goodies component
    window.dispatchEvent(new CustomEvent('streakUpdated', {
      detail: { streak: streak }
    }));
    console.log("🎯 Streak event dispatched to Goodies");
  };

  useEffect(() => {
    fetchGoals();
    
    const handleGoalChange = () => {
      console.log("🔄 Goal changed, refreshing progress...");
      fetchGoals();
    };
    
    window.addEventListener('storage', handleGoalChange);
    window.addEventListener('goalUpdated', handleGoalChange);
    
    const interval = setInterval(fetchGoals, 30000);
    
    return () => {
      window.removeEventListener('storage', handleGoalChange);
      window.removeEventListener('goalUpdated', handleGoalChange);
      clearInterval(interval);
    };
  }, [token]);

  // ✅ TOTAL GOALS = Today's Completed + Today's Pending
  const totalTodaysGoals = todaysCompletedGoals.length + todaysPendingGoals.length;
  const todaysSuccessRate = totalTodaysGoals === 0 ? 0 : Math.round((todaysCompletedGoals.length / totalTodaysGoals) * 100);

  // ✅ SIMPLE: For today's date, use the same counts as upper stats
  const getGoalsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];

    // ✅ FOR TODAY'S DATE: Use the same counts as upper stats
    if (dateString === todayString) {
      return { 
        total: totalTodaysGoals, 
        completed: todaysCompletedGoals.length,
        status: todaysCompletedGoals.length === totalTodaysGoals ? "Done" : "Pending"
      };
    }

    // ✅ FOR OTHER DATES: Calculate actual completions for that date
    let completedForDate = 0;
    let totalForDate = 0;

    allGoals.forEach(goal => {
      // Count completions for this specific date
      if (goal.completed && !goal.isRecurring) {
        const completedDate = new Date(goal.updatedAt || goal.createdAt).toISOString().split('T')[0];
        if (completedDate === dateString) {
          completedForDate++;
          totalForDate++;
        }
      }
      
      if (goal.isRecurring && goal.completedDates) {
        const completionsOnDate = goal.completedDates.filter(completed => 
          completed.date === dateString
        ).length;
        completedForDate += completionsOnDate;
        if (completionsOnDate > 0) {
          totalForDate += completionsOnDate;
        }
      }
    });

    let status = "";
    if (totalForDate === 0) {
      status = "No goals";
    } else if (completedForDate === totalForDate) {
      status = "Done";
    } else {
      if (dateString === todayString) {
        status = "Pending";
      } else if (dateString < todayString) {
        status = "Missed";
      } else {
        status = "Upcoming";
      }
    }

    return { 
      total: totalForDate, 
      completed: completedForDate,
      status: status
    };
  };

  const getWeekDates = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayIndex);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();

  const getStatusClass = (status) => {
    switch (status) {
      case "Done":
        return "done";
      case "Pending":
        return "pending";
      case "Missed":
        return "missed";
      case "Upcoming":
        return "upcoming";
      case "No goals":
        return "no-goals";
      default:
        return "";
    }
  };

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>📊 Progress Analytics</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalTodaysGoals}</div>
          <div className="stat-label">Today's Goals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{todaysCompletedGoals.length}</div>
          <div className="stat-label">Completed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-number streak-number">{dayStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{todaysSuccessRate}%</div>
          <div className="stat-label">Today's Success</div>
        </div>
      </div>

      <div className="week-performance-card">
        <h3>📅 This Week's Performance</h3>
        <div className="week-days">
          {weekDates.map((date) => {
            const { total, completed, status } = getGoalsForDate(date);
            const dayAbbr = date.toLocaleDateString("en-US", { weekday: "short" });
            
            return (
              <div key={date} className="day-card">
                <div className="date-info">
                  <span className="day-name">{dayAbbr}</span>
                  <span className="date-number">{date.getDate()}</span>
                  <span className="month-name">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                </div>
                <div className={`status-indicator ${getStatusClass(status)}`}>
                  <span className="status-text">{status}</span>
                  {total > 0 && (
                    <span className="goals-count">
                      {completed}/{total}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={fetchGoals}
          className="refresh-btn"
        >
          🔄 Refresh Now
        </button>
      </div>
    </div>
  );
}

export default Progress;