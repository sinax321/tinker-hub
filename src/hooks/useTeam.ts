import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Team } from '../types';

export const useTeam = (teamId: string | null) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setTeam(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    let timeout = setTimeout(() => setLoading(false), 5000);

    const unsubscribe = onSnapshot(
      doc(db, 'teams', teamId),
      (doc) => {
        clearTimeout(timeout);
        if (doc.exists()) {
          setTeam({ id: doc.id, ...doc.data() } as Team);
        } else {
          setTeam(null);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Error fetching team:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [teamId]);

  return { team, loading };
};
