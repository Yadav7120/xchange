import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  BookOpen, 
  Check, 
  ArrowRight, 
  FileText, 
  Coins, 
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
  Phone,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Award,
  ArrowLeft,
  Camera,
  Globe,
  Key
} from "lucide-react";
import { mockPeers } from "../data/mockPeers";

export interface CurrentUser {
  name: string;
  email: string;
  major: string;
  bio: string;
  canTeach: string[];
  wantToLearn: string[];
  tokens: number;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  qualification?: string;
}

interface AuthPageProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onBackToLanding: () => void;
  initialMode?: "login" | "signup";
}

export function AuthPage({ onLoginSuccess, onBackToLanding, initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(initialMode);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [generatedResetLink, setGeneratedResetLink] = useState("");
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  // Enhanced Signup fields
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupQualification, setSignupQualification] = useState("Undergraduate Student");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupBio, setSignupBio] = useState("");
  
  // Signup Avatar Preset Configurations
  const avatarPresets = [
    { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150", label: "Scholar" },
    { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", label: "Creative" },
    { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150", label: "Music & Math" },
    { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150", label: "Tech Peer" },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", label: "Consultant" }
  ];
  const [signupAvatarUrl, setSignupAvatarUrl] = useState(avatarPresets[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);

  // Google OAuth Simulator Popup state
  const [showGoogleOAuth, setShowGoogleOAuth] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Custom skills state for signup builder
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [signupCanTeach, setSignupCanTeach] = useState<string[]>(["Calculus", "TypeScript"]);
  const [signupWantToLearn, setSignupWantToLearn] = useState<string[]>(["Classical Guitar", "Spanish"]);

  // Email verification simulation state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userInputCode, setUserInputCode] = useState("");
  const [tempUser, setTempUser] = useState<CurrentUser | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Field helpers for skill tag additions
  const handleAddTeachSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const val = teachInput.trim();
    if (val && !signupCanTeach.includes(val)) {
      setSignupCanTeach([...signupCanTeach, val]);
      setTeachInput("");
    }
  };

  const handleAddLearnSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const val = learnInput.trim();
    if (val && !signupWantToLearn.includes(val)) {
      setSignupWantToLearn([...signupWantToLearn, val]);
      setLearnInput("");
    }
  };

  const removeTeachSkill = (skill: string) => {
    setSignupCanTeach(signupCanTeach.filter(s => s !== skill));
  };

  const removeLearnSkill = (skill: string) => {
    setSignupWantToLearn(signupWantToLearn.filter(s => s !== skill));
  };

  // Submit methods
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!loginEmail || !loginPassword) {
      setError("Please fill in both email and password");
      return;
    }

    // Check if we log in as one of the mock peers
    const matchedPeer = mockPeers.find(p => p.email.toLowerCase() === loginEmail.toLowerCase());
    
    let loggedInUser: CurrentUser;

    if (matchedPeer) {
      // Split display name for consistency
      const parts = matchedPeer.name.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      loggedInUser = {
        name: matchedPeer.name,
        email: matchedPeer.email,
        major: matchedPeer.major,
        bio: matchedPeer.bio,
        canTeach: matchedPeer.canTeach,
        wantToLearn: matchedPeer.wantToLearn,
        tokens: matchedPeer.completedExchanges > 10 ? 40 : 10,
        avatarUrl: matchedPeer.avatarUrl,
        firstName,
        lastName,
        phone: "+1 (555) 492-3021",
        qualification: "Undergraduate Student"
      };
    } else {
      // Allow custom login for standard testing
      const parts = loginEmail.split("@")[0].split(".");
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Student";
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
      
      loggedInUser = {
        name: `${firstName} ${lastName}`.trim(),
        email: loginEmail,
        major: "Student Swapper",
        bio: "Joined the knowledge exchange! Keen to teach others my passion and pick up new techniques.",
        canTeach: ["Calculus", "UI Design"],
        wantToLearn: ["Classical Guitar", "Machine Learning"],
        tokens: 10,
        firstName,
        lastName,
        phone: "+1 (555) 123-4567",
        qualification: "Undergraduate Student"
      };
    }

    onLoginSuccess(loggedInUser);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Validate inputs
    if (!signupFirstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!signupLastName.trim()) {
      setError("Last name is required.");
      return;
    }
    if (!signupEmail.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!signupPhone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!signupPassword) {
      setError("Please choose a password.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match. Please verify password confirmation.");
      return;
    }
    if (signupPassword.length < 6) {
      setError("Password should be at least 6 characters for security.");
      return;
    }

    // Build the tentative user object
    const fullName = `${signupFirstName.trim()} ${signupLastName.trim()}`;
    const tentativeUser: CurrentUser = {
      name: fullName,
      email: signupEmail.trim(),
      major: signupQualification, // Set major as current academic qualification/major
      bio: signupBio || "New xchange student eager to connect and swap skills!",
      canTeach: signupCanTeach.length > 0 ? signupCanTeach : ["English Help"],
      wantToLearn: signupWantToLearn.length > 0 ? signupWantToLearn : ["Basic Calculus"],
      tokens: 10, // Earn 10 credits welcome gift
      avatarUrl: useCustomAvatar && customAvatarUrl.trim() ? customAvatarUrl.trim() : signupAvatarUrl,
      firstName: signupFirstName.trim(),
      lastName: signupLastName.trim(),
      phone: signupPhone.trim(),
      qualification: signupQualification
    };

    // Save temporary user and generate simulated SMTP code
    setTempUser(tentativeUser);
    sendSimulatedVerificationCode(signupEmail.trim());
  };

  const sendSimulatedVerificationCode = (email: string) => {
    setIsSendingCode(true);
    setError("");
    
    // Simulate SMTP delivery network delay
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setIsVerifyingEmail(true);
      setIsSendingCode(false);
      setSuccessMsg(`Simulated safety verification dispatch sent successfully to ${email}!`);
    }, 1200);
  };

  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (userInputCode !== verificationCode) {
      setError("Invalid confirmation PIN. Note the dev box code above and try again.");
      return;
    }

    if (tempUser) {
      onLoginSuccess(tempUser);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!forgotEmail.trim()) {
      setError("Please enter your registered student email address.");
      return;
    }

    setIsSendingResetEmail(true);

    setTimeout(() => {
      const secureToken = "xch_tkn_" + Math.floor(100000 + Math.random() * 900000);
      const resetLink = `${window.location.origin}/?reset_token=${secureToken}&email=${encodeURIComponent(forgotEmail.trim())}`;
      setGeneratedResetLink(resetLink);
      setResetEmail(forgotEmail.trim());
      setResetToken(secureToken);
      setIsSendingResetEmail(false);
      setSuccessMsg(`Secure password update dispatch generated successfully for ${forgotEmail}!`);
    }, 1000);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!resetPassword) {
      setError("Please supply a valid new password.");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setError("Passwords do not match. Please confirm again.");
      return;
    }
    if (resetPassword.length < 6) {
      setError("Password must be at least 6 characters for academic security.");
      return;
    }

    setSuccessMsg("Shield secured! Your password has been updated securely. Try logging in below.");
    setMode("login");
    setLoginEmail(resetEmail);
    // Clear out reset fields
    setResetPassword("");
    setResetConfirmPassword("");
  };

  const triggerGoogleOAuth = () => {
    setShowGoogleOAuth(true);
    setIsGoogleLoading(false);
  };

  const handleGoogleAccountSelect = (email: string, fullName: string, avatar: string) => {
    setIsGoogleLoading(true);
    setError("");
    
    setTimeout(() => {
      const parts = fullName.split(" ");
      const firstName = parts[0] || "Student";
      const lastName = parts.slice(1).join(" ") || "";

      const googleUser: CurrentUser = {
        name: fullName,
        email: email,
        major: "Interdisciplinary Exchange Candidate",
        bio: "Connected instantly using school Google credentials! Eager to match skills with my university peers on xchange.",
        canTeach: ["Calculus", "Basic Programming"],
        wantToLearn: ["Spanish", "Introduction to Psychology"],
        tokens: 15, // Google Quick login welcome incentive
        avatarUrl: avatar,
        firstName,
        lastName,
        phone: "+1 (555) 724-8192",
        qualification: "Undergraduate Student"
      };

      setIsGoogleLoading(false);
      setShowGoogleOAuth(false);
      onLoginSuccess(googleUser);
    }, 1400);
  };

  // Preset accounts login helper
  const handleQuickDemoLogin = (peerEmail: string) => {
    setError("");
    setSuccessMsg("");
    const matchedPeer = mockPeers.find(p => p.email === peerEmail);
    if (matchedPeer) {
      const parts = matchedPeer.name.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const demoUser: CurrentUser = {
        name: matchedPeer.name,
        email: matchedPeer.email,
        major: matchedPeer.major,
        bio: matchedPeer.bio,
        canTeach: matchedPeer.canTeach,
        wantToLearn: matchedPeer.wantToLearn,
        tokens: 30, // Plenty of credits for testing
        avatarUrl: matchedPeer.avatarUrl,
        firstName,
        lastName,
        phone: "+1 (555) 234-9000",
        qualification: "Undergraduate Student"
      };
      onLoginSuccess(demoUser);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-950">
      
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-stretch md:bg-white md:rounded-3xl md:shadow-xl md:border md:border-slate-150 overflow-hidden">
        
        {/* Left Informational Sidebar/Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between rounded-3xl md:rounded-none">
          <div className="space-y-6">
            <div 
              onClick={onBackToLanding}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 inline-block"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-black text-xl tracking-tight text-white">xchange</span>
            </div>

            <div className="space-y-4 pt-12">
              <h2 className="text-3xl font-black font-heading tracking-tight leading-tight">
                Unlock the Skill Economy.
              </h2>
              <p className="text-sm text-indigo-250 leading-relaxed">
                Connect directly with peer students inside your university. Swap instruction sessions 1-on-1 without paying single billing fees.
              </p>
            </div>

            {/* Token details list */}
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <Coins className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <div className="text-xs">
                  <p className="font-bold text-white">Get 10 Welcome Credits</p>
                  <p className="text-indigo-200 text-[10px]">Start learning immediate subjects right after signing up!</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Dual Verification Active</p>
                  <p className="text-indigo-200 text-[10px]">Secure email pin verification and credential compliance checks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-indigo-300">
            © 2026 xchange community. Built securely for students, by students.
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white relative">
          
          <AnimatePresence mode="wait">
            {isVerifyingEmail ? (
              
              /* ==================== INTERACTIVE EMAIL VERIFICATION SCREEN ==================== */
              <motion.div
                key="email-verification-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                    <Mail className="w-8 h-8 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-heading text-slate-900">Email Authenticating</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      We sent a 6-digit confirmation security code to your student network:
                    </p>
                    <span className="inline-block bg-slate-100 px-3 py-1 text-slate-700 font-mono text-xs rounded-lg mt-2 font-bold select-all">
                      {tempUser?.email}
                    </span>
                  </div>
                </div>

                {/* Simulated SMTP Web Outbox Visual Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                    <span>Local SMTP Dev Log Outbox Simulator</span>
                  </div>
                  <p className="text-[11px] text-amber-950 font-mono">
                    Subject: [xchange-Auth] Security code. Pin is: <strong className="text-indigo-600 underline text-sm tracking-widest">{verificationCode}</strong>
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setUserInputCode(verificationCode)}
                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-white shadow-xs px-2.5 py-1 rounded border border-indigo-200 mt-1 cursor-pointer transition-colors"
                  >
                    ⚡ Auto-fill verification code
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block text-center">
                      Enter 6-Digit Code
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 583901"
                      value={userInputCode}
                      onChange={(e) => setUserInputCode(e.target.value)}
                      maxLength={6}
                      className="w-full text-center text-xl tracking-widest font-black bg-slate-50 text-slate-900 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => sendSimulatedVerificationCode(tempUser?.email || "")}
                      className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend PIN
                    </button>
                    
                    <button 
                      type="submit"
                      className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer text-center"
                    >
                      Verify & Activate!
                    </button>
                  </div>
                </form>

                <p className="text-center">
                  <button 
                    type="button"
                    onClick={() => setIsVerifyingEmail(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Go back and correct details
                  </button>
                </p>

              </motion.div>
            ) : (
              /* ==================== NORMAL ENTRY MODES (LOGIN / SIGNUP / FORGOT / RESET) ==================== */
              <div>
                
                {/* View Toggler (Only shown for Login/Signup) */}
                {(mode === "login" || mode === "signup") && (
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <button 
                      id="toggle-login"
                      onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                      className={`text-lg font-bold font-heading pb-2 px-1 relative transition-colors cursor-pointer ${
                        mode === "login" ? "text-indigo-700" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Log In
                      {mode === "login" && (
                        <motion.div 
                          layoutId="activeAuthTab" 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                        />
                      )}
                    </button>
                    <button 
                      id="toggle-signup"
                      onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
                      className={`text-lg font-bold font-heading pb-2 px-1 relative transition-colors cursor-pointer ${
                        mode === "signup" ? "text-indigo-700" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Sign Up
                      {mode === "signup" && (
                        <motion.div 
                          layoutId="activeAuthTab" 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                        />
                      )}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-150 text-red-700 rounded-xl text-xs font-semibold mb-4 animate-fade-in">
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs font-semibold mb-4 animate-fade-in">
                    {successMsg}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    
                    /* ==================== LOGIN FORM ==================== */
                    <motion.div
                      key="login-form-div"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold font-heading text-slate-900">Welcome Back</h3>
                        <p className="text-xs text-slate-500">Sign in to sync your messages, credit tokens, and matchmaking logs.</p>
                      </div>

                      {/* Federated OAuth Login Options */}
                      <button 
                        type="button"
                        onClick={triggerGoogleOAuth}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer bg-white"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Continue with Google Sign-in</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-100"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Account Login</span>
                        <div className="flex-1 h-px bg-slate-100"></div>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            University Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="email" 
                              placeholder="alex.mercer@university.edu"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              Password
                            </label>
                            <button 
                              type="button"
                              onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline bg-none border-none cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-1 mt-6"
                        >
                          <span>Proceed to Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      {/* Simulated testing aid */}
                      <div className="pt-6 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                          ⚡ Quick Testing Accounts (One-Click Log In):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button 
                            type="button"
                            onClick={() => handleQuickDemoLogin("marcus.vance@university.edu")}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 p-2.5 rounded-xl text-left border border-indigo-100 text-xs transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <img 
                              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
                              alt="Marcus" 
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-[11px]">Marcus Vance</p>
                              <p className="text-[9px] text-indigo-600 font-medium">Calculus & Guitar swap</p>
                            </div>
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleQuickDemoLogin("elena.r@university.edu")}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-900 p-2.5 rounded-xl text-left border border-purple-100 text-xs transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <img 
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                              alt="Elena" 
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-[11px]">Elena Rostova</p>
                              <p className="text-[9px] text-purple-600 font-medium">Machine Learning Tutor</p>
                            </div>
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  ) : mode === "signup" ? (
                    
                    /* ==================== SIGNUP FORM (FULLY DETAILED) ==================== */
                    <motion.div
                      key="signup-form-div"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold font-heading text-slate-900">Create Academic Identity</h3>
                        <p className="text-xs text-slate-500">All fields are validated below to maintain community standards.</p>
                      </div>

                      {/* Google Sign-in shortcut */}
                      <button 
                        type="button"
                        onClick={triggerGoogleOAuth}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer bg-white"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Fast Register with Google</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-100"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Form Sign Up</span>
                        <div className="flex-1 h-px bg-slate-100"></div>
                      </div>

                      <form onSubmit={handleSignupSubmit} className="space-y-4">
                        
                        {/* FIRST NAME & LAST NAME */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              First Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="text" 
                                placeholder="Alex"
                                value={signupFirstName}
                                onChange={(e) => setSignupFirstName(e.target.value)}
                                className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              Last Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="text" 
                                placeholder="Mercer"
                                value={signupLastName}
                                onChange={(e) => setSignupLastName(e.target.value)}
                                className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>
                        </div>

                        {/* EMAIL & PHONE NO */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              School Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="email" 
                                placeholder="alex.mercer@school.edu"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              Phone No
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="tel" 
                                placeholder="+1 (555) 0192-384"
                                value={signupPhone}
                                onChange={(e) => setSignupPhone(e.target.value)}
                                className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>
                        </div>

                        {/* QUALIFICATION */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            Academic Qualification
                          </label>
                          <div className="relative bg-slate-50 rounded-xl border border-slate-200">
                            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                              value={signupQualification}
                              onChange={(e) => setSignupQualification(e.target.value)}
                              className="w-full bg-transparent text-sm py-2.5 pl-10 pr-4 rounded-xl focus:outline-none appearance-none cursor-pointer"
                            >
                              <option value="Undergraduate Student">Undergraduate Student</option>
                              <option value="Master's Student">Master's Student</option>
                              <option value="Ph.D. Candidate">Ph.D. Candidate</option>
                              <option value="Postdoctoral Fellow">Postdoctoral Fellow</option>
                              <option value="Alumni Professional">Alumni Professional</option>
                              <option value="Highschool Honor Scholar">Highschool Honor Scholar</option>
                            </select>
                          </div>
                        </div>

                        {/* PASSWORD & CONFIRMATION */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              Choose Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                value={signupConfirmPassword}
                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                            </div>
                          </div>
                        </div>

                        {/* STUDENT INTRODUCTION BIO */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            Student Introduction Bio
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                            <textarea 
                              rows={2}
                              placeholder="Write a couple lines introducing yourself to trade partners..."
                              value={signupBio}
                              onChange={(e) => setSignupBio(e.target.value)}
                              className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        {/* PROFILE PICTURE SELECTOR (HI-FI OPTIONAL ADDITION) */}
                        <div className="space-y-2.5 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/65">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                              <Camera className="w-4 h-4 text-indigo-600" />
                              <span>Select Profile Photo (Optional)</span>
                            </label>
                            <span className="text-[9px] text-indigo-700 bg-white px-2 py-0.5 rounded-full font-bold border border-indigo-200">Optional</span>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Selected preview sphere */}
                            <img 
                              src={useCustomAvatar && customAvatarUrl.trim() ? customAvatarUrl : signupAvatarUrl}
                              alt="Avatar Preview"
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-600 ring-offset-2 shrink-0 bg-indigo-50"
                              onError={(e) => {
                                e.currentTarget.src = avatarPresets[0].url;
                              }}
                            />

                            <div className="space-y-2 flex-1">
                              {/* Option toggler */}
                              <div className="flex items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setUseCustomAvatar(false)}
                                  className={`text-[9px] font-bold px-2 py-1 rounded border-sm transition-all cursor-pointer ${!useCustomAvatar ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" : "bg-white text-slate-600 border-slate-250 hover:bg-slate-50"}`}
                                >
                                  Presets
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setUseCustomAvatar(true)}
                                  className={`text-[9px] font-bold px-2 py-1 rounded border-sm transition-all cursor-pointer ${useCustomAvatar ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" : "bg-white text-slate-600 border-slate-250 hover:bg-slate-50"}`}
                                >
                                  Paste Image URL
                                </button>
                              </div>

                              {!useCustomAvatar ? (
                                <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[210px] sm:max-w-xs scrollbar-none">
                                  {avatarPresets.map((preset, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      title={preset.label}
                                      onClick={() => setSignupAvatarUrl(preset.url)}
                                      className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 transition-transform ${
                                        signupAvatarUrl === preset.url && !useCustomAvatar ? "ring-2 ring-indigo-600 scale-105" : "opacity-75 hover:opacity-100"
                                      }`}
                                    >
                                      <img src={preset.url} alt={preset.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <input 
                                  type="url"
                                  placeholder="Paste any secure image address (https://...)"
                                  value={customAvatarUrl}
                                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                  className="w-full bg-white text-[11px] py-1 px-2.5 rounded-lg border border-slate-200 focus:outline-none text-slate-705 font-mono"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CAN TEACH Tag Builder */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                              ✙ Skills I Have (Can Teach):
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Add subjects for matching</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                            {signupCanTeach.map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-2 py-1 rounded-lg">
                                {skill}
                                <button type="button" onClick={() => removeTeachSkill(skill)} className="text-indigo-400 hover:text-indigo-600 font-bold">✕</button>
                              </span>
                            ))}
                            {signupCanTeach.length === 0 && (
                              <span className="text-[10px] text-slate-400 italic">No skills added yet</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="e.g. Piano, French, Physics"
                              value={teachInput}
                              onChange={(e) => setTeachInput(e.target.value)}
                              className="flex-1 bg-white text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                            />
                            <button 
                              type="button" 
                              onClick={handleAddTeachSkill}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 bg-opacity-95 rounded-lg cursor-pointer animate-pulse"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* WANT TO LEARN Tag Builder */}
                        <div className="space-y-2 pt-1 border-t border-slate-100/60">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                              ✙ Skills I Need (Want to Learn):
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Auto matching engine pairs these</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                            {signupWantToLearn.map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-purple-50 border border-purple-150 text-purple-700 font-bold px-2.5 py-1 rounded-lg">
                                {skill}
                                <button type="button" onClick={() => removeLearnSkill(skill)} className="text-purple-400 hover:text-purple-600 font-bold">✕</button>
                              </span>
                            ))}
                            {signupWantToLearn.length === 0 && (
                              <span className="text-[10px] text-slate-400 italic">No desires listed yet</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="e.g. Spanish, Python, Biology"
                              value={learnInput}
                              onChange={(e) => setLearnInput(e.target.value)}
                              className="flex-1 bg-white text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                            />
                            <button 
                              type="button" 
                              onClick={handleAddLearnSkill}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3 py-1 bg-opacity-95 rounded-lg cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Register submit - Fixed color from indigo-650 */}
                        <button 
                          type="submit"
                          disabled={isSendingCode}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 mt-4"
                        >
                          {isSendingCode ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Dispatching verification code...</span>
                            </>
                          ) : (
                            <>
                              <span>Register & Verificate Email</span>
                              <Coins className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                            </>
                          )}
                        </button>
                      </form>

                    </motion.div>
                  ) : mode === "forgot" ? (

                    /* ==================== FORGOT PASSWORD VIEW ==================== */
                    <motion.div
                      key="forgot-password-div"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <button 
                        type="button"
                        onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Login Screen</span>
                      </button>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-black font-heading text-slate-900">Forgot Password</h3>
                        <p className="text-xs text-slate-500">
                          Enter your school email. We will generate an instant secure simulation reset key link below.
                        </p>
                      </div>

                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            Registered Academic Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="email" 
                              required
                              placeholder="alex.mercer@university.edu"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingResetEmail}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1 mt-6"
                        >
                          {isSendingResetEmail ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Sending Handshake Link...</span>
                            </>
                          ) : (
                            <>
                              <span>Generate Passphrase Lock</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>

                      {/* SIMULATED SMTP WEB OUTBOX RESET BANNER */}
                      {generatedResetLink && (
                        <div className="p-4 bg-indigo-50/80 border border-indigo-200 text-indigo-900 rounded-2xl text-xs space-y-2.5 animate-fade-in">
                          <div className="flex items-center justify-between font-bold text-indigo-950 uppercase tracking-widest text-[9px]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                              SMTP Outbox Simulator: Reset Dispatch
                            </span>
                            <span className="font-mono text-indigo-600">Active</span>
                          </div>
                          
                          <div className="space-y-1 text-[11px] text-indigo-950/80 border-t border-indigo-100 pt-2 font-mono">
                            <p><strong>To:</strong> {resetEmail}</p>
                            <p><strong>Subject:</strong> [xchange-Secure] Cryptographic Reset Code</p>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center space-y-2">
                            <p className="text-[10px] text-slate-500">We received a request to update your password credentials. Click below to verify identity:</p>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setMode("reset");
                                setError("");
                                setSuccessMsg("");
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg cursor-pointer hover:shadow-md transition-all"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Set New Password Now</span>
                            </button>

                            <p className="text-[8px] text-slate-400 font-mono select-all truncate mt-2">{generatedResetLink}</p>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  ) : (

                    /* ==================== CRYPTOGRAPHIC PASSWORD RESET VIEW ==================== */
                    <motion.div
                      key="reset-password-div"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-150">
                          <Key className="w-3 h-3 text-indigo-600" /> Secure Token Link Validated
                        </span>
                        <h3 className="text-2xl font-black font-heading text-slate-900 mt-1">Setup New Password</h3>
                        <p className="text-xs text-slate-500">
                          Establishing credentials secure reset for user: <span className="font-mono font-bold text-slate-800">{resetEmail}</span>
                        </p>
                      </div>

                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            Key Password Code
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="password" 
                              required
                              placeholder="Min. 6 alphanumeric characters"
                              value={resetPassword}
                              onChange={(e) => setResetPassword(e.target.value)}
                              className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                              type="password" 
                              required
                              placeholder="Validate correct typing matches above"
                              value={resetConfirmPassword}
                              onChange={(e) => setResetConfirmPassword(e.target.value)}
                              className="w-full bg-slate-50 text-sm py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1 mt-6"
                        >
                          <span>Save Credentials & Sign In</span>
                          <Check className="w-4 h-4 text-emerald-400" />
                        </button>
                      </form>

                      <p className="text-center">
                        <button 
                          type="button"
                          onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                          className="text-xs text-slate-400 hover:text-indigo-650 font-bold transition-colors underline cursor-pointer"
                        >
                          Abort and return to Login
                        </button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>

          {/* AUTHENTIC GOOGLE OAUTH POPUP SIMULATOR OVERLAY */}
          {showGoogleOAuth && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl max-w-sm w-full border border-slate-150 overflow-hidden shadow-2xl p-6"
              >
                <div className="text-center space-y-4">
                  {/* Google branding logo */}
                  <div className="flex justify-center">
                    <svg className="w-9 h-9" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-950 font-heading">Sign in with Google</h4>
                    <p className="text-xs text-slate-500 mt-1">to continue to <strong className="text-indigo-600 font-heading">xchange.school</strong></p>
                  </div>

                  {isGoogleLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">Securing academic login handshake...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4 text-left">
                      <button
                        type="button"
                        onClick={() => handleGoogleAccountSelect("bruhykme777@gmail.com", "Bruhykme", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150")}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border border-slate-150 rounded-xl transition-all hover:border-slate-300 text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                          B
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">Bruhykme (Me)</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">bruhykme777@gmail.com</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGoogleAccountSelect("tester.student@university.edu", "Taylor Harrison", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150")}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border border-slate-150 rounded-xl transition-all hover:border-slate-300 text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-sm">
                          T
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">Taylor Harrison</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">tester.student@university.edu</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGoogleAccountSelect("engineering.peer@university.edu", "Jordan Blake", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150")}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border border-slate-150 rounded-xl transition-all hover:border-slate-300 text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
                          J
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">Jordan Blake</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">engineering.peer@university.edu</p>
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Double Encrypted Connection</span>
                    <button 
                      type="button"
                      onClick={() => setShowGoogleOAuth(false)}
                      className="text-slate-655 hover:text-indigo-650 font-bold cursor-pointer bg-none border-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
