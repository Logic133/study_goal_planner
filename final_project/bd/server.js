// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import otpRoutes from "./routes/auth.js";
import { auth } from "./middleware/authMiddleware.js";
import fetch from "node-fetch";
import Goal from "./models/Goal.js";
import goalReminderScheduler from "./services/goalReminderScheduler.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import path from "path";
import { fileURLToPath } from 'url';

// ✅ FIX DOTENV LOADING - Add this at the VERY TOP
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ✅ EXPLICITLY LOAD .env FILE
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("🔍 Environment Check:");
console.log("📁 Current directory:", __dirname);
console.log("🔑 GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("🔑 GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length);
console.log("📦 All env variables:", Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('MONGO')));


// Server startup pe add karo
console.log("🔐 Gemini API Key Check:");
console.log("Key exists:", !!process.env.GEMINI_API_KEY);
console.log("Key length:", process.env.GEMINI_API_KEY?.length);
console.log("Key starts with:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");

// ✅ ALTERNATIVE: Manual check and load
if (!process.env.GEMINI_API_KEY) {
  console.log("⚠️ GEMINI_API_KEY not found, trying manual load...");
  
  // Try different .env file paths
  const envPaths = [
    '.env',
    path.join(__dirname, '.env'),
    path.join(process.cwd(), '.env')
  ];
  
  for (const envPath of envPaths) {
    try {
      const result = dotenv.config({ path: envPath });
      if (result.parsed && result.parsed.GEMINI_API_KEY) {
        console.log(`✅ Loaded .env from: ${envPath}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Failed to load from: ${envPath}`);
    }
  }
}

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL: GEMINI_API_KEY still missing after all attempts!");
  console.log("💡 Check .env file exists at:", path.join(__dirname, '.env'));
  console.log("💡 Current .env file content should be:");
  console.log("GEMINI_API_KEY=AIzaSyBHD_7E4ou-FB4vy1YvoaI7Y7uFrTwV7RA");
  console.log("PORT=5000");
  console.log("MONGO_URI=mongodb://127.0.0.1:27017/studyplanner");
  console.log("JWT_SECRET=jhgdjgksdjakhdksd");
  
  // Emergency fallback - Remove this in production
  console.log("🚨 USING EMERGENCY FALLBACK - Fix .env file properly");
  process.env.GEMINI_API_KEY = "AIzaSyBHD_7E4ou-FB4vy1YvoaI7Y7uFrTwV7RA";
} else {
  console.log("✅ SUCCESS: GEMINI_API_KEY loaded properly!");
}

// ✅ Connect MongoDB
connectDB();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- BASIC ROUTES ---------------- //

app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "✅ Backend server is running!",
    timestamp: new Date().toISOString(),
    database: "MongoDB Connected",
    endpoints: {
      health: "GET /api/health",
      test: "GET /api/test", 
      auth: "POST /api/auth/*",
      goals: "GET/POST /api/goals/*",
      reminders: "GET/POST /api/reminders/*",
      otp: "POST /api/otp/*",
      chatbot_goals: "POST /api/chatbot-goals",
      test_reminders: "GET /api/test-reminders",
      gemini_analyze: "POST /api/gemini/analyze-goals"
    }
  });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Backend working with MongoDB + Gemini + OTP + Recurring Goals + Reminders" 
  });
});

