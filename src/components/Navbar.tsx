import { motion } from "motion/react";
import { Sparkles, LayoutDashboard, Home, Search, Laptop, Coins, Crown, LogOut, BookOpen, User } from "lucide-react";
import { CurrentUser } from "./AuthPage";

interface NavbarProps {
  currentView: "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth" | "workspace";
  onNavigate: (view: "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth" | "workspace") => void;
  currentUser: CurrentUser | null;
  onLogout: () => void;
}

export function Navbar({ currentView, onNavigate, currentUser, onLogout }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 text-xl font-bold font-heading text-slate-900 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ fontFamily: "Arial", fontSize: "35px", fontStyle: "normal" }}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          xchange
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
                  currentView === "landing" ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button 
                id="navbar-login-button"
                onClick={() => onNavigate("auth")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-full cursor-pointer"
              >
                Log in
              </button>
              <button 
                id="navbar-signup-button"
                onClick={() => onNavigate("auth")}
                className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
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
                    ? "bg-slate-100 text-slate-900 font-semibold" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Home</span>
              </button>

              <button 
                onClick={() => onNavigate("workspace")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "workspace" 
                    ? "bg-slate-100 text-slate-900 border border-slate-200" 
                    : "text-slate-600 hover:text-indigo-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>

              <button 
                onClick={() => onNavigate("profile")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "profile" 
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                    : "text-slate-600 hover:text-indigo-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button 
                onClick={() => onNavigate("match")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "match" 
                    ? "bg-purple-50 text-purple-700 border border-purple-100" 
                    : "text-slate-600 hover:text-purple-900"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Finder</span>
              </button>

              <button 
                onClick={() => onNavigate("learn")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "learn" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "text-slate-600 hover:text-emerald-950"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Space</span>
              </button>

              <button 
                onClick={() => onNavigate("wallet")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "wallet" 
                    ? "bg-amber-100 text-amber-900 border border-amber-200" 
                    : "text-slate-600 hover:text-amber-905"
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Wallet</span>
              </button>

              <button 
                onClick={() => onNavigate("premium")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === "premium" 
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm font-bold" 
                    : "text-slate-600 hover:text-amber-600"
                }`}
              >
                <Crown className={`w-3.5 h-3.5 ${currentView === "premium" ? "text-yellow-300 fill-yellow-300" : "text-amber-500"}`} />
                <span className="hidden sm:inline">Mentors</span>
              </button>

              {/* Dynamic user info card */}
              <div className="flex items-center gap-2 border-l border-slate-100 pl-3 md:pl-4">
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
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-sans flex items-center justify-center shrink-0">
                      {currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                    </div>
                  )}
                  <div className="hidden lg:block text-left max-w-[80px]">
                    <p className="text-xs font-black text-slate-800 truncate leading-none mb-0.5">{currentUser.name}</p>
                    <p className="text-[10px] text-amber-600 font-bold leading-none">{currentUser.tokens}cr</p>
                  </div>
                </div>

                <button 
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
