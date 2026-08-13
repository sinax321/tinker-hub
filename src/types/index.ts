export interface Student {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  branch: string;
  teamId: string | null;
  createdAt: number;
}

export interface Team {
  id: string;
  name: string;
  emoji: string;
  color: string;
  memberIds: string[];
}

export interface EventSettings {
  registrationOpen: boolean;
  teamsCreated: boolean;
  numberOfTeams: number;
}
