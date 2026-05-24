import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Search, 
  UserCheck, 
  X, 
  ArrowRight, 
  AlertCircle, 
  Tv, 
  Award, 
  Crown, 
  ChevronRight, 
  BookOpen, 
  User, 
  RefreshCw,
  TrendingDown,
  Check,
  CheckCircle,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Mail,
  Zap,
  MessageSquare,
  Send
} from "lucide-react";
import { PeerUser, SkillRequest } from "../types";
import { mockPeers } from "../data/mockPeers";
import { CurrentUser } from "./AuthPage";
import { db } from "../firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

interface MatchFinderProps {
  onBackToLanding: () => void;
  onNavigateToProfile: () => void;
  currentUser: CurrentUser | null;
  onUpdateUser: (user: CurrentUser) => void;
  onSendRequest: (request: SkillRequest) => void;
}

export function MatchFinder({ onBackToLanding, onNavigateToProfile, currentUser, onUpdateUser, onSendRequest }: MatchFinderProps) {
  // Config state
  const [teachSkill, setTeachSkill] = useState("Calculus");
  const [learnSkill, setLearnSkill] = useState("Spanish");
  

  // App matching states
  const [status, setStatus] = useState<"idle" | "searching" | "matched" | "no_match" | "accepted">("idle");
  const [matchedPeer, setMatchedPeer] = useState<PeerUser | null>(null);
  const [searchDuration, setSearchDuration] = useState(3000); // ms
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const handleSendSwapRequest = () => {
    if (!currentUser || !matchedPeer) return;

    const request: SkillRequest = {
      id: `req-${Date.now()}`,
      fromId: currentUser.email,
      fromName: currentUser.name,
      fromAvatar: currentUser.avatarUrl,
      fromEmail: currentUser.email,
      toId: matchedPeer.id,
      skillTitle: learnSkill,
      message: requestMessage || `Hi ${matchedPeer.name}! I'd love to swap skills with you.`,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    onSendRequest(request);
    setShowRequestModal(false);
    setStatus("accepted"); // Borrowing accepted state for "sent" feedback
  };

  const handleAcceptMatch = async () => {
    if (!currentUser) {
      alert("Please register or log in first before initiating skill matches!");
      setStatus("idle");
      return;
    }

    if (currentUser.tokens < 10) {
      alert(`Booking Aborted! You do not have enough Xtokens in your wallet to book a new skill swap (Cost: 10 Xtokens).\nYour Wallet: ${currentUser.tokens} Xtokens.\nPlease facilitate user instruction sessions on the workspace to earn tokens first!`);
      return;
    }

    try {
      const newTokens = currentUser.tokens - 10;
      
      // Update tokens in Firestore
      const userRef = doc(db, "users", currentUser.email);
      await updateDoc(userRef, { tokens: newTokens });

      // Save transaction history conceptually
      const txId = `tx-booked-${Date.now()}`;
      const txRef = doc(db, "users", currentUser.email, "transactions", txId);
      await setDoc(txRef, {
        id: txId,
        type: "spend",
        amount: 10,
        description: `Booked reciprocal class swap for ${learnSkill} with ${matchedPeer?.name || "Community Partner"}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      });

      // Update local state
      onUpdateUser({
        ...currentUser,
        tokens: newTokens
      });
      setStatus("accepted");
    } catch (e) {
      console.error("Error updating tokens or transaction info:", e);
      alert("Something went wrong when securing tokens.");
    }
  };

  // Active radar scan faces
  const [scanAvatars, setScanAvatars] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<PeerUser[]>([]);

  useEffect(() => {
    // Load initial users for radar
    const fetchUsers = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("../firebase");
        const querySnapshot = await getDocs(collection(db, "users"));
        const users: PeerUser[] = [];
        const avatars: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!currentUser || data.email !== currentUser.email) {
            users.push({
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
            avatars.push(data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150");
          }
        });
        setAllUsers(users);
        setScanAvatars(avatars.length > 0 ? avatars : ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"]);
      } catch (err) {
        setScanAvatars(["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"]);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const [activeScanFaceIndex, setActiveScanFaceIndex] = useState(0);

  useEffect(() => {
    let interval: number | null = null;
    if (status === "searching" && scanAvatars.length > 0) {
      interval = window.setInterval(() => {
        setActiveScanFaceIndex(prev => (prev + 1) % scanAvatars.length);
      }, 350);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, scanAvatars]);

  // Handle Match Search trigger
  const handleSearch = () => {
    setStatus("searching");
    setMatchedPeer(null);

    setTimeout(() => {
      if (teachSkill.trim().toLowerCase() === "unknown obscure skill") {
        setStatus("no_match");
      } else {
        // Find best match in real database
        // Look for peer that can teach learnSkill or wants teachSkill
        const lookForMatch = allUsers.find(peer => {
          const teachesMatch = peer.canTeach.some(s => s.toLowerCase().includes(learnSkill.toLowerCase()) || learnSkill.toLowerCase().includes(s.toLowerCase()));
          const wantsMatch = peer.wantToLearn.some(s => s.toLowerCase().includes(teachSkill.toLowerCase()) || teachSkill.toLowerCase().includes(s.toLowerCase()));
          return teachesMatch || wantsMatch;
        });

        // fallback to first peer if no direct found
        const finalMatch = lookForMatch || (allUsers.length > 0 ? allUsers[0] : null);
        
        if (finalMatch) {
          setMatchedPeer(finalMatch);
          setStatus("matched");
        } else {
          setStatus("no_match");
        }
      }
    }, searchDuration);
  };

  const [paymentStep, setPaymentStep] = useState<"idle" | "price" | "verification" | "sending" | "complete">("idle");

  const handleMentorPurchase = async () => {
    setPaymentStep("sending");
    try {
      const response = await fetch('/api/notify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser?.email || 'unknown',
          paymentType: 'MentorAccess',
          confirmation: 'Request Pending'
        }),
      });
      
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.includes("<html>") ? "Server returned HTML error page instead of JSON. Check your server logs." : "Unexpected response format.");
      }
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Telegram notification failed');
      }

      setPaymentStep("complete");
    } catch (error: any) {
      console.error('Failed to notify:', error);
      alert(`Error initiating purchase: ${error.message}`);
      setPaymentStep("price");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Mentor Payment Modal */}
        <AnimatePresence>
          {paymentStep !== "idle" && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPaymentStep("idle")}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200"
              >
                {paymentStep === "price" && (
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-2">
                       <Crown className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-black text-slate-900 font-heading">Certified Mentor Access</h2>
                      <p className="text-sm text-slate-500 mt-1">Unlock expert guidance from verified faculty.</p>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-indigo-900 text-sm">Monthly Mentor Pass</p>
                        <p className="text-[10px] text-indigo-600 font-medium">Verified expert routing</p>
                      </div>
                      <span className="font-black text-slate-900">₹1,199</span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed">
                        <p className="font-bold">Member Verification Policy</p>
                        <p className="mt-1">All premium mentors undergo background checks. By proceeding, you agree to our academic integrity terms and verification process.</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setPaymentStep("verification")}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Process Payment
                    </button>
                  </div>
                )}

                {paymentStep === "verification" && (
                  <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto animate-pulse">
                       <HelpCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900 font-heading">Verify Purchase</h2>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Are you sure you want to hire a certified Mentor? An admin will reach out to schedule your first session.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPaymentStep("price")} className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider">Back</button>
                      <button onClick={handleMentorPurchase} className="py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider">Confirm</button>
                    </div>
                  </div>
                )}

                {paymentStep === "sending" && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-slate-900 text-sm">Processing...</p>
                  </div>
                )}

                {paymentStep === "complete" && (
                  <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                       <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900 font-heading">Mentor Requested!</h2>
                      <p className="text-sm text-slate-500">
                         Admin notified. expect a response within 24 hours.
                      </p>
                    </div>
                    <button 
                      onClick={() => setPaymentStep("idle")} 
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Breadcrumb row */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Public Homepage
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-xl"
          >
            Go to My Profile
          </button>
        </div>

        {/* Hero title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider inline-block">
            xchange Match Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-3 tracking-tight">
            Find Your Skill Swap Counterpart
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Enter your skills to run our dynamic matching algorithm and swap learning credits instantly.
          </p>
        </div>

        {/* Main interactive matching wrapper card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col justify-between">
          
          {/* Status content controller */}
          <div className="p-8 md:p-12 flex-1 flex flex-col justify-center items-center">
            
            <AnimatePresence mode="wait">
              
              {/* IDLE state layout */}
              {status === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-lg space-y-6"
                >
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                    
                    {/* Teach input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Skill You Can Teach
                      </label>
                      <input 
                        type="text" 
                        value={teachSkill} 
                        onChange={(e) => setTeachSkill(e.target.value)}
                        placeholder="e.g., Calculus, Physics, Python"
                        className="w-full text-sm font-medium text-slate-800 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Learn input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Skill You Want To Learn
                      </label>
                      <input 
                        type="text" 
                        value={learnSkill} 
                        onChange={(e) => setLearnSkill(e.target.value)}
                        placeholder="e.g., Spanish, Classical Guitar, UI Design"
                        className="w-full text-sm font-medium text-slate-800 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                  </div>

                  {/* Search action */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleSearch()}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Find Reciprocal Match
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SEARCHING radar scanner state */}
              {status === "searching" && (
                <motion.div 
                  key="searching"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center select-none"
                >
                  {/* Glowing Radar Scanner */}
                  <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
                    
                    {/* Ripple ripples */}
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-4 rounded-full border-2 border-purple-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                    
                    {/* Rotating Scanner Needle */}
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-200 animate-spin" style={{ animationDuration: "4s" }} />
                    
                    {/* Internal avatar scanner carousel */}
                    <div className="relative w-24 h-24 rounded-full bg-slate-150 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={scanAvatars[activeScanFaceIndex]} 
                        alt="Scanning faces"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    </div>

                    {/* Scanning glow ray */}
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-600 top-2 left-1/2 -translate-x-1/2 animate-bounce" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-heading tracking-tight mb-2 animate-pulse">
                    Finding your match...
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm text-center leading-normal">
                    Comparing <strong className="text-indigo-600">{teachSkill}</strong> can-teach vectors against peer directory demand tags...
                  </p>
                </motion.div>
              )}

              {/* MATCH FOUND card state */}
              {status === "matched" && matchedPeer && (
                <motion.div 
                  key="matched"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-md bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl border border-indigo-100 p-6 shadow-md"
                >
                  <div className="text-center mb-6">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mx-auto inline-block border border-emerald-250">
                      ⚡ 100% Mutual Match Found!
                    </span>
                  </div>

                  {/* Matched Avatar card info */}
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 mb-5 relative">
                    <img 
                      src={matchedPeer.avatarUrl} 
                      alt={matchedPeer.name} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 font-heading text-lg truncate leading-none mb-1">
                        {matchedPeer.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate">{matchedPeer.major}</p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-yellow-500 font-bold text-xs">★ {matchedPeer.rating}</span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-400 text-[10px] font-medium">{matchedPeer.completedExchanges} successful trades</span>
                      </div>
                    </div>
                  </div>

                  {/* Teach & Want blocks */}
                  <div className="space-y-3 mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs leading-normal">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                        What they teach (You learn):
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded font-bold border border-purple-200 inline-block">
                        {learnSkill}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                        What they learn (You teach):
                      </span>
                      <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded font-bold border border-indigo-200 inline-block">
                        {teachSkill}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-normal text-center italic mb-6 bg-white p-3.5 rounded-lg border border-slate-100">
                    "{matchedPeer.bio}"
                  </p>

                  {/* Click Accept Match */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setStatus("idle")}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 cursor-pointer uppercase tracking-wider"
                    >
                      Search Again
                    </button>
                    <button 
                      onClick={() => setShowRequestModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl py-3 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-lg shadow-indigo-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Request Swap
                    </button>
                  </div>

                </motion.div>
              )}

              {/* NO MATCH FOUND failure state with Upgrade to Premium */}
              {status === "no_match" && (
                <motion.div 
                  key="no_match"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-md w-full text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <AlertCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 font-heading">
                      No match found
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                      We couldn't identify other active students currently teaching <strong className="text-slate-800">"{learnSkill}"</strong> while seeking <strong className="text-slate-800">"{teachSkill}"</strong>.
                    </p>
                  </div>


                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 text-left shadow-inner space-y-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Crown className="w-5 h-5 text-amber-600 fill-amber-500 shrink-0" />
                      <span className="font-heading font-bold text-sm">Need a Certified Mentor?</span>
                    </div>

                    <p className="text-xs text-amber-900/80 leading-relaxed">
                      Cannot find a peer? Unlock verified university graduates and professional peer mentors.
                    </p>

                    <button 
                      onClick={() => setPaymentStep("price")}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer text-center"
                    >
                      Hire a Certified Mentor
                    </button>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => setStatus("idle")}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 justify-center mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try another skill query
                    </button>
                  </div>

                </motion.div>
              )}

              {/* SUCCESS / ACCEPTED CELEBRATION */}
              {status === "accepted" && (
                <motion.div 
                  key="accepted"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-md w-full text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 scale-110">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 font-heading">
                      Request Sent!
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Your swap request has been broadcasted to <strong className="text-indigo-600">{matchedPeer?.name}</strong>. You'll be notified in the navigation bar once they respond.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-left text-xs text-slate-600 font-medium">
                    <div className="flex justify-between py-2 border-b border-slate-200/50">
                      <span>Recipient</span>
                      <span className="text-slate-900 font-bold">{matchedPeer?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200/50">
                      <span>Target Skill</span>
                      <span className="text-slate-900 font-bold">{learnSkill}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Status</span>
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Awaiting Peer Approval
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => setStatus("idle")}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-5 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      Find another match
                    </button>
                    <button 
                      onClick={onNavigateToProfile}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-5 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Go to Study Workspace
                    </button>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Dynamic Helper Tips drawer at bottom */}
          <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              Tip: List skills in your profile to trigger instant automatic recommendations!
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
              10 Tokens/Session
            </span>
          </div>

        </div>

        {/* Request Message Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRequestModal(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-200"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img src={matchedPeer?.avatarUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-heading leading-tight">Request Swap</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">From {matchedPeer?.name}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message to Peer</label>
                    <textarea 
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder={`Explain what you'd like to learn or teach...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 min-h-[120px] transition-all resize-none shadow-inner"
                    />
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                      Sending a request is free. 10 tokens will only be held if they accept your request.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowRequestModal(false)}
                      className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSendSwapRequest}
                      className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Request
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
