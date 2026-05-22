export interface Transaction {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  date: string;
}

export interface PeerUser {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  major: string;
  canTeach: string[];
  wantToLearn: string[];
  rating: number;
  completedExchanges: number;
  bio: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "peer";
  text: string;
  timestamp: string;
}

export interface NoteFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}
