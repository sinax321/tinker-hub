import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Team } from '../types';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout = setTimeout(() => setLoading(false), 5000);

    const q = query(collection(db, 'teams'), orderBy('id'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(timeout);
        const teamList: Team[] = [];
        snapshot.forEach((doc) => {
          teamList.push({ id: doc.id, ...doc.data() } as Team);
        });
        setTeams(teamList);
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Error fetching teams:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return { teams, loading };
};
