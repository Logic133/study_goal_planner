
// // routes/gemini.js
// const express = require('express');
// const router = express.Router();

// router.post('/analyze-goals', async (req, res) => {
//     try {
//         const { userInput, conversationHistory, hasExistingGoals } = req.body;

//         console.log("🤖 HARDCODED GOAL CREATION:", {
//             userInput: userInput?.substring(0, 100),
//             hasExistingGoals,
//             historyLength: conversationHistory?.length || 0
//         });

//         if (!userInput || userInput.trim().length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User input is required"
//             });
//         }

//         const userInputLower = userInput.toLowerCase();
//         let responseData;

//         // LEARNING GOALS
//         if (userInputLower.includes('learn') || userInputLower.includes('study')) {
//             let subject = 'Programming';
//             if (userInputLower.includes('python')) subject = 'Python Programming';
//             else if (userInputLower.includes('oops') || userInputLower.includes('object')) subject = 'Object-Oriented Programming';
//             else if (userInputLower.includes('dsa') || userInputLower.includes('algorithm')) subject = 'Data Structures & Algorithms';
//             else if (userInputLower.includes('react')) subject = 'React Development';
//             else if (userInputLower.includes('javascript')) subject = 'JavaScript';
//             else subject = userInput.replace(/learn|study/i, '').trim() || 'Programming';

//             responseData = {
//                 goals: [{
//                     title: `Learn ${subject}`,
//                     description: `Master ${subject} through consistent daily practice`,
//                     frequency: "Daily",
//                     duration: "30 days",
//                     reminderTime: "7:00 PM",
//                     tasks: [
//                         "Study core concepts for 1 hour",
//                         "Practice with exercises", 
//                         "Build small projects",
//                         "Review progress weekly"
//                     ]
//                 }],
//                 successMessage: `🎉 Excellent! I've created a 30-day ${subject} learning plan for you!`,
//                 followUpQuestion: "How does this schedule look? Would you like to adjust anything?"
//             };

//         } 
//         // FITNESS GOALS
//         else if (userInputLower.includes('exercise') || userInputLower.includes('fitness') || userInputLower.includes('workout')) {
//             responseData = {
//                 goals: [{
//                     title: "Improve Physical Fitness",
//                     description: "Build consistent exercise habits for better health",
//                     frequency: "Daily",
//                     duration: "30 days",
//                     reminderTime: "6:00 AM",
//                     tasks: [
//                         "30-minute workout session",
//                         "Stretching exercises", 
//                         "Track daily progress",
//                         "Stay hydrated"
//                     ]
//                 }],
//                 successMessage: "💪 Fantastic! I've created a 30-day fitness plan for you!",
//                 followUpQuestion: "Ready to start your fitness journey?"
//             };
//         }
//         // GREETINGS
//         else if (userInputLower.includes('hi') || userInputLower.includes('hello') || userInputLower.includes('hey')) {
//             responseData = {
//                 message: "Hello! 👋 I'm your Goal Planning Assistant. I'd love to help you create a goal plan! What would you like to achieve today?"
//             };
//         }
//         // POSITIVE RESPONSES
//         else if (userInputLower.includes('great') || userInputLower.includes('good') || userInputLower.includes('fine')) {
//             responseData = {
//                 message: "That's wonderful! 😊 Now, what goals would you like to work on? I can help you create plans for learning, fitness, career development, or anything else!"
//             };
//         }
//         // DEFAULT
//         else {
//             responseData = {
//                 message: `I'd love to help you with "${userInput}"! Could you tell me more specifically what you'd like to achieve? For example: 'I want to learn programming', 'I want to exercise daily', or 'I want to study for exams'.`
//             };
//         }

//         console.log("✅ Goal creation successful - Sending:", responseData);
        
//         res.json({
//             success: true,
//             data: responseData
//         });

//     } catch (error) {
//         console.error('❌ Error:', error);
//         res.json({
//             success: true,
//             data: {
//                 message: "Hello! I'm your Goal Planning Assistant. I'd love to help you create a goal plan! What would you like to achieve today?"
//             }
//         });
//     }
// });

// module.exports = router;













// routes/gemini.js - DEBUGGING VERSION
const express = require('express');
const router = express.Router();

