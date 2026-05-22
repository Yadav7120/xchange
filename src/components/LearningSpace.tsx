import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Send, 
  FileText, 
  Upload, 
  X, 
  Plus, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Download, 
  LogOut, 
  Calendar,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  ExternalLink,
  Laptop
} from "lucide-react";
import { ChatMessage, NoteFile } from "../types";
import { CurrentUser } from "./AuthPage";

interface LearningSpaceProps {
  onBackToLanding: () => void;
  currentUser: CurrentUser | null;
  onUpdateUser: (user: CurrentUser) => void;
}

export function LearningSpace({ onBackToLanding, currentUser, onUpdateUser }: LearningSpaceProps) {
  // Session states
  const [isJoined, setIsJoined] = useState(false);
  const [showCompletionOptions, setShowCompletionOptions] = useState(false);
  const [roomName, setRoomName] = useState("xchange-calculus-guitar-swap");
  const [subject, setSubject] = useState("Calculus & Music Theory Swap");
  const [peerName, setPeerName] = useState("Marcus Vance");
  const [peerAvatar, setPeerAvatar] = useState("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120");

  // Jitsi iFrame room state configuration
  const jitsiBaseUrl = "https://meet.jit.si";
  const uniqueRoomUrl = `${jitsiBaseUrl}/${encodeURIComponent(roomName)}#config.prejoinPageEnabled=false&userInfo.displayName="Alex Mercer"`;

  // Automatic billing transaction handlers
  const handleSessionCompletion = (role: "teacher" | "learner" | "none") => {
    setShowCompletionOptions(false);
    setIsJoined(false);

    if (role === "none" || !currentUser) {
      return;
    }

    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (role === "teacher") {
      // Earn 10 Xtokens
      const updatedUser = {
        ...currentUser,
        tokens: currentUser.tokens + 10
      };
      
      // Save transaction receipt
      const savedTxs = localStorage.getItem(`xchange_tx_history_${currentUser.email}`);
      let txs = [];
      if (savedTxs) {
        try { txs = JSON.parse(savedTxs); } catch (e) {}
      }
      txs.unshift({
        id: `tx-completed-${Date.now()}`,
        type: "earn",
        amount: 10,
        description: `Taught ${subject} to ${peerName}`,
        date: todayStr
      });
      localStorage.setItem(`xchange_tx_history_${currentUser.email}`, JSON.stringify(txs));
      onUpdateUser(updatedUser);
      
      alert(`Success! Automatic session calculation cleared. You earned +10 Xtokens!\nNew Balance: ${updatedUser.tokens} Xtokens.`);
    } else if (role === "learner") {
      // Spend 10 Xtokens
      if (currentUser.tokens < 10) {
        alert("Transaction Aborted! You do not have enough Xtokens in your wallet to fund this instruction. Please run a teaching session first to earn credits.");
        return;
      }
      const updatedUser = {
        ...currentUser,
        tokens: currentUser.tokens - 10
      };
      
      // Save transaction receipt
      const savedTxs = localStorage.getItem(`xchange_tx_history_${currentUser.email}`);
      let txs = [];
      if (savedTxs) {
        try { txs = JSON.parse(savedTxs); } catch (e) {}
      }
      txs.unshift({
        id: `tx-completed-${Date.now()}`,
        type: "spend",
        amount: 10,
        description: `Learned ${subject} from ${peerName}`,
        date: todayStr
      });
      localStorage.setItem(`xchange_tx_history_${currentUser.email}`, JSON.stringify(txs));
      onUpdateUser(updatedUser);
      
      alert(`Success! Automatic session calculation cleared. Subtracted 10 Xtokens!\nNew Balance: ${updatedUser.tokens} Xtokens.`);
    }
  };

  // Real-time Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "ls-m1",
      sender: "peer",
      text: "Hey! Ready to swap? Let's start with 30 minutes of Calculus limits and then we can switch to basic guitar chords!",
      timestamp: "10 mins ago"
    },
    {
      id: "ls-m2",
      sender: "user",
      text: "Absolutely! I have loaded my calculus limits cheat sheet in our shared files section. Let me know if you can view it.",
      timestamp: "8 mins ago"
    },
    {
      id: "ls-m3",
      sender: "peer",
      text: "Awesome, downloading the cheat sheet on my end right now! I'm ready to launch the video call whenever you are.",
      timestamp: "5 mins ago"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // File Sharing state
  const [sharedNotes, setSharedNotes] = useState<NoteFile[]>([
    {
      id: "ls-f1",
      name: "Calculus_Limits_Formulas.pdf",
      size: "1.4 MB",
      uploadedAt: "10 mins ago"
    },
    {
      id: "ls-f2",
      name: "Classical_Guitar_Basics.pdf",
      size: "920 KB",
      uploadedAt: "5 mins ago"
    }
  ]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Send interactive simulated messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: "Just now"
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText("");

    // Simulate smart peer replies
    setTimeout(() => {
      let automatedReply = "Awesome! Let's make sure we review the practice exercises on page 3.";
      const lower = userMsg.text.toLowerCase();

      if (lower.includes("video") || lower.includes("call") || lower.includes("jitsi") || lower.includes("join")) {
        automatedReply = "Sounds perfect, I have launched my video feed locally. Joining the Jitsi Room right now!";
      } else if (lower.includes("sheet") || lower.includes("pdf") || lower.includes("file") || lower.includes("download")) {
        automatedReply = "Thank you so much! I'll take a look at these notes during our live run.";
      } else if (lower.includes("token") || lower.includes("session") || lower.includes("end")) {
        automatedReply = "Got it. Let's make sure to hit 'End Session' when we are fully done to exchange the 10 credit tokens.";
      }

      const peerMsg: ChatMessage = {
        id: `peer-${Date.now()}`,
        sender: "peer",
        text: automatedReply,
        timestamp: "Just now"
      };

      setChatMessages(prev => [...prev, peerMsg]);
    }, 1500);
  };

  // Drag & drop file handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const newFile: NoteFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: "Just now"
      };
      setSharedNotes(prev => [...prev, newFile]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile: NoteFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: "Just now"
      };
      setSharedNotes(prev => [...prev, newFile]);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Top bar session header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Laptop className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-heading leading-none">
                  {subject}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isJoined ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {isJoined ? "● Session Active" : "Waiting to Join"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span>With teacher:</span>
                <span className="font-bold text-slate-800">{peerName}</span>
                <span className="text-slate-300">|</span>
                <span>Room:</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-semibold">{roomName}</span>
              </p>
            </div>
          </div>

          {/* Action Join & End buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isJoined ? (
              <button 
                onClick={() => setIsJoined(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
                Join Live Session
              </button>
            ) : (
              <button 
                onClick={() => setShowCompletionOptions(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-red-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                End & Complete Session
              </button>
            )}
            
            <button 
              onClick={onBackToLanding}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-3 rounded-xl transition-colors shrink-0"
            >
              Exit Space
            </button>
          </div>
        </div>

        {/* Triple Section Responsive Panel Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main call block (Lobby / Jitsi Iframe) - 8 columns */}
          <div className="lg:col-span-8 flex flex-col min-h-[580px]">
            
            <AnimatePresence mode="wait">
              {isJoined ? (
                /* SECTION 1: Embedded Jitsi Video Call iframe */
                <motion.div 
                  key="jitsi-active"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex-1 flex flex-col relative"
                >
                  {/* Embedded Iframe */}
                  <iframe 
                    src={uniqueRoomUrl} 
                    className="w-full h-full min-h-[500px] flex-1 border-0"
                    allow="camera; microphone; display-capture; autoplay"
                    referrerPolicy="no-referrer"
                    title="Jitsi Meet Skill Swap Room"
                  />

                  {/* Watermark notice */}
                  <div className="absolute top-4 left-4 bg-slate-950/75 backdrop-blur-sm text-slate-300 text-[10px] px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                    Secure peer-to-peer Jitsi connection
                  </div>
                </motion.div>
              ) : (
                /* Pre-session Setup Screen */
                <motion.div 
                  key="lobby-preview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                      <h2 className="text-xl font-bold text-slate-900 font-heading">
                        Welcome to your Skill Match Room
                      </h2>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl bg-slate-50 p-4 rounded-xl border border-slate-100">
                      You are matched with <strong className="text-indigo-700">{peerName}</strong>. This custom learning space provisions free unlimited high-definition video calling via secure Jitsi Meet pipelines. Take notes, exchange PDF study sheets on the side, and chat!
                    </p>

                    {/* Configuring input fields */}
                    <div className="grid md:grid-cols-2 gap-4 max-w-lg">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Room Identifier Name</label>
                        <input 
                          type="text" 
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value.replace(/\s+/g, '-'))}
                          className="w-full text-xs font-mono font-bold bg-slate-50 text-indigo-700 border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Core Swap Subjects</label>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full text-xs font-sans font-medium bg-slate-50 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Benefits stack */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before joining check your equipment:</h4>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-semibold">
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-green-700">✓ Camera connected</span>
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-green-700">✓ Microphone ready</span>
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">★ Balanced token security</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">
                      *By proceeding you authorize the exchange policy of 10 school tokens.
                    </p>
                    <button 
                      onClick={() => setIsJoined(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      Initialize Meeting Room
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Pane (Chat Box + File Sharing) - 4 columns */}
          <div className="lg:col-span-4 space-y-8 flex flex-col justify-between">
            
            {/* SECTION 2: Interactive Real-Time Chat box */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[320px] justify-between">
              
              {/* Box titlebar */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-150 flex items-center justify-between">
                <span className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Live Study Chat
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>

              {/* Msg listing */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[190px]">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-2.5 text-xs ${
                      msg.sender === "user" 
                        ? "bg-indigo-600 text-white rounded-br-none" 
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`block text-[8px] text-right mt-1 opacity-75 ${
                        msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Message inputs */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 bg-slate-50/50 flex gap-1.5">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl shrink-0 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

            {/* SECTION 3: Notes & PDF upload storage compartment */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between flex-1">
              
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-heading mb-3 flex items-center justify-between">
                  <span>Shared PDF Notes ({sharedNotes.length})</span>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase underline cursor-pointer">View All</span>
                </h4>

                <div className="space-y-2 max-h-[130px] overflow-y-auto pr-1">
                  {sharedNotes.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/50 p-2 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-700 transition-colors">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] text-slate-400 font-mono">{file.size}</span>
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Simulating secure download of ${file.name}`);
                          }}
                          className="p-1 hover:bg-white border hover:border-slate-300 rounded transition-colors text-slate-500 hover:text-slate-800"
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {sharedNotes.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">No sheets uploaded yet. Share one below.</p>
                  )}
                </div>
              </div>

              {/* Drag Drop Simulator Area */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50/50" 
                    : "border-slate-200 hover:border-indigo-500/40"
                }`}
              >
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-700 font-bold">Drag study PDF sheets here</p>
                <p className="text-[10px] text-slate-400/80 mt-0.5">or click to browse local files</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInput}
                  accept=".pdf" 
                  className="hidden" 
                />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* AUTOMATED TRANSACTION CALCULATION POPUP MODAL */}
      <AnimatePresence>
        {showCompletionOptions && (
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
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-800 font-heading">Automated Xtoken Settlement</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Session termination detected. Your swap was hosted on the secure peer-to-peer workspace. To settle the community network balance automatically, select your role:
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => handleSessionCompletion("teacher")}
                  className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 transition-all cursor-pointer text-xs flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 shrink-0" />
                    I taught this session (+10 Xtoken)
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">+10 Xtoken</span>
                </button>

                <button 
                  onClick={() => handleSessionCompletion("learner")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer text-xs flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 shrink-0" />
                    I learned in this session (-10 Xtoken)
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">-10 Xtoken</span>
                </button>

                <button 
                  onClick={() => handleSessionCompletion("none")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Just exit peer room (No balance transfer)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
