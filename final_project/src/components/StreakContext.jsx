import React, { createContext, useContext, useState, useEffect } from 'react';

const StreakContext = createContext();

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  // Load streak from localStorage on component mount
  useEffect(() => {
    const savedStreak = localStorage.getItem('currentStreak');
    if (savedStreak) {
      setCurrentStreak(parseInt(savedStreak));
    }
  }, []);

  // Save streak to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentStreak', currentStreak.toString());
  }, [currentStreak]);

  const updateStreak = (streak) => {
    setCurrentStreak(streak);
  };

  return (
    <StreakContext.Provider value={{ currentStreak, updateStreak }}>
      {children}
    </StreakContext.Provider>
  );
};