// ---------------- GEMINI API ---------------- //
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables");
} else {
  console.log("✅ Gemini API Key loaded successfully");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ IMPROVED GEMINI ANALYZE GOALS ENDPOINT - Natural Conversation Flow

// ✅ FIXED GEMINI ANALYZE GOALS ENDPOINT - Correct Model
// ✅ WORKING GEMINI ANALYZE GOALS ENDPOINT 
// ✅ WORKING GEMINI ENDPOINT - With Available Models
// server.js - IMPROVED GEMINI PROMPT VERSION
// Server.js - QUICK FIX: Add this RIGHT AFTER the userInput check
// app.post("/api/gemini/analyze-goals", async (req, res) => {
//   try {
//     const { userInput, conversationHistory, hasExistingGoals } = req.body;

//     console.log("🎯 USER INPUT:", userInput);

//     if (!userInput || userInput.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "User input is required"
//       });
//     }

//     const userInputLower = userInput.toLowerCase().trim();

//     // 🎯 CRITICAL FIX: DIRECT GOAL DETECTION BEFORE GEMINI CALL
//     if (userInputLower.includes('web development') || 
//         userInputLower.includes('exercise') || 
//         userInputLower.includes('fitness') ||
//         userInputLower.includes('yoga') ||
//         userInputLower.includes('meditation') ||
//         userInputLower.includes('reading') ||
//         userInputLower.includes('study') ||
//         userInputLower.includes('learn')) {
      
//       console.log("🎯 DETECTED GOAL REQUEST:", userInputLower);
      
//       let goalData;
      
//       if (userInputLower.includes('web development')) {
//         goalData = {
//           title: userInputLower.includes('learn') ? "Learn Web Development" : "Web Development",
//           description: "Master web development skills and build modern websites",
//           frequency: "Daily",
//           duration: "60 days",
//           reminderTime: "4:00 PM",
//           tasks: ["Learn HTML/CSS", "Practice JavaScript", "Build projects", "Study frameworks"]
//         };
//       }
//       else if (userInputLower.includes('exercise') || userInputLower.includes('fitness')) {
//         goalData = {
//           title: "Exercise Routine",
//           description: "Build consistent exercise habits for better health",
//           frequency: "Daily", 
//           duration: "30 days",
//           reminderTime: "6:00 AM",
//           tasks: ["30-minute workout", "Stretching exercises", "Track progress", "Stay hydrated"]
//         };
//       }
//       else if (userInputLower.includes('yoga')) {
//         goalData = {
//           title: "Yoga Practice",
//           description: "Develop a consistent yoga practice for mind-body wellness",
//           frequency: "Daily",
//           duration: "21 days",
//           reminderTime: "7:00 AM",
//           tasks: ["Morning stretches", "Breathing exercises", "Yoga poses", "Meditation"]
//         };
//       }
//       else if (userInputLower.includes('reading')) {
//         goalData = {
//           title: "Reading Habit", 
//           description: "Develop a consistent reading habit and expand knowledge",
//           frequency: "Daily",
//           duration: "30 days",
//           reminderTime: "8:00 PM", 
//           tasks: ["Read 30 minutes daily", "Maintain reading log", "Explore genres", "Share insights"]
//         };
//       }
//       else if (userInputLower.includes('learn') || userInputLower.includes('study')) {
//         const subject = userInput.replace(/learn|study/gi, '').trim() || 'Programming';
//         goalData = {
//           title: `Learn ${subject}`,
//           description: `Master ${subject} through consistent practice`,
//           frequency: "Daily",
//           duration: "45 days",
//           reminderTime: "5:00 PM",
//           tasks: ["Study concepts", "Practice exercises", "Build projects", "Review progress"]
//         };
//       }

//       if (goalData) {
//         console.log("✅ SENDING DIRECT GOAL RESPONSE:", goalData.title);
//         return res.json({
//           success: true,
//           data: {
//             goals: [goalData],
//             successMessage: `🎉 Great! Your ${goalData.title.toLowerCase()} plan is ready!`,
//             followUpQuestion: "Ready to get started? You can modify any details."
//           },
//           direct: true
//         });
//       }
//     }

//     // 🎯 Handle greetings and simple responses
//     if (userInputLower === 'hlo' || userInputLower === 'hi' || userInputLower === 'hello') {
//       return res.json({
//         success: true,
//         data: {
//           message: "Hello! 👋 I'm your Goal Planning Assistant. I'd love to help you create a goal plan! What would you like to achieve today?"
//         }
//       });
//     }

//     // 🎯 Handle "ok" responses
//     if (userInputLower === 'ok' || userInputLower === 'okay' || userInputLower === 'sure') {
//       return res.json({
//         success: true,
//         data: {
//           message: "Great! What would you like to work on next? I can help with learning goals, fitness plans, or anything else!"
//         }
//       });
//     }

//     // 🎯 Handle "great" responses  
//     if (userInputLower === 'great' || userInputLower === 'good' || userInputLower === 'fine') {
//       return res.json({
//         success: true, 
//         data: {
//           message: "That's wonderful! 😊 What goals would you like to work on? I can help you create plans for learning, fitness, career development, or anything else!"
//         }
//       });
//     }

//     // 🚨 TEMPORARILY SKIP GEMINI API - Use direct responses for everything
//     console.log("🚨 USING DIRECT RESPONSE FOR:", userInput);
//     return res.json({
//       success: true,
//       data: {
//         message: `I'd love to help you with "${userInput}"! Tell me specifically what you want to achieve - like 'web development', 'exercise daily', 'learn programming', or 'yoga practice'.`
//       }
//     });

//     // COMMENT OUT THE REST OF THE GEMINI API CODE TEMPORARILY
//     // ... (keep the existing code but commented for now)

//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.json({
//       success: true,
//       data: {
//         message: "I'm here to help you create amazing goal plans! What would you like to achieve today?"
//       }
//     });
//   }
// });


// Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Existing generate-goal endpoint (unchanged)
// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// // 🎯 BEST MODEL
// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// // Store conversation context temporarily (in production use Redis)
// let conversationContext = new Map();

// app.post("/api/gemini/analyze-goals", async (req, res) => {
//   try {
//     const { userInput, conversationHistory, hasExistingGoals, sessionId = 'default' } = req.body;

//     console.log("🎯 USER INPUT:", userInput);
//     console.log("📝 CONVERSATION HISTORY LENGTH:", conversationHistory?.length);

//     // Get or create conversation context
//     if (!conversationContext.has(sessionId)) {
//       conversationContext.set(sessionId, {
//         stage: 'greeting',
//         collectedData: {},
//         pendingQuestions: [],
//         currentGoal: null
//       });
//     }

//     const context = conversationContext.get(sessionId);

//     // Check if user wants to edit existing goal
//     const userInputLower = userInput.toLowerCase();
//     const isEditRequest = userInputLower.includes('edit') || 
//                          userInputLower.includes('change') || 
//                          userInputLower.includes('modify') ||
//                          userInputLower.includes('update');

//     const prompt = {
//       contents: [{
//         parts: [{
//           text: `You are an expert Goal Planning Assistant. Manage conversation flow and handle edits.

// CONVERSATION CONTEXT:
// - Current Stage: ${context.stage}
// - Collected Data: ${JSON.stringify(context.collectedData)}
// - Current Goal: ${context.currentGoal ? JSON.stringify(context.currentGoal) : 'None'}
// - Is Edit Request: ${isEditRequest}

// USER'S MESSAGE: "${userInput}"

// CONVERSATION HISTORY:
// ${conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'No history'}

// YOUR TASK:
// 1. If user says "edit" or wants changes, go to editing stage
// 2. In editing stage, ask what specific part they want to change
// 3. After editing, regenerate the complete goal with ALL details
// 4. Always include ALL these fields in goals:
//    - title, description, frequency, reminderTime, duration, tasks
//    - Calculate endDate based on duration from current date

// RESPONSE FORMAT (STRICT JSON):
// {
//   "stage": "greeting|collecting_info|generating_goal|editing",
//   "message": "Your response message",
//   "questions": ["question1"],
//   "collectedData": {
//     "goalType": "",
//     "duration": "",
//     "frequency": "", 
//     "reminderTime": "",
//     "specificTasks": "",
//     "editField": "" // For editing: which field to edit
//   },
//   "goals": [{
//     "title": "Complete goal title",
//     "description": "Detailed goal description", 
//     "frequency": "Daily/Weekly/Monthly",
//     "reminderTime": "6:00 PM",
//     "duration": "30 days/2 months/3 months",
//     "tasks": ["task1", "task2", "task3", "task4"],
//     "startDate": "${new Date().toISOString().split('T')[0]}",
//     "endDate": "calculated based on duration"
//   }],
//   "allowEdit": true,
//   "nextStep": "What to expect next",
//   "isEdit": true/false
// }

// CALCULATE END DATE:
// - If duration is "30 days" → endDate = today + 30 days
// - If duration is "2 months" → endDate = today + 60 days  
// - If duration is "3 months" → endDate = today + 90 days

// EDITING EXAMPLES:

// User: "edit duration to 3 months"
// Response: {
//   "stage": "generating_goal",
//   "message": "✅ Duration updated to 3 months! Here's your revised goal plan:",
//   "questions": [],
//   "collectedData": {
//     "goalType": "learn programming",
//     "duration": "3 months",
//     "frequency": "5 days/week",
//     "reminderTime": "6:00 PM", 
//     "specificTasks": "web development"
//   },
//   "goals": [{
//     "title": "Learn Web Development with JavaScript",
//     "description": "Master web development fundamentals and JavaScript programming over 3 months",
//     "frequency": "5 days/week",
//     "reminderTime": "6:00 PM",
//     "duration": "3 months", 
//     "tasks": ["Learn HTML/CSS", "JavaScript basics", "Build projects", "Study frameworks"],
//     "startDate": "${new Date().toISOString().split('T')[0]}",
//     "endDate": "${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
//   }],
//   "allowEdit": true,
//   "nextStep": "ready_to_save",
//   "isEdit": true
// }

// User: "change frequency to daily"
// Response: {
//   "stage": "generating_goal", 
//   "message": "✅ Frequency updated to daily practice! Here's your revised plan:",
//   "questions": [],
//   "collectedData": {
//     "goalType": "learn programming",
//     "duration": "2 months",
//     "frequency": "daily",
//     "reminderTime": "6:00 PM",
//     "specificTasks": "web development"
//   },
//   "goals": [{
//     "title": "Learn Web Development - Daily Practice",
//     "description": "Master web development through daily practice over 2 months", 
//     "frequency": "daily",
//     "reminderTime": "6:00 PM",
//     "duration": "2 months",
//     "tasks": ["Daily coding practice", "HTML/CSS projects", "JavaScript exercises", "Weekly projects"],
//     "startDate": "${new Date().toISOString().split('T')[0]}",
//     "endDate": "${new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
//   }],
//   "allowEdit": true,
//   "nextStep": "ready_to_save", 
//   "isEdit": true
// }

// Now respond to the current message.`
//         }]
//       }],
//       generationConfig: {
//         temperature: 0.7,
//         maxOutputTokens: 1024,
//       }
//     };

//     console.log("📤 Calling Gemini...");
    
//     const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(prompt),
//     });

//     if (!response.ok) {
//       throw new Error(`Gemini API error: ${response.status}`);
//     }

//     const data = await response.json();
    
//     if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
//       throw new Error("No response from Gemini API");
//     }

//     const rawText = data.candidates[0].content.parts[0].text;
//     console.log("📥 Raw Response:", rawText);

//     // Extract JSON
//     const jsonMatch = rawText.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       const geminiData = JSON.parse(jsonMatch[0]);
      
//       // Update conversation context
//       context.stage = geminiData.stage;
//       context.collectedData = { ...context.collectedData, ...geminiData.collectedData };
//       context.pendingQuestions = geminiData.questions || [];
      
//       if (geminiData.goals && geminiData.goals.length > 0) {
//         context.currentGoal = geminiData.goals[0];
//       }
      
//       conversationContext.set(sessionId, context);

//       return res.json({
//         success: true,
//         data: geminiData,
//         context: context
//       });
//     }

//     throw new Error("No JSON in response");

//   } catch (error) {
//     console.error("❌ Gemini Error:", error);
    
//     return res.json({
//       success: true,
//       data: {
//         stage: "collecting_info",
//         message: "Hello! 👋 I'm your Goal Planning Assistant. What would you like to achieve?",
//         questions: ["What type of goal are you interested in?"],
//         collectedData: {},
//         goals: [],
//         allowEdit: false,
//         nextStep: "waiting_for_goal_type"
//       },
//       fallback: true
//     });
//   }
// });

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

let conversationContext = new Map();

// 🆕 Save goals to database/localStorage
app.post("/api/save-goals", async (req, res) => {
  try {
    const { goals, sessionId } = req.body;
    
    console.log("💾 Saving goals:", goals);

    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({
        success: false,
        message: "No goals provided"
      });
    }

    // Save to localStorage (or your database)
    const savedGoals = saveGoalsToStorage(goals);
    
    // Clear conversation context after saving
    if (sessionId) {
      conversationContext.delete(sessionId);
    }

    res.json({
      success: true,
      message: "Goals saved successfully!",
      savedGoals: savedGoals
    });

  } catch (error) {
    console.error("❌ Error saving goals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save goals"
    });
  }
});

