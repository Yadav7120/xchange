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
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Mail,
  Zap
} from "lucide-react";
import { PeerUser } from "../types";
import { mockPeers } from "../data/mockPeers";
import { CurrentUser } from "./AuthPage";

interface MatchFinderProps {
  onBackToLanding: () => void;
  onNavigateToProfile: () => void;
  currentUser: CurrentUser | null;
  onUpdateUser: (user: CurrentUser) => void;
}

export function MatchFinder({ onBackToLanding, onNavigateToProfile, currentUser, onUpdateUser }: MatchFinderProps) {
  // Config state
  const [teachSkill, setTeachSkill] = useState("Calculus");
  const [learnSkill, setLearnSkill] = useState("Spanish");
  
  // App matching states
  const [status, setStatus] = useState<"idle" | "searching" | "matched" | "no_match" | "accepted">("idle");
  const [matchedPeer, setMatchedPeer] = useState<PeerUser | null>(null);
  const [searchDuration, setSearchDuration] = useState(3000); // ms
  
  // Premium upgrade modal
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const handleAcceptMatch = () => {
    if (!currentUser) {
      alert("Please register or log in first before initiating skill matches!");
      setStatus("idle");
      return;
    }

    if (currentUser.tokens < 10) {
      alert(`Booking Aborted! You do not have enough Xtokens in your wallet to book a new skill swap (Cost: 10 Xtokens).\nYour Wallet: ${currentUser.tokens} Xtokens.\nPlease facilitate user instruction sessions on the workspace to earn tokens first!`);
      return;
    }

    // Deduct 10 tokens automatically
    const updatedUser = {
      ...currentUser,
      tokens: currentUser.tokens - 10
    };

    // Log transaction to history
    const savedTxs = localStorage.getItem(`xchange_tx_history_${currentUser.email}`);
    let txs = [];
    if (savedTxs) {
      try { txs = JSON.parse(savedTxs); } catch (e) {}
    }
    txs.unshift({
      id: `tx-booked-${Date.now()}`,
      type: "spend",
      amount: 10,
      description: `Booked reciprocal class swap for ${learnSkill} with ${matchedPeer?.name || "Community Partner"}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    });
    localStorage.setItem(`xchange_tx_history_${currentUser.email}`, JSON.stringify(txs));

    onUpdateUser(updatedUser);
    setStatus("accepted");
  };

  // Active radar scan faces
  const [activeScanFaceIndex, setActiveScanFaceIndex] = useState(0);
  const scanAvatars = mockPeers.map(p => p.avatarUrl);

  useEffect(() => {
    let interval: number | null = null;
    if (status === "searching") {
      interval = window.setInterval(() => {
        setActiveScanFaceIndex(prev => (prev + 1) % scanAvatars.length);
      }, 350);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, scanAvatars.length]);

  // Handle Match Search trigger
  const handleSearch = (simulateNoMatch: boolean = false) => {
    setStatus("searching");
    setMatchedPeer(null);

    setTimeout(() => {
      if (simulateNoMatch || teachSkill.trim().toLowerCase() === "unknown obscure skill") {
        setStatus("no_match");
      } else {
        // Find best match in mock database
        // Look for peer that can teach learnSkill or wants teachSkill
        const lookForMatch = mockPeers.find(peer => {
          const teachesMatch = peer.canTeach.some(s => s.toLowerCase().includes(learnSkill.toLowerCase()) || learnSkill.toLowerCase().includes(s.toLowerCase()));
          const wantsMatch = peer.wantToLearn.some(s => s.toLowerCase().includes(teachSkill.toLowerCase()) || teachSkill.toLowerCase().includes(s.toLowerCase()));
          return teachesMatch || wantsMatch;
        });

        // fallback to first peer if no direct found but we wanted to simulate a match
        const finalMatch = lookForMatch || mockPeers[0];
        setMatchedPeer(finalMatch);
        setStatus("matched");
      }
    }, searchDuration);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
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

                  {/* Simulator action shortcuts */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleSearch(false)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Find Reciprocal Match
                    </button>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setTeachSkill("Linear Algebra");
                          setLearnSkill("Classical Guitar");
                          handleSearch(false);
                        }}
                        className="text-xs bg-slate-50 border border-slate-200 text-slate-600 py-2.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        ⚡ Standard Swap Preset
                      </button>
                      <button 
                        onClick={() => {
                          setTeachSkill("Quantum Astrophysics");
                          setLearnSkill("Ancient Swahili Dialect");
                          handleSearch(true);
                        }}
                        className="text-xs bg-purple-50 border border-purple-100 text-purple-700 py-2.5 px-3 rounded-lg hover:bg-purple-100/50 transition-colors cursor-pointer"
                      >
                        ❌ Force "No Match" Scenario
                      </button>
                    </div>
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
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 cursor-pointer"
                    >
                      Reject Match
                    </button>
                    <button 
                      onClick={handleAcceptMatch}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl py-3 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      Accept Match
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
                      <span className="font-heading font-bold text-sm">Need a Certified Instructor?</span>
                    </div>

                    <p className="text-xs text-amber-900/80 leading-relaxed">
                      Unlock certified university graduates and professional peer mentors. Upgrade to **xchange Premium** to connect with an on-demand verified Mentor immediately!
                    </p>

                    <ul className="text-xs text-amber-950 space-y-1.5 font-medium">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Access 500+ verified campus Mentors
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" /> 1-on-1 tutoring with graduate teaching assistants
                      </li>
                    </ul>

                    <button 
                      onClick={() => setShowPremiumModal(true)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-amber-200 cursor-pointer text-center block transition-all"
                    >
                      Upgrade to Premium for Mentor Access
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
                      Match Accepted!
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Congratulations! Your trade request has been locked in. We have created a secure workspace room and notified both participants.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-left text-xs text-slate-600 font-medium">
                    <div className="flex justify-between py-2 border-b border-slate-200/50">
                      <span>Reciprocity Partner</span>
                      <span className="text-slate-900 font-bold">{matchedPeer?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200/50">
                      <span>Credit Exchange Policy</span>
                      <span className="text-slate-900 font-bold">10 Tokens / instruction swap</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Status</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Channel Provisioned
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

        {/* Premium Upgrade Modal */}
        <AnimatePresence>
          {showPremiumModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPremiumModal(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl p-8 max-w-md w-full border border-amber-200 shadow-2xl overflow-hidden"
              >
                {/* Visual Crown header */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Crown className="w-44 h-44 text-amber-500" />
                </div>

                <div className="relative space-y-6">
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white px-3 py-1 rounded-full text-xs font-bold font-heading">
                      <Crown className="w-3.5 h-3.5" />
                      PREMIUM SYSTEM
                    </div>
                    <button 
                      onClick={() => setShowPremiumModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 font-heading">
                      Unlock Verified Mentors
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Cannot find a peer student? With Premium custom routing, you get verified faculty members, teaching assistants, or certified alumni tutors.
                    </p>
                  </div>

                  {/* Premium Plans comparison items */}
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-amber-900">Campus Pass Plus</p>
                        <p className="text-amber-700 font-medium font-sans">Unlimited mentor match routing</p>
                      </div>
                      <span className="font-bold font-heading text-slate-900">$9.99/mo</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs opacity-75">
                      <div>
                        <p className="font-bold text-slate-800">Honor Roll Member</p>
                        <p className="text-slate-600 font-sans">Includes 100 extra tokens free</p>
                      </div>
                      <span className="font-bold font-heading text-slate-900">$19.99/mo</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-3.5 text-xs text-slate-600 font-medium">
                    <p className="font-bold text-slate-800">Elite Account Benefits Include:</p>
                    <ul className="space-y-2 text-[11px]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Guaranteed matching fallback within 1 hour
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Access live video rooms without any token spend
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Premium badge on your workspace profile card
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => {
                      setIsPremium(true);
                      setShowPremiumModal(false);
                      // Simulate match success with a generic peer who can play the mentor role
                      setMatchedPeer({
                        id: "peer-premium-mentor",
                        name: "Dr. Evelyn Cartwright (Premium Mentor)",
                        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
                        email: "evelyn.cartwright@university.edu",
                        major: "Faculty Research Lead - CS & Applied Linguistics",
                        canTeach: [learnSkill, "Computational Systems"],
                        wantToLearn: ["Any curious student questions"],
                        rating: 5.0,
                        completedExchanges: 182,
                        bio: "Verified Academic Mentor. I support active learning swaps across xchange. Let's study together to unlock your skills without boundaries."
                      });
                      setStatus("matched");
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-sm font-bold py-3.5 rounded-xl cursor-pointer text-center"
                  >
                    Simulate Premium Upgrade ($9.99)
                  </button>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
