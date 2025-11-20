export enum UserLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum AppMode {
  Dashboard = 'Dashboard',
  Chat = 'Chat',
  Live = 'Live',
  Profile = 'Profile',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  correction?: string; // Optional grammar correction for user messages
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: UserLevel;
  systemInstruction: string;
}

export interface LiveSessionState {
  isConnected: boolean;
  isSpeaking: boolean; // Is the user speaking?
  isModelSpeaking: boolean;
  volume: number;
}

// Audio Types for Live API
export interface PCMData {
  data: string; // Base64
  mimeType: string;
}