import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') !== 'false'
  );

  // ✅ Save notifications preference
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
  }, [notificationsEnabled]);

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your application preferences</p>
      </div>
      
      <div className="settings-content">
        {/* ✅ Notifications On/Off Toggle - Default ON */}
        <div className="setting-section">
          <h3>🔔 Notifications</h3>
          <p>Enable or disable all notifications</p>
          <div className="toggle-section">
            <label className="toggle-label">
              <span className="toggle-text">
                {notificationsEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
              </span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationsToggle}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
            <p className="toggle-help">
              {notificationsEnabled 
                ? 'You will receive notifications for your goal reminders' 
                : 'Notifications are turned off. You will not receive any reminders'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;