// // // // ChatBox.jsx - FIXED VERSION WITH WORKING EDIT
// // // import React, { useState, useRef, useEffect } from "react";
// // // import "./ChatBox.css";
// // // import { IoCloseSharp } from "react-icons/io5";
// // // import { FaCheck, FaEdit, FaRedo, FaCalendar, FaClock, FaSyncAlt } from "react-icons/fa";

// // // function ChatBox({ onBack }) {
// // //     const [conversation, setConversation] = useState([]);
// // //     const [input, setInput] = useState("");
// // //     const [isLoading, setIsLoading] = useState(false);
// // //     const [errorMsg, setErrorMsg] = useState(null);
// // //     const [scheduleCards, setScheduleCards] = useState([]);
// // //     const [showSatisfiedPage, setShowSatisfiedPage] = useState(false);
// // //     const [savingGoals, setSavingGoals] = useState(false);
// // //     const [showEditForm, setShowEditForm] = useState(false);
// // //     const [editingCard, setEditingCard] = useState(null);
// // //     const [conversationStage, setConversationStage] = useState('greeting');
// // //     const [sessionId] = useState(() => 'session-' + Date.now());

// // //     const scrollRef = useRef(null);

// // //     useEffect(() => {
// // //         if (scrollRef.current) {
// // //             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
// // //         }
// // //     }, [conversation, scheduleCards]);

// // //     const getCurrentTime = () => {
// // //         return new Date().toLocaleTimeString('en-US', {
// // //             hour: '2-digit',
// // //             minute: '2-digit',
// // //             hour12: true
// // //         });
// // //     };

// // //     // Initialize with greeting
// // //     useEffect(() => {
// // //         if (conversation.length === 0) {
// // //             const greeting = {
// // //                 type: 'bot',
// // //                 message: "Hello! 👋 I'm your Goal Planning Assistant. I'll help you create a personalized goal plan step by step. What would you like to achieve?",
// // //                 timestamp: getCurrentTime(),
// // //                 stage: 'greeting'
// // //             };
// // //             setConversation([greeting]);
// // //             setConversationStage('greeting');
// // //         }
// // //     }, []);

// // //     // Calculate end date based on duration
// // //     const calculateEndDate = (duration, startDate = new Date()) => {
// // //         const durationMatch = duration?.toString().match(/(\d+)\s*(day|month|week)/i);
// // //         if (durationMatch) {
// // //             const num = parseInt(durationMatch[1]);
// // //             const unit = durationMatch[2].toLowerCase();
// // //             const endDate = new Date(startDate);
            
// // //             if (unit === 'month') endDate.setMonth(endDate.getMonth() + num);
// // //             else if (unit === 'week') endDate.setDate(endDate.getDate() + (num * 7));
// // //             else endDate.setDate(endDate.getDate() + num);
            
// // //             return endDate.toISOString().split('T')[0];
// // //         }
// // //         // Default: 30 days
// // //         const defaultEnd = new Date(startDate);
// // //         defaultEnd.setDate(defaultEnd.getDate() + 30);
// // //         return defaultEnd.toISOString().split('T')[0];
// // //     };

// // //     // Process Gemini Response
// // //     const processGeminiResponse = (geminiResponse) => {
// // //         try {
// // //             console.log("🔄 Processing Gemini response:", geminiResponse);
            
// // //             if (!geminiResponse.success) {
// // //                 throw new Error(geminiResponse.error || "API request failed");
// // //             }

// // //             const responseData = geminiResponse.data;
// // //             setConversationStage(responseData.stage);

// // //             // 🎯 SHOW THE MESSAGE
// // //             if (responseData.message) {
// // //                 const botMessage = {
// // //                     type: 'bot',
// // //                     message: responseData.message,
// // //                     timestamp: getCurrentTime(),
// // //                     stage: responseData.stage,
// // //                     questions: responseData.questions,
// // //                     isEdit: responseData.isEdit
// // //                 };
// // //                 setConversation(prev => [...prev, botMessage]);
// // //             }

// // //             // 🎯 PROCESS GOALS
// // //             if (responseData.goals && Array.isArray(responseData.goals) && responseData.goals.length > 0) {
// // //                 console.log("🎯 Processing goals from response");
                
// // //                 const goalCards = responseData.goals.map((goal, index) => {
// // //                     const startDate = goal.startDate || new Date().toISOString().split('T')[0];
// // //                     const endDate = goal.endDate || calculateEndDate(goal.duration, new Date(startDate));
                    
// // //                     return {
// // //                         id: Date.now() + index,
// // //                         goalTitle: goal.title || `Goal ${index + 1}`,
// // //                         startDate: startDate,
// // //                         endDate: endDate,
// // //                         description: goal.description || `Work on ${goal.title}`,
// // //                         reminderTime: goal.reminderTime || "6:00 PM",
// // //                         displayReminderTime: goal.reminderTime || "6:00 PM",
// // //                         frequency: goal.frequency || "Daily",
// // //                         tasks: Array.isArray(goal.tasks) ? goal.tasks.join(', ') : goal.tasks || "Practice regularly",
// // //                         duration: goal.duration || "30 days",
// // //                         allowEdit: responseData.allowEdit !== false
// // //                     };
// // //                 });

// // //                 setScheduleCards(goalCards);
                
// // //                 // Show goal cards
// // //                 const cardMessage = {
// // //                     type: 'card',
// // //                     message: responseData.isEdit ? "✅ Here's your updated goal plan:" : "🎯 Here's your personalized goal plan:",
// // //                     cards: goalCards,
// // //                     timestamp: getCurrentTime(),
// // //                     stage: 'generating_goal',
// // //                     allowEdit: responseData.allowEdit !== false
// // //                 };
// // //                 setConversation(prev => [...prev, cardMessage]);
// // //             }

// // //             // 🎯 SHOW QUESTIONS
// // //             if (responseData.questions && responseData.questions.length > 0) {
// // //                 setTimeout(() => {
// // //                     const questionsMessage = {
// // //                         type: 'bot',
// // //                         message: "💡 " + responseData.questions[0],
// // //                         timestamp: getCurrentTime(),
// // //                         stage: responseData.stage,
// // //                         isQuestion: true
// // //                     };
// // //                     setConversation(prev => [...prev, questionsMessage]);
// // //                 }, 500);
// // //             }
            
// // //         } catch (error) {
// // //             console.error("❌ Error processing response:", error);
// // //             const errorMessage = {
// // //                 type: 'bot',
// // //                 message: "I had trouble processing that. Could you please rephrase?",
// // //                 timestamp: getCurrentTime()
// // //             };
// // //             setConversation(prev => [...prev, errorMessage]);
// // //         }
// // //     };

// // //     // Handle User Message Submission
// // //     const handleSubmit = async (e) => {
// // //         e.preventDefault();
// // //         if (!input.trim() || isLoading) return;

// // //         const currentTime = getCurrentTime();
// // //         const userInput = input.trim();

// // //         // Add user message to conversation
// // //         const userMessage = {
// // //             type: 'user',
// // //             message: userInput,
// // //             timestamp: currentTime
// // //         };

// // //         setConversation(prev => [...prev, userMessage]);
// // //         setInput("");
// // //         setErrorMsg(null);
// // //         setIsLoading(true);

// // //         try {
// // //             const conversationHistory = conversation
// // //                 .filter(msg => msg.type === 'user' || msg.type === 'bot')
// // //                 .slice(-10)
// // //                 .map(msg => ({
// // //                     role: msg.type === 'user' ? 'user' : 'assistant',
// // //                     content: msg.message
// // //                 }));

// // //             const requestBody = {
// // //                 userInput: userInput,
// // //                 conversationHistory: conversationHistory,
// // //                 hasExistingGoals: scheduleCards.length > 0,
// // //                 sessionId: sessionId
// // //             };

// // //             const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
// // //                 method: 'POST',
// // //                 headers: {
// // //                     'Content-Type': 'application/json',
// // //                 },
// // //                 body: JSON.stringify(requestBody)
// // //             });

// // //             if (!response.ok) {
// // //                 throw new Error(`Server error: ${response.status}`);
// // //             }

// // //             const geminiResponse = await response.json();
// // //             processGeminiResponse(geminiResponse);

// // //         } catch (error) {
// // //             console.error("❌ Error in handleSubmit:", error);
// // //             setErrorMsg("Connection error. Please try again.");
            
// // //             const errorMessage = {
// // //                 type: 'bot',
// // //                 message: "Sorry, I'm having connection issues. Please try again.",
// // //                 timestamp: getCurrentTime()
// // //             };
// // //             setConversation(prev => [...prev, errorMessage]);
// // //         } finally {
// // //             setIsLoading(false);
// // //         }
// // //     };

// // //     // 🎯 FIXED: Handle AI Edit Request
// // //     const handleAIEdit = (card) => {
// // //         const editMessage = {
// // //             type: 'user',
// // //             message: `I want to edit my goal: ${card.goalTitle}`,
// // //             timestamp: getCurrentTime()
// // //         };
        
// // //         setConversation(prev => [...prev, editMessage]);
        
// // //         // Set input and auto-submit
// // //         setInput(`edit ${card.goalTitle}`);
        
// // //         // Use setTimeout to ensure state is updated
// // //         setTimeout(() => {
// // //             const fakeEvent = {
// // //                 preventDefault: () => {}
// // //             };
// // //             handleSubmit(fakeEvent);
// // //         }, 100);
// // //     };

// // //     // 🎯 FIXED: Handle Manual Edit Form
// // //     const handleEditClick = (card) => {
// // //         setEditingCard(card);
// // //         setEditedGoal({
// // //             title: card.goalTitle,
// // //             description: card.description,
// // //             frequency: card.frequency,
// // //             reminderTime: card.displayReminderTime,
// // //             duration: card.duration,
// // //             tasks: card.tasks
// // //         });
// // //         setShowEditForm(true);
// // //     };

