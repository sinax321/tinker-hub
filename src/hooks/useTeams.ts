import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Team } from '../types';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'teams'), orderBy('id'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const teamList: Team[] = [];
        snapshot.forEach((doc) => {
          teamList.push({ id: doc.id, ...doc.data() } as Team);
        });
        setTeams(teamList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching teams:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { teams, loading };
};
