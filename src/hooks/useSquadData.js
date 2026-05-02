import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useSquadData() {
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const squadData = [];
      snapshot.forEach((doc) => {
        squadData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setSquad(squadData);
      setLoading(false);
    }, (error) => {
      console.error("Squad sync error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { squad, loading };
}