// // //     const handleEditSubmit = (e) => {
// // //         e.preventDefault();

// // //         const updatedCards = scheduleCards.map(card =>
// // //             card.id === editingCard.id
// // //                 ? {
// // //                     ...card,
// // //                     goalTitle: editedGoal.title,
// // //                     description: editedGoal.description,
// // //                     frequency: editedGoal.frequency,
// // //                     reminderTime: editedGoal.reminderTime,
// // //                     displayReminderTime: editedGoal.reminderTime,
// // //                     duration: editedGoal.duration,
// // //                     tasks: editedGoal.tasks,
// // //                     endDate: calculateEndDate(editedGoal.duration, new Date(card.startDate))
// // //                 }
// // //                 : card
// // //         );

// // //         setScheduleCards(updatedCards);
// // //         setShowEditForm(false);
// // //         setEditingCard(null);

// // //         // Update conversation
// // //         const updateMessage = {
// // //             type: 'bot',
// // //             message: "✅ Goal updated successfully! The changes have been applied to your goal card.",
// // //             timestamp: getCurrentTime()
// // //         };
// // //         setConversation(prev => [...prev, updateMessage]);
// // //     };

// // //     // Rest of your functions (saveGoalsToLocalStorage, handleSaveSchedule, handleRestart)
// // //     const saveGoalsToLocalStorage = (goals) => {
// // //         try {
// // //             const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            
// // //             goals.forEach(goal => {
// // //                 const goalForStorage = {
// // //                     _id: 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
// // //                     title: goal.goalTitle,
// // //                     description: goal.description,
// // //                     duration: goal.duration,
// // //                     date: goal.startDate,
// // //                     deadline: goal.endDate,
// // //                     reminderTime: new Date().toISOString(),
// // //                     displayReminderTime: goal.displayReminderTime,
// // //                     isRecurring: true,
// // //                     frequency: goal.frequency,
// // //                     tasks: goal.tasks,
// // //                     status: "pending",
// // //                     source: "chatbot",
// // //                     createdAt: new Date().toISOString(),
// // //                     updatedAt: new Date().toISOString()
// // //                 };
// // //                 existingGoals.push(goalForStorage);
// // //             });

// // //             localStorage.setItem('goals', JSON.stringify(existingGoals));
// // //             console.log("✅ Goals saved to localStorage");
// // //             window.dispatchEvent(new Event('storage'));
// // //             return { success: true };
// // //         } catch (error) {
// // //             console.error("❌ Error saving to localStorage:", error);
// // //             return { success: false, error: error.message };
// // //         }
// // //     };

// // //     const handleSaveSchedule = async () => {
// // //         if (scheduleCards.length === 0) {
// // //             setErrorMsg("No goals to save. Please create some goals first.");
// // //             return;
// // //         }

// // //         setSavingGoals(true);
// // //         try {
// // //             const result = saveGoalsToLocalStorage(scheduleCards);
            
// // //             if (result.success) {
// // //                 const successMessage = {
// // //                     type: 'bot',
// // //                     message: "✅ Your goals have been saved successfully! You can now view them in your goals dashboard.",
// // //                     timestamp: getCurrentTime()
// // //                 };
// // //                 setConversation(prev => [...prev, successMessage]);
                
// // //                 setTimeout(() => {
// // //                     setShowSatisfiedPage(true);
// // //                 }, 1500);
// // //             } else {
// // //                 throw new Error(result.error);
// // //             }
// // //         } catch (error) {
// // //             console.error("❌ Error saving goals:", error);
// // //             setErrorMsg("Failed to save goals. Please try again.");
// // //         } finally {
// // //             setSavingGoals(false);
// // //         }
// // //     };

// // //     const handleRestart = () => {
// // //         setConversation([]);
// // //         setInput("");
// // //         setScheduleCards([]);
// // //         setErrorMsg(null);
// // //         setShowSatisfiedPage(false);
// // //         setShowEditForm(false);
// // //         setEditingCard(null);
// // //         setSavingGoals(false);
// // //         setConversationStage('greeting');
        
// // //         fetch('http://localhost:5000/api/clear-context', {
// // //             method: 'POST',
// // //             headers: { 'Content-Type': 'application/json' },
// // //             body: JSON.stringify({ sessionId })
// // //         });
// // //     };

// // //     // 🎯 ENHANCED Edit Form Component
// // //     const EditGoalForm = () => (
// // //         <div className="edit-form-overlay">
// // //             <div className="edit-form">
// // //                 <div className="edit-form-header">
// // //                     <h3>✏️ Edit Goal</h3>
// // //                     <button className="close-btn" onClick={() => setShowEditForm(false)}>
// // //                         <IoCloseSharp />
// // //                     </button>
// // //                 </div>
// // //                 <form onSubmit={handleEditSubmit}>
// // //                     <div className="form-group">
// // //                         <label>Goal Title:</label>
// // //                         <input
// // //                             type="text"
// // //                             value={editedGoal.title}
// // //                             onChange={(e) => setEditedGoal(prev => ({ ...prev, title: e.target.value }))}
// // //                             required
// // //                         />
// // //                     </div>

// // //                     <div className="form-group">
// // //                         <label>Description:</label>
// // //                         <textarea
// // //                             value={editedGoal.description}
// // //                             onChange={(e) => setEditedGoal(prev => ({ ...prev, description: e.target.value }))}
// // //                             required
// // //                             rows="3"
// // //                         />
// // //                     </div>

// // //                     <div className="form-row">
// // //                         <div className="form-group">
// // //                             <label>Frequency:</label>
// // //                             <select
// // //                                 value={editedGoal.frequency}
// // //                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, frequency: e.target.value }))}
// // //                             >
// // //                                 <option value="Daily">Daily</option>
// // //                                 <option value="Weekly">Weekly</option>
// // //                                 <option value="Monthly">Monthly</option>
// // //                                 <option value="5 days/week">5 days/week</option>
// // //                                 <option value="3 days/week">3 days/week</option>
// // //                             </select>
// // //                         </div>

// // //                         <div className="form-group">
// // //                             <label>Reminder Time:</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={editedGoal.reminderTime}
// // //                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, reminderTime: e.target.value }))}
// // //                                 placeholder="e.g., 6:00 PM"
// // //                                 required
// // //                             />
// // //                         </div>
// // //                     </div>

// // //                     <div className="form-row">
// // //                         <div className="form-group">
// // //                             <label>Duration:</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={editedGoal.duration}
// // //                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, duration: e.target.value }))}
// // //                                 placeholder="e.g., 30 days, 2 months"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div className="form-group">
// // //                             <label>End Date:</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={calculateEndDate(editedGoal.duration, new Date())}
// // //                                 disabled
// // //                                 className="disabled-input"
// // //                             />
// // //                         </div>
// // //                     </div>

// // //                     <div className="form-group">
// // //                         <label>Tasks (comma separated):</label>
// // //                         <textarea
// // //                             value={editedGoal.tasks}
// // //                             onChange={(e) => setEditedGoal(prev => ({ ...prev, tasks: e.target.value }))}
// // //                             placeholder="Task 1, Task 2, Task 3"
// // //                             required
// // //                             rows="3"
// // //                         />
// // //                     </div>

// // //                     <div className="form-actions">
// // //                         <button type="button" onClick={() => setShowEditForm(false)} className="btn-cancel">
// // //                             Cancel
// // //                         </button>
// // //                         <button type="submit" className="btn-save">
// // //                             Save Changes
// // //                         </button>
// // //                     </div>
// // //                 </form>
// // //             </div>
// // //         </div>
// // //     );

// // //     // 🎯 ENHANCED Card Display Component
// // //     const GoalCard = ({ card }) => (
// // //         <div className="schedule-card">
// // //             <div className="card-header">
// // //                 <h4>{card.goalTitle}</h4>
// // //                 <div className="card-actions">
// // //                     <button
// // //                         className="edit-btn"
// // //                         onClick={() => handleEditClick(card)}
// // //                     >
// // //                         <FaEdit /> Manual Edit
// // //                     </button>
// // //                     <button
// // //                         className="ai-edit-btn"
// // //                         onClick={() => handleAIEdit(card)}
// // //                     >
// // //                         <FaSyncAlt /> AI Edit
// // //                     </button>
// // //                 </div>
// // //             </div>
            
// // //             <div className="card-preview">
// // //                 <div className="card-description">
// // //                     <p>"{card.description}"</p>
// // //                 </div>
                
// // //                 <div className="card-details-grid">
// // //                     <div className="detail-item">
// // //                         <FaCalendar className="detail-icon" />
// // //                         <div>
// // //                             <span className="detail-label">Duration</span>
// // //                             <span className="detail-value">{card.duration}</span>
// // //                         </div>
// // //                     </div>
                    
// // //                     <div className="detail-item">
// // //                         <FaSyncAlt className="detail-icon" />
// // //                         <div>
// // //                             <span className="detail-label">Frequency</span>
// // //                             <span className="detail-value">{card.frequency}</span>
// // //                         </div>
// // //                     </div>
                    
// // //                     <div className="detail-item">
// // //                         <FaClock className="detail-icon" />
// // //                         <div>
// // //                             <span className="detail-label">Reminder</span>
// // //                             <span className="detail-value">{card.displayReminderTime}</span>
// // //                         </div>
// // //                     </div>
                    
// // //                     <div className="detail-item">
// // //                         <FaCalendar className="detail-icon" />
// // //                         <div>
// // //                             <span className="detail-label">Start Date</span>
// // //                             <span className="detail-value">{card.startDate}</span>
// // //                         </div>
// // //                     </div>
                    
// // //                     <div className="detail-item">
// // //                         <FaCalendar className="detail-icon" />
// // //                         <div>
// // //                             <span className="detail-label">End Date</span>
// // //                             <span className="detail-value">{card.endDate}</span>
// // //                         </div>
// // //                     </div>
// // //                 </div>
                
