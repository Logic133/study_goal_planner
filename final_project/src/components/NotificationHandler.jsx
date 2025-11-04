import React, { useEffect, useState } from 'react';
import { 
  playBeepSound, 
  playNotificationSound, 
  initAudio,
  playRingtone,
  playClassicPhoneRing,
  playMusicalRingtone,
  playDigitalRingtone
} from '../components/NotificationSound';
import './NotificationHandler.css';

const NotificationHandler = () => {
  const [permission, setPermission] = useState('default');
  const [testResult, setTestResult] = useState('');
  const [logs, setLogs] = useState([]);
  const [selectedSound, setSelectedSound] = useState('ringtone');

  const addLog = (message) => {
    setLogs(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
    console.log(message);
  };

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    
    // Initialize audio
    initAudio();
    addLog("🔔 Notification handler loaded with new ringtones");
  }, []);

  const testSound = () => {
    addLog(`🧪 Testing ${getSoundLabel(selectedSound)}...`);
    setTestResult(`Testing ${getSoundLabel(selectedSound)}...`);
    
    initAudio();
    
    let success = false;
    
    switch(selectedSound) {
      case 'beep':
        success = playBeepSound();
        break;
      case 'ringtone':
        success = playRingtone();
        break;
      case 'classicPhone':
        success = playClassicPhoneRing();
        break;
      case 'musical':
        success = playMusicalRingtone();
        break;
      case 'digital':
        success = playDigitalRingtone();
        break;
      default:
        success = playRingtone();
    }
    
    if (success) {
      setTestResult(`✅ ${getSoundLabel(selectedSound)} played successfully!`);
      addLog(`✅ ${getSoundLabel(selectedSound)} test passed`);
    } else {
      setTestResult(`❌ ${getSoundLabel(selectedSound)} failed`);
      addLog(`❌ ${getSoundLabel(selectedSound)} test failed`);
    }
    
    setTimeout(() => setTestResult(''), 3000);
  };

  const getSoundLabel = (soundValue) => {
    const sound = soundOptions.find(opt => opt.value === soundValue);
    return sound ? sound.label.replace(/[^a-zA-Z\s]/g, '') : soundValue;
  };

  const testBrowserNotification = () => {
    addLog("🧪 Testing browser notification...");
    
    if (Notification.permission === "granted") {
      try {
        new Notification("Study Planner Test", { 
          body: "This is a test notification!",
          icon: "/favicon.ico"
        });
        setTestResult("✅ Browser notification sent!");
        addLog("✅ Browser notification test passed");
      } catch (error) {
        setTestResult("❌ Notification error: " + error.message);
        addLog("❌ Browser notification failed: " + error.message);
      }
    } else {
      setTestResult("❌ Notification permission not granted");
      addLog("❌ Notification permission not granted");
    }
    
    setTimeout(() => setTestResult(''), 3000);
  };

  const testFullNotification = () => {
    addLog("🧪 Testing full notification with sound...");
    setTestResult("Testing full notification...");
    
    const success = playNotificationSound("This is a test reminder!");
    
    if (success) {
      setTestResult("✅ Full notification test passed!");
      addLog("✅ Full notification test passed");
    } else {
      setTestResult("❌ Full notification failed");
      addLog("❌ Full notification test failed");
    }
    
    setTimeout(() => setTestResult(''), 3000);
  };

  const requestPermission = async () => {
    addLog("🔔 Requesting notification permission...");
    
    if (!("Notification" in window)) {
      setTestResult("❌ Browser doesn't support notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      addLog("✅ Permission result: " + permission);
      
      if (permission === "granted") {
        setTestResult("✅ Notifications enabled!");
      } else {
        setTestResult("❌ Notifications blocked");
      }
    } catch (error) {
      setTestResult("❌ Error requesting permission");
      addLog("❌ Permission error: " + error.message);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const soundOptions = [
    { value: 'ringtone', label: '📱 Ringtone', description: 'Mobile style ringtone (Recommended)' },
    { value: 'classicPhone', label: '📞 Classic Phone', description: 'Nokia type ring pattern' },
    { value: 'musical', label: '🎵 Musical', description: 'Short melody like gaana' },
    { value: 'digital', label: '📟 Digital', description: 'Modern digital sound' },
    { value: 'beep', label: '🔊 Beep', description: 'Simple beep sound' }
  ];

  // Test all sounds quickly
  const testAllSounds = async () => {
    addLog("🎵 Testing all sounds sequentially...");
    
    for (let i = 0; i < soundOptions.length; i++) {
      const sound = soundOptions[i];
      addLog(`🔊 Testing ${sound.label}...`);
      setTestResult(`Testing ${sound.label}...`);
      
      await new Promise(resolve => {
        initAudio();
        
        switch(sound.value) {
          case 'beep':
            playBeepSound();
            break;
          case 'ringtone':
            playRingtone();
            break;
          case 'classicPhone':
            playClassicPhoneRing();
            break;
          case 'musical':
            playMusicalRingtone();
            break;
          case 'digital':
            playDigitalRingtone();
            break;
        }
        
        setTimeout(resolve, 2000); // 2 second gap between sounds
      });
    }
    
    setTestResult("✅ All sounds tested!");
    addLog("✅ All sound tests completed");
    setTimeout(() => setTestResult(''), 3000);
  };

  return (
    <div className="notification-settings">
      <h3>🔔 Notification Settings</h3>
      
      <div className="permission-status">
        <p><strong>Current Status:</strong> 
          <span className={`status ${permission}`}>
            {permission.toUpperCase()}
          </span>
        </p>
        
        {testResult && (
          <p className={`test-result ${testResult.includes('✅') ? 'success' : 'error'}`}>
            {testResult}
          </p>
        )}
      </div>

      {/* ✅ SOUND SELECTION */}
      <div className="sound-selection">
        <h4>🎵 Select Notification Sound:</h4>
        <div className="sound-options">
          {soundOptions.map(option => (
            <div key={option.value} className={`sound-option ${selectedSound === option.value ? 'selected' : ''}`}>
              <label>
                <input
                  type="radio"
                  value={option.value}
                  checked={selectedSound === option.value}
                  onChange={(e) => setSelectedSound(e.target.value)}
                />
                <span className="sound-label">{option.label}</span>
                <span className="sound-description">{option.description}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ ACTION BUTTONS */}
      <div className="action-buttons">
        {permission === 'default' && (
          <button className="btn btn-primary" onClick={requestPermission}>
            Enable Notifications
          </button>
        )}
        
        <button className="btn btn-success" onClick={testSound}>
          Test Selected Sound
        </button>
        
        <button className="btn btn-secondary" onClick={testAllSounds}>
          Test All Sounds
        </button>
        
        <button className="btn btn-info" onClick={testFullNotification}>
          Test Full Notification
        </button>
        
        {permission === 'granted' && (
          <button className="btn btn-warning" onClick={testBrowserNotification}>
            Test Browser Notification
          </button>
        )}
        
        <button className="btn btn-danger" onClick={clearLogs}>
          Clear Logs
        </button>
      </div>

      {/* ✅ SOUND PREVIEWS */}
      <div className="sound-previews">
        <h4>🎧 Sound Previews:</h4>
        <div className="preview-buttons">
          {soundOptions.map(option => (
            <button
              key={option.value}
              className={`preview-btn ${selectedSound === option.value ? 'active' : ''}`}
              onClick={() => {
                setSelectedSound(option.value);
                setTimeout(testSound, 100);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ LIVE LOGS */}
      <div className="live-logs">
        <h4>📝 Live Test Logs:</h4>
        <div className="logs-container">
          {logs.length === 0 ? (
            <p className="no-logs">No logs yet. Click buttons above to test sounds.</p>
          ) : (
            logs.slice(-10).reverse().map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ TROUBLESHOOTING */}
      <div className="troubleshooting">
        <h4>🔧 If sounds don't work:</h4>
        <div className="troubleshooting-steps">
          <div className="step">
            <strong>Step 1:</strong> Click anywhere on page first 🔊
          </div>
          <div className="step">
            <strong>Step 2:</strong> Check system volume and browser mute
          </div>
          <div className="step">
            <strong>Step 3:</strong> Try "Test All Sounds" button
          </div>
          <div className="step">
            <strong>Step 4:</strong> Refresh page and try again
          </div>
        </div>
        
        <div className="current-sound-info">
          <p><strong>Currently Selected:</strong> {soundOptions.find(s => s.value === selectedSound)?.label}</p>
          <p><strong>Default Sound:</strong> 📱 Ringtone (Mobile style)</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationHandler;