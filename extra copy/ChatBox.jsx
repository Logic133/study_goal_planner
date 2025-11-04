
// // recenlty changed
// import React, { useState, useRef, useEffect } from "react";
// import "./ChatBox.css";
// import { IoCloseSharp } from "react-icons/io5";
// import { FaCheck, FaEdit } from "react-icons/fa";

// function ChatBox({ onBack }) {
//     const [conversation, setConversation] = useState([]);
//     const [input, setInput] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [errorMsg, setErrorMsg] = useState(null);
//     const [scheduleCards, setScheduleCards] = useState([]);
//     const [showSatisfiedPage, setShowSatisfiedPage] = useState(false);
//     const [savingGoals, setSavingGoals] = useState(false);
//     const [showEditForm, setShowEditForm] = useState(false);
//     const [editingCard, setEditingCard] = useState(null);
//     const [editedGoal, setEditedGoal] = useState({
//         title: "",
//         description: "",
//         frequency: "",
//         reminderTime: "",
//         duration: ""
//     });

//     const scrollRef = useRef(null);

//     useEffect(() => {
//         if (scrollRef.current) {
//             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//         }
//     }, [conversation, scheduleCards, showEditForm]);

//     const getCurrentTime = () => {
//         return new Date().toLocaleTimeString('en-US', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         });
//     };

//     // Initialize with greeting only
//     useEffect(() => {
//         if (conversation.length === 0) {
//             const greeting = {
//                 type: 'bot',
//                 message: "Hello! 👋 I'm your Goal Planning Assistant. How are you doing today?",
//                 timestamp: getCurrentTime()
//             };
//             setConversation([greeting]);
//         }
//     }, [conversation.length]);

//     // Call Gemini API to analyze goals - UPDATED
//     // Call Gemini API to analyze goals - DEBUG VERSION
//     const analyzeGoalsWithGemini = async (userInput) => {
//         setIsLoading(true);
//         try {
//             console.log("🔍 DEBUG - Current conversation:", conversation);
//             console.log("🔍 DEBUG - Schedule cards:", scheduleCards.length);

//             const requestBody = {
//                 userInput: userInput,
//                 conversationHistory: conversation.slice(-6),
//                 hasExistingGoals: scheduleCards.length > 0
//             };

//             console.log("📤 Sending to Gemini API:", requestBody);

//             const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(requestBody)
//             });

//             console.log("📥 Response status:", response.status);

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log("✅ Gemini API response received:", data);

//             return data;
//         } catch (error) {
//             console.error("❌ Gemini API error:", error);
//             throw new Error("Failed to connect to AI service. Please check your connection and try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };


//     // Process Gemini response and handle conversation flow
//     // Process Gemini response and handle conversation flow
// const processGeminiResponse = (geminiData) => {
//     try {
//         console.log("🔄 Processing Gemini response:", geminiData);
        
//         const responseData = geminiData.data;
//         console.log("📋 Response data:", responseData);
        
//         // Case 1: Gemini returns structured goals
//         if (responseData.goals && Array.isArray(responseData.goals)) {
//             console.log("🎯 Creating goal cards from response");
//             const goalCards = [];
            
//             responseData.goals.forEach((goal, index) => {
//                 const startDate = new Date();
//                 const endDate = new Date();
                
//                 // Calculate end date based on duration
//                 if (goal.duration) {
//                     const durationMatch = goal.duration.match(/(\d+)\s*(day|week|month|days|weeks|months)/i);
//                     if (durationMatch) {
//                         const num = parseInt(durationMatch[1]);
//                         const unit = durationMatch[2].toLowerCase();
//                         if (unit === 'day' || unit === 'days') endDate.setDate(startDate.getDate() + num);
//                         else if (unit === 'week' || unit === 'weeks') endDate.setDate(startDate.getDate() + (num * 7));
//                         else if (unit === 'month' || unit === 'months') endDate.setMonth(startDate.getMonth() + num);
//                     } else {
//                         endDate.setDate(startDate.getDate() + 30);
//                     }
//                 } else {
//                     endDate.setDate(startDate.getDate() + 30);
//                 }
                
//                 // Format tasks
//                 let tasksText = "";
//                 if (Array.isArray(goal.tasks)) {
//                     tasksText = goal.tasks.join(', ');
//                 } else if (typeof goal.tasks === 'string') {
//                     tasksText = goal.tasks;
//                 } else {
//                     tasksText = "Practice and make progress daily";
//                 }
                
