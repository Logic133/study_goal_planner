import React, { useState, useEffect } from "react";
import "./ProfileSidebar.css";
import { AiOutlineLogin } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

import {
  WhatsAppIcon,
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  ShareIcon,
  CopyIcon
} from "./Icons";

function ProfileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { name: "User", email: "user@example.com", mobile: "" };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");

  // 🧠 Theme sync
  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem("theme") || "light";
      setCurrentTheme(theme);
    };

    checkTheme();
    const interval = setInterval(checkTheme, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Get mobile number from user data
  const getMobileNumber = () => {
    // Check multiple possible fields for mobile number
    return user.mobile || user.phone || user.phoneNumber || "Not set";
  };

  // ✅ Format mobile number for display
  const formatMobileNumber = (mobile) => {
    if (!mobile || mobile === "Not set") return "Not set";
    
    // Remove any non-digit characters
    const cleanMobile = mobile.replace(/\D/g, '');
    
    // Format as +91 XXXXXXXXXX
    if (cleanMobile.length === 10) {
      return `+91 ${cleanMobile}`;
    } else if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
      return `+${cleanMobile}`;
    } else if (cleanMobile.length > 10) {
      return `+${cleanMobile}`;
    }
    
    return mobile;
  };

  // 🎯 Generate share data
  const generateShareData = () => {
    const streak = localStorage.getItem("dayStreak") || "0";
    const successRate = localStorage.getItem("successRate") || "0";
    const totalGoals = localStorage.getItem("totalGoals") || "0";
    const completedGoals = localStorage.getItem("completedGoals") || "0";

    const shareData = {
      name: user.name,
      streak,
      successRate,
      totalGoals,
      completedGoals,
      timestamp: new Date().toISOString()
    };

    const shareId = `share_${Date.now()}`;
    localStorage.setItem(shareId, JSON.stringify(shareData));

    return {
      id: shareId,
      url: `${window.location.origin}/share/${shareId}`,
      message: `🎯 Check out ${user.name}'s Progress!\n` +
        `🔥 ${streak} Day Streak\n` +
        `✅ ${successRate}% Success Rate\n` +
        `📊 ${completedGoals}/${totalGoals} Goals Completed\n` +
        `View my progress: ${window.location.origin}/share/${shareId}`
    };
  };

  // 📤 Share progress on different platforms
  const shareProgress = (platform) => {
    const { url, message } = generateShareData();
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        break;
      case "instagram":
        navigator.clipboard.writeText(message);
        alert("Progress copied to clipboard! You can paste it on Instagram.");
        setShowShareOptions(false);
        return;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(message);
        alert("Progress link copied to clipboard!");
        setShowShareOptions(false);
        return;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareOptions(false);
  };

  // 🚪 Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    onClose(); // close sidebar
    navigate("/login"); // redirect to login page
    window.location.reload(); // refresh header instantly (optional)
  };

  return (
    <div className={`profile-sidebar ${isOpen ? "active" : ""} ${currentTheme}-theme`}>
      <button className="close-btn" onClick={onClose}>
        <span className="close-icon">x</span>
      </button>

      <div className="profile-header">
        <div className="profile-icon">{initial}</div>
        <div className="profile-info">
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{user.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>
          {/* ✅ NEW: Mobile Number Display */}
          <div className="info-row">
            <span className="label">Mobile:</span>
            <span className="value mobile-number">
              {formatMobileNumber(getMobileNumber())}
            </span>
          </div>
        </div>
      </div>

      <div className="share-section">
        <button
          className="share-btn"
          onClick={() => setShowShareOptions(!showShareOptions)}
        >
          <ShareIcon size={18} />
          Share Progress
          <span className={`arrow ${showShareOptions ? "rotate" : ""}`}>▼</span>
        </button>

        {showShareOptions && (
          <div className="share-dropdown">
            <button onClick={() => shareProgress("whatsapp")}>
              <WhatsAppIcon size={18} />
              WhatsApp
            </button>
            <button onClick={() => shareProgress("instagram")}>
              <InstagramIcon size={18} />
              Instagram
            </button>
            <button onClick={() => shareProgress("twitter")}>
              <TwitterIcon size={18} />
              Twitter
            </button>
            <button onClick={() => shareProgress("facebook")}>
              <FacebookIcon size={18} />
              Facebook
            </button>
            <button onClick={() => shareProgress("copy")}>
              <CopyIcon size={18} />
              Copy Link
            </button>
          </div>
        )}
      </div>

      <div className="profile-badges">
        <h4>🏆 Your Badges</h4>
        <div className="badges-list">
          <span className="badge" title="First Goal">🎯</span>
        </div>
        <p className="badges-count">1 badge earned</p>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <AiOutlineLogin style={{ marginRight: "6px" }} /> Log out
      </button>
    </div>
  );
}

export default ProfileSidebar;