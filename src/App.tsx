/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
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

type ActiveView = "landing" | "profile" | "match" | "learn" | "wallet" | "premium" | "auth";

export default function App() {
  // Read existing session or pre-populate Alex Mercer for seamless demo experience
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem("xchange_logged_in_user");
    if (saved) {
      try {
        return JSON.parse(saved);
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
      tokens: 40 // Let's give them generous initial tokens to play around
    };
    localStorage.setItem("xchange_logged_in_user", JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [view, setView] = useState<ActiveView>("landing"); 

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

  const handleUpdateUser = (updatedUser: CurrentUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("xchange_logged_in_user", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
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
        onLogout={handleLogout}
      />
      <main>
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
              onLogout={handleLogout}
            />
          ) : (
            <AuthPage 
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setView("landing")}
            />
          )
        ) : view === "match" ? (
          <MatchFinder 
            onBackToLanding={() => setView("landing")} 
            onNavigateToProfile={() => setView("profile")}
          />
        ) : view === "learn" ? (
          <LearningSpace 
            onBackToLanding={() => setView("landing")}
          />
        ) : view === "wallet" ? (
          <WalletPage 
            onBackToLanding={() => setView("landing")}
            onNavigateToProfile={() => setView("profile")}
          />
        ) : (
          <PremiumPage 
            onBackToLanding={() => setView("landing")}
            onNavigateToProfile={() => setView("profile")}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