//                 const card = {
//                     id: Date.now() + index,
//                     goalTitle: goal.title || `Goal ${index + 1}`,
//                     startDate: startDate.toISOString().split('T')[0],
//                     endDate: endDate.toISOString().split('T')[0],
//                     description: goal.description || `Work on ${goal.title}`,
//                     reminderTime: goal.reminderTime || "6:00 PM",
//                     displayReminderTime: goal.reminderTime || "6:00 PM",
//                     frequency: goal.frequency || "Daily",
//                     tasks: tasksText,
//                     duration: goal.duration || "30 days"
//                 };
                
//                 console.log(`📋 Created card:`, card);
//                 goalCards.push(card);
//             });

//             setScheduleCards(goalCards);
            
//             // Add success message from Gemini or default
//             const successMessage = {
//                 type: 'bot',
//                 message: responseData.successMessage || "🎉 I've created a personalized goal plan for you! Review it below.",
//                 timestamp: getCurrentTime()
//             };
            
//             const cardMessage = {
//                 type: 'card',
//                 message: "Here's your personalized goal plan:",
//                 cards: goalCards,
//                 timestamp: getCurrentTime()
//             };
            
//             setConversation(prev => [...prev, successMessage, cardMessage]);
            
//             // Ask follow-up question from Gemini or default
//             setTimeout(() => {
//                 const followUpQuestion = {
//                     type: 'bot',
//                     message: responseData.followUpQuestion || "If you want to make any changes, just tell me what you'd like to modify.",
//                     timestamp: getCurrentTime()
//                 };
//                 setConversation(prev => [...prev, followUpQuestion]);
//             }, 1000);
            
//         } 
//         // Case 2: Gemini returns a regular message (continuing conversation)
//         else if (responseData.message) {
//             console.log("💬 Adding conversation message:", responseData.message);
//             const botMessage = {
//                 type: 'bot',
//                 message: responseData.message,
//                 timestamp: getCurrentTime()
//             };
            
//             setConversation(prev => [...prev, botMessage]);
//         }
//         // Case 3: Response is just a string message
//         else if (typeof responseData === 'string') {
//             console.log("💬 Adding string message:", responseData);
//             const botMessage = {
//                 type: 'bot',
//                 message: responseData,
//                 timestamp: getCurrentTime()
//             };
            
//             setConversation(prev => [...prev, botMessage]);
//         }
//         // Case 4: Invalid response structure
//         else {
//             console.log("❌ Invalid response structure, using fallback");
//             throw new Error("No valid response format from Gemini");
//         }
        
//     } catch (error) {
//         console.error("❌ Error processing response:", error);
        
//         const errorMessage = {
//             type: 'bot',
//             message: "I had trouble processing that. Could you please rephrase or provide more details about your goal?",
//             timestamp: getCurrentTime()
//         };
//         setConversation(prev => [...prev, errorMessage]);
//     }
// };


// const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const currentTime = getCurrentTime();

//     const userMessage = {
//         type: 'user',
//         message: input,
//         timestamp: currentTime
//     };

//     setConversation(prev => [...prev, userMessage]);
//     const userInput = input;
//     setInput("");
//     setErrorMsg(null);
//     setIsLoading(true);

//     try {
//         // Always send to Gemini and let it handle the conversation flow
//         console.log("🤖 Sending to Gemini:", userInput);
//         const geminiResponse = await analyzeGoalsWithGemini(userInput);

//         // ✅ ADD THIS DEBUG LINE TO SEE THE ACTUAL RESPONSE
//         console.log("🔍 RAW GEMINI RESPONSE:", JSON.stringify(geminiResponse, null, 2));

//         if (geminiResponse && geminiResponse.success) {
//             processGeminiResponse(geminiResponse);
//         } else {
//             throw new Error(geminiResponse?.error || "Failed to analyze goals");
//         }

//     } catch (error) {
//         console.error("❌ Error in handleSubmit:", error);
//         setErrorMsg(error.message);

//         const errorMessage = {
//             type: 'bot',
//             message: "Sorry, I encountered an error. Please try again.",
//             timestamp: getCurrentTime()
//         };
//         setConversation(prev => [...prev, errorMessage]);
//     } finally {
//         setIsLoading(false);
//     }
// };


//     // Save goals to localStorage
//     const saveGoalsToLocalStorage = (goals) => {
//         try {
//             const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');

//             goals.forEach(goal => {
//                 let reminderTimeStr = goal.reminderTime || "6:00 PM";

//                 // Normalize time format
//                 reminderTimeStr = reminderTimeStr.trim().toUpperCase()
//                     .replace(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i, (match, hour, minute, period) => {
//                         period = period ? period.toUpperCase() : hour < 12 ? 'AM' : 'PM';
//                         return `${parseInt(hour)}:${minute} ${period}`;
//                     });