// // //                 <div className="tasks-section">
// // //                     <h5>📝 Tasks:</h5>
// // //                     <div className="tasks-list">
// // //                         {card.tasks.split(', ').map((task, index) => (
// // //                             <span key={index} className="task-tag">{task.trim()}</span>
// // //                         ))}
// // //                     </div>
// // //                 </div>
// // //             </div>
            
// // //             <div className="card-footer">
// // //                 <button
// // //                     onClick={handleSaveSchedule}
// // //                     className="btn-satisfied"
// // //                     disabled={savingGoals}
// // //                 >
// // //                     {savingGoals ? "⏳ Saving..." : <><FaCheck /> Save Goal</>}
// // //                 </button>
// // //             </div>
// // //         </div>
// // //     );

// // //     // Render method
// // //     return (
// // //         <div className="chatbox-fullscreen">
// // //             <div className="chatbox-container">
// // //                 {/* Header remains same */}
                
// // //                 <div className="chat-messages" ref={scrollRef}>
// // //                     {conversation.map((item, idx) => (
// // //                         <div key={idx} className={`message ${item.type === 'user' ? 'user-message' : 'bot-message'} ${item.isEdit ? 'edit-message' : ''}`}>
// // //                             {item.type === 'bot' && <div className="message-avatar">🤖</div>}
// // //                             <div className="message-content">
// // //                                 {item.type === 'user' || item.type === 'bot' ? (
// // //                                     <>
// // //                                         <p className={item.isQuestion ? "question-text" : ""}>{item.message}</p>
// // //                                         <span className="message-time">{item.timestamp}</span>
// // //                                     </>
// // //                                 ) : item.type === 'card' ? (
// // //                                     <div className="card-message">
// // //                                         <p>{item.message}</p>
// // //                                         {item.cards?.map((card) => (
// // //                                             <GoalCard key={card.id} card={card} />
// // //                                         ))}
// // //                                         <span className="message-time">{item.timestamp}</span>
// // //                                     </div>
// // //                                 ) : null}
// // //                             </div>
// // //                             {item.type === 'user' && <div className="message-avatar">👤</div>}
// // //                         </div>
// // //                     ))}

// // //                     {isLoading && (
// // //                         <div className="message bot-message">
// // //                             <div className="message-avatar">🤖</div>
// // //                             <div className="message-content">
// // //                                 <div className="typing-indicator">
// // //                                     <span></span>
// // //                                     <span></span>
// // //                                     <span></span>
// // //                                 </div>
// // //                             </div>
// // //                         </div>
// // //                     )}
// // //                 </div>

// // //                 {!isLoading && (
// // //                     <form className="chat-input-area" onSubmit={handleSubmit}>
// // //                         <div className="input-container">
// // //                             <input
// // //                                 type="text"
// // //                                 value={input}
// // //                                 onChange={(e) => setInput(e.target.value)}
// // //                                 placeholder={conversationStage === 'collecting_info' ? "Answer the question..." : "Type your message or say 'edit' to make changes..."}
// // //                                 autoFocus
// // //                                 disabled={savingGoals}
// // //                             />
// // //                             <button type="submit" disabled={savingGoals}>
// // //                                 Send
// // //                             </button>
// // //                         </div>
// // //                     </form>
// // //                 )}

// // //                 {errorMsg && <div className="error-message">{errorMsg}</div>}
// // //             </div>

// // //             {showEditForm && <EditGoalForm />}
// // //         </div>
// // //     );
// // // }

// // // export default ChatBox;


// // // ChatBox.jsx - FIXED MANUAL EDIT VERSION
// // import React, { useState, useRef, useEffect } from "react";
// // import "./ChatBox.css";
// // import { IoCloseSharp } from "react-icons/io5";
// // import { FaCheck, FaEdit, FaSyncAlt, FaCalendar, FaClock, FaTasks } from "react-icons/fa";

// // function ChatBox({ onBack }) {
// //     const [conversation, setConversation] = useState([]);
// //     const [input, setInput] = useState("");
// //     const [isLoading, setIsLoading] = useState(false);
// //     const [errorMsg, setErrorMsg] = useState(null);
// //     const [scheduleCards, setScheduleCards] = useState([]);
// //     const [showSatisfiedPage, setShowSatisfiedPage] = useState(false);
// //     const [savingGoals, setSavingGoals] = useState(false);
// //     const [showEditForm, setShowEditForm] = useState(false);
// //     const [editingCard, setEditingCard] = useState(null);
// //     const [editedGoal, setEditedGoal] = useState({
// //         title: "",
// //         description: "",
// //         frequency: "",
// //         reminderTime: "",
// //         duration: "",
// //         tasks: ""
// //     });
// //     const [conversationStage, setConversationStage] = useState('greeting');
// //     const [sessionId] = useState(() => 'session-' + Date.now());

// //     const scrollRef = useRef(null);

// //     useEffect(() => {
// //         if (scrollRef.current) {
// //             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
// //         }
// //     }, [conversation, scheduleCards, showEditForm]); // Added showEditForm

// //     const getCurrentTime = () => {
// //         return new Date().toLocaleTimeString('en-US', {
// //             hour: '2-digit',
// //             minute: '2-digit',
// //             hour12: true
// //         });
// //     };

// //     // Initialize with greeting
// //     useEffect(() => {
// //         if (conversation.length === 0) {
// //             const greeting = {
// //                 type: 'bot',
// //                 message: "Hello! 👋 I'm your Goal Planning Assistant. I'll help you create a personalized goal plan step by step. What would you like to achieve?",
// //                 timestamp: getCurrentTime(),
// //                 stage: 'greeting'
// //             };
// //             setConversation([greeting]);
// //             setConversationStage('greeting');
// //         }
// //     }, []);

// //     // Calculate end date based on duration - FIXED
// //     const calculateEndDate = (duration, startDate = new Date()) => {
// //         if (!duration) return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
// //         const durationMatch = duration.toString().match(/(\d+)\s*(day|month|week)/i);
// //         if (durationMatch) {
// //             const num = parseInt(durationMatch[1]);
// //             const unit = durationMatch[2].toLowerCase();
// //             const endDate = new Date(startDate);
            
// //             if (unit === 'month') endDate.setMonth(endDate.getMonth() + num);
// //             else if (unit === 'week') endDate.setDate(endDate.getDate() + (num * 7));
// //             else endDate.setDate(endDate.getDate() + num);
            
// //             return endDate.toISOString().split('T')[0];
// //         }
// //         // Default: 30 days
// //         const defaultEnd = new Date(startDate);
// //         defaultEnd.setDate(defaultEnd.getDate() + 30);
// //         return defaultEnd.toISOString().split('T')[0];
// //     };

// //     // Process Gemini Response
// //     const processGeminiResponse = (geminiResponse) => {
// //         try {
// //             console.log("🔄 Processing Gemini response:", geminiResponse);
            
// //             if (!geminiResponse.success) {
// //                 throw new Error(geminiResponse.error || "API request failed");
// //             }

// //             const responseData = geminiResponse.data;
// //             setConversationStage(responseData.stage);

// //             // 🎯 SHOW THE MESSAGE
// //             if (responseData.message) {
// //                 const botMessage = {
// //                     type: 'bot',
// //                     message: responseData.message,
// //                     timestamp: getCurrentTime(),
// //                     stage: responseData.stage,
// //                     questions: responseData.questions
// //                 };
// //                 setConversation(prev => [...prev, botMessage]);
// //             }

// //             // 🎯 PROCESS GOALS
// //             if (responseData.goals && Array.isArray(responseData.goals) && responseData.goals.length > 0) {
// //                 console.log("🎯 Processing goals from response");
                
// //                 const goalCards = responseData.goals.map((goal, index) => {
// //                     const startDate = goal.startDate || new Date().toISOString().split('T')[0];
// //                     const endDate = goal.endDate || calculateEndDate(goal.duration, new Date(startDate));
                    
// //                     return {
// //                         id: Date.now() + index,
// //                         goalTitle: goal.title || `Goal ${index + 1}`,
// //                         startDate: startDate,
// //                         endDate: endDate,
// //                         description: goal.description || `Work on ${goal.title}`,
// //                         reminderTime: goal.reminderTime || "6:00 PM",
// //                         displayReminderTime: goal.reminderTime || "6:00 PM",
// //                         frequency: goal.frequency || "Daily",
// //                         tasks: Array.isArray(goal.tasks) ? goal.tasks.join(', ') : goal.tasks || "Practice regularly",
// //                         duration: goal.duration || "30 days",
// //                         allowEdit: responseData.allowEdit !== false
// //                     };
// //                 });

// //                 setScheduleCards(goalCards);
                
// //                 // Show goal cards
// //                 const cardMessage = {
// //                     type: 'card',
// //                     message: "🎯 Here's your personalized goal plan:",
// //                     cards: goalCards,
// //                     timestamp: getCurrentTime(),
// //                     stage: 'generating_goal',
// //                     allowEdit: responseData.allowEdit !== false
// //                 };
// //                 setConversation(prev => [...prev, cardMessage]);
// //             }

// //             // 🎯 SHOW QUESTIONS
// //             if (responseData.questions && responseData.questions.length > 0) {
// //                 setTimeout(() => {
// //                     const questionsMessage = {
// //                         type: 'bot',
// //                         message: "💡 " + responseData.questions[0],
// //                         timestamp: getCurrentTime(),
// //                         stage: responseData.stage,
// //                         isQuestion: true
// //                     };
// //                     setConversation(prev => [...prev, questionsMessage]);
// //                 }, 500);
// //             }
            
// //         } catch (error) {
// //             console.error("❌ Error processing response:", error);
// //             const errorMessage = {
// //                 type: 'bot',
// //                 message: "I had trouble processing that. Could you please rephrase?",
// //                 timestamp: getCurrentTime()
// //             };
// //             setConversation(prev => [...prev, errorMessage]);
// //         }
// //     };

// //     // Handle User Message Submission
// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         if (!input.trim() || isLoading) return;

