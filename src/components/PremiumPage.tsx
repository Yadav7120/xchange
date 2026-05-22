import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Crown, 
  Check, 
  Star, 
  Sparkles, 
  UserCheck, 
  ArrowLeft, 
  Award, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  Zap, 
  ArrowRight,
  Bookmark,
  Calendar,
  Lock,
  Mail,
  Video
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  subject: string;
  reputationScore: number; // e.g. 4.97 or 5.0
  avatarUrl: string;
  role: string;
  bio: string;
  completedClasses: number;
}

// Mentor Card Component as requested
interface MentorProps {
  key?: string;
  mentor: Mentor;
  isUnlocked: boolean;
  onSelect: (mentor: Mentor) => void;
}

export function MentorCard({ mentor, isUnlocked, onSelect }: MentorProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Decorative badge corner */}
      <div className="absolute top-0 right-0">
        <div className="bg-amber-500 text-white font-sans text-[9px] font-bold px-3 py-1 bg-gradient-to-l from-amber-600 to-amber-500 rounded-bl-xl shadow-sm">
          ★ VERIFIED MENTOR
        </div>
      </div>

      <div className="space-y-4">
        {/* Mentor Header Profile Row */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img 
              src={mentor.avatarUrl} 
              alt={mentor.name} 
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-100 shadow-sm"
            />
            {/* Status dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="min-w-0">
            <h4 className="font-heading font-black text-slate-900 text-base md:text-lg leading-normal truncate">
              {mentor.name}
            </h4>
            <p className="text-xs text-amber-700 font-semibold">{mentor.role}</p>
            
            {/* Reputation Score & Classes done */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                <span>{mentor.reputationScore.toFixed(2)}</span>
              </div>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {mentor.completedClasses} teaching events
              </span>
            </div>
          </div>
        </div>

        {/* Core Subject Details */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Primary Area of Expertise:
          </span>
          <span className="inline-block bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg">
            {mentor.subject}
          </span>
        </div>

        {/* Bio quote */}
        <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-3">
          "{mentor.bio}"
        </p>
      </div>

      {/* Dynamic Interaction Button based on premium lock status */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        {isUnlocked ? (
          <button 
            onClick={() => onSelect(mentor)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            Book Instant Mentoring
          </button>
        ) : (
          <button 
            disabled 
            className="w-full bg-slate-105 border border-slate-200 text-slate-400 text-[10px] py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Requires xchange Premium
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface PremiumPageProps {
  onBackToLanding: () => void;
  onNavigateToProfile: () => void;
}

export function PremiumPage({ onBackToLanding, onNavigateToProfile }: PremiumPageProps) {
  // Simulator Premium Active Storage check
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem("xchange_premium_unlocked") === "true";
  });

  // Target select modal info
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Elite campus list of mentors
  const mockMentors: Mentor[] = [
    {
      id: "mentor-1",
      name: "Dr. Evelyn Cartwright",
      subject: "Computational Linguistics & Python",
      reputationScore: 5.00,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
      role: "Faculty Research Chair - CSE",
      bio: "University professor teaching high-performance coding and syntactic grammar analysis. Willing to exchange learning reviews for active peer programming feedback.",
      completedClasses: 182
    },
    {
      id: "mentor-2",
      name: "Prof. Arthur Pendelton",
      subject: "Calculus, Linear Algebra & Geometry",
      reputationScore: 4.98,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
      role: "Ph.D. Graduate Peer Director",
      bio: "Calculus coordinator and certified curriculum analyst. Expert at distilling complex derivations into digestible, visual logic charts.",
      completedClasses: 314
    },
    {
      id: "mentor-3",
      name: "Gabriela Mendes",
      subject: "Advanced UI/UX Architecture & Figma",
      reputationScore: 4.95,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      role: "Professional Alumni Mentor - Senior Designer",
      bio: "Industry lead designer. Empowering student ventures with robust user mapping, interaction guidelines, and advanced tactile animations.",
      completedClasses: 65
    }
  ];

  // Upgrade simulator click handler
  const handleUpgradeNow = () => {
    localStorage.setItem("xchange_premium_unlocked", "true");
    setIsPremium(true);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const handleDowngrade = () => {
    localStorage.removeItem("xchange_premium_unlocked");
    setIsPremium(false);
  };

  const handleBookMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 selection:bg-amber-100 selection:text-amber-900 pb-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Navigation Breadcrumb back road */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 animate-pulse-slow" />
            Back to Public Homepage
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-xl"
          >
            Go to My Profile
          </button>
        </div>

        {/* Hero Title Section */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider inline-block">
            👑 Premium Access Suite
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mb-4 tracking-tight">
            xchange Elite Mentoring
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Can't find a regular peer student? Upgrade to unlock professional university staff, expert teaching assistants, and 100% verified postgraduate mentors.
          </p>
        </div>

        {/* Instant feedback notification */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-2xl mb-8 flex items-center gap-3 text-xs font-semibold shadow-md inline-block max-w-md mx-auto"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Upgrade Simulated successfully!</p>
                <p className="text-[10px] text-emerald-700/80 mt-0.5">Faculty directories have been unlocked and priority routing logic is active.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Layout Container with grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* PRICING CARD: Unlock Mentor Access as requested */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-8 border border-amber-400/40 shadow-2xl relative overflow-hidden">
            
            {/* Visual background decorations */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown className="w-48 h-48 text-white rotate-12" />
            </div>

            <div className="space-y-6 relative">
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                Featured Tier
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black font-heading tracking-tight">
                  Unlock Mentor Access
                </h3>
                <p className="text-amber-100 text-xs leading-relaxed">
                  Bridge learning bottlenecks instantly with dedicated verified specialists, fully vetted by campus academic registers.
                </p>
              </div>

              {/* Price rate display */}
              <div className="flex items-baseline gap-1.5 py-4">
                <span className="text-4xl font-black font-heading">$9.99</span>
                <span className="text-xs text-amber-150 font-medium">/ month</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded ml-2 font-bold font-sans">98% Satisfied</span>
              </div>

              {/* Core 3 Benefits as explicitly requested */}
              <div className="space-y-4 pt-2 border-t border-white/15">
                <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">Plan Benefits Included:</p>
                
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-3 text-xs font-medium">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/25 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <span className="font-bold block text-white">Instant mentor matching</span>
                      <span className="text-[10px] text-amber-100">Bypass standard reciprocal lines; pair with a certified mentor under 60 seconds.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 text-xs font-medium">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/25 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <span className="font-bold block text-white">Expert verified teachers</span>
                      <span className="text-[10px] text-amber-100">Connect with credentialed TAs, honor graduates, and university professors.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 text-xs font-medium">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/25 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <span className="font-bold block text-white">Priority support</span>
                      <span className="text-[10px] text-amber-100">Dedicated 24/7 customer care concierge to mediate credit audits and resolve issues.</span>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

            {/* Dynamic simulated upgrade CTA button */}
            <div className="pt-8 mt-8 border-t border-white/10 relative">
              {!isPremium ? (
                <button 
                  onClick={handleUpgradeNow}
                  className="w-full bg-white text-amber-900 hover:bg-amber-50 font-black text-sm py-4 rounded-xl cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-center block"
                >
                  Upgrade Now (Simulate Checkout)
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-center text-xs font-bold flex items-center justify-center gap-1.5 text-white">
                    <UserCheck className="w-4 h-4 text-emerald-300" />
                    Premium Plan Active
                  </div>
                  <button 
                    onClick={handleDowngrade}
                    className="w-full text-center text-[10px] text-amber-200 hover:text-white underline cursor-pointer"
                  >
                    Simulate Downgrade for testing
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* MENTORS GRID DIRECTORY DESCRIPTION & MENTOR CARDS */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-xl text-slate-900">
                    Verify Elite Faculty & Mentors
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing premium certified mentors available. Upgrade the plan to unlock meetings directly.
                  </p>
                </div>
                
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded border border-slate-200 uppercase tracking-widest">
                  Live Database
                </span>
              </div>

              {/* Grid of requested MentorCard components */}
              <div className="grid sm:grid-cols-1 md:grid-cols-1 gap-6">
                {mockMentors.map((mentor) => (
                  <MentorCard 
                    key={mentor.id}
                    mentor={mentor}
                    isUnlocked={isPremium}
                    onSelect={handleBookMentor}
                  />
                ))}
              </div>
            </div>

            {/* Guarantee footnote */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 text-xs text-slate-500 mt-6 font-medium">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <p>
                <strong>The xchange Honor Promise:</strong> All Premium faculty sessions are covered by academic liability policies. Guaranteed match of active TA in 60 minutes or return of 100% value.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Booking Simulation Detail */}
        <AnimatePresence>
          {selectedMentor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setSelectedMentor(null)}
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    ACADEMIC BOOKING
                  </div>
                  
                  <button 
                    onClick={() => setSelectedMentor(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded bg-slate-55"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={selectedMentor.avatarUrl} 
                      alt={selectedMentor.name} 
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-amber-100 shadow-md"
                    />
                    <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>

                  <div>
                    <h3 className="font-heading font-black text-xl text-slate-900 leading-normal">
                      Connect with {selectedMentor.name}
                    </h3>
                    <p className="text-xs text-amber-700 font-semibold">{selectedMentor.role}</p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    You are starting a premium mentoring channel for <strong className="text-indigo-600 font-bold">{selectedMentor.subject}</strong>. Your premium token-waived policy applies! No tokens required.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedMentor(null)}
                    className="text-xs font-semibold text-slate-650 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Room created! Launching secure Jitsi video session with ${selectedMentor.name}. Enjoy your direct premium swap!`);
                      setSelectedMentor(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer text-center block shadow-md"
                  >
                    Start Class Instantly
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
