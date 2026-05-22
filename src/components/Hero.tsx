import { motion } from "motion/react";
import { ArrowRight, BookOpen, Coins, Users } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl -z-10 opacity-50"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Join 10,000+ students learning together
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-slate-900 leading-[1.1] tracking-tight mb-6">
            Master new skills. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Share what you know.
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
            The ultimate peer-to-peer learning network. Teach a subject you've mastered, earn tokens, and spend them to learn anything else. Pure knowledge exchange.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-indigo-600 text-white text-base font-medium px-8 py-4 rounded-full hover:bg-indigo-700 cursor-pointer transition-all shadow-lg shadow-indigo-200"
            >
              Start Learning Now
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </motion.div>

        {/* Abstract Visual / App Mockup Simulation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative lg:ml-auto cursor-pointer"
          onClick={onGetStarted}
        >
          <div className="relative w-full max-w-md mx-auto aspect-square bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden border-8 border-white ring-1 ring-slate-100 hover:scale-[1.02] transition-transform">
            {/* Inner App Mockup UI */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-slate-400 text-sm">Your Balance</p>
                  <p className="text-white text-2xl font-bold font-heading flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    240 Tokens
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-slate-800">
                  <span className="text-white font-medium text-sm">AL</span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 mb-4 border border-slate-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                     <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Incoming Request</h3>
                    <p className="text-slate-400 text-sm mb-3">Sarah wants to learn Advanced React from you.</p>
                    <div className="flex gap-2">
                      <span className="bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">+ 40 Tokens</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                     <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Upcoming Session</h3>
                    <p className="text-slate-400 text-sm">You are learning UI Design with Marcus at 4:00 PM.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Session Completed</p>
              <p className="text-xs text-slate-500">Earned 20 tokens</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