// //         const currentTime = getCurrentTime();
// //         const userInput = input.trim();

// //         const userMessage = {
// //             type: 'user',
// //             message: userInput,
// //             timestamp: currentTime
// //         };

// //         setConversation(prev => [...prev, userMessage]);
// //         setInput("");
// //         setErrorMsg(null);
// //         setIsLoading(true);

// //         try {
// //             const conversationHistory = conversation
// //                 .filter(msg => msg.type === 'user' || msg.type === 'bot')
// //                 .slice(-10)
// //                 .map(msg => ({
// //                     role: msg.type === 'user' ? 'user' : 'assistant',
// //                     content: msg.message
// //                 }));

// //             const requestBody = {
// //                 userInput: userInput,
// //                 conversationHistory: conversationHistory,
// //                 hasExistingGoals: scheduleCards.length > 0,
// //                 sessionId: sessionId
// //             };

// //             const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify(requestBody)
// //             });

// //             if (!response.ok) {
// //                 throw new Error(`Server error: ${response.status}`);
// //             }

// //             const geminiResponse = await response.json();
// //             processGeminiResponse(geminiResponse);

// //         } catch (error) {
// //             console.error("❌ Error in handleSubmit:", error);
// //             setErrorMsg("Connection error. Please try again.");
            
// //             const errorMessage = {
// //                 type: 'bot',
// //                 message: "Sorry, I'm having connection issues. Please try again.",
// //                 timestamp: getCurrentTime()
// //             };
// //             setConversation(prev => [...prev, errorMessage]);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     // 🎯 FIXED: Handle AI Edit Request
// //     const handleAIEdit = (card) => {
// //         const editMessage = {
// //             type: 'user',
// //             message: `I want to edit: ${card.goalTitle}`,
// //             timestamp: getCurrentTime()
// //         };
        
// //         setConversation(prev => [...prev, editMessage]);
// //         setInput(`edit ${card.goalTitle}`);
        
// //         setTimeout(() => {
// //             const fakeEvent = {
// //                 preventDefault: () => {}
// //             };
// //             handleSubmit(fakeEvent);
// //         }, 100);
// //     };

// //     // 🎯 FIXED: Handle Manual Edit - PROPERLY INITIALIZE STATE
// //     const handleEditClick = (card) => {
// //         console.log("🔄 Opening edit form for:", card);
// //         setEditingCard(card);
// //         setEditedGoal({
// //             title: card.goalTitle || "",
// //             description: card.description || "",
// //             frequency: card.frequency || "Daily",
// //             reminderTime: card.displayReminderTime || "6:00 PM",
// //             duration: card.duration || "30 days",
// //             tasks: card.tasks || ""
// //         });
// //         setShowEditForm(true);
// //     };

// //     // 🎯 FIXED: Handle Edit Form Submit
// //     const handleEditSubmit = (e) => {
// //         e.preventDefault();
// //         console.log("✅ Submitting edit form:", editedGoal);

// //         if (!editingCard) {
// //             console.error("❌ No editing card found");
// //             return;
// //         }

// //         const updatedCards = scheduleCards.map(card =>
// //             card.id === editingCard.id
// //                 ? {
// //                     ...card,
// //                     goalTitle: editedGoal.title,
// //                     description: editedGoal.description,
// //                     frequency: editedGoal.frequency,
// //                     reminderTime: editedGoal.reminderTime,
// //                     displayReminderTime: editedGoal.reminderTime,
// //                     duration: editedGoal.duration,
// //                     tasks: editedGoal.tasks,
// //                     endDate: calculateEndDate(editedGoal.duration, new Date(card.startDate))
// //                 }
// //                 : card
// //         );

// //         console.log("🔄 Updated cards:", updatedCards);
// //         setScheduleCards(updatedCards);
// //         setShowEditForm(false);
// //         setEditingCard(null);

// //         // Update conversation to show changes
// //         const updateMessage = {
// //             type: 'bot',
// //             message: "✅ Goal updated successfully! Your changes have been applied.",
// //             timestamp: getCurrentTime()
// //         };
// //         setConversation(prev => [...prev, updateMessage]);
// //     };

// //     // Rest of your functions remain the same...
// //     const saveGoalsToLocalStorage = (goals) => {
// //         try {
// //             const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            
// //             goals.forEach(goal => {
// //                 const goalForStorage = {
// //                     _id: 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
// //                     title: goal.goalTitle,
// //                     description: goal.description,
// //                     duration: goal.duration,
// //                     date: goal.startDate,
// //                     deadline: goal.endDate,
// //                     reminderTime: new Date().toISOString(),
// //                     displayReminderTime: goal.displayReminderTime,
// //                     isRecurring: true,
// //                     frequency: goal.frequency,
// //                     tasks: goal.tasks,
// //                     status: "pending",
// //                     source: "chatbot",
// //                     createdAt: new Date().toISOString(),
// //                     updatedAt: new Date().toISOString()
// //                 };
// //                 existingGoals.push(goalForStorage);
// //             });

// //             localStorage.setItem('goals', JSON.stringify(existingGoals));
// //             console.log("✅ Goals saved to localStorage");
// //             window.dispatchEvent(new Event('storage'));
// //             return { success: true };
// //         } catch (error) {
// //             console.error("❌ Error saving to localStorage:", error);
// //             return { success: false, error: error.message };
// //         }
// //     };

// //     const handleSaveSchedule = async () => {
// //         if (scheduleCards.length === 0) {
// //             setErrorMsg("No goals to save. Please create some goals first.");
// //             return;
// //         }

// //         setSavingGoals(true);
// //         try {
// //             const result = saveGoalsToLocalStorage(scheduleCards);
            
// //             if (result.success) {
// //                 const successMessage = {
// //                     type: 'bot',
// //                     message: "✅ Your goals have been saved successfully! You can now view them in your goals dashboard.",
// //                     timestamp: getCurrentTime()
// //                 };
// //                 setConversation(prev => [...prev, successMessage]);
                
// //                 setTimeout(() => {
// //                     setShowSatisfiedPage(true);
// //                 }, 1500);
// //             } else {
// //                 throw new Error(result.error);
// //             }
// //         } catch (error) {
// //             console.error("❌ Error saving goals:", error);
// //             setErrorMsg("Failed to save goals. Please try again.");
// //         } finally {
// //             setSavingGoals(false);
// //         }
// //     };

// //     const handleRestart = () => {
// //         setConversation([]);
// //         setInput("");
// //         setScheduleCards([]);
// //         setErrorMsg(null);
// //         setShowSatisfiedPage(false);
// //         setShowEditForm(false);
// //         setEditingCard(null);
// //         setSavingGoals(false);
// //         setConversationStage('greeting');
        
// //         fetch('http://localhost:5000/api/clear-context', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({ sessionId })
// //         });
// //     };

// //     // 🎯 FIXED Edit Form Component
// //     const EditGoalForm = () => {
// //         if (!editingCard) return null;

// //         return (
// //             <div className="edit-form-overlay">
// //                 <div className="edit-form">
// //                     <div className="edit-form-header">
// //                         <h3>✏️ Edit Goal</h3>
// //                         <button 
// //                             className="close-btn" 
// //                             onClick={() => setShowEditForm(false)}
// //                             type="button"
// //                         >
// //                             <IoCloseSharp />
// //                         </button>
// //                     </div>
// //                     <form onSubmit={handleEditSubmit}>
// //                         <div className="form-group">
// //                             <label>Goal Title:</label>
// //                             <input
// //                                 type="text"
// //                                 value={editedGoal.title}
// //                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, title: e.target.value }))}
// //                                 required
// //                             />
// //                         </div>

// //                         <div className="form-group">
// //                             <label>Description:</label>
// //                             <textarea
// //                                 value={editedGoal.description}
// //                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, description: e.target.value }))}
// //                                 required
// //                                 rows="3"
// //                             />
// //                         </div>

// //                         <div className="form-row">
// //                             <div className="form-group">
// //                                 <label>Frequency:</label>
// //                                 <select
// //                                     value={editedGoal.frequency}
// //                                     onChange={(e) => setEditedGoal(prev => ({ ...prev, frequency: e.target.value }))}
// //                                 >
// //                                     <option value="Daily">Daily</option>
// //                                     <option value="Weekly">Weekly</option>
// //                                     <option value="Monthly">Monthly</option>
// //                                     <option value="5 days/week">5 days/week</option>
// //                                     <option value="3 days/week">3 days/week</option>
// //                                     <option value="Weekends only">Weekends only</option>
// //                                 </select>
// //                             </div>

// //                             <div className="form-group">
// //                                 <label>Reminder Time:</label>
// //                                 <input
// //                                     type="text"
// //                                     value={editedGoal.reminderTime}
// //                                     onChange={(e) => setEditedGoal(prev => ({ ...prev, reminderTime: e.target.value }))}
// //                                     placeholder="e.g., 6:00 PM"
// //                                     required
// //                                 />
// //                             </div>
// //                         </div>

// //                         <div className="form-row">
// //                             <div className="form-group">
// //                                 <label>Duration:</label>
// //                                 <input
// //                                     type="text"
// //                                     value={editedGoal.duration}
// //                                     onChange={(e) => setEditedGoal(prev => ({ ...prev, duration: e.target.value }))}
// //                                     placeholder="e.g., 30 days, 2 months"
// //                                     required
// //                                 />
// //                             </div>

// //                             <div className="form-group">
// //                                 <label>End Date:</label>
// //                                 <input
// //                                     type="text"
// //                                     value={calculateEndDate(editedGoal.duration, new Date())}
// //                                     disabled
// //                                     className="disabled-input"
// //                                 />
// //                             </div>
// //                         </div>

// //                         <div className="form-group">
// //                             <label>Tasks (comma separated):</label>
// //                             <textarea
// //                                 value={editedGoal.tasks}
// //                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, tasks: e.target.value }))}
// //                                 placeholder="Task 1, Task 2, Task 3"
// //                                 required
// //                                 rows="3"
// //                             />
// //                         </div>

