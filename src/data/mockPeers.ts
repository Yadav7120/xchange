import { PeerUser } from "../types";

export const mockPeers: PeerUser[] = [
  {
    id: "peer-1",
    name: "Marcus Vance",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    email: "marcus.vance@university.edu",
    major: "Music Performance & Math Minor",
    canTeach: ["Classical Guitar", "Spanish", "Music Theory"],
    wantToLearn: ["Calculus", "TypeScript", "UI Design"],
    rating: 4.9,
    completedExchanges: 14,
    bio: "Hey! I am a senior majoring in classical guitar. I am currently struggling with my advanced calculus class and would love to trade some guitar or Spanish lessons for solid math tutoring!"
  },
  {
    id: "peer-2",
    name: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    email: "elena.r@university.edu",
    major: "Computer Science",
    canTeach: ["Machine Learning", "Python", "Data Structures"],
    wantToLearn: ["UI Design", "Public Speaking", "Organic Chemistry"],
    rating: 4.8,
    completedExchanges: 22,
    bio: "CS student passionate about AI. I can teach you machine learning, Python scripting, or interview-ready data structures! I really want to level up my Figma and UI/UX design skills in return."
  },
  {
    id: "peer-3",
    name: "Sofia Patterson",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
    major: "Economics & Writing",
    email: "sofia.p@university.edu",
    canTeach: ["Microeconomics", "Essay Writing", "French Level 1"],
    wantToLearn: ["Calculus", "UI Design", "Python"],
    rating: 4.7,
    completedExchanges: 8,
    bio: "Hi! I can help you draft compelling essays, analyze economic charts, or practice conversational French. Looking to learn Calculus I or Python!"
  },
  {
    id: "peer-4",
    name: "Kenji Tanaka",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    major: "Business Administration",
    email: "kenji.t@university.edu",
    canTeach: ["Cooking Fundamentals", "Japanese Conversational", "Financial Accounting"],
    wantToLearn: ["TypeScript", "Guitar", "French Level 1"],
    rating: 5.0,
    completedExchanges: 11,
    bio: "Exchange student from Tokyo. I can teach you Japanese or how to cook simple, delicious Japanese meals! I want to learn basic guitar to play for my friends."
  },
  {
    id: "peer-5",
    name: "Jordan Alvarez",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    major: "Pre-Med & Chemistry",
    email: "j.alvarez@university.edu",
    canTeach: ["Chemistry", "Organic Chemistry", "Biology"],
    wantToLearn: ["Spanish", "Classical Guitar", "Music Theory"],
    rating: 4.9,
    completedExchanges: 19,
    bio: "Pre-med junior eager to help you ace your chemistry labs. I am trying to learn Spanish to better communicate with patients and want to learn basic guitar just for fun!"
  }
];