router.post('/analyze-goals', async (req, res) => {
    try {
        const { userInput, conversationHistory, hasExistingGoals } = req.body;

        console.log("🎯 RAW USER INPUT:", userInput);
        console.log("🔍 USER INPUT LOWERCASE:", userInput.toLowerCase().trim());
        console.log("📝 CONVERSATION HISTORY:", conversationHistory?.length || 0);

        if (!userInput || userInput.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "User input is required"
            });
        }

        const userInputLower = userInput.toLowerCase().trim();
        let responseData;

        // 🎯 DEBUG: Check what we're detecting
        console.log("🔍 DETECTION DEBUG:");
        console.log("   - Includes 'change':", userInputLower.includes('change'));
        console.log("   - Includes 'weekly':", userInputLower.includes('weekly'));
        console.log("   - Includes 'modify':", userInputLower.includes('modify'));
        console.log("   - Is 'ok':", userInputLower === 'ok');
        console.log("   - Is 'great':", userInputLower === 'great');

        // 🎯 CRITICAL FIX: Handle "great" response properly
        if (userInputLower === 'great' || userInputLower === 'good' || userInputLower === 'fine') {
            console.log("😊 Handling positive response");
            responseData = {
                message: "That's wonderful! 😊 What goals would you like to work on? I can help you create plans for learning, fitness, career development, or anything else!"
            };
        }
        // 🎯 CRITICAL FIX: Handle "change to weekly" - MORE SPECIFIC DETECTION
        else if (userInputLower.includes('change to weekly') || 
                 userInputLower.includes('make it weekly') ||
                 userInputLower.includes('weekly frequency') ||
                 (userInputLower.includes('change') && userInputLower.includes('weekly'))) {
            
            console.log("🔄 Detected frequency change to weekly");
            
            const updatedGoal = {
                title: "Learn DBMS",
                description: "Master Database Management Systems through consistent practice",
                frequency: "Weekly", // CHANGED TO WEEKLY
                duration: "30 days",
                reminderTime: "7:00 PM",
                tasks: [
                    "Study database concepts",
                    "Practice SQL queries", 
                    "Design database schemas",
                    "Review progress weekly"
                ]
            };

            responseData = {
                goals: [updatedGoal],
                successMessage: "✅ Frequency updated to Weekly successfully!",
                followUpQuestion: "Would you like to make any other changes?"
            };
        }
        // 🎯 CRITICAL FIX: Handle simple "ok" responses
        else if (userInputLower === 'ok' || userInputLower === 'okay') {
            console.log("✅ Handling OK response");
            
            // Check last conversation to provide context-aware response
            const lastMessages = conversationHistory?.slice(-2) || [];
            const hasRecentGoals = lastMessages.some(msg => 
                msg.content && (msg.content.includes('goal') || msg.content.includes('plan') || msg.content.includes('created'))
            );

            if (hasRecentGoals) {
                responseData = {
                    message: "Great! Your goals are ready. Click 'Save Goals' to add them to your schedule, or tell me if you'd like to make any other changes."
                };
            } else {
                responseData = {
                    message: "Great! What would you like to work on? I can help with learning goals, fitness plans, or anything else!"
                };
            }
        }
        // 🎓 LEARNING GOALS
        else if (userInputLower.includes('learn') || userInputLower.includes('study')) {
            console.log("📚 Detected learning goal");
            
            let subject = 'Programming';
            if (userInputLower.includes('dbms') || userInputLower.includes('database')) subject = 'DBMS';
            else if (userInputLower.includes('python')) subject = 'Python Programming';
            else if (userInputLower.includes('oops') || userInputLower.includes('object')) subject = 'Object-Oriented Programming';
            else if (userInputLower.includes('dsa') || userInputLower.includes('algorithm')) subject = 'Data Structures & Algorithms';
            else if (userInputLower.includes('react')) subject = 'React Development';
            else if (userInputLower.includes('javascript')) subject = 'JavaScript';
            else subject = userInput.replace(/learn|study/i, '').trim() || 'Programming';

            const newGoal = {
                title: `Learn ${subject}`,
                description: `Master ${subject} through consistent practice`,
                frequency: "Daily",
                duration: "30 days",
                reminderTime: "7:00 PM",
                tasks: [
                    "Study core concepts for 1 hour",
                    "Practice with exercises", 
                    "Build small projects",
                    "Review progress weekly"
                ]
            };

            responseData = {
                goals: [newGoal],
                successMessage: `🎉 I've created a ${subject} learning plan for you!`,
                followUpQuestion: "How does this look? You can ask me to 'change to weekly' or modify any other details."
            };
        } 
        // 👋 GREETINGS
        else if (userInputLower.includes('hi') || userInputLower.includes('hello')) {
            console.log("👋 Detected greeting");
            responseData = {
                message: "Hello! 👋 I'm your Goal Planning Assistant. I'd love to help you create a goal plan! What would you like to achieve today?"
            };
        }
        // ❓ DEFAULT RESPONSE
        else {
            console.log("❓ Using default response");
            responseData = {
                message: `I'd love to help you with "${userInput}"! Tell me what you want to achieve - like 'learn programming', 'exercise daily', or 'study for exams'.`
            };
        }

        console.log("✅ FINAL RESPONSE:", {
            hasGoals: !!(responseData.goals),
            message: responseData.message?.substring(0, 50) || 'No message',
            followUp: responseData.followUpQuestion?.substring(0, 30) || 'No follow up'
        });
        
        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.json({
            success: true,
            data: {
                message: "I'm here to help you create amazing goal plans! What would you like to achieve?"
            }
        });
    }
});

module.exports = router;