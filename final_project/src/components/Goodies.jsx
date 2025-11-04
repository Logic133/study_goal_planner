// import React, { useState, useEffect } from "react";
// import "./Goodies.css";

// function Goodies() {
//   const [currentStreak, setCurrentStreak] = useState(0);
//   const [currentTheme, setCurrentTheme] = useState('light');

//   // ✅ Load streak from localStorage
//   useEffect(() => {
//     const loadStreak = () => {
//       const savedStreak = localStorage.getItem('dayStreak');
//       console.log("Loaded streak from localStorage:", savedStreak);
//       if (savedStreak) {
//         setCurrentStreak(parseInt(savedStreak));
//       } else {
//         setCurrentStreak(0);
//       }
//     };

//     loadStreak();
    
//     // ✅ Listen for changes
//     const handleStorageChange = () => {
//       loadStreak();
//     };
    
//     window.addEventListener('storage', handleStorageChange);
    
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   // ✅ Sync with theme from Settings
//   useEffect(() => {
//     const checkTheme = () => {
//       const theme = localStorage.getItem('theme') || 'light';
//       setCurrentTheme(theme);
//     };

//     checkTheme();
//     const interval = setInterval(checkTheme, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const rewards = [
//     {
//       id: 1,
//       name: "First Goal",
//       icon: "🎯",
//       description: "Complete your very first goal",
//       status: "unlocked"
//     },
//     {
//       id: 2,
//       name: "3-Day Streak", 
//       icon: "🔥",
//       description: "Maintain 3 days streak",
//       status: currentStreak >= 3 ? "unlocked" : "locked"
//     },
//     {
//       id: 3,
//       name: "7-Day Streak",
//       icon: "⚡",
//       description: "Maintain 7 days streak",
//       status: currentStreak >= 7 ? "unlocked" : "locked"
//     },
//     {
//       id: 4,
//       name: "14-Day Streak",
//       icon: "🌟",
//       description: "Maintain 14 days streak",
//       status: currentStreak >= 14 ? "unlocked" : "locked"
//     },
//     {
//       id: 5,
//       name: "30-Day Streak",
//       icon: "🏆",
//       description: "Maintain 30 days streak",
//       status: currentStreak >= 30 ? "unlocked" : "locked"
//     },
//     {
//       id: 6,
//       name: "Early Bird",
//       icon: "🌅",
//       description: "Complete goal before 8 AM",
//       status: "locked"
//     },
//     {
//       id: 7,
//       name: "Weekend Warrior",
//       icon: "💪",
//       description: "Complete goals on Saturday & Sunday",
//       status: "locked"
//     },
//     {
//       id: 8,
//       name: "Consistency King",
//       icon: "👑",
//       description: "Maintain streak for 1 month",
//       status: currentStreak >= 30 ? "unlocked" : "locked"
//     }
//   ];

//   const unlockedRewards = rewards.filter(reward => reward.status === "unlocked");

//   return (
//     <div className={`goodies-page ${currentTheme}-theme`}>
    
//       <h2>🏆 Streak Badges</h2>
//       <p className="page-subtitle">Maintain your streak to unlock amazing badges!</p>
      
//       <div className="stats">
//         <div className="stat">
//           <span className="stat-number">{unlockedRewards.length}</span>
//           <span className="stat-label">Badges Earned</span>
//         </div>
//         <div className="stat">
//           <span className="stat-number">{rewards.length}</span>
//           <span className="stat-label">Total Badges</span>
//         </div>
//         <div className="stat">
//           <span className="stat-number">{currentStreak}</span>
//           <span className="stat-label">Current Streak</span>
//         </div>
//       </div>

//       <div className="badges-grid">
//         {rewards.map((badge) => (
//           <div key={badge.id} className={`badge-card ${badge.status}`}>
//             <div className="badge-icon">{badge.icon}</div>
//             <h3>{badge.name}</h3>
//             <p>{badge.description}</p>
//             <div className="badge-status">
//               {badge.status === "unlocked" ? "✅ Earned" : "🔒 Locked"}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="motivation">
//         <p>🚀 <strong>Don't break the chain!</strong> Every day you maintain your streak brings you closer to the next badge!</p>
//       </div>
//       <div>
//         rewards
//       </div>
//       <div>
//         rewards
//       </div>
//     </div>
//   );
// }

// export default Goodies;














import React, { useState, useEffect } from "react";
import "./Goodies.css";

