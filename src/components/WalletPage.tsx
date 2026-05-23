import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Info,
  QrCode,
  Share2,
  Wallet,
  CheckCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  CreditCard
} from "lucide-react";
import { CurrentUser } from "./AuthPage";

interface Transaction {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  date: string;
}

interface WalletPageProps {
  onBackToLanding: () => void;
  onNavigateToProfile: () => void;
  currentUser: CurrentUser | null;
  onUpdateUser: (user: CurrentUser) => void;
}

export function WalletPage({ onBackToLanding, onNavigateToProfile, currentUser, onUpdateUser }: WalletPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "earn" | "spend">("all");

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`xchange_tx_history_${currentUser.email}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default initial transactions showing welcome tokens
    return [
      {
        id: "tx-init",
        type: "earn",
        amount: 30,
        description: "Welcome grant for joining xchange",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      }
    ];
  });

  // Keep transactions in sync with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`xchange_tx_history_${currentUser.email}`, JSON.stringify(transactions));
    }
  }, [transactions, currentUser]);

  const tokens = currentUser?.tokens ?? 30;

  // Calculate totals
  const totalEarned = transactions
    .filter(tx => tx.type === "earn")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = transactions
    .filter(tx => tx.type === "spend")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Filtered list
  const filteredTxs = transactions.filter(tx => {
    const filterMatches = activeFilter === "all" || tx.type === activeFilter;
    const searchMatches = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.date.toLowerCase().includes(searchQuery.toLowerCase());
    return filterMatches && searchMatches;
  });

  const [paymentStep, setPaymentStep] = useState<"idle" | "price" | "verification" | "sending" | "complete">("idle");
  const [purchaseType, setPurchaseType] = useState<"Token" | "Mentor">("Token");

  const handlePurchase = async () => {
    setPaymentStep("sending");
    try {
      const response = await fetch('/api/notify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser?.email || 'unknown',
          paymentType: purchaseType === "Token" ? "TokenPurchase" : "MentorAccess",
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Improved Payment Modal */}
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
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
                       <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-black text-slate-900 font-heading">Purchase {purchaseType === "Token" ? "Xtokens" : "Mentor Access"}</h2>
                      <p className="text-sm text-slate-500 mt-1">Select your preferred package to proceed.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-indigo-900 text-sm">{purchaseType === "Token" ? "100 Xtokens" : "Monthly Mentor Pass"}</p>
                          <p className="text-[10px] text-indigo-600 font-medium">Instant balance update</p>
                        </div>
                        <span className="font-black text-slate-900">₹{purchaseType === "Token" ? "799" : "1,199"}</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center opacity-60">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{purchaseType === "Token" ? "250 Xtokens" : "Annual Mentor Pass"}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Best Value</p>
                        </div>
                        <span className="font-black text-slate-400">₹{purchaseType === "Token" ? "1,599" : "9,999"}</span>
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
                        Are you sure you want to proceed with this payment? A notification will be sent to the administrator for manual verification.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPaymentStep("price")} className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider">Back</button>
                      <button onClick={handlePurchase} className="py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider">Confirm</button>
                    </div>
                  </div>
                )}

                {paymentStep === "sending" && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-slate-900 text-sm">Notifying Administrator...</p>
                  </div>
                )}

                {paymentStep === "complete" && (
                  <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                       <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900 font-heading">Request Sent!</h2>
                      <p className="text-sm text-slate-500">
                        Admin has been notified. Your account will be updated once the transaction is verified.
                      </p>
                    </div>
                    <button 
                      onClick={() => setPaymentStep("idle")} 
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Return to Wallet
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Navigation Breadcrumb row */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Homepage
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 transition-colors px-4 py-2 rounded-xl"
          >
            My Profile Page
          </button>
        </div>

        {/* Hero wallet dashboard structure */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left card Column: Token balance values */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Dark balance display */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[300px]">
              
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Coins className="w-48 h-48" />
              </div>

              {/* Sub-header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Wallet className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-widest">xchange Wallet</span>
                </div>

              </div>

              {/* Huge Balance display */}
              <div className="space-y-1 my-6 text-left">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Current Account Balance</p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-6xl font-black font-heading tracking-tight text-white animate-fade-in">
                    {tokens}
                  </span>
                  <span className="text-sm font-semibold text-slate-35 bg-indigo-600 px-3 py-1 rounded-full text-indigo-100">
                    Xtoken
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setPurchaseType("Token");
                    setPaymentStep("price");
                  }}
                  className="mt-4 flex items-center gap-2 bg-white text-indigo-900 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Purchase Xtoken
                </button>
              </div>

              {/* Progress feedback bar */}
              <div className="space-y-2 text-xs text-left">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-semibold text-[10px] uppercase">Account Liquidity Status</span>
                  <span className="font-bold text-indigo-300">{tokens >= 10 ? "Good standing" : "Low: Need to teach!"}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                    style={{ width: `${Math.min((tokens / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Statistics panels row */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800 text-left text-xs">
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/50">
                  <span className="text-slate-400 block mb-1 font-medium">Total Earned</span>
                  <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{totalEarned} Xtoken
                  </p>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/50">
                  <span className="text-slate-400 block mb-1 font-medium">Total Spent</span>
                  <p className="text-lg font-bold text-purple-400 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    -{totalSpent} Xtoken
                  </p>
                </div>
              </div>

            </div>

            {/* AUTOMATED NETWORK POLICY */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-650 shrink-0" />
                <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Communal Exchange Policies
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Skill trading runs on automated, direct micro-transfers. No manual adjustments or financial wire approvals are required. Take note of the core exchange framework:
              </p>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 px-2 bg-indigo-50 text-indigo-700 font-bold font-mono rounded text-[10px] shrink-0 mt-0.5">
                    +10 Xtoken
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">Teaching Rewards</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Automatically added to your wallet balance when you initiate and finalize a tutoring session as an instructor.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 px-2 bg-purple-50 text-purple-700 font-bold font-mono rounded text-[10px] shrink-0 mt-0.5">
                    -10 Xtoken
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">Booking debits</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Immediately subtracted from your wallet ledger once you look up and secure active skill swaps on the Match Finder.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code static address */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 text-left">
                <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Unique User ID</h4>
                    <p className="text-[10px] text-slate-450 font-mono truncate select-all bg-slate-50 border p-1 rounded mt-1">
                        {currentUser?.email ? btoa(currentUser.email).slice(0, 15) : "unknown-user"}
                    </p>
                </div>
            </div>

          </div>

          {/* Right Column: Transaction Logs lists */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            
            <div className="space-y-6">
              
              {/* Header Title block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="text-left">
                  <h3 className="font-heading font-black text-xl text-slate-900">Ledger History</h3>
                  <p className="text-xs text-slate-450">Verified cryptographical exchange receipts on the xchange network</p>
                </div>

                {/* Filter Selector tabs */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                  {(["all", "earn", "spend"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveFilter(mode)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border uppercase tracking-wider transition-colors cursor-pointer ${
                        activeFilter === mode 
                          ? "bg-slate-900 border-slate-950 text-white font-semibold" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Field inside Transaction logs */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter transactions by topic, dates or student tags..."
                  className="w-full bg-slate-50 py-2.5 pl-9 pr-4 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
                />
              </div>

              {/* Transactions list layout */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredTxs.map((tx) => (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3.5 bg-slate-50/50 border border-slate-150/70 hover:bg-slate-55 rounded-2xl flex items-center justify-between gap-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Transaction Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.type === "earn" 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                            : "bg-purple-50 border-purple-100 text-purple-600"
                        }`}>
                          {tx.type === "earn" ? (
                            <ArrowUpRight className="w-4 h-4 font-bold" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 font-bold" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
                            {tx.description}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{tx.date}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-black font-heading text-sm ${
                          tx.type === "earn" ? "text-emerald-600" : "text-purple-600"
                        }`}>
                          {tx.type === "earn" ? "+" : "-"}{tx.amount} Xtoken
                        </span>
                        <p className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">
                          {tx.type === "earn" ? "Credits Earned" : "Debit Applied"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredTxs.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-slate-150 rounded-2xl space-y-2">
                    <Info className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-650">No transaction logs identified</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                      Search queries or toggle preferences yielded empty logs. Book reciprocal skills to register transaction blocks.
                    </p>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 text-left leading-normal">
              Receipts are signed securely by peer keys and processed in the cloud under ledger verification protocols. Transaction logs are stored locally for instant synchronization.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
