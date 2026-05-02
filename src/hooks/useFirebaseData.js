import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirebaseData(userId) {
  const [userData, setUserData] = useState({
    name: '',
    currentDay: 1,
    progress: 0,
    tasks: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    completedDays: {},   // { "1": true, "3": true, ... }
    dayHistory: {},      // { "1": 100, "2": 83, ... } — her günün % skoru
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({
          name: data.name || '',
          currentDay: data.currentDay || 1,
          progress: data.progress || 0,
          tasks: data.tasks || { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
          completedDays: data.completedDays || {},
          dayHistory: data.dayHistory || {},
          ...data,
        });
      } else {
        const initialData = {
          name: userId,
          currentDay: 1,
          progress: 0,
          tasks: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
          completedDays: {},
          dayHistory: {},
          lastUpdated: new Date().toISOString(),
        };
        setDoc(userDocRef, initialData, { merge: true });
        setUserData(initialData);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleTask = async (taskId) => {
    if (!userId) return;

    const newTasks = { ...userData.tasks, [taskId]: !userData.tasks[taskId] };
    const completedCount = Object.values(newTasks).filter(Boolean).length;
    const newProgress = Math.round((completedCount / 6) * 100);
    const dayKey = String(userData.currentDay);
    const allDone = completedCount === 6;

    // completedDays ve dayHistory güncelle
    const newCompletedDays = { ...userData.completedDays };
    const newDayHistory = { ...userData.dayHistory, [dayKey]: newProgress };
    if (allDone) newCompletedDays[dayKey] = true;
    else delete newCompletedDays[dayKey];

    setUserData(prev => ({
      ...prev,
      tasks: newTasks,
      progress: newProgress,
      completedDays: newCompletedDays,
      dayHistory: newDayHistory,
    }));

    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        tasks: newTasks,
        progress: newProgress,
        completedDays: newCompletedDays,
        dayHistory: newDayHistory,
        lastUpdated: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Update error:', e);
    }
  };

  // Günü tamamla ve sonraki güne geç
  const completeDay = async () => {
    if (!userId || userData.progress < 100) return;
    const nextDay = Math.min((userData.currentDay || 1) + 1, 75);
    const freshTasks = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };

    setUserData(prev => ({
      ...prev,
      currentDay: nextDay,
      tasks: freshTasks,
      progress: 0,
    }));

    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        currentDay: nextDay,
        tasks: freshTasks,
        progress: 0,
        lastUpdated: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Day advance error:', e);
    }
  };

  return { userData, loading, toggleTask, completeDay };
}
