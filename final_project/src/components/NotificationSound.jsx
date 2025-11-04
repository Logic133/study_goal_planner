// notificationSound.js में replace करें

let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log("🎵 AudioContext created");
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log("🎵 AudioContext resumed");
    });
  }
  
  return audioContext;
};

// ✅ Real Ringtone - Mobile jaisi ringtone
export const playRingtone = () => {
  console.log("📱 Playing ringtone...");
  
  try {
    const context = getAudioContext();
    const oscillator1 = context.createOscillator();
    const oscillator2 = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Mobile ringtone frequencies (pleasant melody)
    oscillator1.frequency.value = 523.25; // C5
    oscillator2.frequency.value = 659.25; // E5
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    // Ringtone pattern: sound-pause-sound-pause
    const now = context.currentTime;
    
    // First beep
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    // Second beep after pause
    gainNode.gain.setValueAtTime(0, now + 0.8);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.9);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 1.2);
    oscillator2.stop(now + 1.2);
    
    console.log("✅ Ringtone played");
    return true;
    
  } catch (error) {
    console.error("❌ Ringtone error:", error);
    return false;
  }
};

// ✅ Classic Phone Ringtone (Nokia type)
export const playClassicPhoneRing = () => {
  console.log("📞 Playing classic phone ring...");
  
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    const now = context.currentTime;
    
    // Classic ring pattern: ring-ring-pause-ring-ring
    // Ring 1
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    // Ring 2
    gainNode.gain.setValueAtTime(0, now + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    
    // Pause
    gainNode.gain.setValueAtTime(0, now + 1.0);
    
    // Ring 3
    gainNode.gain.setValueAtTime(0, now + 2.0);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 2.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    
    // Ring 4
    gainNode.gain.setValueAtTime(0, now + 2.5);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 2.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.9);
    
    oscillator.start(now);
    oscillator.stop(now + 3.0);
    
    console.log("✅ Classic phone ring played");
    return true;
    
  } catch (error) {
    console.error("❌ Classic phone ring error:", error);
    return false;
  }
};

// ✅ Musical Ringtone (Short melody)
export const playMusicalRingtone = () => {
  console.log("🎵 Playing musical ringtone...");
  
  try {
    const context = getAudioContext();
    
    // Simple melody: C - E - G (Do - Mi - So)
    playNote(context, 523.25, 0, 0.3);   // C5
    playNote(context, 659.25, 0.4, 0.3); // E5
    playNote(context, 783.99, 0.8, 0.3); // G5
    
    console.log("✅ Musical ringtone played");
    return true;
    
  } catch (error) {
    console.error("❌ Musical ringtone error:", error);
    return false;
  }
};

const playNote = (context, frequency, startTime, duration) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  const start = context.currentTime + startTime;
  
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(0.4, start + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
  
  oscillator.start(start);
  oscillator.stop(start + duration);
};

// ✅ Digital Ringtone (Modern style)
export const playDigitalRingtone = () => {
  console.log("📟 Playing digital ringtone...");
  
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'square'; // Digital sound
    
    const now = context.currentTime;
    
    // Digital beep pattern
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    // Frequency modulation for digital effect
    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    
    console.log("✅ Digital ringtone played");
    return true;
    
  } catch (error) {
    console.error("❌ Digital ringtone error:", error);
    return false;
  }
};

// ✅ Main function - Default ringtone
export const playNotificationSound = (message = "Reminder!") => {
  console.log("🔊 Playing notification sound:", message);
  
  // Show notification if permitted
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Study Planner", { 
        body: message,
        icon: "/favicon.ico"
      });
      console.log("✅ Notification shown");
    } catch (error) {
      console.error("❌ Notification error:", error);
    }
  }
  
  // Play ringtone instead of beep
  return playRingtone();
};

// ✅ Keep old beep for compatibility
export const playBeepSound = () => {
  return playRingtone(); // Now plays ringtone instead of beep
};

export const initAudio = () => {
  console.log("🎵 Initializing audio system");
  getAudioContext();
};