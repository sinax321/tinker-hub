import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useStudents } from '../hooks/useStudents';
import { useTeams } from '../hooks/useTeams';
import { useEventSettings } from '../hooks/useEventSettings';
import { generateTeams, resetTeams } from '../utils/grouping';
import type { Student } from '../types';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const { students, loading: studentsLoading } = useStudents();
  const { teams, loading: teamsLoading } = useTeams();
  const { settings, loading: settingsLoading } = useEventSettings();
  
  const [numTeams, setNumTeams] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{name: string, gender: string, branch: string, teamId: string | null}>({ name: '', gender: '', branch: '', teamId: null });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Admin Login</h2>
          {loginError && <div className="text-red-500 mb-4 text-sm text-center">{loginError}</div>}
          <div className="space-y-4">
            <input 
              type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-1 focus:ring-primary outline-none" 
            />
            <input 
              type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-1 focus:ring-primary outline-none" 
            />
            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-violet-600 transition-colors">
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (studentsLoading || teamsLoading || settingsLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const males = students.filter(s => s.gender === 'Male').length;
  const females = students.filter(s => s.gender === 'Female').length;
  
  const branchCounts = students.reduce((acc, curr) => {
    acc[curr.branch] = (acc[curr.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleRegistration = async () => {
    const isOpen = settings?.registrationOpen || false;
    await setDoc(doc(db, 'settings', 'event'), { registrationOpen: !isOpen }, { merge: true });
  };

  const handleCreateTeams = async () => {
    if (!window.confirm(`Create ${numTeams} teams for ${students.length} students?`)) return;
    setIsProcessing(true);
    try {
      await generateTeams(students, numTeams);
    } catch (err: any) {
      alert(err.message);
    }
    setIsProcessing(false);
  };

  const handleReshuffle = async () => {
    if (!window.confirm("Reshuffle teams? This will replace current assignments.")) return;
    setIsProcessing(true);
    try {
      await generateTeams(students, teams.length || numTeams);
    } catch (err: any) {
      alert(err.message);
    }
    setIsProcessing(false);
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all teams? Students will lose their teams.")) return;
    setIsProcessing(true);
    try {
      await resetTeams(students, teams);
    } catch (err: any) {
      alert(err.message);
    }
    setIsProcessing(false);
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student.id);
    setEditForm({ name: student.name, gender: student.gender, branch: student.branch, teamId: student.teamId });
  };

  const saveEdit = async (studentId: string) => {
    await updateDoc(doc(db, 'students', studentId), {
      name: editForm.name.trim(),
      gender: editForm.gender,
      branch: editForm.branch,
      teamId: editForm.teamId
    });
    setEditingStudent(null);
  };

  const deleteStudent = async (studentId: string) => {
    if (window.confirm("Delete this student?")) {
      await deleteDoc(doc(db, 'students', studentId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 max-w-6xl mx-auto font-sans">
      
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-xl text-primary font-bold tracking-wider uppercase mb-1">TinkerHub Orientation 2026</h1>
        <h2 className="text-4xl font-black text-slate-900">Admin Dashboard</h2>
      </header>

      {/* 1. Statistics */}
      <section className="mb-10">
        <h3 className="text-xl font-bold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Registered</span>
            <span className="text-4xl font-black text-slate-900">{students.length}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Teams</span>
            <span className="text-4xl font-black text-slate-900">{teams.length}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <span className="text-sm text-blue-500 font-bold uppercase tracking-widest mb-2">Male</span>
            <span className="text-4xl font-black text-slate-900">{males}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <span className="text-sm text-pink-500 font-bold uppercase tracking-widest mb-2">Female</span>
            <span className="text-4xl font-black text-slate-900">{females}</span>
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 text-sm font-medium">
          <span className="text-slate-500 mr-2">Branch Breakdown:</span>
          {Object.entries(branchCounts).map(([branch, count]) => (
            <span key={branch} className="bg-slate-100 px-3 py-1 rounded-full text-slate-700">{branch}: {count}</span>
          ))}
        </div>
      </section>

      {/* 2. Controls */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-4">Registration Control</h3>
          <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700">Status:</span>
            <span className={`font-bold px-3 py-1 rounded-full ${settings?.registrationOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {settings?.registrationOpen ? '🟢 OPEN' : '🔴 CLOSED'}
            </span>
          </div>
          <button 
            onClick={handleToggleRegistration}
            className={`w-full py-3 font-bold rounded-xl transition-colors ${settings?.registrationOpen ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
          >
            {settings?.registrationOpen ? 'CLOSE REGISTRATION' : 'OPEN REGISTRATION'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-4">Team Generation</h3>
          {!settings?.teamsCreated ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Number of Teams</label>
                  <input 
                    type="number" min="1" max="20" value={numTeams} onChange={e => setNumTeams(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-xl font-black text-slate-800">
                    {students.length > 0 ? Math.floor(students.length / numTeams) : 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Est. Size</span>
                </div>
              </div>
              <button onClick={handleCreateTeams} disabled={isProcessing || students.length === 0} className="w-full py-3 bg-primary hover:bg-violet-600 text-white font-bold rounded-xl disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'CREATE TEAMS'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={handleReshuffle} disabled={isProcessing} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl">
                🔀 RESHUFFLE TEAMS
              </button>
              <button onClick={handleReset} disabled={isProcessing} className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl">
                RESET TEAMS
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Teams Grid */}
      {teams.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Generated Teams</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col items-center text-center p-4" style={{ borderColor: `${team.color}50` }}>
                <div className="text-4xl mb-2">{team.emoji}</div>
                <div className="font-bold text-sm uppercase tracking-tight mb-2" style={{ color: team.color }}>{team.name}</div>
                <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">
                  {team.memberIds.length} Members
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Student List */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-2xl font-bold">Registered Students</h3>
          <input 
            type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64 p-3 rounded-xl border border-slate-300 focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredStudents.map(student => {
            const team = teams.find(t => t.id === student.teamId);
            const isEditing = editingStudent === student.id;

            return (
              <div key={student.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center gap-4">
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="p-2 border rounded" placeholder="Name" />
                    <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="p-2 border rounded">
                      <option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                    <select value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} className="p-2 border rounded">
                      <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="EEE">EEE</option><option value="ME">ME</option><option value="CE">CE</option><option value="Other">Other</option>
                    </select>
                    <select value={editForm.teamId || ''} onChange={e => setEditForm({...editForm, teamId: e.target.value || null})} className="p-2 border rounded">
                      <option value="">No Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                    <div className="font-bold text-slate-900 col-span-2 md:col-span-1">{student.name}</div>
                    <div className="text-sm text-slate-500">{student.gender}</div>
                    <div className="text-sm font-semibold text-slate-700">{student.branch}</div>
                    <div className="text-sm">
                      {team ? (
                        <span className="px-3 py-1 rounded-full font-bold" style={{ backgroundColor: `${team.color}15`, color: team.color }}>
                          {team.emoji} {team.name}
                        </span>
                      ) : <span className="text-slate-400 font-medium">Unassigned</span>}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(student.id)} className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600">Save</button>
                      <button onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-300">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(student)} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200">Edit</button>
                      <button onClick={() => deleteStudent(student.id)} className="px-4 py-2 bg-red-50 text-red-500 text-sm font-bold rounded-xl hover:bg-red-100">Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
              No students found.
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
