import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function compressImage(file, maxWidth = 800, quality = 0.65) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = url;
  });
}

const EMPTY_TASKS = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };

export function useFirebaseData(userId) {
  const [userData, setUserData] = useState({
    name: '',
    currentDay: 1,
    progress: 0,
    tasks: { ...EMPTY_TASKS },
    completedDays: {},
    dayHistory: {},
    notes: {},
    startDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [todayPhoto, setTodayPhoto] = useState(null);

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
          tasks: data.tasks || { ...EMPTY_TASKS },
          completedDays: data.completedDays || {},
          dayHistory: data.dayHistory || {},
          notes: data.notes || {},
          startDate: data.startDate || null,
          ...data,
        });
      } else {
        const initialData = {
          name: userId,
          currentDay: 1,
          progress: 0,
          tasks: { ...EMPTY_TASKS },
          completedDays: {},
          dayHistory: {},
          notes: {},
          startDate: new Date().toISOString(),
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

  // Bugünün fotoğrafını ayrı koleksiyondan yükle
  useEffect(() => {
    if (!userId || !userData.currentDay) return;
    setTodayPhoto(null);
    const dayKey = String(userData.currentDay);
    getDoc(doc(db, 'photos', `${userId}_day${dayKey}`))
      .then(snap => { if (snap.exists()) setTodayPhoto(snap.data().data); })
      .catch(() => {});
  }, [userId, userData.currentDay]);

  const toggleTask = async (taskId) => {
    if (!userId) return;
    const newTasks = { ...userData.tasks, [taskId]: !userData.tasks[taskId] };
    const completedCount = Object.values(newTasks).filter(Boolean).length;
    const newProgress = Math.round((completedCount / 7) * 100);
    const dayKey = String(userData.currentDay);
    const allDone = completedCount === 7;

    const newCompletedDays = { ...userData.completedDays };
    const newDayHistory = { ...userData.dayHistory, [dayKey]: newProgress };
    if (allDone) newCompletedDays[dayKey] = true;
    else delete newCompletedDays[dayKey];

    setUserData(prev => ({ ...prev, tasks: newTasks, progress: newProgress, completedDays: newCompletedDays, dayHistory: newDayHistory }));
    try {
      await updateDoc(doc(db, 'users', userId), {
        tasks: newTasks, progress: newProgress,
        completedDays: newCompletedDays, dayHistory: newDayHistory,
        lastUpdated: new Date().toISOString(),
      });
    } catch (e) { console.error('Update error:', e); }
  };

  const saveNote = async (text) => {
    if (!userId) return;
    const dayKey = String(userData.currentDay);
    const newNotes = { ...userData.notes, [dayKey]: text };
    setUserData(prev => ({ ...prev, notes: newNotes }));
    try {
      await updateDoc(doc(db, 'users', userId), { notes: newNotes });
    } catch (e) { console.error('Note save error:', e); }
  };

  const completeDay = async () => {
    if (!userId || userData.progress < 100) return;
    const nextDay = Math.min((userData.currentDay || 1) + 1, 75);
    const freshTasks = { ...EMPTY_TASKS };
    setUserData(prev => ({ ...prev, currentDay: nextDay, tasks: freshTasks, progress: 0 }));
    try {
      await updateDoc(doc(db, 'users', userId), {
        currentDay: nextDay, tasks: freshTasks, progress: 0,
        lastUpdated: new Date().toISOString(),
      });
    } catch (e) { console.error('Day advance error:', e); }
  };

  const uploadPhoto = async (file) => {
    if (!userId || !file) return;
    setUploading(true);
    try {
      const dayKey = String(userData.currentDay);
      const base64 = await compressImage(file);
      await setDoc(doc(db, 'photos', `${userId}_day${dayKey}`), {
        data: base64, userId, day: dayKey,
        updatedAt: new Date().toISOString(),
      });
      setTodayPhoto(base64);
    } catch (e) { console.error('Photo upload error:', e); }
    finally { setUploading(false); }
  };

  return { userData, loading, uploading, todayPhoto, toggleTask, completeDay, saveNote, uploadPhoto };
}
