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
import { Transaction, PeerUser, ChatMessage, NoteFile, Resource } from "../types";
import { mockPeers } from "../data/mockPeers";
import { CurrentUser } from "./AuthPage";

interface ProfileProps {
  onBackToLanding: () => void;
  currentUser: CurrentUser;
  onUpdateUser: (updatedUser: CurrentUser) => void;
  onLogout: () => void;
}

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";

export function Profile({ onBackToLanding, currentUser, onUpdateUser, onLogout }: ProfileProps) {
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
      avatarUrl
    });
  }, [name, major, bio, canTeachKey, wantToLearnKey, tokens, avatarUrl]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "t-init",
      type: "earn",
      amount: 30,
      description: "Welcome grant for joining xchange",
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
            Profile Dashboard
          </div>
        </div>

        {/* Dashboard Grid split-pane */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Profile info, Wallet, Skills) - 5 Cols */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-500"></div>
              
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

              {/* Profile pic changer (No presets - Custom URL input only) */}
              {isEditingProfile && (
                <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 mt-2 animate-fade-in text-left">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Custom Profile Image</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploading(true);
                            // As a fallback for permissions, generate object URL immediately for preview
                            try {
                              const objectUrl = URL.createObjectURL(file);
                              setAvatarUrl(objectUrl);
                            } catch (e) {
                              /* ignore */
                            }
                            
                            const storageRef = ref(storage, `profiles/${currentUser.name}_${Date.now()}`);
                            const snapshot = await uploadBytes(storageRef, file);
                            const downloadURL = await getDownloadURL(snapshot.ref);
                            setAvatarUrl(downloadURL);
                          } catch (err) {
                            console.error("Error uploading file to storage:", err);
                            // Fallback to FileReader DataURL if storage fails due to rules
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              if (re.target?.result) setAvatarUrl(re.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                      className="w-full text-xs"
                      disabled={isUploading}
                    />
                    {isUploading && <p className="text-[10px] text-indigo-600 font-bold">Uploading...</p>}
                    

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
                  onClick={() => {
                    if (isEditingProfile) {
                      setShowProfileSaveConfirm(true);
                    } else {
                      setIsEditingProfile(true);
                    }
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/75 transition-colors px-4 py-2 rounded-lg"
                >
                  {isEditingProfile ? "Save Profile" : "Edit Profile Info"}
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
                  <p className="text-slate-400 text-xs">Current Wallet Balance</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-black font-heading tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-slate-200">
                      {tokens}
                    </span>
                    <span className="text-sm font-semibold text-indigo-300">Xtoken</span>
                  </div>
                  <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    Earn 10 Xtokens per teaching session!
                  </p>
                </div>

                {/* Automated transactional wallet banner (no manual adjustments) */}
                <div className="bg-slate-800/50 border border-slate-700/50 p-3.5 rounded-2xl mb-6 text-slate-300 text-xs flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-450 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Wallet Automated Mode</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Xtoken transaction calculations are triggered automatically on live session completed study states and peer bookings.</p>
                  </div>
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

            {/* My Uploaded Resources Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3.5 rounded bg-emerald-500"></span>
                  My Uploaded Resources
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {myResources.length} Items
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage files you've shared in the global academic workspace.
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {myResources.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No resources uploaded yet.</p>
                ) : (
                  myResources.map(res => (
                    <div key={res.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                      {editingResourceId === res.id ? (
                        <div className="space-y-2">
                          <input 
                            value={editingTitle} 
                            onChange={e => setEditingTitle(e.target.value)}
                            className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2 py-1.5 rounded focus:ring-2 focus:ring-indigo-500"
                            placeholder="Resource Title"
                          />
                          <textarea 
                            value={editingDesc} 
                            onChange={e => setEditingDesc(e.target.value)}
                            className="w-full text-xs text-slate-600 bg-white border border-slate-200 px-2 py-1.5 rounded focus:ring-2 focus:ring-indigo-500"
                            placeholder="Description"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 p-1">
                            <button onClick={() => setEditingResourceId(null)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button onClick={() => handleEditResourceSave(res.id)} className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-800">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-bold text-sm text-slate-800 leading-tight">{res.title}</h4>
                            <div className="flex gap-1 shrink-0">
                               <button 
                                 onClick={() => {
                                   setEditingTitle(res.title);
                                   setEditingDesc(res.description);
                                   setEditingResourceId(res.id);
                                 }}
                                 className="text-indigo-400 hover:text-indigo-600 p-1"
                                 title="Edit"
                               >
                                 <BookOpen className="w-3.5 h-3.5" />
                               </button>
                               <button 
                                 onClick={() => {
                                   setResourceToDelete(res.id);
                                   setConfirmStage(1);
                                 }}
                                 className="text-red-400 hover:text-red-600 p-1"
                                 title="Delete"
                               >
                                 <X className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                            {res.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                             <span className="uppercase text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{res.type}</span>
                             <span>{res.fileSize}</span>
                             {res.fileUrl && (
                               <a href={res.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline inline-flex items-center gap-0.5">
                                 <ExternalLink className="w-2.5 h-2.5" /> View File
                               </a>
                             )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
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
            ) : (
              
              /* STANDARD ACTIVE PROFILE DASHBOARD VIEW (MATCHING ENGINE) */
              <div className="space-y-6">
                
                {/* Active search matching metrics bar */}

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

    </div>
  );
}