//                 const [timePart, period] = reminderTimeStr.split(' ');
//                 const [hours, minutes] = timePart.split(':');

//                 let hour24 = parseInt(hours);
//                 if (period === 'PM' && hour24 < 12) hour24 += 12;
//                 if (period === 'AM' && hour24 === 12) hour24 = 0;

//                 const reminderDate = new Date();
//                 reminderDate.setHours(hour24, parseInt(minutes), 0, 0);

//                 const goalForStorage = {
//                     _id: 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
//                     title: goal.goalTitle,
//                     description: goal.description,
//                     duration: goal.duration || "30 days",
//                     date: new Date().toISOString().split('T')[0],
//                     deadline: goal.endDate,
//                     reminderTime: reminderDate.toISOString(),
//                     displayReminderTime: reminderTimeStr,
//                     isRecurring: true,
//                     frequency: goal.frequency || "Daily",
//                     tasks: goal.tasks,
//                     status: "pending",
//                     source: "chatbot",
//                     notified: false,
//                     notifiedToday: false,
//                     completed: false,
//                     completedDates: [],
//                     currentInstanceDate: new Date().toISOString().split('T')[0],
//                     createdAt: new Date().toISOString(),
//                     updatedAt: new Date().toISOString()
//                 };

//                 existingGoals.push(goalForStorage);
//             });

//             localStorage.setItem('goals', JSON.stringify(existingGoals));
//             console.log("✅ Chatbot goals saved to localStorage");

//             // Trigger storage event for App.js
//             window.dispatchEvent(new CustomEvent('chatbotGoalsSaved', {
//                 detail: { goals: goals }
//             }));

//             return { success: true };
//         } catch (error) {
//             console.error("❌ Error saving to localStorage:", error);
//             return { success: false, error: error.message };
//         }
//     };
//     // Handle save schedule
//     const handleSaveSchedule = async () => {
//         setSavingGoals(true);

//         try {
//             const goalsToSave = scheduleCards.map(card => ({
//                 goalTitle: card.goalTitle,
//                 tasks: card.tasks,
//                 startDate: card.startDate,
//                 endDate: card.endDate,
//                 reminderTime: card.reminderTime,
//                 frequency: card.frequency,
//                 description: card.description,
//                 duration: card.duration
//             }));

//             const localResult = saveGoalsToLocalStorage(goalsToSave);

//             if (!localResult.success) {
//                 throw new Error("Failed to save goals");
//             }

//             setShowSatisfiedPage(true);

//         } catch (error) {
//             console.error("❌ Error saving goals:", error);
//             setErrorMsg("Failed to save goals. Please try again.");
//         } finally {
//             setSavingGoals(false);
//         }
//     };

//     // Handle edit form
//     const handleEditClick = (card) => {
//         setEditingCard(card);
//         setEditedGoal({
//             title: card.goalTitle,
//             description: card.description,
//             frequency: card.frequency,
//             reminderTime: card.displayReminderTime,
//             duration: card.duration
//         });
//         setShowEditForm(true);
//     };

//     const handleEditSubmit = (e) => {
//         e.preventDefault();

//         const updatedCards = scheduleCards.map(card =>
//             card.id === editingCard.id
//                 ? {
//                     ...card,
//                     goalTitle: editedGoal.title,
//                     description: editedGoal.description,
//                     frequency: editedGoal.frequency,
//                     reminderTime: editedGoal.reminderTime,
//                     displayReminderTime: editedGoal.reminderTime,
//                     duration: editedGoal.duration
//                 }
//                 : card
//         );

//         setScheduleCards(updatedCards);
//         setShowEditForm(false);
//         setEditingCard(null);

//         setConversation(prev => prev.map(msg =>
//             msg.type === 'card'
//                 ? { ...msg, cards: updatedCards }
//                 : msg
//         ));

//         // Show confirmation message
//         const updateMessage = {
//             type: 'bot',
//             message: "✅ Goal updated successfully! You can make more changes in chat or click 'Save Goals' when ready.",
//             timestamp: getCurrentTime()
//         };
//         setConversation(prev => [...prev, updateMessage]);
//     };

//     const handleRestart = () => {
//         setConversation([]);
//         setInput("");
//         setScheduleCards([]);
//         setErrorMsg(null);
//         setShowSatisfiedPage(false);
//         setShowEditForm(false);
//         setEditingCard(null);
//         setSavingGoals(false);
//     };

//     const formatDisplayTime = (timeStr) => {
//         if (!timeStr) return "6:00 PM";

//         try {
//             const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i;
//             const match = timeStr.toString().trim().match(timeRegex);

//             if (match) {
//                 let hours = parseInt(match[1]);
//                 const minutes = parseInt(match[2]);
//                 let period = match[3] ? match[3].toUpperCase() : 'AM';