// //                         <div className="form-actions">
// //                             <button 
// //                                 type="button" 
// //                                 onClick={() => setShowEditForm(false)} 
// //                                 className="btn-cancel"
// //                             >
// //                                 Cancel
// //                             </button>
// //                             <button type="submit" className="btn-save">
// //                                 Save Changes
// //                             </button>
// //                         </div>
// //                     </form>
// //                 </div>
// //             </div>
// //         );
// //     };

// //     // Goal Card Component
// //     const GoalCard = ({ card }) => (
// //         <div className="schedule-card">
// //             <div className="card-header">
// //                 <h4>{card.goalTitle}</h4>
// //                 <div className="card-actions">
// //                     <button
// //                         className="edit-btn"
// //                         onClick={() => handleEditClick(card)}
// //                     >
// //                         <FaEdit /> Manual Edit
// //                     </button>
// //                     <button
// //                         className="ai-edit-btn"
// //                         onClick={() => handleAIEdit(card)}
// //                     >
// //                         <FaSyncAlt /> AI Edit
// //                     </button>
// //                 </div>
// //             </div>
            
// //             <div className="card-preview">
// //                 <div className="card-description">
// //                     <p>"{card.description}"</p>
// //                 </div>
                
// //                 <div className="card-details-grid">
// //                     <div className="detail-item">
// //                         <FaCalendar className="detail-icon" />
// //                         <div>
// //                             <span className="detail-label">Duration</span>
// //                             <span className="detail-value">{card.duration}</span>
// //                         </div>
// //                     </div>
                    
// //                     <div className="detail-item">
// //                         <FaSyncAlt className="detail-icon" />
// //                         <div>
// //                             <span className="detail-label">Frequency</span>
// //                             <span className="detail-value">{card.frequency}</span>
// //                         </div>
// //                     </div>
                    
// //                     <div className="detail-item">
// //                         <FaClock className="detail-icon" />
// //                         <div>
// //                             <span className="detail-label">Reminder</span>
// //                             <span className="detail-value">{card.displayReminderTime}</span>
// //                         </div>
// //                     </div>
                    
// //                     <div className="detail-item">
// //                         <FaCalendar className="detail-icon" />
// //                         <div>
// //                             <span className="detail-label">Start Date</span>
// //                             <span className="detail-value">{card.startDate}</span>
// //                         </div>
// //                     </div>
                    
// //                     <div className="detail-item">
// //                         <FaCalendar className="detail-icon" />
// //                         <div>
// //                             <span className="detail-label">End Date</span>
// //                             <span className="detail-value">{card.endDate}</span>
// //                         </div>
// //                     </div>
// //                 </div>
                
// //                 <div className="tasks-section">
// //                     <h5><FaTasks /> Tasks:</h5>
// //                     <div className="tasks-list">
// //                         {card.tasks.split(', ').map((task, index) => (
// //                             <span key={index} className="task-tag">{task.trim()}</span>
// //                         ))}
// //                     </div>
// //                 </div>
// //             </div>
            
// //             <div className="card-footer">
// //                 <button
// //                     onClick={handleSaveSchedule}
// //                     className="btn-satisfied"
// //                     disabled={savingGoals}
// //                 >
// //                     {savingGoals ? "⏳ Saving..." : <><FaCheck /> Save Goal</>}
// //                 </button>
// //             </div>
// //         </div>
// //     );

// //     // Render method
// //     return (
// //         <div className="chatbox-fullscreen">
// //             <div className="chatbox-container">
// //                 {/* Header remains same */}
                
// //                 <div className="chat-messages" ref={scrollRef}>
// //                     {conversation.map((item, idx) => (
// //                         <div key={idx} className={`message ${item.type === 'user' ? 'user-message' : 'bot-message'}`}>
// //                             {item.type === 'bot' && <div className="message-avatar">🤖</div>}
// //                             <div className="message-content">
// //                                 {item.type === 'user' || item.type === 'bot' ? (
// //                                     <>
// //                                         <p className={item.isQuestion ? "question-text" : ""}>{item.message}</p>
// //                                         <span className="message-time">{item.timestamp}</span>
// //                                     </>
// //                                 ) : item.type === 'card' ? (
// //                                     <div className="card-message">
// //                                         <p>{item.message}</p>
// //                                         {item.cards?.map((card) => (
// //                                             <GoalCard key={card.id} card={card} />
// //                                         ))}
// //                                         <span className="message-time">{item.timestamp}</span>
// //                                     </div>
// //                                 ) : null}
// //                             </div>
// //                             {item.type === 'user' && <div className="message-avatar">👤</div>}
// //                         </div>
// //                     ))}

// //                     {isLoading && (
// //                         <div className="message bot-message">
// //                             <div className="message-avatar">🤖</div>
// //                             <div className="message-content">
// //                                 <div className="typing-indicator">
// //                                     <span></span>
// //                                     <span></span>
// //                                     <span></span>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {!isLoading && (
// //                     <form className="chat-input-area" onSubmit={handleSubmit}>
// //                         <div className="input-container">
// //                             <input
// //                                 type="text"
// //                                 value={input}
// //                                 onChange={(e) => setInput(e.target.value)}
// //                                 placeholder={conversationStage === 'collecting_info' ? "Answer the question..." : "Type your message or say 'edit' to make changes..."}
// //                                 autoFocus
// //                                 disabled={savingGoals}
// //                             />
// //                             <button type="submit" disabled={savingGoals}>
// //                                 Send
// //                             </button>
// //                         </div>
// //                     </form>
// //                 )}

// //                 {errorMsg && <div className="error-message">{errorMsg}</div>}
// //             </div>

// //             {showEditForm && <EditGoalForm />}
// //         </div>
// //     );
// // }

// // export default ChatBox;

// // ChatBox.jsx - COMPLETE FIXED VERSION
// import React, { useState, useRef, useEffect } from "react";
// import "./ChatBox.css";
// import { IoCloseSharp } from "react-icons/io5";
// import { FaCheck, FaEdit, FaSyncAlt, FaCalendar, FaClock, FaTasks, FaArrowLeft, FaRocket } from "react-icons/fa";

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
//         duration: "",
//         tasks: ""
//     });
//     const [conversationStage, setConversationStage] = useState('greeting');
//     const [sessionId] = useState(() => 'session-' + Date.now());
//     const [userProvidedDetails, setUserProvidedDetails] = useState({});
//     const [savedGoals, setSavedGoals] = useState([]);

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

//     // Fetch user details when card is generated
//     useEffect(() => {
//         if (scheduleCards.length > 0) {
//             fetchUserDetails();
//         }
//     }, [scheduleCards]);

//     const fetchUserDetails = async () => {
//         try {
//             const response = await fetch(`http://localhost:5000/api/user-details/${sessionId}`);
//             const data = await response.json();
//             if (data.success) {
//                 setUserProvidedDetails(data.userDetails);
//             }
//         } catch (error) {
//             console.error("❌ Error fetching user details:", error);
//         }
//     };

//     // Initialize with greeting
//     useEffect(() => {
//         if (conversation.length === 0) {
//             const greeting = {
//                 type: 'bot',
//                 message: "Hello! 👋 I'm your Goal Planning Assistant. I'll help you create a personalized goal plan step by step. What would you like to achieve?",
//                 timestamp: getCurrentTime(),
//                 stage: 'greeting'
//             };
//             setConversation([greeting]);
//             setConversationStage('greeting');
//         }
//     }, []);

//     // Calculate end date based on duration
//     const calculateEndDate = (duration, startDate = new Date()) => {
//         if (!duration) return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
//         const durationMatch = duration.toString().match(/(\d+)\s*(day|month|week)/i);
//         if (durationMatch) {
//             const num = parseInt(durationMatch[1]);
//             const unit = durationMatch[2].toLowerCase();
//             const endDate = new Date(startDate);
            
//             if (unit === 'month') endDate.setMonth(endDate.getMonth() + num);
//             else if (unit === 'week') endDate.setDate(endDate.getDate() + (num * 7));
//             else endDate.setDate(endDate.getDate() + num);
            
//             return endDate.toISOString().split('T')[0];
//         }
//         const defaultEnd = new Date(startDate);
//         defaultEnd.setDate(defaultEnd.getDate() + 30);
//         return defaultEnd.toISOString().split('T')[0];
//     };

//     // Process Gemini Response
//     const processGeminiResponse = (geminiResponse) => {
//         try {
//             console.log("🔄 Processing Gemini response:", geminiResponse);
            
//             if (!geminiResponse.success) {
//                 throw new Error(geminiResponse.error || "API request failed");
//             }

//             const responseData = geminiResponse.data;
//             const context = geminiResponse.context;
            
//             setConversationStage(responseData.stage);

//             if (responseData.userProvidedDetails) {
//                 setUserProvidedDetails(responseData.userProvidedDetails);
//             }

//             if (responseData.message) {
//                 const botMessage = {
//                     type: 'bot',
//                     message: responseData.message,
//                     timestamp: getCurrentTime(),
//                     stage: responseData.stage,
//                     questions: responseData.questions
//                 };
//                 setConversation(prev => [...prev, botMessage]);
//             }

//             if (responseData.goals && Array.isArray(responseData.goals) && responseData.goals.length > 0) {
//                 console.log("🎯 Processing goals from response");
                
//                 const goalCards = responseData.goals.map((goal, index) => {
//                     const startDate = goal.startDate || new Date().toISOString().split('T')[0];
//                     const endDate = goal.endDate || calculateEndDate(goal.duration, new Date(startDate));
                    
