export interface User {
  id: string;
  email: string;
  role: 'MEMBER' | 'ORGANIZER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  membershipType: string;
  membershipStart: string;
  membershipEnd?: string;
  duprRating: number;
  skillLevel: string;
  playPreferences?: any;
  profilePhotoUrl?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'SINGLES' | 'DOUBLES' | 'MIXED';
  format: 'ROUND_ROBIN' | 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'LEAGUE' | 'LADDER';
  doublesFormat?:
    | 'CLASSIC_DOUBLES'
    | 'MIXED_DOUBLES'
    | 'AMERICANO_DOUBLES'
    | 'MEXICANO_DOUBLES'
    | 'ROUND_ROBIN_DOUBLES'
    | 'KING_OF_THE_COURT_DOUBLES'
    | 'FAST4_DOUBLES'
    | 'TIEBREAK_DOUBLES';
  formatConfig?: any;
  scheduleConfig?: any;
  schedule?: any;
  totalTimeMinutes?: number;
  swapDuration?: number;
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  minSkillLevel?: string;
  entryFee: number;
  registrationDeadline: string;
  rules: any;
  hasConsolation: boolean;
  hasBronzeMatch: boolean;
  description?: string;
  qrCode?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  matchNumber: number;
  roundName?: string;
  team1Player1Id: string;
  team1Player2Id?: string;
  team2Player1Id: string;
  team2Player2Id?: string;
  scheduledDatetime?: string;
  courtNumber?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  winnerTeam?: number;
  team1Confirmed: boolean;
  team2Confirmed: boolean;
  organizerVerified: boolean;
  verifiedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Set {
  id: string;
  matchId: string;
  setNumber: number;
  team1Score: number;
  team2Score: number;
  winnerTeam: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User & { member?: Member };
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}
