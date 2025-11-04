import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GoalForm.css";

function GoalForm() {
  const [goal, setGoal] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // for edit
  const token = localStorage.getItem("token");

  // Fetch goal if editing
  useEffect(() => {
    if (!id) return;
    const fetchGoal = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setGoal({
            title: data.goal.title,
            description: data.goal.description,
            deadline: data.goal.deadline || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGoal();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoal({ ...goal, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        id
          ? `http://localhost:5000/api/goals/${id}`
          : "http://localhost:5000/api/goals",
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(goal),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Redirect to Goals page (cards will show updated goal)
      navigate("/goals");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h2>{id ? "Edit Goal ✏️" : "Create New Goal ✍️"}</h2>
      <form className="goal-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Goal Title"
          value={goal.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Goal Description"
          value={goal.description}
          onChange={handleChange}
        />
        <input
          type="date"
          name="deadline"
          value={goal.deadline}
          onChange={handleChange}
        />
        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading
              ? "Saving..."
              : id
              ? "✅ Update Goal"
              : "✅ Save Goal"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/goals")}
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default GoalForm;
