import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEventSettings } from '../hooks/useEventSettings';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'Other'];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useEventSettings();
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [branch, setBranch] = useState('CSE');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId = localStorage.getItem('tinkerhub_student_id');
    if (studentId) {
      navigate('/group', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const studentId = 'TH_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      await setDoc(doc(db, 'students', studentId), {
        id: studentId,
        name: name.trim(),
        gender,
        branch,
        teamId: null,
        createdAt: Date.now()
      });

      localStorage.setItem('tinkerhub_student_id', studentId);
      navigate('/group', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError('Unable to connect. Please check your internet connection and try again.');
      setIsSubmitting(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (settings && !settings.registrationOpen) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Registration Closed</h2>
          <p className="text-slate-500">Registration for the orientation is currently closed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-slate-50 text-slate-900 py-12">
      <div className="w-full max-w-sm mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-primary mb-1">
          TinkerHub First Year Orientation 2026
        </h1>
        <h2 className="text-xl font-medium text-slate-600">Find Your Team</h2>
      </div>

      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              required
            >
              {BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium border border-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-2 bg-primary hover:bg-violet-600 active:bg-violet-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'JOIN ORIENTATION'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
