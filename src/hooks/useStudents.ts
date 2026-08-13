import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const studentList: Student[] = [];
        snapshot.forEach((doc) => {
          studentList.push(doc.data() as Student);
        });
        setStudents(studentList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { students, loading };
};