//                     return {
//                         id: Date.now() + index,
//                         goalTitle: goal.title || `Goal ${index + 1}`,
//                         startDate: startDate,
//                         endDate: endDate,
//                         description: goal.description || `Work on ${goal.title}`,
//                         reminderTime: goal.reminderTime || "6:00 PM",
//                         displayReminderTime: goal.reminderTime || "6:00 PM",
//                         frequency: goal.frequency || "Daily",
//                         tasks: Array.isArray(goal.tasks) ? goal.tasks.join(', ') : goal.tasks || "Practice regularly",
//                         duration: goal.duration || "30 days",
//                         allowEdit: responseData.allowEdit !== false,
//                         userDetails: responseData.userProvidedDetails || {}
//                     };
//                 });

//                 setScheduleCards(goalCards);
                
//                 const cardMessage = {
//                     type: 'card',
//                     message: "🎯 Here's your personalized goal plan:",
//                     cards: goalCards,
//                     timestamp: getCurrentTime(),
//                     stage: 'generating_goal',
//                     allowEdit: responseData.allowEdit !== false
//                 };
//                 setConversation(prev => [...prev, cardMessage]);
//             }

//             if (responseData.questions && responseData.questions.length > 0) {
//                 setTimeout(() => {
//                     const questionsMessage = {
//                         type: 'bot',
//                         message: "💡 " + responseData.questions[0],
//                         timestamp: getCurrentTime(),
//                         stage: responseData.stage,
//                         isQuestion: true
//                     };
//                     setConversation(prev => [...prev, questionsMessage]);
//                 }, 500);
//             }
            
//         } catch (error) {
//             console.error("❌ Error processing response:", error);
//             const errorMessage = {
//                 type: 'bot',
//                 message: "I had trouble processing that. Could you please rephrase?",
//                 timestamp: getCurrentTime()
//             };
//             setConversation(prev => [...prev, errorMessage]);
//         }
//     };

//     // Handle User Message Submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!input.trim() || isLoading) return;

//         const currentTime = getCurrentTime();
//         const userInput = input.trim();

//         const userMessage = {
//             type: 'user',
//             message: userInput,
//             timestamp: currentTime
//         };

//         setConversation(prev => [...prev, userMessage]);
//         setInput("");
//         setErrorMsg(null);
//         setIsLoading(true);

//         try {
//             const conversationHistory = conversation
//                 .filter(msg => msg.type === 'user' || msg.type === 'bot')
//                 .slice(-10)
//                 .map(msg => ({
//                     role: msg.type === 'user' ? 'user' : 'assistant',
//                     content: msg.message
//                 }));

//             const requestBody = {
//                 userInput: userInput,
//                 conversationHistory: conversationHistory,
//                 hasExistingGoals: scheduleCards.length > 0,
//                 sessionId: sessionId
//             };

//             const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
//                 method: "POST",
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(requestBody)
//             });

//             if (!response.ok) {
//                 throw new Error(`Server error: ${response.status}`);
//             }

//             const geminiResponse = await response.json();
//             processGeminiResponse(geminiResponse);

//         } catch (error) {
//             console.error("❌ Error in handleSubmit:", error);
//             setErrorMsg("Connection error. Please try again.");
            
//             const errorMessage = {
//                 type: 'bot',
//                 message: "Sorry, I'm having connection issues. Please try again.",
//                 timestamp: getCurrentTime()
//             };
//             setConversation(prev => [...prev, errorMessage]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Handle AI Edit Request
//     const handleAIEdit = (card) => {
//         const editMessage = {
//             type: 'user',
//             message: `I want to edit: ${card.goalTitle}`,
//             timestamp: getCurrentTime()
//         };
        
//         setConversation(prev => [...prev, editMessage]);
//         setInput(`edit ${card.goalTitle}`);
        
//         setTimeout(() => {
//             const fakeEvent = {
//                 preventDefault: () => {}
//             };
//             handleSubmit(fakeEvent);
//         }, 100);
//     };

//     // Handle Manual Edit with AUTO-FILL
//     const handleEditClick = (card) => {
//         console.log("🔄 Opening edit form with user details:", userProvidedDetails);
        
//         const userFrequency = userProvidedDetails.frequency || card.frequency;
//         const userDuration = userProvidedDetails.duration || card.duration;
//         const userReminderTime = userProvidedDetails.reminderTime || card.displayReminderTime;
//         const userTasks = userProvidedDetails.specificTasks || card.tasks;

//         setEditingCard(card);
//         setEditedGoal({
//             title: card.goalTitle || "",
//             description: card.description || "",
//             frequency: userFrequency || "Daily",
//             reminderTime: userReminderTime || "6:00 PM",
//             duration: userDuration || "30 days",
//             tasks: userTasks || ""
//         });
//         setShowEditForm(true);
//     };

//     // 🆕 FIXED: Handle Edit Form Submit
//     const handleEditSubmit = (e) => {
//         e.preventDefault();
//         console.log("✅ Submitting edit form:", editedGoal);

//         if (!editingCard) {
//             console.error("❌ No editing card found");
//             return;
//         }

//         const updatedCards = scheduleCards.map(card =>
//             card.id === editingCard.id
//                 ? {
//                     ...card,
//                     goalTitle: editedGoal.title,
//                     description: editedGoal.description,
//                     frequency: editedGoal.frequency,
//                     reminderTime: editedGoal.reminderTime,
//                     displayReminderTime: editedGoal.reminderTime,
//                     duration: editedGoal.duration,
//                     tasks: editedGoal.tasks,
//                     endDate: calculateEndDate(editedGoal.duration, new Date(card.startDate))
//                 }
//                 : card
//         );

//         console.log("🔄 Updated cards:", updatedCards);
//         setScheduleCards(updatedCards);
//         setShowEditForm(false);
//         setEditingCard(null);

//         const successMessage = {
//             type: 'bot',
//             message: `✅ Goal updated successfully! 
// • Title: ${editedGoal.title}
// • Frequency: ${editedGoal.frequency}
// • Duration: ${editedGoal.duration}
// • Reminder: ${editedGoal.reminderTime}

// Your changes have been applied. Click "Save Goal" when ready.`,
//             timestamp: getCurrentTime()
//         };
//         setConversation(prev => [...prev, successMessage]);
//     };

//     // 🆕 FIXED: Save Goals to Backend
//     const handleSaveSchedule = async () => {
//         if (scheduleCards.length === 0) {
//             setErrorMsg("No goals to save. Please create some goals first.");
//             return;
//         }

//         setSavingGoals(true);
//         try {
//             console.log("💾 Saving goals to backend:", scheduleCards);
            
//             const response = await fetch('http://localhost:5000/api/save-goals', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     goals: scheduleCards,
//                     sessionId: sessionId
//                 })
//             });

//             if (!response.ok) {
//                 throw new Error(`Save failed: ${response.status}`);
//             }

//             const result = await response.json();
            
//             if (result.success) {
//                 setSavedGoals(scheduleCards);
                
//                 const successMessage = {
//                     type: 'bot',
//                     message: "✅ Your goals have been saved successfully! Redirecting to congratulations page...",
//                     timestamp: getCurrentTime()
//                 };
//                 setConversation(prev => [...prev, successMessage]);
                
//                 // Show congratulations page after delay
//                 setTimeout(() => {
//                     setShowSatisfiedPage(true);
//                 }, 1500);
//             } else {
//                 throw new Error(result.message || "Failed to save goals");
//             }

//         } catch (error) {
//             console.error("❌ Error saving goals:", error);
//             setErrorMsg("Failed to save goals. Please try again.");
            
//             const errorMessage = {
//                 type: 'bot',
//                 message: "❌ Failed to save goals. Please try again.",
//                 timestamp: getCurrentTime()
//             };
//             setConversation(prev => [...prev, errorMessage]);
//         } finally {
//             setSavingGoals(false);
//         }
//     };

//     // 🆕 Handle Restart - Create New Goal
//     const handleRestart = () => {
//         setConversation([]);
//         setInput("");
//         setScheduleCards([]);
//         setErrorMsg(null);
//         setShowSatisfiedPage(false);
//         setShowEditForm(false);
//         setEditingCard(null);
//         setSavingGoals(false);
//         setConversationStage('greeting');
//         setUserProvidedDetails({});
//         setSavedGoals([]);
        
//         // Clear backend context
//         fetch('http://localhost:5000/api/clear-context', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ sessionId })
//         });
//     };

//     // 🆕 Handle View in Goals Section
//     const handleViewGoals = () => {
//         // Navigate to goals page or refresh goals list
//         window.dispatchEvent(new Event('storage'));
//         window.location.href = '/goals'; // Adjust based on your routing
//     };

//     // Edit Form Component
//     const EditGoalForm = () => {
//         if (!editingCard) return null;

//         return (
//             <div className="edit-form-overlay">
//                 <div className="edit-form">
//                     <div className="edit-form-header">
//                         <h3>✏️ Edit Goal</h3>
//                         <span className="auto-fill-notice">✅ Pre-filled with your details</span>
//                         <button 
//                             className="close-btn" 
//                             onClick={() => setShowEditForm(false)}
//                             type="button"
//                         >
//                             <IoCloseSharp />
//                         </button>
//                     </div>
//                     <form onSubmit={handleEditSubmit}>
//                         <div className="form-group">
//                             <label>Goal Title:</label>
//                             <input
//                                 type="text"
//                                 value={editedGoal.title}
//                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, title: e.target.value }))}
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label>Description:</label>
//                             <textarea
//                                 value={editedGoal.description}
//                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, description: e.target.value }))}
//                                 required
//                                 rows="3"
//                             />
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Frequency: <span className="user-detail-badge">Your choice</span></label>
//                                 <select
//                                     value={editedGoal.frequency}
//                                     onChange={(e) => setEditedGoal(prev => ({ ...prev, frequency: e.target.value }))}
//                                 >
//                                     <option value="Daily">Daily</option>
//                                     <option value="Weekly">Weekly</option>
//                                     <option value="Monthly">Monthly</option>
//                                     <option value="5 days/week">5 days/week</option>
//                                     <option value="3 days/week">3 days/week</option>
//                                     <option value="Weekends only">Weekends only</option>
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Reminder Time: <span className="user-detail-badge">Your preference</span></label>
//                                 <input
//                                     type="text"
//                                     value={editedGoal.reminderTime}
//                                     onChange={(e) => setEditedGoal(prev => ({ ...prev, reminderTime: e.target.value }))}
//                                     placeholder="e.g., 6:00 PM"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Duration: <span className="user-detail-badge">Your duration</span></label>
//                                 <input
//                                     type="text"
//                                     value={editedGoal.duration}
//                                     onChange={(e) => setEditedGoal(prev => ({ ...prev, duration: e.target.value }))}
//                                     placeholder="e.g., 30 days, 2 months"
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>End Date:</label>
//                                 <input
//                                     type="text"
//                                     value={calculateEndDate(editedGoal.duration, new Date())}
//                                     disabled
//                                     className="disabled-input"
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label>Tasks: <span className="user-detail-badge">Based on your input</span></label>
//                             <textarea
//                                 value={editedGoal.tasks}
//                                 onChange={(e) => setEditedGoal(prev => ({ ...prev, tasks: e.target.value }))}
//                                 placeholder="Task 1, Task 2, Task 3"
//                                 required
//                                 rows="3"
//                             />
//                         </div>

