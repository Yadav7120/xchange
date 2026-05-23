/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Last Updated: 2026-05-23
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Footer } from "./components/Footer";
import { Profile } from "./components/Profile";
import { MatchFinder } from "./components/MatchFinder";
import { LearningSpace } from "./components/LearningSpace";
import { WalletPage } from "./components/WalletPage";
import { PremiumPage } from "./components/PremiumPage";
import { AuthPage, CurrentUser } from "./components/AuthPage";
import { WorkspacePage } from "./components/WorkspacePage";
import { AssistantBot } from "./components/AssistantBot";
import { SkillRequest } from "./types";

type ActiveView = "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth" | "workspace";

export default function App() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Read existing session or pre-populate Alex Mercer for seamless demo experience
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem("xchange_logged_in_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Force minimum 30 if parsed has no tokens or is dirty
        if (parsed && typeof parsed.tokens !== "number") {
          parsed.tokens = 30;
        }
        return parsed;
      } catch (e) {
        // ignore
      }
    }
    // High-fidelity standard student account so the sandbox starts fully accessible
    const defaultUser: CurrentUser = {
      name: "Alex Mercer",
      email: "alex.mercer@university.edu",
      major: "Software Engineering Undergraduate",
      bio: "Software senior seeking to trade computer science concepts for foreign languages and music theory lessons. Love hands-on practice!",
      canTeach: ["Calculus", "TypeScript", "UI Design"],
      wantToLearn: ["Classical Guitar", "Machine Learning", "Spanish"],
      tokens: 30, // Set default token for the user to 30
      isPremium: false
    };
    localStorage.setItem("xchange_logged_in_user", JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [view, setView] = useState<ActiveView>("landing"); 

  const [requests, setRequests] = useState<SkillRequest[]>([]);

  // Load requests from storage
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`xchange_requests_${currentUser.email}`);
      if (saved) {
        try {
          setRequests(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse requests", e);
        }
      }
    } else {
      setRequests([]);
    }
  }, [currentUser?.email]);

  const handleSendRequest = (request: SkillRequest) => {
    // 1. DELIVER to recipient: In this localStorage demo, we write to the recipient's storage key
    try {
      const recipientKey = `xchange_requests_${request.toId}`;
      const existing = localStorage.getItem(recipientKey);
      const recipientRequests = existing ? JSON.parse(existing) : [];
      
      const newRequest: SkillRequest = { ...request, id: `req-${Date.now()}` };
      const updated = [newRequest, ...recipientRequests];
      
      localStorage.setItem(recipientKey, JSON.stringify(updated));
      console.log(`[Demo] Delivered request to ${request.toId}`);

      // 2. SIMULATE receiving an incoming request from that same peer shortly after
      // This allows the user to see the notification bar in action
      setTimeout(() => {
        const demoIncoming: SkillRequest = {
          id: `incoming-${Date.now()}`,
          fromId: request.toId,
          fromName: "Academic Peer",
          fromAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          fromEmail: request.toId,
          toId: currentUser?.email || "target",
          skillTitle: currentUser?.canTeach[0] || "Knowledge",
          message: `Hey ${currentUser?.name}! I got your request. I'd actually love to learn ${currentUser?.canTeach[0]} from you as well. Want to swap?`,
          status: "pending",
          timestamp: new Date().toISOString()
        };
        
        setRequests(prev => {
          const updated = [demoIncoming, ...prev];
          if (currentUser) {
            localStorage.setItem(`xchange_requests_${currentUser.email}`, JSON.stringify(updated));
          }
          return updated;
        });
      }, 3000);

    } catch (e) {
      console.error("Failed to deliver request to recipient's local storage", e);
    }
  };

  const handleUpdateReqStatus = (reqId: string, status: "accepted" | "rejected") => {
    setRequests(prev => {
      const updated = prev.map(r => r.id === reqId ? { ...r, status } : r);
      if (currentUser) {
        localStorage.setItem(`xchange_requests_${currentUser.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Watch Firebase Auth status changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const loggedInUser: CurrentUser = {
              name: data.name || user.displayName || "Student Swapper",
              email: data.email || user.email || "",
              major: data.major || "Student Candidate",
              bio: data.bio || "Joined the peer exchange network!",
              canTeach: data.canTeach || [],
              wantToLearn: data.wantToLearn || [],
              tokens: typeof data.tokens === "number" ? data.tokens : 30,
              isPremium: !!data.isPremium,
              avatarUrl: data.avatarUrl || user.photoURL || undefined,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              phone: data.phone || "",
              qualification: data.qualification || "Undergraduate Student"
            };
            setCurrentUser(loggedInUser);
            localStorage.setItem("xchange_logged_in_user", JSON.stringify(loggedInUser));
          } else {
            // Document doesn't exist yet (could be a social login first-join)
            const parts = (user.displayName || "Google Scholar").split(" ");
            const firstName = parts[0] || "Student";
            const lastName = parts.slice(1).join(" ") || "";
            const freshUser: CurrentUser = {
              name: user.displayName || "Student Swapper",
              email: user.email || "",
              major: "Interdisciplinary Exchange Candidate",
              bio: "Connected instantly using academic credentials! Keen to match skills with university peers on Xchange.",
              canTeach: ["Calculus", "TypeScript"],
              wantToLearn: ["Classical Guitar", "Spanish"],
              tokens: 30,
              isPremium: false,
              avatarUrl: user.photoURL || undefined,
              firstName,
              lastName,
              phone: "",
              qualification: "Undergraduate Student"
            };
            setCurrentUser(freshUser);
            localStorage.setItem("xchange_logged_in_user", JSON.stringify(freshUser));
          }
        }, (error) => {
          console.error("Firestore user onSnapshot error:", error);
        });

        return () => unsubDoc();
      } else {
        // No Firebase Auth user has logged session
        const saved = localStorage.getItem("xchange_logged_in_user");
        if (!saved) {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Guard navigation to force login/signup for restricted sections
  const handleNavigate = (targetView: ActiveView) => {
    if (!currentUser && targetView !== "landing" && targetView !== "auth") {
      setView("auth");
    } else {
      setView(targetView);
    }
  };

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem("xchange_logged_in_user", JSON.stringify(user));
    setView("profile"); // Navigate directly to their personalized dashboard
  };

  const handleUpdateUser = async (updatedUser: CurrentUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("xchange_logged_in_user", JSON.stringify(updatedUser));

    // Persist real-time updates directly into Firestore collection
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      try {
        await updateDoc(userRef, {
          name: updatedUser.name,
          major: updatedUser.major,
          bio: updatedUser.bio,
          canTeach: updatedUser.canTeach,
          wantToLearn: updatedUser.wantToLearn,
          tokens: updatedUser.tokens,
          isPremium: updatedUser.isPremium,
          avatarUrl: updatedUser.avatarUrl || "",
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          phone: updatedUser.phone || "",
          qualification: updatedUser.qualification || ""
        });
      } catch (err) {
        console.error("Error committing active profile update to Firestore: ", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase logout rejection:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem("xchange_logged_in_user");
    setView("landing"); // Bounce back to the landing page
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      <Navbar 
        currentView={view} 
        onNavigate={handleNavigate} 
        currentUser={currentUser}
        onLogout={() => setShowLogoutConfirm(true)}
        requests={requests}
        onUpdateReqStatus={handleUpdateReqStatus}
      />
      <main className="pt-20">
        {view === "landing" ? (
          <>
            <Hero onGetStarted={() => handleNavigate(currentUser ? "profile" : "auth")} />
            <HowItWorks />
          </>
        ) : view === "auth" ? (
          <AuthPage 
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() => setView("landing")}
          />
        ) : view === "profile" ? (
          currentUser ? (
            <Profile 
              onBackToLanding={() => setView("landing")} 
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onLogout={() => setShowLogoutConfirm(true)}
              onNavigate={handleNavigate}
            />
          ) : (
            <AuthPage 
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setView("landing")}
            />
          )
        ) : view === "workspace" ? (
          <WorkspacePage 
            onBackToLanding={() => setView("landing")}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        ) : view === "match" ? (
          <MatchFinder 
            onBackToLanding={() => setView("landing")} 
            onNavigateToProfile={() => setView("profile")}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onSendRequest={handleSendRequest}
          />
        ) : view === "learn" ? (
          <LearningSpace 
            onBackToLanding={() => setView("landing")}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        ) : view === "wallet" ? (
          <WalletPage 
            onBackToLanding={() => setView("landing")}
            onNavigateToProfile={() => setView("profile")}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        ) : (
          <PremiumPage 
            onBackToLanding={() => setView("landing")}
            onNavigateToProfile={() => setView("profile")}
          />
        )}
      </main>
      <Footer />

      {/* Second-Step Logout Verification Modal OVERLAY */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-800 font-heading">Confirm Log Out</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to end your Xchange session? You will need to re-verify your registered email to search for swaps next time.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-100 transition-all cursor-pointer text-xs"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AssistantBot />
    </div>
  );
}
