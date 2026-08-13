import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout = setTimeout(() => setLoading(false), 5000);

    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(timeout);
        const studentList: Student[] = [];
        snapshot.forEach((doc) => {
          studentList.push({ id: doc.id, ...doc.data() } as Student);
        });
        setStudents(studentList);
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return { students, loading };
};
