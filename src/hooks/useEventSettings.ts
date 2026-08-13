import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { EventSettings } from '../types';

export const useEventSettings = () => {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'event'),
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as EventSettings);
        } else {
          setSettings(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
};
