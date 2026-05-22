import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-xl font-bold font-heading text-slate-900">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          xchange
        </div>
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} xchange platform. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