//                 if (hours > 12 && !match[3]) {
//                     period = hours >= 12 ? 'PM' : 'AM';
//                     hours = hours > 12 ? hours - 12 : hours;
//                 }

//                 return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
//             }

//             return timeStr;
//         } catch (error) {
//             return timeStr;
//         }
//     };

//     // Edit Form Component
//     const EditGoalForm = () => (
//         <div className="edit-form-overlay">
//             <div className="edit-form">
//                 <h3>Edit Goal</h3>
//                 <form onSubmit={handleEditSubmit}>
//                     <div className="form-group">
//                         <label>Goal Title:</label>
//                         <input
//                             type="text"
//                             value={editedGoal.title}
//                             onChange={(e) => setEditedGoal(prev => ({ ...prev, title: e.target.value }))}
//                             required
//                         />
//                     </div>

//                     <div className="form-group">
//                         <label>Description:</label>
//                         <textarea
//                             value={editedGoal.description}
//                             onChange={(e) => setEditedGoal(prev => ({ ...prev, description: e.target.value }))}
//                             required
//                         />
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Frequency:</label>
//                             <select
//                                 value={editedGoal.frequency}
//                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, frequency: e.target.value }))}
//                             >
//                                 <option value="Daily">Daily</option>
//                                 <option value="Weekly">Weekly</option>
//                                 <option value="Monthly">Monthly</option>
//                             </select>
//                         </div>

//                         <div className="form-group">
//                             <label>Reminder Time:</label>
//                             <input
//                                 type="text"
//                                 value={editedGoal.reminderTime}
//                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, reminderTime: e.target.value }))}
//                                 placeholder="e.g., 6:00 PM"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label>Duration:</label>
//                         <input
//                             type="text"
//                             value={editedGoal.duration}
//                             onChange={(e) => setEditedGoal(prev => ({ ...prev, duration: e.target.value }))}
//                             placeholder="e.g., 30 days"
//                             required
//                         />
//                     </div>

//                     <div className="form-actions">
//                         <button type="button" onClick={() => setShowEditForm(false)} className="btn-cancel">
//                             Cancel
//                         </button>
//                         <button type="submit" className="btn-save">
//                             Save Changes
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );

//     // Satisfied Page
//     if (showSatisfiedPage) {
//         return (
//             <div className="satisfied-page">
//                 <div className="satisfied-content">
//                     <h1>Hello! 🎉</h1>
//                     <p>Your goal plan has been successfully created and saved!</p>

//                     <div className="saved-goals-preview">
//                         <h3>📋 Your Saved Goals:</h3>
//                         {scheduleCards.map((card, index) => (
//                             <div key={card.id} className="saved-goal-item">
//                                 <h4>{card.goalTitle}</h4>
//                                 <p>⏰ {formatDisplayTime(card.displayReminderTime)} | 🔄 {card.frequency}</p>
//                                 <p className="goal-desc">"{card.description}"</p>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="satisfied-actions">
//                         <button
//                             onClick={() => {
//                                 window.dispatchEvent(new Event('storage'));
//                                 window.location.href = '/goals';
//                             }}
//                             className="btn-view-goals"
//                         >
//                             📊 View My Goals
//                         </button>
//                         <button onClick={handleRestart} className="btn-new-plan">
//                             🆕 Create New Plan
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="chatbox-fullscreen">
//             <div className="chatbox-container">
//                 <div className="chatbox-header">
//                     <div className="header-info">
//                         <div className="bot-avatar">🤖</div>
//                         <div className="header-text">
//                             <h3>Goal Planning Assistant</h3>
//                             <span>Online • Powered by Gemini AI</span>
//                         </div>
//                     </div>
//                     <button className="close-btn" onClick={onBack}>
//                         <IoCloseSharp />
//                     </button>
//                 </div>

