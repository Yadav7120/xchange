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

export interface Resource {
  id: string;
  title: string;
  type: string;
  subject: string;
  project: string;
  description: string;
  author: string;
  authorEmail: string;
  date: string;
  fileSize: string;
  downloads: number;
  fileUrl?: string;
}

export interface NoteFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  fileUrl?: string; // Add remote URL
}

export interface SkillRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: string;
  fromEmail: string;
  toId: string;
  skillTitle: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}
