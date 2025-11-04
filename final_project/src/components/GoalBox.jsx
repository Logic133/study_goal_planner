import React, { useState } from "react";
import ChatBox from "./ChatBox";
import ManualGoal from "./ManualGoal";
import "./GoalBox.css";

function GoalBox({ addGoal, updateGoalStatus }) {
    const [selected, setSelected] = useState(null);

    return (
        <div className="goalbox-container">
            {/* Header */}
            {!selected && (
                <div className="goalbox-header">
                    <h1>🎯 Goal Creator</h1>
                    <p>Choose how you want to set your goals</p>
                </div>
            )}

            {/* Step 1: Options */}
            {!selected && (
                <div className="option-boxes">
                    <div className="option" onClick={() => setSelected("chat")}>
                        <h2>🤖 AI assistant Goal</h2>
                        <p>Generate smart goals using ChatBox</p>
                    </div>

                    <div className="option" onClick={() => setSelected("manual")}>
                        <h2>✍️ Manual Goal</h2>
                        <p>Create and track your own goals</p>
                    </div>
                </div>
            )}

            {/* Step 2: Render Selected */}
            {selected === "chat" && <ChatBox onBack={() => setSelected(null)} />}
            {selected === "manual" && (
                <ManualGoal
                    addGoal={addGoal}
                    updateGoalStatus={updateGoalStatus}
                    onBack={() => setSelected(null)}
                />
            )}
        </div>
    );
}

export default GoalBox;
