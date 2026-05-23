import { motion, AnimatePresence } from "motion/react";
import { Sparkles, LayoutDashboard, Home, Search, Laptop, Coins, Crown, LogOut, BookOpen, User, Bell, Check, X, Clock } from "lucide-react";
import { CurrentUser } from "./AuthPage";
import React, { useState } from "react";
import { SkillRequest } from "../types";

interface NavbarProps {
  currentView: "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth" | "workspace";
  onNavigate: (view: "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth" | "workspace") => void;
  currentUser: CurrentUser | null;
  onLogout: () => void;
  requests: SkillRequest[];
  onUpdateReqStatus: (id: string, status: "accepted" | "rejected") => void;
}

export function Navbar({ currentView, onNavigate, currentUser, onLogout, requests, onUpdateReqStatus }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const pendingRequests = requests.filter(r => r.status === "pending");
  const hasNotifications = pendingRequests.length > 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 border-b-2 border-indigo-600 shadow-2xl h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-3 text-2xl font-black font-heading text-white cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-black border border-slate-700 shadow-inner">
            <img 
              src="/logo.png" 
              alt="xchange logo" 
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <span className="hidden sm:block tracking-tighter">Xchange</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 sm:gap-4 shrink-0"
        >
          {!currentUser ? (
            <>
              <button 
                onClick={() => onNavigate("landing")}
                className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors cursor-pointer ${
                  currentView === "landing" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button 
                id="navbar-login-button"
                onClick={() => onNavigate("auth")}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-full cursor-pointer"
              >
                Log in
              </button>
              <button 
                id="navbar-signup-button"
                onClick={() => onNavigate("auth")}
                className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate("landing")}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "landing" 
                    ? "bg-slate-800 text-white font-semibold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Home</span>
              </button>

              <button 
                onClick={() => onNavigate("workspace")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "workspace" 
                    ? "bg-slate-800 text-white border border-slate-700" 
                    : "text-slate-400 hover:text-indigo-400"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>

              <button 
                onClick={() => onNavigate("profile")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "profile" 
                    ? "bg-indigo-900/50 text-indigo-200 border border-indigo-700/50" 
                    : "text-slate-400 hover:text-indigo-300"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button 
                onClick={() => onNavigate("match")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "match" 
                    ? "bg-purple-900/50 text-purple-200 border border-purple-700/50" 
                    : "text-slate-400 hover:text-purple-300"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Finder</span>
              </button>

              <button 
                onClick={() => onNavigate("learn")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "learn" 
                    ? "bg-emerald-900/50 text-emerald-200 border border-emerald-700/50" 
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Space</span>
              </button>

              <button 
                onClick={() => onNavigate("wallet")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "wallet" 
                    ? "bg-amber-900/50 text-amber-200 border border-amber-700/50" 
                    : "text-slate-400 hover:text-amber-300"
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Wallet</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-all relative ${
                    showNotifications ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {hasNotifications && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div 
                        className="fixed inset-0 z-[-1]" 
                        onClick={() => setShowNotifications(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-2"
                      >
                        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">Swap Requests</h4>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                            {pendingRequests.length} New
                          </span>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                          {pendingRequests.length === 0 ? (
                            <div className="py-12 px-6 text-center space-y-3">
                              <div className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                                <Bell className="w-4 h-4 text-slate-700" />
                              </div>
                              <p className="text-xs text-slate-500 font-medium tracking-tight">No pending knowledge requests</p>
                            </div>
                          ) : (
                            pendingRequests.map((req) => (
                              <div key={req.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <div className="flex gap-3 mb-3">
                                  {req.fromAvatar ? (
                                    <img src={req.fromAvatar} className="w-8 h-8 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                                      {req.fromName[0]}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{req.fromName}</p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {new Date(req.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 mb-3">
                                  <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Wants to learn {req.skillTitle}</p>
                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">"{req.message}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => onUpdateReqStatus(req.id, "rejected")}
                                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-red-950/30 text-slate-400 hover:text-red-400 transition-all text-[10px] font-bold uppercase tracking-wider"
                                  >
                                    <X className="w-3 h-3" />
                                    Reject
                                  </button>
                                  <button 
                                    onClick={() => onUpdateReqStatus(req.id, "accepted")}
                                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                                  >
                                    <Check className="w-3 h-3" />
                                    Accept
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="px-4 py-2 border-t border-slate-800">
                          <button onClick={() => onNavigate("profile")} className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">
                            View All History
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => onNavigate("premium")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "premium" 
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg font-bold" 
                    : "text-slate-400 hover:text-amber-400"
                }`}
              >
                <Crown className={`w-3.5 h-3.5 ${currentView === "premium" ? "text-yellow-300 fill-yellow-300" : "text-amber-400"}`} />
                <span className="hidden sm:inline">Mentors</span>
              </button>

              {/* Dynamic user info card */}
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3 md:pl-4">
                <div 
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                  title="View Profile Workspace"
                >
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold font-sans flex items-center justify-center shrink-0 border border-slate-700">
                      {currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                    </div>
                  )}
                  <div className="hidden lg:block text-left max-w-[80px]">
                    <p className="text-xs font-black text-white truncate leading-none mb-0.5">{currentUser.name}</p>
                    <p className="text-[10px] text-amber-400 font-bold leading-none">{currentUser.tokens}cr</p>
                  </div>
                </div>

                <button 
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </nav>
  );
}