function saveGoalsToStorage(goals) {
  try {
    const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    const newGoals = goals.map(goal => {
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
    
    console.log("✅ Goals saved to localStorage:", newGoals.length);
    return newGoals;
  } catch (error) {
    console.error("❌ Error saving to storage:", error);
    throw error;
  }
}

app.post("/api/gemini/analyze-goals", async (req, res) => {
  try {
    const { userInput, conversationHistory, hasExistingGoals, sessionId = 'default' } = req.body;

    console.log("🎯 USER INPUT:", userInput);

    if (!conversationContext.has(sessionId)) {
      conversationContext.set(sessionId, {
        stage: 'greeting',
        collectedData: {},
        pendingQuestions: [],
        currentGoal: null,
        userProvidedDetails: {} // 🆕 Store all user provided details
      });
    }

    const context = conversationContext.get(sessionId);

    // 🆕 Extract user details from conversation
    const userDetails = extractUserDetails(userInput, conversationHistory);
    if (Object.keys(userDetails).length > 0) {
      context.userProvidedDetails = { ...context.userProvidedDetails, ...userDetails };
    }

    const prompt = {
      contents: [{
        parts: [{
          text: `You are an expert Goal Planning Assistant. Create goals using ALL user-provided details.

USER PROVIDED DETAILS: ${JSON.stringify(context.userProvidedDetails)}

CONVERSATION CONTEXT:
- Current Stage: ${context.stage}
- Collected Data: ${JSON.stringify(context.collectedData)}
- Current Goal: ${context.currentGoal ? JSON.stringify(context.currentGoal) : 'None'}

USER'S MESSAGE: "${userInput}"

CONVERSATION HISTORY:
${conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'No history'}

CRITICAL: You MUST use ALL user-provided details in the goal. Do NOT ignore any information.

RESPONSE FORMAT (STRICT JSON):
{
  "stage": "greeting|collecting_info|generating_goal|editing",
  "message": "Your response message",
  "questions": ["question1"],
  "collectedData": {
    "goalType": "",
    "duration": "",
    "frequency": "", 
    "reminderTime": "",
    "specificTasks": ""
  },
  "goals": [{
    "title": "MUST USE user details in title",
    "description": "MUST INCLUDE all user specifics",
    "frequency": "MUST USE user frequency",
    "reminderTime": "MUST USE user time preference", 
    "duration": "MUST USE user duration",
    "tasks": ["Specific tasks based on user input"],
    "startDate": "${new Date().toISOString().split('T')[0]}",
    "endDate": "calculated based on duration"
  }],
  "allowEdit": true,
  "nextStep": "What to expect next",
  "userProvidedDetails": ${JSON.stringify(context.userProvidedDetails)} // 🆕 Send back to frontend
}

EXAMPLES:

User provides: "learn web development, 5 days a week, 2 months, evening time"
Goals MUST be: {
  "title": "2-Month Web Development Intensive (5 days/week)",
  "description": "Learn web development through structured evening sessions over 2 months",
  "frequency": "5 days per week",
  "reminderTime": "6:00 PM",
  "duration": "2 months",
  "tasks": ["HTML/CSS fundamentals", "JavaScript programming", "Project building", "Evening practice sessions"]
}

User provides: "fitness, daily, 30 days, morning, cardio and strength"
Goals MUST be: {
  "title": "30-Day Daily Fitness Challenge", 
  "description": "Daily morning fitness routine focusing on cardio and strength training",
  "frequency": "daily",
  "reminderTime": "7:00 AM",
  "duration": "30 days",
  "tasks": ["Morning cardio sessions", "Strength training", "Daily progress tracking", "Cardio exercises"]
}

Now create goals using ALL user details.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    };

    console.log("📤 Calling Gemini with user details...");
    
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No response from Gemini API");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    console.log("📥 Raw Response:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const geminiData = JSON.parse(jsonMatch[0]);
      
      // Update context with user details
      context.stage = geminiData.stage;
      context.collectedData = { ...context.collectedData, ...geminiData.collectedData };
      context.pendingQuestions = geminiData.questions || [];
      context.userProvidedDetails = { ...context.userProvidedDetails, ...geminiData.userProvidedDetails };
      
      if (geminiData.goals && geminiData.goals.length > 0) {
        context.currentGoal = geminiData.goals[0];
      }
      
      conversationContext.set(sessionId, context);

      return res.json({
        success: true,
        data: geminiData,
        context: context
      });
    }

    throw new Error("No JSON in response");

  } catch (error) {
    console.error("❌ Gemini Error:", error);
    
    return res.json({
      success: true,
      data: {
        stage: "collecting_info",
        message: "Hello! 👋 Let's create your goal plan!",
        questions: ["What would you like to achieve?"],
        collectedData: {},
        goals: [],
        allowEdit: true,
        userProvidedDetails: {}
      },
      fallback: true
    });
  }
});

// 🆕 Function to extract user details from conversation
function extractUserDetails(userInput, conversationHistory) {
  const details = {};
  const input = userInput.toLowerCase();
  
  // Extract duration
  if (input.match(/\b(\d+)\s*(day|week|month)s?\b/i)) {
    const match = input.match(/\b(\d+)\s*(day|week|month)s?\b/i);
    details.duration = `${match[1]} ${match[2]}${match[1] > 1 ? 's' : ''}`;
  }
  
  // Extract frequency
  if (input.includes('daily') || input.includes('every day')) {
    details.frequency = 'daily';
  } else if (input.includes('weekly') || input.includes('week')) {
    details.frequency = 'weekly';
  } else if (input.match(/\b(\d+)\s*days?\s*\/?\s*week/i)) {
    const match = input.match(/\b(\d+)\s*days?\s*\/?\s*week/i);
    details.frequency = `${match[1]} days/week`;
  }
  
  // Extract time preference
  if (input.includes('morning')) {
    details.reminderTime = '7:00 AM';
  } else if (input.includes('evening') || input.includes('night')) {
    details.reminderTime = '6:00 PM';
  } else if (input.includes('afternoon')) {
    details.reminderTime = '3:00 PM';
  }
  
  // Extract goal type
  if (input.includes('web') || input.includes('programming') || input.includes('coding')) {
    details.goalType = 'web development';
  } else if (input.includes('fitness') || input.includes('exercise') || input.includes('gym')) {
    details.goalType = 'fitness';
  } else if (input.includes('study') || input.includes('learn')) {
    details.goalType = 'learning';
  }
  
  // Extract specific tasks
  if (input.includes('javascript') || input.includes('html') || input.includes('css')) {
    details.specificTasks = 'web development technologies';
  } else if (input.includes('cardio') || input.includes('strength') || input.includes('yoga')) {
    details.specificTasks = input.match(/(cardio|strength|yoga|meditation)/gi)?.join(', ') || 'fitness exercises';
  }
  
  return details;
}

// 🆕 Get user details endpoint for frontend
app.get("/api/user-details/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const context = conversationContext.get(sessionId);
  
  if (context && context.userProvidedDetails) {
    res.json({
      success: true,
      userDetails: context.userProvidedDetails
    });
  } else {
    res.json({
      success: false,
      userDetails: {}
    });
  }
});
// Clear context endpoint (optional)
app.post("/api/clear-context", (req, res) => {
  const { sessionId = 'default' } = req.body;
  conversationContext.delete(sessionId);
  res.json({ success: true, message: "Context cleared" });
});

// 🎯 BEST MODEL FOR GOAL PLANNING
// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// app.post("/api/gemini/analyze-goals", async (req, res) => {
//   try {
//     const { userInput, conversationHistory, hasExistingGoals } = req.body;

//     console.log("🎯 USER INPUT:", userInput);
//     console.log("🤖 USING: Gemini 2.0 Flash");

//     const prompt = {
//       contents: [{
//         parts: [{
//           text: `You are an expert Goal Planning Assistant. Analyze the user message and create goal plans.

// USER: "${userInput}"
// CONVERSATION: ${JSON.stringify(conversationHistory || [])}
// EXISTING GOALS: ${hasExistingGoals ? 'Yes' : 'No'}

// Respond in EXACT JSON format:
// {
//   "message": "Your response message",
//   "goals": [
//     {
//       "title": "Goal title",
//       "description": "Goal description",
//       "frequency": "Daily/Weekly/Monthly", 
//       "reminderTime": "6:00 PM",
//       "duration": "30 days",
//       "tasks": ["task1", "task2", "task3"]
//     }
//   ],
//   "successMessage": "Optional success message",
//   "followUpQuestion": "Optional follow-up question"
// }

// Be helpful, friendly and create practical goal plans.`
//         }]
//       }],
//       generationConfig: {
//         temperature: 0.7,
//         maxOutputTokens: 1024,
//       }
//     };

//     console.log("📤 Calling Gemini 2.0 Flash...");
    
//     const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(prompt),
//     });

//     if (!response.ok) {
//       throw new Error(`Gemini API error: ${response.status}`);
//     }

//     const data = await response.json();
    
//     if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
//       throw new Error("No response from Gemini API");
//     }

//     const rawText = data.candidates[0].content.parts[0].text;
//     console.log("📥 Raw Response:", rawText);

//     // Extract JSON
//     const jsonMatch = rawText.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       const geminiData = JSON.parse(jsonMatch[0]);
      
//       return res.json({
//         success: true,
//         data: geminiData,
//         model: "gemini-2.0-flash"
//       });
//     }

//     throw new Error("No JSON in response");

//   } catch (error) {
//     console.error("❌ Gemini Error:", error);
    
//     // Fallback to direct response
//     const userInputLower = (userInput || '').toLowerCase();
    
//     let responseData = {
//       message: "I'd love to help you create amazing goals!",
//       goals: [],
//       followUpQuestion: "What specific area would you like to work on?"
//     };

//     // Your existing fallback logic here...
    
//     return res.json({
//       success: true,
//       data: responseData,
//       fallback: true
//     });
//   }
// });

// Your other routes...
app.post("/api/generate-goal", async (req, res) => {
  // Use the same model for consistency
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  
  // Your existing generate-goal code with this model
});

// Your existing generate-goal endpoint (keep as is)
app.post("/api/generate-goal", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ success: false, message: "No answers provided" });
    }

    const formatted = answers.map((a) => `Q${a.question_id}: ${a.answer}`).join("\n");

    const prompt = {
      contents: [{
        parts: [{
          text: `You are an expert goal planner.

Based on the following answers from a user (who wants to achieve a goal in the category "${answers[0]?.category || "Other"}"):\n
${formatted}\n

✅ Generate ONLY ONE combined goal object that merges all answers into a single actionable goal.

The JSON should have exactly this structure:
[
  {
    "goal": "Clear and concise single goal statement",
    "description": ["Step 1", "Step 2", "Step 3"],
    "category": "Career | Fitness | Relationship | Learning | Finance | Other",
    "deadline": "YYYY-MM-DD"
  }
]

Rules:
1. Do not return multiple goal objects.
2. Do not include explanations, greetings, or extra text.
3. If answers are irrelevant, return exactly:
{
  "success": false,
  "message": "Invalid answer",
  "hint": "Provide a more detailed and relevant response"
}`
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ success: false, message: "No response from Gemini API" });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    
    // Use the same JSON extraction function
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    if (!Array.isArray(parsed) && parsed.success === false) {
      return res.json(parsed);
    }

    res.json({ success: true, goals: parsed });
  } catch (error) {
    console.error("❌ /api/generate-goal error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

function extractJson(rawText) {
  const clean = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("❌ Failed to parse Gemini JSON:", err.message);
    return [];
  }
}

app.post("/api/generate-goal", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ success: false, message: "No answers provided" });
    }

    const formatted = answers.map((a) => `Q${a.question_id}: ${a.answer}`).join("\n");

    const prompt = `You are an expert goal planner.

Based on the following answers from a user (who wants to achieve a goal in the category "${answers[0]?.category || "Other"}"):\n
${formatted}\n

✅ Generate ONLY ONE combined goal object that merges all answers into a single actionable goal.

The JSON should have exactly this structure:
[
  {
    "goal": "Clear and concise single goal statement",
    "description": ["Step 1", "Step 2", "Step 3"],
    "category": "Career | Fitness | Relationship | Learning | Finance | Other",
    "deadline": "YYYY-MM-DD"
  }
]

Rules:
1. Do not return multiple goal objects.
2. Do not include explanations, greetings, or extra text.
3. If answers are irrelevant, return exactly:
{
  "success": false,
  "message": "Invalid answer",
  "hint": "Provide a more detailed and relevant response"
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ success: false, message: "No response from Gemini API" });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const parsed = extractJson(rawText);

    if (!Array.isArray(parsed) && parsed.success === false) {
      return res.json(parsed);
    }

    res.json({ success: true, goals: parsed });
  } catch (error) {
    console.error("❌ /api/generate-goal error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- CHATBOT GOALS SAVE ROUTE ---------------- //
app.post("/api/chatbot-goals", auth, async (req, res) => {
  try {
    const { goals } = req.body;
    const userId = req.user.id;

    console.log("📥 Saving chatbot goals for user:", userId, goals);

    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goals data"
      });
    }

    const savedGoals = [];

    for (const goalData of goals) {
      const {
        goalTitle,
        tasks,
        startDate,
        endDate,
        reminderTime, // "HH:MM" format
        frequency,
        description
      } = goalData;

      // ✅ Convert "HH:MM" string to proper Date object
      const [hours, minutes] = reminderTime.split(':');
      const reminderDateTime = new Date(startDate);
      reminderDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // ✅ Ensure reminder is at least 10 minutes in future
      const now = new Date();
      if (reminderDateTime - now < 10 * 60 * 1000) {
        reminderDateTime.setDate(reminderDateTime.getDate() + 1);
        console.log("⏰ Reminder moved to tomorrow to avoid immediate trigger");
      }

      const newGoal = new Goal({
        title: goalTitle,
        description: description,
        duration: frequency,
        startDate: new Date(startDate),
        deadline: new Date(endDate),
        reminderTime: reminderDateTime,
        isRecurring: true,
        frequency: frequency,
        tasks: tasks,
        user: userId,
        status: "pending",
        source: "chatbot",
        completed: false,
        completedDates: [],
        currentInstanceDate: new Date(startDate),
        reminderScheduled: true, // ✅ MARK AS SCHEDULED
        notified: false
      });

      const savedGoal = await newGoal.save();
      savedGoals.push(savedGoal);
      
      console.log("✅ Chatbot goal saved:", {
        title: savedGoal.title,
        reminder: savedGoal.reminderTime,
        displayTime: savedGoal.displayTime,
        isFuture: savedGoal.reminderTime > new Date()
      });
    }

    res.json({
      success: true,
      message: `Successfully saved ${savedGoals.length} goals from chatbot`,
      goals: savedGoals
    });

  } catch (error) {
    console.error("❌ Error saving chatbot goals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save chatbot goals",
      error: error.message
    });
  }
});

// ✅ UPDATED TEST GEMINI API ROUTE
app.post("/api/test-gemini", async (req, res) => {
  try {
    console.log("🧪 Testing Gemini API with available models...");
    
    const models = ['gemini-1.0-pro-latest', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const model of models) {
      try {
        console.log(`🔍 Testing model: ${model}`);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: "Say 'TEST SUCCESSFUL' in one word only" }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${model} WORKS!`);
          return res.json({ 
            success: true, 
            workingModel: model,
            message: data.candidates[0].content.parts[0].text 
          });
        } else {
          console.log(`❌ ${model} failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${model} error: ${error.message}`);
      }
    }
    
    res.json({ success: false, error: "No working models found" });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


// First, let's find which models are available
app.get("/api/check-gemini-models", async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("🔍 AVAILABLE GEMINI MODELS:");
    data.models.forEach(model => {
      console.log(`📦 ${model.name} - ${model.displayName} - Supported: ${model.supportedGenerationMethods}`);
    });
    
    res.json({
      success: true,
      models: data.models.map(m => ({
        name: m.name,
        displayName: m.displayName,
        supportedMethods: m.supportedGenerationMethods
      }))
    });
  } catch (error) {
    console.error("❌ Error checking models:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------- TEST REMINDERS ENDPOINT ---------------- //
app.get("/api/test-reminders", auth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    const upcomingReminders = await Goal.find({
      user: req.user.id,
      completed: false,
      reminderTime: {
        $gte: now,
        $lte: thirtyMinutesFromNow
      }
    }).select('title reminderTime notified reminderScheduled').sort({ reminderTime: 1 });

    // Manual check trigger
    await goalReminderScheduler.manualCheck();

    res.json({
      success: true,
      message: `Found ${upcomingReminders.length} upcoming reminders`,
      schedulerStatus: goalReminderScheduler.getStatus(),
      upcomingReminders: upcomingReminders.map(g => ({
        title: g.title,
        reminderTime: g.reminderTime,
        notified: g.notified,
        reminderScheduled: g.reminderScheduled,
        timeUntil: Math.round((new Date(g.reminderTime) - now) / 1000 / 60) + " minutes"
      }))
    });

  } catch (error) {
    console.error('❌ Test reminders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test failed',
      error: error.message 
    });
  }
});

// ---------------- ROUTES ---------------- //
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/otp", otpRoutes);

// ---------------- AUTO-RESET RECURRING GOALS ---------------- //
const autoResetRecurringGoals = async () => {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/goals/auto-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.resetCount > 0) {
        console.log(`🔄 Auto-reset ${data.resetCount} recurring goals for today`);
      }
    } else {
      console.error('❌ Auto-reset failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Auto-reset request failed:', error.message);
  }
};

const checkAndResetGoals = () => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    console.log('⏰ Midnight - Running auto-reset for recurring goals...');
    autoResetRecurringGoals();
  }
};

setInterval(checkAndResetGoals, 60 * 1000);

// ---------------- ERROR HANDLING ---------------- //
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// ---------------- SERVER START ---------------- //
const PORT = process.env.PORT || 5000;

// ✅ START REMINDER SCHEDULER BEFORE SERVER STARTS
goalReminderScheduler.start();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📍 Test reminders: http://localhost:${PORT}/api/test-reminders`);
  console.log(`📱 OTP endpoints: http://localhost:${PORT}/api/otp/*`);
  console.log(`🤖 Chatbot goals: POST http://localhost:${PORT}/api/chatbot-goals`);
  console.log(`🤖 Gemini analyze: POST http://localhost:${PORT}/api/gemini/analyze-goals`);
  console.log(`🔔 Reminder endpoints: http://localhost:${PORT}/api/reminders/*`);
  console.log(`🎯 Recurring goals: Auto-reset enabled (runs daily at midnight)`);
  console.log(`⏰ Goal Reminder Scheduler: ACTIVE (checks every 30 seconds)`);
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  goalReminderScheduler.stop();
  process.exit(0);
});

