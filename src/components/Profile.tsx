import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  Plus, 
  X, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Tv, 
  Upload, 
  FileText, 
  ArrowLeft, 
  Check, 
  ArrowRight,
  ExternalLink,
  BookOpen,
  Send,
  Video,
  Mic,
  MicOff,
  VideoOff,
  User,
  GraduationCap,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Camera
} from "lucide-react";
import { Transaction, PeerUser, ChatMessage, NoteFile } from "../types";
import { mockPeers } from "../data/mockPeers";
import { CurrentUser } from "./AuthPage";

interface ProfileProps {
  onBackToLanding: () => void;
  currentUser: CurrentUser;
  onUpdateUser: (updatedUser: CurrentUser) => void;
  onLogout: () => void;
}

export function Profile({ onBackToLanding, currentUser, onUpdateUser, onLogout }: ProfileProps) {
  // User profile state
  const [name, setName] = useState(currentUser.name);
  const [major, setMajor] = useState(currentUser.major);
  const [bio, setBio] = useState(currentUser.bio);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150");
  const [useCustomProfileAvatar, setUseCustomProfileAvatar] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");

  const avatarPresets = [
    { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", label: "Sophia (Design)" },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120", label: "Marcus (Physics)" },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", label: "Elena (Languages)" },
    { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", label: "David (Music)" },
    { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120", label: "Aisha (Math)" },
  ];

  // Skill tags state (Starts with pre-populated tags as described)
  const [canTeach, setCanTeach] = useState<string[]>(currentUser.canTeach);
  const [wantToLearn, setWantToLearn] = useState<string[]>(currentUser.wantToLearn);

  // Skill Inputs
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

  // Token & Transactions State (Starts at 10 tokens as instructed)
  const [tokens, setTokens] = useState(currentUser.tokens);

  // Sync edits back to parent safely
  const canTeachKey = canTeach.join(",");
  const wantToLearnKey = wantToLearn.join(",");

  useEffect(() => {
    onUpdateUser({
      name,
      email: currentUser.email,
      major,
      bio,
      canTeach,
      wantToLearn,
      tokens,
      avatarUrl
    });
  }, [name, major, bio, canTeachKey, wantToLearnKey, tokens, avatarUrl]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "t-init",
      type: "earn",
      amount: 10,
      description: "Welcome credit for joining xchange",
      date: "May 22, 2026"
    }
  ]);

  // Matching Engine State
  const [matches, setMatches] = useState<Array<PeerUser & { matchScore: number; directMatch: boolean }>>([]);
  const [activeWorkspacePeer, setActiveWorkspacePeer] = useState<PeerUser | null>(null);

  // Chat conversation state
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({
    "peer-1": [
      { id: "m-1", sender: "peer", text: "Hey! I saw you can teach Calculus and UI Design. Music theory is also my jam! Care to swap dynamic scheduling for guitar lessons?", timestamp: "4 hours ago" }
    ],
    "peer-2": [
      { id: "m-2", sender: "peer", text: "Hi Alex! Your TypeScript feedback looks super solid. I can definitely teach you advanced deep learning frameworks in swap!", timestamp: "Just now" }
    ]
  });
  const [currentMessageText, setCurrentMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Notes file upload mock database
  const [sharedNotes, setSharedNotes] = useState<Record<string, NoteFile[]>>({
    "peer-1": [
      { id: "n-1", name: "Calculus-CheatSheet.pdf", size: "1.4 MB", uploadedAt: "Yesterday" },
      { id: "n-2", name: "Guitar_Fingerpicking_Tabs.pdf", size: "840 KB", uploadedAt: "Today" }
    ],
    "peer-2": [
      { id: "n-3", name: "PyTorch_Introduction.pdf", size: "2.8 MB", uploadedAt: "3 days ago" }
    ]
  });

  // Drag and drop / local upload simulator states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live video call mock states
  const [isJoinedCall, setIsJoinedCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callTimer, setCallTimer] = useState(0);
  const callIntervalRef = useRef<number | null>(null);

  // Form Submitters
  const handleAddTeachSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = teachInput.trim();
    if (trimmed && !canTeach.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setCanTeach([...canTeach, trimmed]);
      setTeachInput("");
    }
  };

  const handleAddLearnSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = learnInput.trim();
    if (trimmed && !wantToLearn.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setWantToLearn([...wantToLearn, trimmed]);
      setLearnInput("");
    }
  };

  const handleRemoveTeachSkill = (index: number) => {
    setCanTeach(canTeach.filter((_, i) => i !== index));
  };

  const handleRemoveLearnSkill = (index: number) => {
    setWantToLearn(wantToLearn.filter((_, i) => i !== index));
  };

  // Simulated exchange reward mechanics (10 tokens earned for teaching, spent for learning)
  const simulateTeachSession = (peerName: string, skill: string) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "earn",
      amount: 10,
      description: `Taught ${skill} to ${peerName}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    setTokens(prev => prev + 10);
    setTransactions(prev => [newTx, ...prev]);
  };

  const simulateLearnSession = (peerName: string, skill: string) => {
    if (tokens < 10) {
      alert("Insufficient Skill Tokens! Please run a teaching session to earn credits first.");
      return;
    }
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "spend",
      amount: 10,
      description: `Learned ${skill} from ${peerName}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    setTokens(prev => prev - 10);
    setTransactions(prev => [newTx, ...prev]);
  };

  // Run Real-time Matching Engine whenever any skill arrays change
  // Scoring weights:
  // - Direct mutual match: both can trade what they need = 100% Match
  // - Partial canTeach matches their need, OR their canTeach matches your need = 50% Match
  // - Otherwise, any overlapping skills or lower match score
  useEffect(() => {
    const calculateMatches = () => {
      const sortedMatches = mockPeers.map(peer => {
        let directMatchCount = 0;
        let partialMatchCount = 0;

        // Check if I can teach what they want to learn
        const theyWantSkills = peer.wantToLearn.map(s => s.toLowerCase());
        const iCanTeachSkills = canTeach.map(s => s.toLowerCase());
        const teachesMatch = iCanTeachSkills.some(skill => theyWantSkills.includes(skill));

        // Check if they can teach what I want to learn
        const theyTeachSkills = peer.canTeach.map(s => s.toLowerCase());
        const iWantSkills = wantToLearn.map(s => s.toLowerCase());
        const learnsMatch = iWantSkills.some(skill => theyTeachSkills.includes(skill));

        let matchScore = 15; // default base relevance score for other community students
        let directMatch = false;

        if (teachesMatch && learnsMatch) {
          matchScore = 100;
          directMatch = true;
        } else if (teachesMatch || learnsMatch) {
          matchScore = 60;
        } else {
          // Check for keyword sub-elements or tags similarity
          const overlapCount = peer.canTeach.filter(s => canTeach.includes(s)).length;
          if (overlapCount > 0) {
            matchScore = 30;
          }
        }

        return {
          ...peer,
          matchScore,
          directMatch
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setMatches(sortedMatches);
    };

    calculateMatches();
  }, [canTeach, wantToLearn]);

  // Instant messaging interactive state engine
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspacePeer || !currentMessageText.trim()) return;

    const peerId = activeWorkspacePeer.id;
    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: currentMessageText,
      timestamp: "Just now"
    };

    // Update state safely
    setConversations(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), userMsg]
    }));
    setCurrentMessageText("");

    // Simulate smart replies after a short delay
    setTimeout(() => {
      let responseText = `That sounds great! I'm free this Thursday evening if you want to set up an active live session here! Let's swap files or jump on a meeting link.`;
      
      const lowerText = userMsg.text.toLowerCase();
      if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
        responseText = `Hi Alex! Thanks for reaching out. I checked your profile. I would absolutely love to trade notes and start practicing together!`;
      } else if (lowerText.includes("token") || lowerText.includes("credit") || lowerText.includes("pay")) {
        responseText = `The 10-token policy on xchange is awesome because neither of us have to pay cash! I have enough tokens to learn from you, or I can teach you guitar to earn some.`;
      } else if (lowerText.includes("meet") || lowerText.includes("time") || lowerText.includes("schedule") || lowerText.includes("zoom")) {
        responseText = `Perfect! Let's hop onto the live room using the 'Join Meeting Room' panel right here on this study card.`;
      } else if (lowerText.includes("pdf") || lowerText.includes("file") || lowerText.includes("note")) {
        responseText = `I just uploaded my study files to our shared note compartment below! Feel free to upload yours so we can sync them.`;
      }

      const peerMsg: ChatMessage = {
        id: `m-peer-${Date.now()}`,
        sender: "peer",
        text: responseText,
        timestamp: "Just now"
      };

      setConversations(prev => ({
        ...prev,
        [peerId]: [...(prev[peerId] || []), peerMsg]
      }));
    }, 1500);
  };

  // Scroll chat to bottom with smoothness
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, activeWorkspacePeer]);

  // Video Meeting Room simulation stopwatch
  useEffect(() => {
    if (isJoinedCall) {
      callIntervalRef.current = window.setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
      setCallTimer(0);
    }
    return () => {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, [isJoinedCall]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Notes document mockup uploader
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addNewSimulatedFile(file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addNewSimulatedFile(file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`);
    }
  };

  const addNewSimulatedFile = (name: string, size: string) => {
    if (!activeWorkspacePeer) return;
    const newFile: NoteFile = {
      id: `note-${Date.now()}`,
      name: name,
      size: size,
      uploadedAt: "Just now"
    };
    const peerId = activeWorkspacePeer.id;
    setSharedNotes(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), newFile]
    }));
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Breadcrumb back to landing */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            id="back-home-button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Homepage
          </button>
          
          <div className="flex items-center gap-2 text-sm bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Signed In: student-node-active
          </div>
        </div>

        {/* Dashboard Grid split-pane */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Profile info, Wallet, Skills) - 5 Cols */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>
              
              <div className="flex items-center gap-4 mb-6 mt-2">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={name} 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0 bg-slate-50"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-2xl font-heading shrink-0">
                    {name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="text-lg font-bold text-slate-800 border bg-slate-50 rounded-lg px-2 py-1 w-full font-heading focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-slate-900 font-heading truncate">{name}</h2>
                  )}
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={major} 
                      onChange={(e) => setMajor(e.target.value)} 
                      className="text-xs text-slate-500 border bg-slate-50 rounded-lg px-2 py-0.5 mt-1 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {major}
                    </p>
                  )}
                </div>
              </div>

              {/* Profile pic changer */}
              {isEditingProfile && (
                <div className="mb-6 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 mt-2 animate-fade-in text-left">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Update Profile Photo</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    {/* Option toggler */}
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setUseCustomProfileAvatar(false)}
                        className={`text-[9px] font-bold px-2 py-1 rounded border transition-all cursor-pointer ${!useCustomProfileAvatar ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" : "bg-white text-slate-600 border-slate-200"}`}
                      >
                        Presets
                      </button>
                      <button 
                        type="button"
                        onClick={() => setUseCustomProfileAvatar(true)}
                        className={`text-[9px] font-bold px-2 py-1 rounded border transition-all cursor-pointer ${useCustomProfileAvatar ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" : "bg-white text-slate-600 border-slate-200"}`}
                      >
                        Paste URL
                      </button>
                    </div>

                    {!useCustomProfileAvatar ? (
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[280px] scrollbar-none">
                        {avatarPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            title={preset.label}
                            onClick={() => setAvatarUrl(preset.url)}
                            className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 transition-transform ${
                              avatarUrl === preset.url && !useCustomProfileAvatar ? "ring-2 ring-indigo-600 scale-105" : "opacity-75 hover:opacity-100"
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input 
                        type="url"
                        placeholder="Paste secure image address (https://...)"
                        value={customUrlInput || avatarUrl}
                        onChange={(e) => {
                          setCustomUrlInput(e.target.value);
                          setAvatarUrl(e.target.value);
                        }}
                        className="w-full bg-white text-[10px] py-1 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-700"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Student Bio</p>
                {isEditingProfile ? (
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={3}
                    className="text-sm text-slate-600 border bg-slate-50 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic">
                    "{bio}"
                  </p>
                )}
              </div>

              {/* Verified School Contact & Credentials */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-2.5">
                <div className="flex items-center justify-between font-heading">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Verified Student Contact</span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Node
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-650">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700 select-all truncate">{currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div className="flex items-center gap-2.5 text-slate-650">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-700 select-all">{currentUser.phone}</span>
                  </div>
                )}
                {currentUser.qualification && (
                  <div className="flex items-center gap-2.5 text-slate-650">
                    <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-700 font-medium">{currentUser.qualification}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  id="dashboard-logout-button"
                  onClick={onLogout}
                  className="text-xs font-bold text-red-650 hover:text-red-800 bg-red-50 hover:bg-red-100/75 transition-colors px-4 py-2 rounded-lg cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  id="dashboard-edit-button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/75 transition-colors px-4 py-2 rounded-lg"
                >
                  {isEditingProfile ? "Done Editing" : "Edit Profile Info"}
                </button>
              </div>
            </div>

            {/* Wallet Card - Critical Specification */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
              {/* Abs decoration circles */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/25 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-600/25 rounded-full blur-2xl"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Skill Exchange Wallet</span>
                  <Coins className="w-6 h-6 text-yellow-500 animate-spin-slow" />
                </div>

                <div className="mb-6">
                  <p className="text-slate-400 text-xs">Current Token Balance</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-black font-heading tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-slate-200">
                      {tokens}
                    </span>
                    <span className="text-sm font-medium text-slate-300">Credits</span>
                  </div>
                  <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    Earn 10 credits per session you teach!
                  </p>
                </div>

                {/* Simulated credit adjustment triggers */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => simulateTeachSession("Anonymous Peer", "Calculus")}
                    className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-800 text-left p-3 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all text-xs group"
                  >
                    <span className="text-green-400 font-bold mb-0.5 group-hover:scale-110 transition-transform">+10 Tokens</span>
                    <span className="text-slate-400 text-[10px]">Simulate Teaching</span>
                  </button>
                  <button 
                    onClick={() => simulateLearnSession("Marcus Vance", "Classical Guitar")}
                    className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-800 text-left p-3 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all text-xs group"
                  >
                    <span className="text-purple-400 font-bold mb-0.5 group-hover:scale-110 transition-transform">-10 Tokens</span>
                    <span className="text-slate-400 text-[10px]">Simulate Booking</span>
                  </button>
                </div>

                {/* Transaction history stack */}
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Transaction History</h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-xs">
                    {transactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <p className="text-slate-200 truncate font-medium">{tx.description}</p>
                          <p className="text-[10px] text-slate-400">{tx.date}</p>
                        </div>
                        <span className={`font-bold shrink-0 px-2 py-0.5 rounded-full text-[10px] ${
                          tx.type === "earn" ? "text-green-400 bg-green-500/10" : "text-purple-400 bg-purple-500/10"
                        }`}>
                          {tx.type === "earn" ? "+" : "-"}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Skill Tags Setup Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              
              {/* Can Teach Panel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded bg-indigo-600"></span>
                    Skills I Can Teach
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {canTeach.length} Skills
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                  These are subjects you've mastered and can tutor schoolmates in.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {canTeach.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium border border-indigo-100 animate-fade-in"
                    >
                      {skill}
                      <button 
                        onClick={() => handleRemoveTeachSkill(index)}
                        className="text-indigo-400 hover:text-indigo-600 focus:outline-none transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {canTeach.length === 0 && (
                    <span className="text-slate-400 text-xs italic">No skills listed yet. Add one below!</span>
                  )}
                </div>

                <form onSubmit={handleAddTeachSkill} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g., Python, Physics, Piano..." 
                    value={teachInput}
                    onChange={(e) => setTeachInput(e.target.value)}
                    className="flex-1 text-sm bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 text-white rounded-xl p-2 h-9 w-9 flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Want to Learn Panel */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded bg-purple-600"></span>
                    Skills I Want to Learn
                  </h3>
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                    {wantToLearn.length} Skills
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  These are subjects you'd like to read up on or master.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {wantToLearn.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-100 animate-fade-in"
                    >
                      {skill}
                      <button 
                        onClick={() => handleRemoveLearnSkill(index)}
                        className="text-purple-400 hover:text-purple-600 focus:outline-none transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {wantToLearn.length === 0 && (
                    <span className="text-slate-400 text-xs italic">No desires listed yet. Add one below!</span>
                  )}
                </div>

                <form onSubmit={handleAddLearnSkill} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g., French, Chemistry, Jazz..." 
                    value={learnInput}
                    onChange={(e) => setLearnInput(e.target.value)}
                    className="flex-1 text-sm bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button 
                    type="submit"
                    className="bg-purple-600 text-white rounded-xl p-2 h-9 w-9 flex items-center justify-center hover:bg-purple-700 transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* Right Column: Dynamic Matching Engine and Learning Classroom Space - 8 Cols */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Split UI: Active Workspace takes precedence if a peer is clicked */}
            {activeWorkspacePeer ? (
              
              /* ALL-IN-ONE ACTIVE LEARNING SPACE: Chat, PDF Notes, and Video Link */
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-md overflow-hidden animate-fade-in">
                
                {/* Active Session Header bar */}
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveWorkspacePeer(null)}
                      className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <img 
                      src={activeWorkspacePeer.avatarUrl} 
                      alt={activeWorkspacePeer.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-500/50"
                    />
                    <div>
                      <h3 className="font-bold text-base font-heading leading-tight">{activeWorkspacePeer.name}</h3>
                      <p className="text-xs text-indigo-200">Active Skill Exchange partner</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => simulateTeachSession(activeWorkspacePeer.name, canTeach[0] || "Calculus")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Teach ({canTeach[0] || "Calculus"}) +10cr
                    </button>
                    <button 
                      onClick={() => simulateLearnSession(activeWorkspacePeer.name, activeWorkspacePeer.canTeach[0] || "Guitar")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Learn ({activeWorkspacePeer.canTeach[0] || "Guitar"}) -10cr
                    </button>
                  </div>
                </div>

                {/* Subheader containing major matching statistics */}
                <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-3 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-600 text-medium">
                  <div>
                    <span className="font-semibold text-slate-700">Skills trade setup:</span> You teach them <strong className="text-indigo-700">{canTeach.find(s => activeWorkspacePeer.wantToLearn.includes(s)) || canTeach[0] || "your subjects"}</strong> — They teach you <strong className="text-purple-700">{activeWorkspacePeer.canTeach.find(s => wantToLearn.includes(s)) || activeWorkspacePeer.canTeach[0] || "their subjects"}</strong>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-indigo-700">
                    <Users className="w-3.5 h-3.5" />
                    Exchange Space Active
                  </div>
                </div>

                {/* Layout split: Left Side Chat, Right Side notes & Live call mockup */}
                <div className="grid md:grid-cols-12 gap-0 min-h-[480px]">
                  
                  {/* Chat Section — 7 cols */}
                  <div className="md:col-span-7 flex flex-col border-r border-slate-100 bg-white">
                    
                    {/* Chat Area Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] min-h-[300px]">
                      {/* System message */}
                      <div className="text-center">
                        <span className="inline-block text-[10px] bg-slate-100 text-slate-500 rounded-full px-3 py-1">
                          Platform connection secured. Agree on a meeting schedule or trade study sheets!
                        </span>
                      </div>

                      {/* Chat messages */}
                      {(conversations[activeWorkspacePeer.id] || []).map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                            msg.sender === "user" 
                              ? "bg-indigo-600 text-white rounded-br-none" 
                              : "bg-slate-100 text-slate-800 rounded-bl-none"
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <span className={`block text-[9px] mt-1 text-right leading-none ${
                              msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                            }`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={sendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
                      <input 
                        type="text" 
                        placeholder="Type a message to discuss your lesson..."
                        value={currentMessageText}
                        onChange={(e) => setCurrentMessageText(e.target.value)}
                        className="flex-1 bg-white text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                      <button 
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shrink-0 font-medium text-xs gap-1 opacity-90 hover:opacity-100"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>

                  </div>

                  {/* Shared Info (Notes PDF & Call Link) — 5 cols */}
                  <div className="md:col-span-5 p-4 space-y-4 bg-slate-50/75 flex flex-col justify-between">
                    
                    {/* Live Call Block */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-heading">
                          Live Instruction Room
                        </span>
                        <span className="flex h-2 w-2 relative">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isJoinedCall ? "bg-red-400" : "bg-green-400"}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${isJoinedCall ? "bg-red-500" : "bg-green-500"}`}></span>
                        </span>
                      </div>

                      {isJoinedCall ? (
                        /* Joined active call representation */
                        <div className="bg-slate-900 rounded-xl p-3 text-white space-y-3 relative overflow-hidden animate-fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500">
                              AL
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">Study Session (Live)</p>
                              <p className="text-[10px] text-indigo-300 font-mono">{formatTimer(callTimer)} duration</p>
                            </div>
                          </div>

                          {/* Sound wave bars simulated */}
                          <div className="flex items-center justify-center gap-1 py-4">
                            <span className="w-1 bg-indigo-500 rounded animate-pulse" style={{ height: "16px", animationDelay: "0.1s" }} />
                            <span className="w-1 bg-indigo-400 rounded animate-pulse" style={{ height: "32px", animationDelay: "0.3s" }} />
                            <span className="w-1 bg-purple-500 rounded animate-pulse" style={{ height: "24px", animationDelay: "0.2s" }} />
                            <span className="w-1 bg-blue-400 rounded animate-pulse" style={{ height: "14px", animationDelay: "0.5s" }} />
                            <span className="w-1 bg-indigo-500 rounded animate-pulse" style={{ height: "28px", animationDelay: "0.4s" }} />
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button 
                              onClick={() => setIsMicOn(!isMicOn)}
                              className={`p-2 rounded-lg transition-colors ${isMicOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white"}`}
                            >
                              {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => setIsVideoOn(!isVideoOn)}
                              className={`p-2 rounded-lg transition-colors ${isVideoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white"}`}
                            >
                              {isVideoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => setIsJoinedCall(false)}
                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors"
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Call start room button representation */
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500 leading-normal">
                            Direct virtual calling link. No external Zoom account necessary! Tutors use this link for live instruction.
                          </p>
                          <button 
                            onClick={() => setIsJoinedCall(true)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-3 rounded-xl border border-indigo-100 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            Launch Live Meeting Room
                          </button>
                        </div>
                      )}
                    </div>

                    {/* PDF Storage list */}
                    <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-heading mb-2">
                          Study Sheets & Notes (PDF)
                        </h4>
                        
                        <div className="space-y-2 mb-4 overflow-y-auto max-h-[160px]">
                          {(sharedNotes[activeWorkspacePeer.id] || []).map(file => (
                            <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="font-medium text-slate-700 truncate">{file.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">{file.size}</span>
                            </div>
                          ))}
                          {(sharedNotes[activeWorkspacePeer.id] || []).length === 0 && (
                            <p className="text-xs text-slate-400 italic py-2">No sheets shared. Drop files to upload.</p>
                          )}
                        </div>
                      </div>

                      {/* Drop-zone notes simulation */}
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                          dragActive 
                            ? "border-indigo-500 bg-indigo-50/50" 
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Drag PDF notes here</p>
                        <p className="text-[8px] text-slate-400">or click to browse local sheets</p>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleManualUpload} 
                          accept=".pdf,.doc,.docx,.txt" 
                          className="hidden" 
                        />
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            ) : (
              
              /* STANDARD ACTIVE PROFILE DASHBOARD VIEW (MATCHING ENGINE) */
              <div className="space-y-6">
                
                {/* Active search matching metrics bar */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4">
                    <Sparkles className="w-72 h-72" />
                  </div>
                  
                  <div className="relative max-w-xl">
                    <span className="bg-indigo-500/40 text-indigo-100 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/20 inline-block mb-3">
                      Match Engine Active
                    </span>
                    <h2 className="text-2xl font-bold font-heading mb-2 leading-tight">
                      Find compatible university trade partners
                    </h2>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                      Our engine automatically searches the student directory to pair your active tags. Swap instruction with reciprocal matches free of cost!
                    </p>
                  </div>
                </div>

                {/* Matching directory grid stack */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 font-heading">
                      Recommended Matches Near You
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Updated live based on tag changes
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {matches.map(peer => {
                      // Work out what mutual exchange can happen here
                      const overlapsLearn = peer.canTeach.filter(s => wantToLearn.some(w => w.toLowerCase() === s.toLowerCase()));
                      const overlapsTeach = peer.wantToLearn.filter(s => canTeach.some(c => c.toLowerCase() === s.toLowerCase()));
                      
                      return (
                        <div 
                          key={peer.id} 
                          className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                            peer.directMatch 
                              ? "border-indigo-400 bg-indigo-50/5 ring-1 ring-indigo-300" 
                              : "border-slate-100"
                          }`}
                        >
                          <div>
                            {/* Score header */}
                            <div className="flex items-center justify-between mb-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                peer.directMatch 
                                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200" 
                                  : "bg-slate-150 text-slate-650"
                              }`}>
                                {peer.directMatch ? "⚡ 100% Reciprocal Trade Match" : `✓ ${peer.matchScore}% Match Rate`}
                              </span>
                              <span className="text-xs text-yellow-500 font-bold flex items-center gap-1 font-heading">
                                ★ {peer.rating} <span className="text-slate-400 font-normal">({peer.completedExchanges} trades)</span>
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex items-start gap-3 mb-4">
                              <img 
                                src={peer.avatarUrl} 
                                alt={peer.name} 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                              />
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 font-heading leading-none">{peer.name}</h4>
                                <span className="text-[10px] text-slate-400 font-medium">{peer.major}</span>
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                  {peer.bio}
                                </p>
                              </div>
                            </div>

                            {/* Overlapping Trade analysis */}
                            <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 mb-4 text-xs font-medium border border-slate-100">
                              <div>
                                <span className="text-slate-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">They Can Teach You:</span>
                                <div className="flex flex-wrap gap-1">
                                  {peer.canTeach.map((tag, i) => {
                                    const isTargeted = wantToLearn.some(w => w.toLowerCase() === tag.toLowerCase());
                                    return (
                                      <span key={i} className={`px-2 py-0.5 rounded text-[10px] ${
                                        isTargeted 
                                          ? "bg-purple-100 text-purple-700 font-bold border border-purple-200" 
                                          : "bg-slate-200 text-slate-650"
                                      }`}>
                                        {tag}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <span className="text-slate-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">They Want To Learn:</span>
                                <div className="flex flex-wrap gap-1">
                                  {peer.wantToLearn.map((tag, i) => {
                                    const isTargeted = canTeach.some(c => c.toLowerCase() === tag.toLowerCase());
                                    return (
                                      <span key={i} className={`px-2 py-0.5 rounded text-[10px] ${
                                        isTargeted 
                                          ? "bg-indigo-100 text-indigo-700 font-bold border border-indigo-200" 
                                          : "bg-slate-200 text-slate-650"
                                      }`}>
                                        {tag}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-450 italic">
                              {overlapsLearn.length > 0 && overlapsTeach.length > 0 
                                ? "Full swap match!" 
                                : overlapsLearn.length > 0 
                                ? "Earn match!" 
                                : "Overlapping trade tags"}
                            </span>
                            <button
                              onClick={() => {
                                setActiveWorkspacePeer(peer);
                                // Initialize chat if not exists
                                if (!conversations[peer.id]) {
                                  setConversations(prev => ({
                                    ...prev,
                                    [peer.id]: [
                                      { id: "m-start", sender: "peer", text: `Hi there! I would love to schedule a skill trading session. I can help you with ${peer.canTeach.join(" or ")}!`, timestamp: "Just now" }
                                    ]
                                  }));
                                }
                              }}
                              className="inline-flex items-center gap-1 bg-indigo-650 hover:bg-indigo-705 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                            >
                              <span>Exchange Skills</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}