function Goodies() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [currentTheme, setCurrentTheme] = useState('light');

  // ✅ IMPROVED: Load streak from localStorage with multiple methods
  useEffect(() => {
    const loadStreak = () => {
      try {
        const savedStreak = localStorage.getItem('dayStreak');
        console.log("🔍 Goodies: Loading streak from localStorage:", savedStreak);
        
        if (savedStreak) {
          const streakValue = parseInt(savedStreak);
          if (!isNaN(streakValue)) {
            setCurrentStreak(streakValue);
            console.log("✅ Goodies: Streak set to:", streakValue);
          } else {
            setCurrentStreak(0);
            console.log("❌ Goodies: Invalid streak value, setting to 0");
          }
        } else {
          setCurrentStreak(0);
          console.log("❌ Goodies: No streak found in localStorage, setting to 0");
        }
      } catch (error) {
        console.error("❌ Goodies: Error loading streak:", error);
        setCurrentStreak(0);
      }
    };

    // Load immediately on component mount
    loadStreak();
    
    // ✅ Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'dayStreak') {
        console.log("🔄 Goodies: localStorage streak updated");
        setTimeout(loadStreak, 100); // Small delay to ensure value is updated
      }
    };
    
    // ✅ Listen for custom events from Progress
    const handleStreakUpdate = (e) => {
      console.log("🎯 Goodies: Received streak update event:", e.detail);
      if (e.detail && e.detail.streak !== undefined) {
        setCurrentStreak(e.detail.streak);
        localStorage.setItem('dayStreak', e.detail.streak.toString());
        console.log("✅ Goodies: Streak updated from event:", e.detail.streak);
      }
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('streakUpdated', handleStreakUpdate);
    
    // ✅ Poll every 3 seconds to catch any missed updates
    const interval = setInterval(loadStreak, 3000);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('streakUpdated', handleStreakUpdate);
      clearInterval(interval);
    };
  }, []);

  // ✅ Sync with theme from Settings
  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(theme);
    };

    checkTheme();
    const interval = setInterval(checkTheme, 1000);

    return () => clearInterval(interval);
  }, []);

  const rewards = [
    {
      id: 1,
      name: "First Goal",
      icon: "🎯",
      description: "Complete your very first goal",
      status: "unlocked"
    },
    {
      id: 2,
      name: "3-Day Streak", 
      icon: "🔥",
      description: "Maintain 3 days streak",
      status: currentStreak >= 3 ? "unlocked" : "locked"
    },
    {
      id: 3,
      name: "7-Day Streak",
      icon: "⚡",
      description: "Maintain 7 days streak",
      status: currentStreak >= 7 ? "unlocked" : "locked"
    },
    {
      id: 4,
      name: "14-Day Streak",
      icon: "🌟",
      description: "Maintain 14 days streak",
      status: currentStreak >= 14 ? "unlocked" : "locked"
    },
    {
      id: 5,
      name: "30-Day Streak",
      icon: "🏆",
      description: "Maintain 30 days streak",
      status: currentStreak >= 30 ? "unlocked" : "locked"
    },
    {
      id: 6,
      name: "Early Bird",
      icon: "🌅",
      description: "Complete goal before 8 AM",
      status: "locked"
    },
    {
      id: 7,
      name: "Weekend Warrior",
      icon: "💪",
      description: "Complete goals on Saturday & Sunday",
      status: "locked"
    },
    {
      id: 8,
      name: "Consistency King",
      icon: "👑",
      description: "Maintain streak for 1 month",
      status: currentStreak >= 30 ? "unlocked" : "locked"
    }
  ];

  const unlockedRewards = rewards.filter(reward => reward.status === "unlocked");

  // ✅ Debug: Force refresh button
  const refreshStreak = () => {
    const savedStreak = localStorage.getItem('dayStreak');
    console.log("🔄 Manual refresh - Current streak in localStorage:", savedStreak);
    if (savedStreak) {
      setCurrentStreak(parseInt(savedStreak));
    }
  };

  return (
    <div className={`goodies-page ${currentTheme}-theme`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🏆 Streak Badges</h2>
        <button 
          onClick={refreshStreak}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh Streak
        </button>
      </div>
      
      <p className="page-subtitle">Maintain your streak to unlock amazing badges! Current streak: <strong>{currentStreak} days</strong></p>
      
      <div className="stats">
        <div className="stat">
          <span className="stat-number">{unlockedRewards.length}</span>
          <span className="stat-label">Badges Earned</span>
        </div>
        <div className="stat">
          <span className="stat-number">{rewards.length}</span>
          <span className="stat-label">Total Badges</span>
        </div>
        <div className="stat">
          <span className="stat-number">{currentStreak}</span>
          <span className="stat-label">Current Streak</span>
        </div>
      </div>

      <div className="badges-grid">
        {rewards.map((badge) => (
          <div key={badge.id} className={`badge-card ${badge.status}`}>
            <div className="badge-icon">{badge.icon}</div>
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
            <div className="badge-status">
              {badge.status === "unlocked" ? "✅ Earned" : "🔒 Locked"}
              {badge.status === "locked" && badge.name.includes("Streak") && (
                <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                  ({currentStreak}/{badge.name.split(' ')[0].replace('-Day', '')})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="motivation">
        <p>🚀 <strong>Don't break the chain!</strong> Every day you maintain your streak brings you closer to the next badge!</p>
      </div>

      {/* Debug Info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong> Current Streak: {currentStreak} | localStorage: {localStorage.getItem('dayStreak')}
      </div>
    </div>
  );
}

export default Goodies;