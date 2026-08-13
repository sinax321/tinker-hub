import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Student } from '../types';

export const useStudent = (studentId: string | null) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      setLoading(false);
      return;
    }

    let timeout = setTimeout(() => setLoading(false), 5000);

    const unsubscribe = onSnapshot(
      doc(db, 'students', studentId),
      (docSnap) => {
        clearTimeout(timeout);
        if (docSnap.exists()) {
          setStudent(docSnap.data() as Student);
        } else {
          setStudent(null);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Error fetching student:", error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [studentId]);

  return { student, loading };
};