//                 <div className="chat-messages" ref={scrollRef}>
//                     {conversation.map((item, idx) => (
//                         <div key={idx} className={`message ${item.type === 'user' ? 'user-message' : 'bot-message'}`}>
//                             {item.type === 'bot' && <div className="message-avatar">🤖</div>}
//                             <div className="message-content">
//                                 {item.type === 'user' || item.type === 'bot' ? (
//                                     <>
//                                         <p>{item.message}</p>
//                                         <span className="message-time">{item.timestamp}</span>
//                                     </>
//                                 ) : item.type === 'card' ? (
//                                     <div className="card-message">
//                                         <p>{item.message}</p>
//                                         {item.cards?.map((card) => (
//                                             <div key={card.id} className="schedule-card">
//                                                 <div className="card-header">
//                                                     <h4>{card.goalTitle}</h4>
//                                                     <button
//                                                         className="edit-btn"
//                                                         onClick={() => handleEditClick(card)}
//                                                     >
//                                                         <FaEdit /> Edit
//                                                     </button>
//                                                 </div>
//                                                 <div className="card-preview">
//                                                     <div className="card-date">
//                                                         <span>📅 {card.startDate} to {card.endDate}</span>
//                                                     </div>
//                                                     <div className="card-description">
//                                                         <p>"{card.description}"</p>
//                                                     </div>
//                                                     <div className="card-details">
//                                                         <div className="detail-item">
//                                                             <span>📝 Tasks: {card.tasks}</span>
//                                                         </div>
//                                                         <div className="detail-item">
//                                                             <span>⏰ Reminder: {formatDisplayTime(card.displayReminderTime)}</span>
//                                                         </div>
//                                                         <div className="detail-item">
//                                                             <span>🔄 Frequency: {card.frequency}</span>
//                                                         </div>
//                                                         <div className="detail-item">
//                                                             <span>⏳ Duration: {card.duration}</span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="card-actions">
//                                                     <button
//                                                         onClick={handleSaveSchedule}
//                                                         className="btn-satisfied"
//                                                         disabled={savingGoals}
//                                                     >
//                                                         {savingGoals ? "⏳ Saving..." : <><FaCheck /> Save Goals</>}
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                         <span className="message-time">{item.timestamp}</span>
//                                     </div>
//                                 ) : null}
//                             </div>
//                             {item.type === 'user' && <div className="message-avatar">👤</div>}
//                         </div>
//                     ))}

//                     {isLoading && (
//                         <div className="message bot-message">
//                             <div className="message-avatar">🤖</div>
//                             <div className="message-content">
//                                 <div className="typing-indicator">
//                                     <span></span>
//                                     <span></span>
//                                     <span></span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {!isLoading && (
//                     <form className="chat-input-area" onSubmit={handleSubmit}>
//                         <div className="input-container">
//                             <input
//                                 type="text"
//                                 value={input}
//                                 onChange={(e) => setInput(e.target.value)}
//                                 placeholder="Type your message..."
//                                 autoFocus
//                                 disabled={savingGoals}
//                             />
//                             <button type="submit" disabled={savingGoals}>
//                                 Send
//                             </button>
//                         </div>
//                     </form>
//                 )}

//                 {errorMsg && <div className="error-message">{errorMsg}</div>}
//             </div>

//             {showEditForm && <EditGoalForm />}
//         </div>
//     );
// }

// export default ChatBox;












// ChatBox.jsx - FIXED VERSION
import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";
import { IoCloseSharp } from "react-icons/io5";
import { FaCheck, FaEdit } from "react-icons/fa";

