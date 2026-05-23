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
  Camera,
  Zap,
  TrendingUp,
  Search,
  Laptop,
  Crown
} from "lucide-react";
import { Transaction, PeerUser, ChatMessage, NoteFile, Resource } from "../types";
import { mockPeers } from "../data/mockPeers";
import { CurrentUser } from "./AuthPage";

interface ProfileProps {
  onBackToLanding: () => void;
  currentUser: CurrentUser;
  onUpdateUser: (updatedUser: CurrentUser) => void;
  onLogout: () => void;
  onNavigate: (view: "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth" | "workspace") => void;
}

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";

export function Profile({ onBackToLanding, currentUser, onUpdateUser, onLogout, onNavigate }: ProfileProps) {
  // User profile state
  const [name, setName] = useState(currentUser.name);
  const [major, setMajor] = useState(currentUser.major);
  const [bio, setBio] = useState(currentUser.bio);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      isPremium: currentUser.isPremium,
      avatarUrl
    });
  }, [name, major, bio, canTeachKey, wantToLearnKey, tokens, avatarUrl]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "t-init",
      type: "earn",
      amount: 30,
      description: "Welcome grant for joining Xchange",
      date: "May 22, 2026"
    }
  ]);

  // Matching Engine State
  const [matches, setMatches] = useState<Array<PeerUser & { matchScore: number; directMatch: boolean }>>([]);
  const [activeWorkspacePeer, setActiveWorkspacePeer] = useState<PeerUser | null>(null);

  // Chat conversation state
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [currentMessageText, setCurrentMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Notes file upload mock database
  const [sharedNotes, setSharedNotes] = useState<Record<string, NoteFile[]>>({});

  // My uploaded resources
  const [myResources, setMyResources] = useState<Resource[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    const fetchMyResources = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import("firebase/firestore");
        const q = query(
          collection(db, "resources"),
          where("authorEmail", "==", currentUser.email)
        );
        unsubscribe = onSnapshot(q, (snapshot) => {
          const resourcesData: Resource[] = [];
          snapshot.forEach((doc) => {
            resourcesData.push(doc.data() as Resource);
          });
          resourcesData.sort((a, b) => b.id.localeCompare(a.id));
          setMyResources(resourcesData);
        });
      } catch (err) {
        console.error("Error fetching my resources", err);
      }
    };
    fetchMyResources();
    return () => unsubscribe();
  }, [currentUser.email]);

  // Drag and drop / local upload simulator states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live video call mock states
  const [isJoinedCall, setIsJoinedCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callTimer, setCallTimer] = useState(0);
  const callIntervalRef = useRef<number | null>(null);

  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState("");
  
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [confirmStage, setConfirmStage] = useState<number>(0);
  const [showProfileSaveConfirm, setShowProfileSaveConfirm] = useState(false);

  const executeDeleteResource = async () => {
    if (!resourceToDelete) return;
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "resources", resourceToDelete));
      setResourceToDelete(null);
      setConfirmStage(0);
    } catch (e) {
      console.error(e);
      alert("Failed to delete resource.");
    }
  };

  const handleEditResourceSave = async (id: string) => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "resources", id), {
        title: editingTitle,
        description: editingDesc
      });
      setEditingResourceId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update resource.");
    }
  };

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

  // Exchange reward mechanics (10 tokens earned for teaching, spent for learning)
  const processTeachSession = (peerName: string, skill: string) => {
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

  const processLearnSession = (peerName: string, skill: string) => {
    if (tokens < 10) {
      alert("Insufficient Skill Tokens! Please run a teaching session to earn Xtokens first.");
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
  useEffect(() => {
    const calculateMatches = async () => {
      // First try to load peers from firestore users, if none found, we use an empty array.
      let allUsers: PeerUser[] = [];
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Exclude current user from matches
          if (data.email !== currentUser.email) {
            allUsers.push({
              id: doc.id,
              name: data.name || "Unknown",
              avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
              email: data.email,
              major: data.major || "Undecided",
              canTeach: data.canTeach || [],
              wantToLearn: data.wantToLearn || [],
              rating: 5.0,
              completedExchanges: 0,
              bio: data.bio || ""
            });
          }
        });
      } catch (err) {
        console.error("Error fetching users for matching", err);
      }

      const sortedMatches = allUsers.map(peer => {
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
  }, [canTeach, wantToLearn, currentUser.email]);

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
        responseText = `The 10-token policy on Xchange is awesome because neither of us have to pay cash! I have enough tokens to learn from you, or I can teach you guitar to earn some.`;
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleRealFileUpload(file);
    }
  };

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleRealFileUpload(file);
    }
  };

  const handleRealFileUpload = async (file: File) => {
    if (!activeWorkspacePeer) return;
    const peerId = activeWorkspacePeer.id;
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    
    // Add pending state
    const newFile: NoteFile = {
      id: `note-${Date.now()}`,
      name: file.name,
      size: sizeStr,
      uploadedAt: "Uploading..."
    };
    
    setSharedNotes(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || []), newFile]
    }));

    try {
      // Create Object URL as fallback preview
      let downloadURL = "";
      try {
        downloadURL = URL.createObjectURL(file);
      } catch(e) {}
      
      try {
        const fileRef = ref(storage, `chat_notes/${peerId}_${Date.now()}_${file.name}`);
        const snap = await uploadBytes(fileRef, file);
        downloadURL = await getDownloadURL(snap.ref);
      } catch (storageErr) {
        console.error("Storage upload error for chat notes", storageErr);
      }

      setSharedNotes(prev => ({
        ...prev,
        [peerId]: prev[peerId].map(f => f.id === newFile.id ? { ...f, uploadedAt: "Just now", fileUrl: downloadURL } : f)
      }));
    } catch (err) {
      console.error(err);
      setSharedNotes(prev => ({
        ...prev,
        [peerId]: prev[peerId].map(f => f.id === newFile.id ? { ...f, uploadedAt: "Failed" } : f)
      }));
    }
  };

  return (
    <>
      <div className="pt-24 min-h-screen bg-slate-950 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            id="back-home-button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Discovery
          </button>
          
          <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 text-indigo-400 px-4 py-2 rounded-full font-bold shadow-xl">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            Scholar Dashboard
          </div>
        </div>

        {/* Improved Bento-Grid Layout */}
        {!activeWorkspacePeer ? (
          <div className="space-y-12 animate-fade-in text-left">
            
            {/* DASHBOARD ACTION HIGHLIGHT HUBS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { name: "Match Finder", icon: Search, color: "bg-indigo-600", border: "border-indigo-500/20", desc: "Discover peer partners", view: "match" },
                 { name: "Live Space", icon: Laptop, color: "bg-blue-600", border: "border-blue-500/20", desc: "Digital study rooms", view: "learn" },
                 { name: "Resources", icon: BookOpen, color: "bg-emerald-600", border: "border-emerald-500/20", desc: "Academic study files", view: "workspace" },
                 { name: "Get Mentors", icon: Crown, color: "bg-amber-600", border: "border-amber-500/20", desc: "Connect with faculty", view: "premium" }
               ].map((item, idx) => (
                 <motion.div
                   key={idx}
                   whileHover={{ scale: 1.02, y: -4 }}
                   onClick={() => onNavigate(item.view as any)}
                   className={`bg-slate-900/50 backdrop-blur-sm p-6 rounded-[2rem] border ${item.border} shadow-2xl cursor-pointer transition-all flex flex-col items-center text-center group hover:bg-slate-900`}
                 >
                   <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-black/50 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-white mb-1">{item.name}</h4>
                   <p className="text-[11px] text-slate-500">{item.desc}</p>
                 </motion.div>
               ))}
            </div>

            {/* Top Row: User Primary Info & Wallet Balance */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              
              {/* User Profile Card - 8 Cols */}
              <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600"></div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8 mt-4">
                  <div className="relative shrink-0 self-start md:self-center">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={name} 
                        referrerPolicy="no-referrer"
                        className="w-32 h-32 rounded-[2rem] object-cover border-4 border-indigo-50 dark:border-slate-800 shadow-lg bg-slate-50 dark:bg-slate-800 transition-colors"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-[2rem] bg-indigo-100 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-4xl font-heading shrink-0 transition-colors">
                        {name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </div>
                    )}
                    {isEditingProfile && (
                       <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                         <Camera className="w-4 h-4" />
                         <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setIsUploading(true);
                                    const objectUrl = URL.createObjectURL(file);
                                    setAvatarUrl(objectUrl);
                                    const storageRef = ref(storage, `profiles/${currentUser.name}_${Date.now()}`);
                                    const snapshot = await uploadBytes(storageRef, file);
                                    const downloadURL = await getDownloadURL(snapshot.ref);
                                    setAvatarUrl(downloadURL);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setIsUploading(false);
                                  }
                                }
                            }}
                         />
                       </label>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-left space-y-4">
                    <div>
                      {isEditingProfile ? (
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="text-3xl font-black text-slate-900 dark:text-white border-b-2 bg-transparent border-indigo-200 dark:border-slate-700 w-full font-heading focus:border-indigo-600 focus:outline-none transition-colors"
                        />
                      ) : (
                        <h2 className="text-4xl font-black text-white font-heading tracking-tight">
                          {name}
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                            Academic Tier
                          </span>
                        </h2>
                      )}
                      {isEditingProfile ? (
                        <input 
                          type="text" 
                          value={major} 
                          onChange={(e) => setMajor(e.target.value)} 
                          className="text-sm text-slate-500 dark:text-slate-400 border bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 mt-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                      ) : (
                        <p className="text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-2 font-medium transition-colors">
                          <GraduationCap className="w-5 h-5 text-indigo-500" />
                          {major}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">Bio & Scholar Profile</p>
                       {isEditingProfile ? (
                         <textarea 
                           value={bio} 
                           onChange={(e) => setBio(e.target.value)} 
                           rows={3}
                           className="text-sm text-slate-600 dark:text-slate-300 border bg-slate-50 dark:bg-slate-800 rounded-xl p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                         />
                       ) : (
                         <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                           {bio}
                         </p>
                       )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                   <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-sm transition-colors">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="font-mono truncate">{currentUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-sm transition-colors">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">Verified Academic Node</span>
                      </div>
                   </div>
                   <div className="flex justify-start md:justify-end items-center gap-3">
                      <button 
                        onClick={onLogout}
                        className="text-xs font-bold text-red-650 hover:text-white hover:bg-red-600 bg-red-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Log Out
                      </button>
                      <button 
                        onClick={() => isEditingProfile ? setShowProfileSaveConfirm(true) : setIsEditingProfile(true)}
                        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        {isEditingProfile ? "Save Changes" : "Update Profile"}
                      </button>
                   </div>
                </div>
              </div>

              {/* Wallet Integration Card - 4 Cols */}
              <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Skill Account Ledger</span>
                    <Coins className="w-6 h-6 text-amber-500" />
                  </div>

                  <div className="space-y-2 mb-8">
                    <p className="text-slate-400 text-xs font-medium">Available Balance</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-black font-heading tracking-tight tracking-tighter">
                        {tokens}
                      </span>
                      <span className="text-sm font-bold text-indigo-400">Xtoken</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-wide mt-2">
                       <TrendingUp className="w-3 h-3" />
                       Active Credential Node
                    </p>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-800">
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Recent Deposit</span>
                        <span className="text-emerald-400 font-bold">+{transactions[0]?.amount || 0} cr</span>
                     </div>
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Last Activity</span>
                        <span className="text-slate-300 font-mono italic">{transactions[0]?.date || "Pending..."}</span>
                     </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {/* Navigate to wallet if needed or just trigger purchase modal */}}
                  className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  View Detailed Transactions
                </button>
              </div>
            </div>

            {/* Second Row: Skills Inventory & Resources Management */}
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Skills Card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl rounded-full"></div>
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-800">
                   <h3 className="text-xl font-bold text-white font-heading tracking-tight flex items-center gap-2.5">
                      <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                      Skill Inventory
                   </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                   {/* Teach Section */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Knowledge to Share</span>
                         <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-500/20">
                            {canTeach.length} Vectors
                         </span>
                      </div>
                      
                      <form onSubmit={handleAddTeachSkill} className="relative">
                        <input 
                          type="text"
                          value={teachInput}
                          onChange={(e) => setTeachInput(e.target.value)}
                          placeholder="Add a skill you've mastered..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                        />
                        <button 
                          type="submit"
                          className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {canTeach.map((skill, idx) => (
                           <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={idx} 
                            className="group bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center gap-2 cursor-default"
                           >
                              {skill}
                              <X 
                                onClick={() => handleRemoveTeachSkill(idx)}
                                className="w-3 h-3 text-slate-600 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                              />
                           </motion.span>
                        ))}
                      </div>
                   </div>

                   {/* Learn Section */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth Targets</span>
                         <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-500/20">
                            {wantToLearn.length} Goals
                         </span>
                      </div>

                      <form onSubmit={handleAddLearnSkill} className="relative">
                        <input 
                          type="text"
                          value={learnInput}
                          onChange={(e) => setLearnInput(e.target.value)}
                          placeholder="Add a skill you wish to learn..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner"
                        />
                        <button 
                          type="submit"
                          className="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-lg active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {wantToLearn.map((skill, idx) => (
                           <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={idx} 
                            className="group bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-800 hover:border-purple-500/50 transition-all flex items-center gap-2 cursor-default"
                           >
                              {skill}
                              <X 
                                onClick={() => handleRemoveLearnSkill(idx)}
                                className="w-3 h-3 text-slate-600 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                              />
                           </motion.span>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Resources Card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl rounded-full"></div>
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-800">
                   <h3 className="text-xl font-bold text-white font-heading tracking-tight flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      Academic Library
                   </h3>
                </div>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {myResources.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                         <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 mb-4">
                            <Upload className="w-5 h-5 text-slate-700" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest">No assets published</p>
                      </div>
                   ) : (
                      myResources.map(res => (
                         <div key={res.id} className="group/item flex items-center gap-4 bg-slate-950 hover:bg-slate-800 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                               <FileText className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="text-sm font-bold text-slate-200 truncate">{res.title}</h4>
                               <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                 <span className="uppercase">{res.type}</span>
                                 <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                 <span>{res.fileSize}</span>
                               </p>
                            </div>
                            <button 
                               onClick={() => {
                                 setResourceToDelete(res.id);
                                 setConfirmStage(1);
                               }}
                               className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                            >
                               <X className="w-4 h-4" />
                            </button>
                         </div>
                      ))
                   )}
                </div>
              </div>
            </div>

            {/* Matches & Recommended Swaps Section */}
            <div className="pt-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="text-left">
                     <h3 className="text-2xl font-black text-white font-heading tracking-tight">Xchange Matching Engine</h3>
                     <p className="text-sm text-slate-500">Live peer recommendations based on your current skill vectors</p>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {matches.slice(0, 6).map(peer => (
                    <div 
                      key={peer.id}
                      onClick={() => setActiveWorkspacePeer(peer)}
                      className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                        peer.directMatch 
                          ? "border-indigo-200 dark:border-indigo-800 ring-4 ring-indigo-50 dark:ring-indigo-900/20" 
                          : "border-slate-100 dark:border-slate-800"
                      }`}
                    >
                       <div className="flex items-center gap-4 mb-6">
                          <img 
                            src={peer.avatarUrl} 
                            alt={peer.name} 
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm transition-colors"
                          />
                          <div className="min-w-0">
                             <h4 className="font-bold text-slate-900 dark:text-white truncate transition-colors">{peer.name}</h4>
                             <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider transition-colors">{peer.major}</p>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 transition-colors">
                          <div className="text-center">
                             <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1 transition-colors">Trust</p>
                             <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{peer.rating}<span className="text-[10px] text-amber-500 ml-0.5">★</span></p>
                          </div>
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 transition-colors"></div>
                          <div className="text-center">
                             <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1 transition-colors">Match</p>
                             <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 transition-colors">{peer.matchScore}%</p>
                          </div>
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 transition-colors"></div>
                          <div className="text-center">
                             <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1 transition-colors">Trades</p>
                             <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{peer.completedExchanges}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center gap-2 overflow-hidden">
                             <span className="text-[9px] font-black text-slate-400 uppercase shrink-0 transition-colors">Swap:</span>
                             <div className="flex gap-1 overflow-hidden">
                                {peer.canTeach.slice(0, 2).map((s, i) => (
                                   <span key={i} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors whitespace-nowrap">{s}</span>
                                ))}
                             </div>
                          </div>
                          <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                             Connect to Workspace
                          </button>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-md overflow-hidden animate-fade-in transition-colors">
                {/* Active Session Header bar */}
                <div className="bg-indigo-900 border-b border-indigo-800 text-white p-5 flex items-center justify-between">
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

                  <div className="flex items-center gap-2 text-xs bg-indigo-500/30 border border-indigo-400/20 text-white px-3 py-1.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Secure Workspace Channel
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
                                {file.fileUrl ? (
                                  <a href={file.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline truncate">
                                    {file.name}
                                  </a>
                                ) : (
                                  <span className="font-medium text-slate-700 truncate">{file.name}</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono flex flex-col items-end">
                                <span>{file.size}</span>
                                {file.uploadedAt === "Uploading..." && <span className="text-indigo-400">Uploading...</span>}
                              </span>
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
            )}
          </div>

        </div>
      
      <AnimatePresence>
        {confirmStage > 0 && resourceToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-5 border border-slate-100"
            >
              <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <X className="w-6 h-6" />
              </div>
              
              {confirmStage === 1 ? (
                <>
                  <h3 className="text-lg font-bold text-slate-800 font-heading">Delete Resource?</h3>
                  <p className="text-sm text-slate-500">Are you sure you want to remove this uploaded resource? It will be permanently removed from the global workspace.</p>
                  <div className="flex items-center gap-3 justify-center pt-2">
                    <button 
                      onClick={() => { setConfirmStage(0); setResourceToDelete(null); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setConfirmStage(2)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      Yes, Delete It
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-red-600 font-heading">Final Verification</h3>
                  <p className="text-sm text-slate-600 font-semibold underline decoration-red-200 decoration-2">Are you absolutely sure?</p>
                  <p className="text-xs text-slate-500">This cannot be undone.</p>
                  <div className="flex items-center gap-3 justify-center pt-2">
                    <button 
                      onClick={() => { setConfirmStage(0); setResourceToDelete(null); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      No, Keep It
                    </button>
                    <button 
                      onClick={executeDeleteResource}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all border border-red-500"
                    >
                      Confirm Deletion
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileSaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-5 border border-slate-100"
            >
              <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-heading">Save Profile Changes?</h3>
              <p className="text-sm text-slate-500">Are you sure you want to apply these updates to your public profile?</p>
              
              <div className="flex items-center gap-3 justify-center pt-4">
                <button 
                  onClick={() => setShowProfileSaveConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setShowProfileSaveConfirm(false);
                    try {
                      const { doc, updateDoc } = await import("firebase/firestore");
                      const { getDocs, query, collection, where } = await import("firebase/firestore");
                      const q = query(collection(db, "users"), where("email", "==", currentUser.email));
                      const snap = await getDocs(q);
                      if (!snap.empty) {
                        const userDocId = snap.docs[0].id;
                        await updateDoc(doc(db, "users", userDocId), {
                          name,
                          major,
                          bio,
                          avatarUrl
                        });
                      }
                      onUpdateUser({ ...currentUser, name, major, bio, avatarUrl });
                      setIsEditingProfile(false);
                    } catch (err) {
                      console.error("Failed to save profile:", err);
                      alert("Failed to save profile changes.");
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Apply Updates
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
