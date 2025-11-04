import React from "react";
import { useNavigate } from "react-router-dom";
import "./BottomNav.css";

function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <button onClick={() => navigate("/")}>
        <span className="icon">🏠</span>
        <span className="label">Dashboard</span>
      </button>
      <button onClick={() => navigate("/goals")}>
        <span className="icon">🎯</span>
        <span className="label">Goals</span>
      </button>
      <button onClick={() => navigate("/progress")}>
        <span className="icon">📊</span>
        <span className="label">Progress</span>
      </button>
      <button onClick={() => navigate("/goodies")}>
        <span className="icon">🎁</span>
        <span className="label">Rewards</span>
      </button>
    </nav>
  );
}

export default BottomNav;