//                         <div className="form-actions">
//                             <button 
//                                 type="button" 
//                                 onClick={() => setShowEditForm(false)} 
//                                 className="btn-cancel"
//                             >
//                                 Cancel
//                             </button>
//                             <button type="submit" className="btn-save">
//                                 Save Changes
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         );
//     };

//     // 🆕 Congratulations Page Component
//     const CongratulationsPage = () => {
//         return (
//             <div className="congratulations-page">
//                 <div className="congratulations-content">
//                     <div className="success-animation">🎉</div>
//                     <h1>Congratulations!</h1>
//                     <p>Your goal plan has been successfully created and saved!</p>

//                     <div className="saved-goals-preview">
//                         <h3>📋 Your Saved Goals:</h3>
//                         {savedGoals.map((goal, index) => (
//                             <div key={index} className="saved-goal-item">
//                                 <h4>{goal.goalTitle}</h4>
//                                 <p>⏰ {goal.displayReminderTime} | 🔄 {goal.frequency} | 📅 {goal.duration}</p>
//                                 <p className="goal-desc">"{goal.description}"</p>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="congratulations-actions">
//                         <button
//                             onClick={handleViewGoals}
//                             className="btn-view-goals"
//                         >
//                             <FaArrowLeft /> View in Goals Section
//                         </button>
//                         <button 
//                             onClick={handleRestart}
//                             className="btn-new-goal"
//                         >
//                             <FaRocket /> Create New Goal
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // Goal Card Component
//     const GoalCard = ({ card }) => (
//         <div className="schedule-card">
//             <div className="card-header">
//                 <h4>{card.goalTitle}</h4>
//                 <div className="card-actions">
//                     <button
//                         className="edit-btn"
//                         onClick={() => handleEditClick(card)}
//                     >
//                         <FaEdit /> Manual Edit
//                     </button>
//                     <button
//                         className="ai-edit-btn"
//                         onClick={() => handleAIEdit(card)}
//                     >
//                         <FaSyncAlt /> AI Edit
//                     </button>
//                 </div>
//             </div>
            
//             <div className="card-preview">
//                 <div className="card-description">
//                     <p>"{card.description}"</p>
//                 </div>
                
//                 <div className="card-details-grid">
//                     <div className="detail-item">
//                         <FaCalendar className="detail-icon" />
//                         <div>
//                             <span className="detail-label">Duration</span>
//                             <span className="detail-value">{card.duration}</span>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaSyncAlt className="detail-icon" />
//                         <div>
//                             <span className="detail-label">Frequency</span>
//                             <span className="detail-value">{card.frequency}</span>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaClock className="detail-icon" />
//                         <div>
//                             <span className="detail-label">Reminder</span>
//                             <span className="detail-value">{card.displayReminderTime}</span>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaCalendar className="detail-icon" />
//                         <div>
//                             <span className="detail-label">Start Date</span>
//                             <span className="detail-value">{card.startDate}</span>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaCalendar className="detail-icon" />
//                         <div>
//                             <span className="detail-label">End Date</span>
//                             <span className="detail-value">{card.endDate}</span>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div className="tasks-section">
//                     <h5><FaTasks /> Tasks:</h5>
//                     <div className="tasks-list">
//                         {card.tasks.split(', ').map((task, index) => (
//                             <span key={index} className="task-tag">{task.trim()}</span>
//                         ))}
//                     </div>
//                 </div>
//             </div>
            
//             <div className="card-footer">
//                 <button
//                     onClick={handleSaveSchedule}
//                     className="btn-save-goal"
//                     disabled={savingGoals}
//                 >
//                     {savingGoals ? "⏳ Saving..." : <><FaCheck /> Save Goal</>}
//                 </button>
//             </div>
//         </div>
//     );

//     // Show Congratulations Page if satisfied
//     if (showSatisfiedPage) {
//         return <CongratulationsPage />;
//     }

//     // Main Chat Interface
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
//                                         <p className={item.isQuestion ? "question-text" : ""}>{item.message}</p>
//                                         <span className="message-time">{item.timestamp}</span>
//                                     </>
//                                 ) : item.type === 'card' ? (
//                                     <div className="card-message">
//                                         <p>{item.message}</p>
//                                         {item.cards?.map((card) => (
//                                             <GoalCard key={card.id} card={card} />
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
//                                 placeholder={conversationStage === 'collecting_info' ? "Answer the question..." : "Type your message or say 'edit' to make changes..."}
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


