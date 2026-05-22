import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  ArrowLeft, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Bookmark, 
  Info,
  QrCode,
  Share2,
  Wallet,
  CheckCircle,
  HelpCircle,
  X
} from "lucide-react";
import { Transaction } from "../types";

interface WalletPageProps {
  onBackToLanding: () => void;
  onNavigateToProfile: () => void;
}

export function WalletPage({ onBackToLanding, onNavigateToProfile }: WalletPageProps) {
  // Current Active Wallet Balance (starts at high value or configurable)
  const [tokens, setTokens] = useState(140);
  
  // Interactive Simulator States
  const [testDescription, setTestDescription] = useState("");
  const [testType, setTestType] = useState<"earn" | "spend">("earn");
  const [testAmount, setTestAmount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "earn" | "spend">("all");

  // Success feedback text when simulating a transaction
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Preset core transactions requested by user description:
  // e.g. Taught Python — +10 tokens, Learned UI Design — -10 tokens
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      type: "earn",
      amount: 10,
      description: "Taught Python",
      date: "May 22, 2026, 03:14 PM"
    },
    {
      id: "tx-2",
      type: "spend",
      amount: 10,
      description: "Learned UI Design",
      date: "May 21, 2026, 11:45 AM"
    },
    {
      id: "tx-3",
      type: "earn",
      amount: 40,
      description: "Taught Advanced React frameworks to Marcus",
      date: "May 19, 2026, 02:20 PM"
    },
    {
      id: "tx-4",
      type: "spend",
      amount: 20,
      description: "Learned Guitar lesson 1 with Marcus",
      date: "May 18, 2026, 04:00 PM"
    },
    {
      id: "tx-5",
      type: "earn",
      amount: 10,
      description: "Welcome signup token bonus",
      date: "May 15, 2026, 09:00 AM"
    }
  ]);

  // Insert a simulated transaction
  const handleSimulateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDescription.trim()) return;

    if (testType === "spend" && tokens < testAmount) {
      alert("Insufficient credit tokens! Teach other students first to accumulate xchange tokens.");
      return;
    }

    const newTx: Transaction = {
      id: `sim-tx-${Date.now()}`,
      type: testType,
      amount: testAmount,
      description: testDescription.trim(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    };

    setTransactions(prev => [newTx, ...prev]);
    setTokens(prev => testType === "earn" ? prev + testAmount : prev - testAmount);
    
    // Provide nice flash feedback
    setFeedbackMsg(`Successfully logged transaction! Balance adjusted by ${testType === "earn" ? "+" : "-"}${testAmount} tokens.`);
    setTestDescription("");
    
    setTimeout(() => {
      setFeedbackMsg("");
    }, 4000);
  };

  // Helper values for wallet dashboard stats
  const totalEarned = transactions
    .filter(t => t.type === "earn")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === "spend")
    .reduce((sum, current) => sum + current.amount, 0);

  // Search/Filter matching logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || tx.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pt-24 min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Navigation Breadcrumb back to landing */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Homepage
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-xl"
          >
            Manage Skills Workspace
          </button>
        </div>

        {/* Dashboard Title Header */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider inline-block">
            Token Ledger
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight leading-none mb-3">
            Your Skill Exchange Ledger
          </h1>
          <p className="text-slate-600 text-sm">
            Tutor schoolmates to pile up points, then swap them directly for physical knowledge exchanges. Zero cash necessary.
          </p>
        </div>

        {/* Real-time notification toast */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid: Left Side Ledger Balance cards, Right Side Detailed Logs */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Large Token card + Simulator Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Big Token Balance Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Coins className="w-44 h-44 text-yellow-500 animate-spin-slow" />
              </div>
              
              {/* Card visual elements */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 font-heading">Alex Mercer</p>
                    <p className="text-[10px] text-slate-400">Class of 2027</p>
                  </div>
                </div>
                
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-400/20">
                  xchange Standard
                </span>
              </div>

              {/* Huge Balance display */}
              <div className="space-y-1 mb-8">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Current Account Balance</p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-6xl font-black font-heading tracking-tight text-white animate-fade-in">
                    {tokens}
                  </span>
                  <span className="text-sm font-semibold text-slate-305 bg-indigo-650 px-2.5 py-0.5 rounded-full text-indigo-200">
                    Tokens (cr)
                  </span>
                </div>
              </div>

              {/* Progress feedback bar */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Usage Rating: Good standing</span>
                  <span>{tokens >= 10 ? "Can buy 1+ class" : "Low: Need to teach!"}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                    style={{ width: `${Math.min((tokens / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Statistics panels row */}
              <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/50">
                  <span className="text-slate-400 block mb-1 font-medium">Total Earned</span>
                  <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{totalEarned} cr
                  </p>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/50">
                  <span className="text-slate-400 block mb-1 font-medium">Total Spent</span>
                  <p className="text-lg font-bold text-purple-400 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    -{totalSpent} cr
                  </p>
                </div>
              </div>

            </div>

            {/* Faucet / Transaction simulator */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Exchange Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Simulate completed teaching sessions or learned skills to instantly increment or decrement your wallet ledger in real time.
              </p>

              <form onSubmit={handleSimulateTransaction} className="space-y-4 pt-2 border-t border-slate-100">
                {/* Simulated text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description of Class Swap</label>
                  <input 
                    type="text" 
                    required
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="e.g. Taught Python fundamentals to Sofia"
                    className="w-full text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Simulated action types */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setTestType("earn");
                      setTestAmount(10);
                    }}
                    className={`text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                      testType === "earn" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-300" 
                        : "bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Teach (+10 tokens)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setTestType("spend");
                      setTestAmount(10);
                    }}
                    className={`text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                      testType === "spend" 
                        ? "bg-purple-100 text-purple-700 border border-purple-200 ring-1 ring-purple-300" 
                        : "bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Learn (-10 tokens)
                  </button>
                </div>

                {/* Amount selection */}
                <div className="flex items-center justify-between text-xs pt-1.5">
                  <span className="text-slate-500 font-semibold">Step size multiplier:</span>
                  <div className="flex gap-1">
                    {[10, 20, 40].map((amt) => (
                      <button 
                        key={amt}
                        type="button"
                        onClick={() => setTestAmount(amt)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                          testAmount === amt 
                            ? "bg-slate-900 text-white" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {amt}cr
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                >
                  Post Simulated Transaction
                </button>
              </form>
            </div>

            {/* QR Code section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                <QrCode className="w-8 h-8 text-slate-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Exchange ID Code</p>
                <p className="text-[10px] text-slate-500 text-ellipsis overflow-hidden mt-0.5">student-928-mercer-alex</p>
                <div className="flex gap-3 mt-2 text-[10px] font-semibold text-indigo-600">
                  <button className="hover:underline cursor-pointer">Copy Address</button>
                  <button className="hover:underline cursor-pointer">Request Swap</button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Detailed Transaction Logs Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col justify-between">
            
            <div>
              {/* Ledger Tab Header bar */}
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h3 className="font-heading font-black text-xl text-slate-900">
                    Transaction History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Detailed breakdown of your skill trades and token transactions.
                  </p>
                </div>

                <div className="flex gap-1 text-[11px] font-bold">
                  {[
                    { id: "all", label: "All Logs" },
                    { id: "earn", label: "Taught (+)" },
                    { id: "spend", label: "Learned (-)" }
                  ].map((filterTab) => (
                    <button 
                      key={filterTab.id}
                      onClick={() => setActiveFilter(filterTab.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activeFilter === filterTab.id 
                          ? "bg-slate-900 text-white" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar inside logs */}
              <div className="px-6 md:px-8 py-3 border-b border-slate-100 bg-white flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your history (e.g. Python, UI Design)..."
                  className="w-full text-xs text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Transactions list stack */}
              <div className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4 animate-fade-in"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      {/* Icon based on transaction type */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        tx.type === "earn" 
                          ? "bg-green-50 border-green-100 text-green-700 animate-pulse-slow" 
                          : "bg-purple-50 border-purple-100 text-purple-700"
                      }`}>
                        {tx.type === "earn" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {tx.description}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.date}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black font-heading text-base ${
                        tx.type === "earn" ? "text-emerald-600" : "text-purple-600"
                      }`}>
                        {tx.type === "earn" ? "+" : "-"}{tx.amount} Tokens
                      </span>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        {tx.type === "earn" ? "Credit Earned" : "Debit Applied"}
                      </p>
                    </div>

                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="p-12 text-center text-slate-400 text-sm italic space-y-2">
                    <p>No matching transaction logs found.</p>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-indigo-600 underline font-semibold"
                      >
                        Clear search filter
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-4 font-semibold">
              <span className="flex items-center gap-1.5 leading-normal">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                Transactions are recorded on the university xchange ledger instantly.
              </span>
              
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to reset simulated transaction logs to default presets?")) {
                    setTransactions([
                      { id: "tx-1", type: "earn", amount: 10, description: "Taught Python", date: "May 22, 2026, 03:14 PM" },
                      { id: "tx-2", type: "spend", amount: 10, description: "Learned UI Design", date: "May 21, 2026, 11:45 AM" },
                      { id: "tx-5", type: "earn", amount: 10, description: "Welcome signup token bonus", date: "May 15, 2026, 09:00 AM" }
                    ]);
                    setTokens(10);
                  }
                }}
                className="text-slate-400 hover:text-red-500 shrink-0 transition-colors p-1 hover:bg-slate-100 rounded"
                title="Reset Simulation Ledger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
