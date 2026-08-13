import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Student, Team } from '../types';

const TEAM_IDENTITIES = [
  { name: 'Red', emoji: '🔴', color: '#ef4444' },
  { name: 'Blue', emoji: '🔵', color: '#3b82f6' },
  { name: 'Green', emoji: '🟢', color: '#22c55e' },
  { name: 'Yellow', emoji: '🟡', color: '#eab308' },
  { name: 'Purple', emoji: '🟣', color: '#a855f7' },
  { name: 'Orange', emoji: '🟠', color: '#f97316' },
  { name: 'White', emoji: '⚪', color: '#f8fafc' },
  { name: 'Black', emoji: '⚫', color: '#1e293b' },
  { name: 'Cyan', emoji: '🟦', color: '#06b6d4' },
  { name: 'Pink', emoji: '🌸', color: '#ec4899' },
  { name: 'Silver', emoji: '⚪', color: '#94a3b8' },
  { name: 'Gold', emoji: '🟡', color: '#fbbf24' },
  { name: 'Crimson', emoji: '🔴', color: '#dc2626' },
  { name: 'Teal', emoji: '🟢', color: '#14b8a6' },
  { name: 'Indigo', emoji: '🟣', color: '#4f46e5' },
  { name: 'Lime', emoji: '🟢', color: '#84cc16' },
  { name: 'Amber', emoji: '🟠', color: '#d97706' },
  { name: 'Emerald', emoji: '🟢', color: '#10b981' },
  { name: 'Rose', emoji: '🔴', color: '#e11d48' },
  { name: 'Sky Blue', emoji: '🔵', color: '#0ea5e9' }
];

export const generateTeams = async (students: Student[], numberOfTeams: number) => {
  if (numberOfTeams < 1 || numberOfTeams > 20) {
    throw new Error('Number of teams must be between 1 and 20');
  }
  if (students.length === 0) {
    throw new Error('No students to group');
  }

  // 1. Randomize students
  const shuffled = [...students].sort(() => Math.random() - 0.5);

  // 2. Sort by gender and branch to ensure fair distribution when dealing round-robin
  // We sort so that when we iterate 0 to N, we are picking diverse students.
  shuffled.sort((a, b) => {
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender);
    return a.branch.localeCompare(b.branch);
  });

  // 3. Initialize teams
  const teams: Team[] = Array.from({ length: numberOfTeams }).map((_, i) => ({
    id: `team_${i + 1}`,
    name: TEAM_IDENTITIES[i]?.name || `Team ${i + 1}`,
    emoji: TEAM_IDENTITIES[i]?.emoji || '🏁',
    color: TEAM_IDENTITIES[i]?.color || '#ffffff',
    memberIds: []
  }));

  // 4. Distribute students round-robin
  shuffled.forEach((student, index) => {
    const teamIndex = index % numberOfTeams;
    teams[teamIndex].memberIds.push(student.id);
  });

  // 5. Execute Firestore Batch Write
  const batch = writeBatch(db);

  // Clear existing teams (if reshuffling, old ones should be overwritten or deleted. For simplicity, we overwrite team_1 to team_N. If previous had more teams, they are technically dangling, but we can manage that by deleting old teams first).
  // Let's assume we delete all previous teams and recreate them in the calling function, OR we just overwrite up to numberOfTeams.
  
  // Save new teams
  teams.forEach(team => {
    const teamRef = doc(collection(db, 'teams'), team.id);
    batch.set(teamRef, team);
  });

  // Update students with their new teamId
  shuffled.forEach((student, index) => {
    const teamIndex = index % numberOfTeams;
    const studentRef = doc(db, 'students', student.id);
    batch.update(studentRef, { teamId: teams[teamIndex].id });
  });

  // Update Event Settings
  const settingsRef = doc(db, 'settings', 'event');
  batch.set(settingsRef, {
    teamsCreated: true,
    numberOfTeams: numberOfTeams
  }, { merge: true });

  await batch.commit();
};

export const resetTeams = async (students: Student[], oldTeams: Team[]) => {
  const batch = writeBatch(db);

  // Delete all old teams
  oldTeams.forEach(team => {
    const teamRef = doc(db, 'teams', team.id);
    batch.delete(teamRef);
  });

  // Remove teamId from all students
  students.forEach(student => {
    const studentRef = doc(db, 'students', student.id);
    batch.update(studentRef, { teamId: null });
  });

  // Update Event Settings
  const settingsRef = doc(db, 'settings', 'event');
  batch.set(settingsRef, {
    teamsCreated: false,
    numberOfTeams: 0
  }, { merge: true });

  await batch.commit();
};
