import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStudent } from '../hooks/useStudent';
import { useTeam } from '../hooks/useTeam';
import { useStudents } from '../hooks/useStudents';

export const GroupReveal: React.FC = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('tinkerhub_student_id');
  
  const { student, loading: studentLoading } = useStudent(studentId);
  const { team, loading: teamLoading } = useTeam(student?.teamId || null);
  // We need to fetch students to show teammates. Since it's 140 students, it's very small.
  const { students } = useStudents(); 

  const [revealStage, setRevealStage] = useState<'waiting' | 'revealed'>('waiting');

  useEffect(() => {
    if (!studentId && !studentLoading) {
      navigate('/register', { replace: true });
    }
  }, [studentId, studentLoading, navigate]);

  useEffect(() => {
    if (studentLoading || teamLoading) return;

    if (student?.teamId && team) {
      if (revealStage === 'waiting') {
        setRevealStage('revealed');
        triggerConfetti();
      }
    } else {
      setRevealStage('waiting');
    }
  }, [student?.teamId, team, studentLoading, teamLoading]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (studentLoading || (student?.teamId && teamLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Find teammates
  const teammates = students.filter(s => s.teamId === student?.teamId);

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-4 bg-slate-50 text-slate-900 pt-12">
      {revealStage === 'waiting' && (
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in fade-in duration-500">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
          <p className="text-slate-600 mb-6 font-medium">Your team will be revealed soon. Keep this page open.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Registered as</p>
            <p className="text-lg font-bold text-slate-800">{student?.name}</p>
          </div>
          <p className="mt-6 text-sm font-semibold text-primary animate-pulse">Waiting for teams...</p>
        </div>
      )}

      {revealStage === 'revealed' && team && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-2">🎉 YOUR TEAM</h2>
          </div>
          
          <div 
            className="w-full bg-white rounded-3xl shadow-lg border-2 overflow-hidden mb-8 transition-transform duration-300"
            style={{ borderColor: team.color }}
          >
            <div className="p-10 flex flex-col items-center text-center">
              <div className="text-8xl mb-6 transform hover:scale-110 transition-transform duration-300">
                {team.emoji}
              </div>
              <h3 
                className="text-3xl font-black uppercase tracking-tight mb-3"
                style={{ color: team.color }}
              >
                {team.name}
              </h3>
              <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-sm tracking-widest uppercase">
                {team.id.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="w-full">
            <h4 className="text-lg font-bold text-slate-800 mb-4 px-2">
              Your Team ({teammates.length} Members)
            </h4>
            <div className="space-y-3">
              {teammates.map(member => (
                <div 
                  key={member.id} 
                  className={`p-4 rounded-2xl flex items-center font-medium ${
                    member.id === student?.id 
                      ? 'bg-primary/10 border-2 border-primary text-primary shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xl mr-4 opacity-70">👤</span>
                  <span className="text-lg">{member.name}</span>
                  {member.id === student?.id && (
                    <span className="ml-auto text-sm font-bold bg-primary text-white px-3 py-1 rounded-full">
                      ⭐ You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
