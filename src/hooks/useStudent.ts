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

    const unsubscribe = onSnapshot(
      doc(db, 'students', studentId),
      (docSnap) => {
        if (docSnap.exists()) {
          setStudent(docSnap.data() as Student);
        } else {
          setStudent(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching student:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  return { student, loading };
};
