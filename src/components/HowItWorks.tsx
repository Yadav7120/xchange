import { motion } from "motion/react";
import { Search, Sparkles, UserPlus } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "List your skill",
    description: "Create a profile highlighting what you can teach. Whether it's Calculus, Guitar, or Python, someone wants to learn it.",
    icon: <UserPlus className="w-6 h-6 text-indigo-600" />
  },
  {
    id: "02",
    title: "Get Matched",
    description: "Our algorithm finds students who want to learn from you, and connects you with peers who can teach what you want to learn.",
    icon: <Search className="w-6 h-6 text-purple-600" />
  },
  {
    id: "03",
    title: "Teach & Earn",
    description: "Conduct sessions to earn tokens. Spend your earned tokens to book sessions with other student experts.",
    icon: <Sparkles className="w-6 h-6 text-blue-600" />
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function HowItWorks() {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">
            How xchange works
          </h2>
          <p className="text-slate-600 text-lg">
            A simple, self-sustaining ecosystem built on mutual knowledge sharing.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 relative"
        >
          {/* Connecting Line (desktop only) */}
          <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div key={step.id} variants={itemVariants} className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                  {step.icon}
                </div>
                
                <div className="text-sm font-bold text-slate-300 mb-2 font-heading tracking-wider">
                  STEP {step.id}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