// ChatBox.jsx - WORKING FIXED VERSION
import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";
import { IoCloseSharp } from "react-icons/io5";
import { FaCheck, FaEdit, FaSyncAlt, FaCalendar, FaClock, FaTasks, FaArrowLeft, FaRocket } from "react-icons/fa";

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
    
    // 🆕 FIX: Initialize editedGoal with default values
    const [editedGoal, setEditedGoal] = useState({
        title: "",
        description: "",
        frequency: "Daily",
        reminderTime: "6:00 PM",
        duration: "30 days",
        tasks: ""
    });
    
    const [conversationStage, setConversationStage] = useState('greeting');
    const [sessionId] = useState(() => 'session-' + Date.now());
    const [userProvidedDetails, setUserProvidedDetails] = useState({});
    const [savedGoals, setSavedGoals] = useState([]);

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

    // Initialize with greeting
    useEffect(() => {
        if (conversation.length === 0) {
            const greeting = {
                type: 'bot',
                message: "Hello! 👋 I'm your Goal Planning Assistant. I'll help you create a personalized goal plan step by step. What would you like to achieve?",
                timestamp: getCurrentTime(),
                stage: 'greeting'
            };
            setConversation([greeting]);
            setConversationStage('greeting');
        }
    }, []);

    // Calculate end date based on duration
    const calculateEndDate = (duration, startDate = new Date()) => {
        if (!duration) return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const durationMatch = duration.toString().match(/(\d+)\s*(day|month|week)/i);
        if (durationMatch) {
            const num = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            const endDate = new Date(startDate);
            
            if (unit === 'month') endDate.setMonth(endDate.getMonth() + num);
            else if (unit === 'week') endDate.setDate(endDate.getDate() + (num * 7));
            else endDate.setDate(endDate.getDate() + num);
            
            return endDate.toISOString().split('T')[0];
        }
        const defaultEnd = new Date(startDate);
        defaultEnd.setDate(defaultEnd.getDate() + 30);
        return defaultEnd.toISOString().split('T')[0];
    };

    // Process Gemini Response
    const processGeminiResponse = (geminiResponse) => {
        try {
            console.log("🔄 Processing Gemini response:", geminiResponse);
            
            if (!geminiResponse.success) {
                throw new Error(geminiResponse.error || "API request failed");
            }

            const responseData = geminiResponse.data;
            
            setConversationStage(responseData.stage);

            if (responseData.message) {
                const botMessage = {
                    type: 'bot',
                    message: responseData.message,
                    timestamp: getCurrentTime(),
                    stage: responseData.stage,
                    questions: responseData.questions
                };
                setConversation(prev => [...prev, botMessage]);
            }

            if (responseData.goals && Array.isArray(responseData.goals) && responseData.goals.length > 0) {
                console.log("🎯 Processing goals from response");
                
                const goalCards = responseData.goals.map((goal, index) => {
                    const startDate = goal.startDate || new Date().toISOString().split('T')[0];
                    const endDate = goal.endDate || calculateEndDate(goal.duration, new Date(startDate));
                    
                    return {
                        id: Date.now() + index,
                        goalTitle: goal.title || `Goal ${index + 1}`,
                        startDate: startDate,
                        endDate: endDate,
                        description: goal.description || `Work on ${goal.title}`,
                        reminderTime: goal.reminderTime || "6:00 PM",
                        displayReminderTime: goal.reminderTime || "6:00 PM",
                        frequency: goal.frequency || "Daily",
                        tasks: Array.isArray(goal.tasks) ? goal.tasks.join(', ') : goal.tasks || "Practice regularly",
                        duration: goal.duration || "30 days",
                        allowEdit: responseData.allowEdit !== false
                    };
                });

                setScheduleCards(goalCards);
                
                const cardMessage = {
                    type: 'card',
                    message: "🎯 Here's your personalized goal plan:",
                    cards: goalCards,
                    timestamp: getCurrentTime(),
                    stage: 'generating_goal',
                    allowEdit: responseData.allowEdit !== false
                };
                setConversation(prev => [...prev, cardMessage]);
            }

            if (responseData.questions && responseData.questions.length > 0) {
                setTimeout(() => {
                    const questionsMessage = {
                        type: 'bot',
                        message: "💡 " + responseData.questions[0],
                        timestamp: getCurrentTime(),
                        stage: responseData.stage,
                        isQuestion: true
                    };
                    setConversation(prev => [...prev, questionsMessage]);
                }, 500);
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

    // Handle User Message Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentTime = getCurrentTime();
        const userInput = input.trim();

        const userMessage = {
            type: 'user',
            message: userInput,
            timestamp: currentTime
        };

        setConversation(prev => [...prev, userMessage]);
        setInput("");
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const conversationHistory = conversation
                .filter(msg => msg.type === 'user' || msg.type === 'bot')
                .slice(-10)
                .map(msg => ({
                    role: msg.type === 'user' ? 'user' : 'assistant',
                    content: msg.message
                }));

            const requestBody = {
                userInput: userInput,
                conversationHistory: conversationHistory,
                hasExistingGoals: scheduleCards.length > 0,
                sessionId: sessionId
            };

            const response = await fetch('http://localhost:5000/api/gemini/analyze-goals', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const geminiResponse = await response.json();
            processGeminiResponse(geminiResponse);

        } catch (error) {
            console.error("❌ Error in handleSubmit:", error);
            setErrorMsg("Connection error. Please try again.");
            
            const errorMessage = {
                type: 'bot',
                message: "Sorry, I'm having connection issues. Please try again.",
                timestamp: getCurrentTime()
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle AI Edit Request
    const handleAIEdit = (card) => {
        const editMessage = {
            type: 'user',
            message: `I want to edit: ${card.goalTitle}`,
            timestamp: getCurrentTime()
        };
        
        setConversation(prev => [...prev, editMessage]);
        setInput(`edit ${card.goalTitle}`);
        
        setTimeout(() => {
            handleSubmit({ preventDefault: () => {} });
        }, 100);
    };

    // Handle Manual Edit
    const handleEditClick = (card) => {
        console.log("🔄 Opening edit form for:", card);
        
        setEditingCard(card);
        setEditedGoal({
            title: card.goalTitle || "",
            description: card.description || "",
            frequency: card.frequency || "Daily",
            reminderTime: card.displayReminderTime || "6:00 PM",
            duration: card.duration || "30 days",
            tasks: card.tasks || ""
        });
        setShowEditForm(true);
    };

    // Handle Edit Form Submit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        console.log("✅ Submitting edit form:", editedGoal);

        if (!editingCard) {
            console.error("❌ No editing card found");
            return;
        }

        const updatedCards = scheduleCards.map(card =>
            card.id === editingCard.id
                ? {
                    ...card,
                    goalTitle: editedGoal.title,
                    description: editedGoal.description,
                    frequency: editedGoal.frequency,
                    reminderTime: editedGoal.reminderTime,
                    displayReminderTime: editedGoal.reminderTime,
                    duration: editedGoal.duration,
                    tasks: editedGoal.tasks,
                    endDate: calculateEndDate(editedGoal.duration, new Date(card.startDate))
                }
                : card
        );

        console.log("🔄 Updated cards:", updatedCards);
        setScheduleCards(updatedCards);
        setShowEditForm(false);
        setEditingCard(null);

        const successMessage = {
            type: 'bot',
            message: `✅ Goal updated successfully! 
• Title: ${editedGoal.title}
• Frequency: ${editedGoal.frequency}
• Duration: ${editedGoal.duration}
• Reminder: ${editedGoal.reminderTime}

Your changes have been applied. Click "Save Goal" when ready.`,
            timestamp: getCurrentTime()
        };
        setConversation(prev => [...prev, successMessage]);
    };

    // Save Goals to Backend
    const handleSaveSchedule = async () => {
        if (scheduleCards.length === 0) {
            setErrorMsg("No goals to save. Please create some goals first.");
            return;
        }

        setSavingGoals(true);
        try {
            console.log("💾 Saving goals:", scheduleCards);
            
            // Save to localStorage directly (simplified approach)
            const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            
            const newGoals = scheduleCards.map(goal => {
                return {
                    _id: 'chatbot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                    title: goal.goalTitle,
                    description: goal.description,
                    duration: goal.duration,
                    date: goal.startDate,
                    deadline: goal.endDate,
                    reminderTime: new Date().toISOString(),
                    displayReminderTime: goal.displayReminderTime,
                    isRecurring: true,
                    frequency: goal.frequency,
                    tasks: goal.tasks,
                    status: "pending",
                    source: "chatbot",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });

            const allGoals = [...existingGoals, ...newGoals];
            localStorage.setItem('goals', JSON.stringify(allGoals));
            
            setSavedGoals(scheduleCards);
            
            const successMessage = {
                type: 'bot',
                message: "✅ Your goals have been saved successfully! Redirecting to congratulations page...",
                timestamp: getCurrentTime()
            };
            setConversation(prev => [...prev, successMessage]);
            
            // Show congratulations page after delay
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

    // Handle Restart - Create New Goal
    const handleRestart = () => {
        setConversation([]);
        setInput("");
        setScheduleCards([]);
        setErrorMsg(null);
        setShowSatisfiedPage(false);
        setShowEditForm(false);
        setEditingCard(null);
        setSavingGoals(false);
        setConversationStage('greeting');
        setSavedGoals([]);
    };

    // Handle View in Goals Section
    const handleViewGoals = () => {
        window.dispatchEvent(new Event('storage'));
        // Adjust based on your routing
        if (window.location.pathname.includes('/goals')) {
            window.location.reload();
        } else {
            window.location.href = '/goals';
        }
    };

    // Edit Form Component
    const EditGoalForm = () => {
        if (!editingCard) return null;

        return (
            <div className="edit-form-overlay">
                <div className="edit-form">
                    <div className="edit-form-header">
                        <h3>✏️ Edit Goal</h3>
                        <button 
                            className="close-btn" 
                            onClick={() => setShowEditForm(false)}
                            type="button"
                        >
                            <IoCloseSharp />
                        </button>
                    </div>
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
                                rows="3"
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
                                    <option value="5 days/week">5 days/week</option>
                                    <option value="3 days/week">3 days/week</option>
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

                        <div className="form-row">
                            <div className="form-group">
                                <label>Duration:</label>
                                <input
                                    type="text"
                                    value={editedGoal.duration}
                                    onChange={(e) => setEditedGoal(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="e.g., 30 days, 2 months"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date:</label>
                                <input
                                    type="text"
                                    value={calculateEndDate(editedGoal.duration, new Date())}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tasks (comma separated):</label>
                            <textarea
                                value={editedGoal.tasks}
                                onChange={(e) => setEditedGoal(prev => ({ ...prev, tasks: e.target.value }))}
                                placeholder="Task 1, Task 2, Task 3"
                                required
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                onClick={() => setShowEditForm(false)} 
                                className="btn-cancel"
                            >
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
    };

    // Congratulations Page Component
    const CongratulationsPage = () => {
        return (
            <div className="congratulations-page">
                <div className="congratulations-content">
                    <div className="success-animation">🎉</div>
                    <h1>Congratulations!</h1>
                    <p>Your goal plan has been successfully created and saved!</p>

                    <div className="saved-goals-preview">
                        <h3>📋 Your Saved Goals:</h3>
                        {savedGoals.map((goal, index) => (
                            <div key={index} className="saved-goal-item">
                                <h4>{goal.goalTitle}</h4>
                                <p>⏰ {goal.displayReminderTime} | 🔄 {goal.frequency} | 📅 {goal.duration}</p>
                                <p className="goal-desc">"{goal.description}"</p>
                            </div>
                        ))}
                    </div>

                    <div className="congratulations-actions">
                        <button
                            onClick={handleViewGoals}
                            className="btn-view-goals"
                        >
                            <FaArrowLeft /> View in Goals Section
                        </button>
                        <button 
                            onClick={handleRestart}
                            className="btn-new-goal"
                        >
                            <FaRocket /> Create New Goal
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Goal Card Component
    const GoalCard = ({ card }) => (
        <div className="schedule-card">
            <div className="card-header">
                <h4>{card.goalTitle}</h4>
                <div className="card-actions">
                    <button
                        className="edit-btn"
                        onClick={() => handleEditClick(card)}
                    >
                        <FaEdit /> Edit
                    </button>
                    <button
                        className="ai-edit-btn"
                        onClick={() => handleAIEdit(card)}
                    >
                        <FaSyncAlt /> AI Edit
                    </button>
                </div>
            </div>
            
            <div className="card-preview">
                <div className="card-description">
                    <p>"{card.description}"</p>
                </div>
                
                <div className="card-details-grid">
                    <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                            <span className="detail-label">Duration</span>
                            <span className="detail-value">{card.duration}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FaSyncAlt className="detail-icon" />
                        <div>
                            <span className="detail-label">Frequency</span>
                            <span className="detail-value">{card.frequency}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <div>
                            <span className="detail-label">Reminder</span>
                            <span className="detail-value">{card.displayReminderTime}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                            <span className="detail-label">Start Date</span>
                            <span className="detail-value">{card.startDate}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                            <span className="detail-label">End Date</span>
                            <span className="detail-value">{card.endDate}</span>
                        </div>
                    </div>
                </div>
                
                <div className="tasks-section">
                    <h5><FaTasks /> Tasks:</h5>
                    <div className="tasks-list">
                        {card.tasks.split(', ').map((task, index) => (
                            <span key={index} className="task-tag">{task.trim()}</span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="card-footer">
                <button
                    onClick={handleSaveSchedule}
                    className="btn-save-goal"
                    disabled={savingGoals}
                >
                    {savingGoals ? "⏳ Saving..." : <><FaCheck /> Save Goal</>}
                </button>
            </div>
        </div>
    );

    // Show Congratulations Page if satisfied
    if (showSatisfiedPage) {
        return <CongratulationsPage />;
    }

    // Main Chat Interface
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
                                        <p className={item.isQuestion ? "question-text" : ""}>{item.message}</p>
                                        <span className="message-time">{item.timestamp}</span>
                                    </>
                                ) : item.type === 'card' ? (
                                    <div className="card-message">
                                        <p>{item.message}</p>
                                        {item.cards?.map((card) => (
                                            <GoalCard key={card.id} card={card} />
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