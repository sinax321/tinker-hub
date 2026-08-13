import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { EventSettings } from '../types';

export const useEventSettings = () => {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout = setTimeout(() => setLoading(false), 5000);

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'event'),
      (doc) => {
        clearTimeout(timeout);
        if (doc.exists()) {
          setSettings(doc.data() as EventSettings);
        } else {
          setSettings(null);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return { settings, loading };
};