function ChatBox({ onBack }) {
    const [conversation, setConversation] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [scheduleCards, setScheduleCards] = useState([]);
    const [showSatisfiedPage, setShowSatisfiedPage] = useState(false);
    const [savingGoals, setSavingGoals] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [editedGoal, setEditedGoal] = useState({
        title: "",
        description: "",
        frequency: "",
        reminderTime: "",
        duration: ""
    });

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversation, scheduleCards, showEditForm]);

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Initialize with greeting only
    useEffect(() => {
        if (conversation.length === 0) {
            const greeting = {
                type: 'bot',
                message: "Hello! 👋 I'm your Goal Planning Assistant. How are you doing today?",
                timestamp: getCurrentTime()
            };
            setConversation([greeting]);
        }
    }, [conversation.length]);

    // Call Gemini API to analyze goals
    const analyzeGoalsWithGemini = async (userInput) => {
        setIsLoading(true);
        try {
            console.log("🔍 DEBUG - Current conversation:", conversation);
            console.log("🔍 DEBUG - Schedule cards:", scheduleCards.length);

            const requestBody = {
                userInput: userInput,
                conversationHistory: conversation.slice(-6),
                hasExistingGoals: scheduleCards.length > 0
            };

            console.log("📤 Sending to Gemini API:", requestBody);

            const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log("📥 Response status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Gemini API response received:", data);

            return data;
        } catch (error) {
            console.error("❌ Gemini API error:", error);
            throw new Error("Failed to connect to AI service. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Process Gemini response and handle conversation flow - FIXED VERSION
    // ChatBox.jsx - REPLACE ONLY THIS FUNCTION
const processGeminiResponse = (geminiData) => {
    try {
        console.log("🔄 Processing Gemini response:", geminiData);
        
        const responseData = geminiData.data;
        console.log("📋 Response data:", responseData);
        
        // Case 1: Gemini returns goals (NEW or UPDATED)
        if (responseData.goals && Array.isArray(responseData.goals)) {
            console.log("🎯 Processing goals from response");
            
            const goalCards = responseData.goals.map((goal, index) => {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + 30); // Default 30 days
                
                // Format tasks
                let tasksText = "";
                if (Array.isArray(goal.tasks)) {
                    tasksText = goal.tasks.join(', ');
                } else {
                    tasksText = "Practice and make progress daily";
                }
                
                return {
                    id: Date.now() + index,
                    goalTitle: goal.title || `Goal ${index + 1}`,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    description: goal.description || `Work on ${goal.title}`,
                    // reminderTime: goal.reminderTime || "5:00 PM",
                    // displayReminderTime: goal.reminderTime || "5:00 PM",
                    frequency: goal.frequency || "Daily" || "Weekly" || "Monthly",
                    tasks: tasksText,
                    duration: goal.duration || "30 days" || "15 days" || "7 days"
                };
            });

            setScheduleCards(goalCards);
            
            // 🎯 CRITICAL FIX: Always show success message first
            const successMessage = {
                type: 'bot',
                message: responseData.successMessage || "✅ Your goals have been updated!",
                timestamp: getCurrentTime()
            };
            
            // 🎯 CRITICAL FIX: Then show card
            const cardMessage = {
                type: 'card',
                message: "Here's your goal plan:",
                cards: goalCards,
                timestamp: getCurrentTime()
            };
            
            setConversation(prev => [...prev, successMessage, cardMessage]);
            
            // 🎯 CRITICAL FIX: Add follow-up question if provided
            if (responseData.followUpQuestion) {
                setTimeout(() => {
                    const followUpQuestion = {
                        type: 'bot',
                        message: responseData.followUpQuestion,
                        timestamp: getCurrentTime()
                    };
                    setConversation(prev => [...prev, followUpQuestion]);
                }, 500);
            }
        } 
        // Case 2: Regular message
        else if (responseData.message) {
            console.log("💬 Adding message to conversation:", responseData.message);
            const botMessage = {
                type: 'bot',
                message: responseData.message,
                timestamp: getCurrentTime()
            };
            setConversation(prev => [...prev, botMessage]);
        }
        
    } catch (error) {
        console.error("❌ Error processing response:", error);
        const errorMessage = {
            type: 'bot',
            message: "I had trouble processing that. Could you please rephrase?",
            timestamp: getCurrentTime()
        };
        setConversation(prev => [...prev, errorMessage]);
    }
};
    // ChatBox.jsx - FIXED handleSubmit function
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentTime = getCurrentTime();

    const userMessage = {
        type: 'user',
        message: input,
        timestamp: currentTime
    };

    setConversation(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setErrorMsg(null);
    setIsLoading(true);

    try {
        console.log("🤖 Sending to Gemini:", userInput);
        
        // Create proper conversation history
        const conversationHistory = conversation
            .filter(msg => msg.type === 'user' || msg.type === 'bot')
            .slice(-10) // Last 10 messages
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.message
            }));

        const requestBody = {
            userInput: userInput,
            conversationHistory: conversationHistory,
            hasExistingGoals: scheduleCards.length > 0
        };

        console.log("📤 Sending to backend:", requestBody);

        const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const geminiResponse = await response.json();
        console.log("🔍 RAW GEMINI RESPONSE:", geminiResponse);

        if (geminiResponse && geminiResponse.success) {
            processGeminiResponse(geminiResponse);
        } else {
            throw new Error(geminiResponse?.error || "Failed to analyze goals");
        }

    } catch (error) {
        console.error("❌ Error in handleSubmit:", error);
        setErrorMsg(error.message);

        const errorMessage = {
            type: 'bot',
            message: "Sorry, I encountered an error. Please try again.",
            timestamp: getCurrentTime()
        };
        setConversation(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
};

    // Save goals to localStorage
    const saveGoalsToLocalStorage = (goals) => {
        try {
            const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');

            goals.forEach(goal => {
                let reminderTimeStr = goal.reminderTime || "6:00 PM";

                // Normalize time format
                reminderTimeStr = reminderTimeStr.trim().toUpperCase()
                    .replace(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i, (match, hour, minute, period) => {
                        period = period ? period.toUpperCase() : hour < 12 ? 'AM' : 'PM';
                        return `${parseInt(hour)}:${minute} ${period}`;
                    });

                const [timePart, period] = reminderTimeStr.split(' ');
                const [hours, minutes] = timePart.split(':');

                let hour24 = parseInt(hours);
                if (period === 'PM' && hour24 < 12) hour24 += 12;
                if (period === 'AM' && hour24 === 12) hour24 = 0;

                const reminderDate = new Date();
                reminderDate.setHours(hour24, parseInt(minutes), 0, 0);

                const goalForStorage = {
                    _id: 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                    title: goal.goalTitle,
                    description: goal.description,
                    duration: goal.duration || "30 days",
                    date: new Date().toISOString().split('T')[0],
                    deadline: goal.endDate,
                    reminderTime: reminderDate.toISOString(),
                    displayReminderTime: reminderTimeStr,
                    isRecurring: true,
                    frequency: goal.frequency || "Daily",
                    tasks: goal.tasks,
                    status: "pending",
                    source: "chatbot",
                    notified: false,
                    notifiedToday: false,
                    completed: false,
                    completedDates: [],
                    currentInstanceDate: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                existingGoals.push(goalForStorage);
            });

            localStorage.setItem('goals', JSON.stringify(existingGoals));
            console.log("✅ Chatbot goals saved to localStorage");

            // Trigger storage event for App.js
            window.dispatchEvent(new CustomEvent('chatbotGoalsSaved', {
                detail: { goals: goals }
            }));

            return { success: true };
        } catch (error) {
            console.error("❌ Error saving to localStorage:", error);
            return { success: false, error: error.message };
        }
    };

    // Handle save schedule
    const handleSaveSchedule = async () => {
        setSavingGoals(true);

        try {
            const goalsToSave = scheduleCards.map(card => ({
                goalTitle: card.goalTitle,
                tasks: card.tasks,
                startDate: card.startDate,
                endDate: card.endDate,
                reminderTime: card.reminderTime,
                frequency: card.frequency,
                description: card.description,
                duration: card.duration
            }));

            const localResult = saveGoalsToLocalStorage(goalsToSave);

            if (!localResult.success) {
                throw new Error("Failed to save goals");
            }

            // Show success message in chat before redirecting
            const successMessage = {
                type: 'bot',
                message: "✅ Your goals have been saved successfully! You can now view them in your goals dashboard.",
                timestamp: getCurrentTime()
            };
            setConversation(prev => [...prev, successMessage]);

            // Show satisfied page after a short delay
            setTimeout(() => {
                setShowSatisfiedPage(true);
            }, 1500);

        } catch (error) {
            console.error("❌ Error saving goals:", error);
            setErrorMsg("Failed to save goals. Please try again.");
            
            const errorMessage = {
                type: 'bot',
                message: "❌ Failed to save goals. Please try again.",
                timestamp: getCurrentTime()
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setSavingGoals(false);
        }
    };

    // Handle edit form
    const handleEditClick = (card) => {
        setEditingCard(card);
        setEditedGoal({
            title: card.goalTitle,
            description: card.description,
            frequency: card.frequency,
            reminderTime: card.displayReminderTime,
            duration: card.duration
        });
        setShowEditForm(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        const updatedCards = scheduleCards.map(card =>
            card.id === editingCard.id
                ? {
                    ...card,
                    goalTitle: editedGoal.title,
                    description: editedGoal.description,
                    frequency: editedGoal.frequency,
                    reminderTime: editedGoal.reminderTime,
                    displayReminderTime: editedGoal.reminderTime,
                    duration: editedGoal.duration
                }
                : card
        );

        setScheduleCards(updatedCards);
        setShowEditForm(false);
        setEditingCard(null);

        // Update the card in conversation
        setConversation(prev => prev.map(msg =>
            msg.type === 'card'
                ? { ...msg, cards: updatedCards }
                : msg
        ));

        // Show confirmation message
        const updateMessage = {
            type: 'bot',
            message: "✅ Goal updated successfully! You can make more changes in chat or click 'Save Goals' when ready.",
            timestamp: getCurrentTime()
        };
        setConversation(prev => [...prev, updateMessage]);
    };

    const handleRestart = () => {
        setConversation([]);
        setInput("");
        setScheduleCards([]);
        setErrorMsg(null);
        setShowSatisfiedPage(false);
        setShowEditForm(false);
        setEditingCard(null);
        setSavingGoals(false);
    };

    const formatDisplayTime = (timeStr) => {
        if (!timeStr) return "6:00 PM";

        try {
            const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i;
            const match = timeStr.toString().trim().match(timeRegex);

            if (match) {
                let hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                let period = match[3] ? match[3].toUpperCase() : 'AM';

                if (hours > 12 && !match[3]) {
                    period = hours >= 12 ? 'PM' : 'AM';
                    hours = hours > 12 ? hours - 12 : hours;
                }

                return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
            }

            return timeStr;
        } catch (error) {
            return timeStr;
        }
    };

    // Edit Form Component
    const EditGoalForm = () => (
        <div className="edit-form-overlay">
            <div className="edit-form">
                <h3>Edit Goal</h3>
                <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                        <label>Goal Title:</label>
                        <input
                            type="text"
                            value={editedGoal.title}
                            onChange={(e) => setEditedGoal(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={editedGoal.description}
                            onChange={(e) => setEditedGoal(prev => ({ ...prev, description: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Frequency:</label>
                            <select
                                value={editedGoal.frequency}
                                onChange={(e) => setEditedGoal(prev => ({ ...prev, frequency: e.target.value }))}
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Reminder Time:</label>
                            <input
                                type="text"
                                value={editedGoal.reminderTime}
                                onChange={(e) => setEditedGoal(prev => ({ ...prev, reminderTime: e.target.value }))}
                                placeholder="e.g., 6:00 PM"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duration:</label>
                        <input
                            type="text"
                            value={editedGoal.duration}
                            onChange={(e) => setEditedGoal(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="e.g., 30 days"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => setShowEditForm(false)} className="btn-cancel">
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Satisfied Page
    if (showSatisfiedPage) {
        return (
            <div className="satisfied-page">
                <div className="satisfied-content">
                    <h1>Hello! 🎉</h1>
                    <p>Your goal plan has been successfully created and saved!</p>

                    <div className="saved-goals-preview">
                        <h3>📋 Your Saved Goals:</h3>
                        {scheduleCards.map((card, index) => (
                            <div key={card.id} className="saved-goal-item">
                                <h4>{card.goalTitle}</h4>
                                <p>⏰ {formatDisplayTime(card.displayReminderTime)} | 🔄 {card.frequency}</p>
                                <p className="goal-desc">"{card.description}"</p>
                            </div>
                        ))}
                    </div>

                    <div className="satisfied-actions">
                        <button
                            onClick={() => {
                                window.dispatchEvent(new Event('storage'));
                                window.location.href = '/goals';
                            }}
                            className="btn-view-goals"
                        >
                            📊 View My Goals
                        </button>
                        <button onClick={handleRestart} className="btn-new-plan">
                            🆕 Create New Plan
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chatbox-fullscreen">
            <div className="chatbox-container">
                <div className="chatbox-header">
                    <div className="header-info">
                        <div className="bot-avatar">🤖</div>
                        <div className="header-text">
                            <h3>Goal Planning Assistant</h3>
                            <span>Online • Powered by Gemini AI</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>
                        <IoCloseSharp />
                    </button>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                    {conversation.map((item, idx) => (
                        <div key={idx} className={`message ${item.type === 'user' ? 'user-message' : 'bot-message'}`}>
                            {item.type === 'bot' && <div className="message-avatar">🤖</div>}
                            <div className="message-content">
                                {item.type === 'user' || item.type === 'bot' ? (
                                    <>
                                        <p>{item.message}</p>
                                        <span className="message-time">{item.timestamp}</span>
                                    </>
                                ) : item.type === 'card' ? (
                                    <div className="card-message">
                                        <p>{item.message}</p>
                                        {item.cards?.map((card) => (
                                            <div key={card.id} className="schedule-card">
                                                <div className="card-header">
                                                    <h4>{card.goalTitle}</h4>
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(card)}
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                </div>
                                                <div className="card-preview">
                                                    <div className="card-date">
                                                        <span>📅 {card.startDate} to {card.endDate}</span>
                                                    </div>
                                                    <div className="card-description">
                                                        <p>"{card.description}"</p>
                                                    </div>
                                                    <div className="card-details">
                                                        <div className="detail-item">
                                                            <span>📝 Tasks: {card.tasks}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span>⏰ Reminder: {formatDisplayTime(card.displayReminderTime)}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span>🔄 Frequency: {card.frequency}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span>⏳ Duration: {card.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        onClick={handleSaveSchedule}
                                                        className="btn-satisfied"
                                                        disabled={savingGoals}
                                                    >
                                                        {savingGoals ? "⏳ Saving..." : <><FaCheck /> Save Goals</>}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <span className="message-time">{item.timestamp}</span>
                                    </div>
                                ) : null}
                            </div>
                            {item.type === 'user' && <div className="message-avatar">👤</div>}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message bot-message">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!isLoading && (
                    <form className="chat-input-area" onSubmit={handleSubmit}>
                        <div className="input-container">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                autoFocus
                                disabled={savingGoals}
                            />
                            <button type="submit" disabled={savingGoals}>
                                Send
                            </button>
                        </div>
                    </form>
                )}

                {errorMsg && <div className="error-message">{errorMsg}</div>}
            </div>

            {showEditForm && <EditGoalForm />}
        </div>
    );
}

export default ChatBox;