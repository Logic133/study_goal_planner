// test-server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ Test Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Gemini endpoint - SIMPLE VERSION
app.post('/api/gemini/analyze-goals', (req, res) => {
    console.log('🤖 Gemini endpoint called:', req.body.userInput);
    
    // Always return success with sample data
    const response = {
        success: true,
        data: {
            goals: [
                {
                    title: `Learn ${req.body.userInput || 'New Skill'}`,
                    description: `Master ${req.body.userInput || 'this skill'} through consistent practice`,
                    tasks: ['Practice daily', 'Review progress', 'Build projects'],
                    frequency: 'Daily',
                    reminderTime: '7:00 PM',
                    duration: '60 days'
                }
            ]
        }
    };
    
    console.log('✅ Sending response:', response);
    res.json(response);
});

app.listen(PORT, () => {
    console.log(`🚀 TEST Server running on http://localhost:${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});