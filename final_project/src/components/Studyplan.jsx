import React, { useState } from "react";
import "./StudyPlan.css"; // optional styling

function StudyPlan() {
  const [plan, setPlan] = useState(null);

  // Example static plan
  const examplePlan = {
    "Day 1": {
      "09:00-10:30": "Math - Algebra",
      "10:45-12:15": "Physics - Mechanics",
      "14:00-15:30": "Chemistry - Organic"
    },
    "Day 2": {
      "09:00-10:30": "Math - Calculus",
      "10:45-12:15": "Physics - Thermodynamics",
      "14:00-15:30": "Chemistry - Inorganic"
    },
    "Day 3": {
      "09:00-10:30": "Biology - Genetics",
      "10:45-12:15": "Computer Science - Basics",
      "14:00-15:30": "English - Grammar"
    }
  };

  return (
    <div className="study-plan-ui">
      <h1>My Study Plan</h1>
      <button onClick={() => setPlan(examplePlan)}>Generate Plan</button>

      <div className="cards-container">
        {plan &&
          Object.keys(plan).map((day) => (
            <div key={day} className="day-card">
              <h2>{day}</h2>
              <ul>
                {Object.entries(plan[day]).map(([time, topic]) => (
                  <li key={time}>
                    <strong>{time}</strong>: {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

export default StudyPlan;
