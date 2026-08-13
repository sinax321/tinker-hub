import React from 'react';
import { useTeams } from '../hooks/useTeams';
import { useEventSettings } from '../hooks/useEventSettings';

export const EventMode: React.FC = () => {
  const { teams, loading: teamsLoading } = useTeams();
  const { settings, loading: settingsLoading } = useEventSettings();

  if (settingsLoading || teamsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-100">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-8 md:p-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-widest">
          TinkerHub Orientation 2026
        </h1>
        <p className="text-2xl text-slate-400 font-medium tracking-widest uppercase">
          Meet • Connect • Build • Have Fun
        </p>
      </div>

      {!settings?.teamsCreated ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-9xl mb-8 animate-pulse">⏳</div>
          <h2 className="text-4xl text-slate-300 font-bold tracking-wider">Waiting for Teams...</h2>
        </div>
      ) : (
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {teams.map(team => (
              <div 
                key={team.id} 
                className="rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-slate-800 border-4 shadow-2xl relative overflow-hidden"
                style={{ borderColor: team.color }}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: team.color }} />
                <span className="text-7xl mb-6 relative z-10">{team.emoji}</span>
                <h3 
                  className="text-3xl font-black uppercase leading-tight mb-2 relative z-10" 
                  style={{ color: team.color }}
                >
                  {team.name}
                </h3>
                <p className="text-slate-300 font-bold tracking-widest relative z-10">
                  {team.id.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
