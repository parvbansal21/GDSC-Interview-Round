export type Difficulty = "Easy" | "Medium" | "Hard";

export interface DailyQuestion {
  id: string; // YYYY-MM-DD
  title: string;
  description: string;
  difficulty: Difficulty;
  topic: string;
  createdAt?: any;
}

export interface DailySolution {
  id: string; // YYYY-MM-DD
  solution: string;
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  currentStreak: number;
  longestStreak: number;
  lastAttemptDate: string | null;
  totalAttempts: number;
  missedDays: number;
}

export interface DailyAttempt {
  viewedAt?: any;
  submitted: boolean;
  submissionId?: string | null;
  submittedAt?: any;
}
