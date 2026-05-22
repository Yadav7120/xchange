import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Video, 
  Plus, 
  Search, 
  Sparkles, 
  Download, 
  BookOpen, 
  Filter, 
  Folder, 
  User, 
  BookMarked,
  ArrowRight,
  ExternalLink,
  Laptop
} from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CurrentUser } from "./AuthPage";

interface Resource {
  id: string;
  title: string;
  type: "notes" | "pdf" | "class notes" | "video class";
  subject: "coding" | "music" | "math" | "physics" | "languages" | "other";
  project: string;
  description: string;
  author: string;
  authorEmail: string;
  date: string;
  fileSize: string;
  downloads: number;
}

interface WorkspacePageProps {
  onBackToLanding: () => void;
  currentUser: CurrentUser | null;
  onUpdateUser: (user: CurrentUser) => void;
}

const INITIAL_RESOURCES: Resource[] = [
  {
    id: "res-1",
    title: "Calculus I: Limits & Continuity Cheat Sheet",
    type: "pdf",
    subject: "math",
    project: "Limit Solver Project",
    description: "Detailed formulas and breakdown of epsilon-delta proofs, standard limit laws, and the squeeze theorem with worked examples.",
    author: "Marcus Vance",
    authorEmail: "marcus.v@university.edu",
    date: "May 18, 2026",
    fileSize: "1.4 MB",
    downloads: 38
  },
  {
    id: "res-2",
    title: "Advanced TypeScript Patterns & Generic Hooks",
    type: "notes",
    subject: "coding",
    project: "State Machine Hook Project",
    description: "Handcrafted markdown guide outlining generics, conditional types, and real-world custom React hook structures for state machines.",
    author: "Sophia Cheng",
    authorEmail: "sophia.c@university.edu",
    date: "May 20, 2026",
    fileSize: "480 KB",
    downloads: 54
  },
  {
    id: "res-3",
    title: "Spanish Subjunctive Mood Conjugation Matrix",
    type: "class notes",
    subject: "languages",
    project: "Spanish Verb Drills",
    description: "Classroom reference sheets comparing indicative vs subjunctive clauses across common irregular verbs (ser, estar, tener, etc.)",
    author: "Elena Rostova",
    authorEmail: "elena.r@university.edu",
    date: "May 21, 2026",
    fileSize: "840 KB",
    downloads: 19
  },
  {
    id: "res-4",
    title: "Video Class: Classical Guitar Basics & Arpeggios",
    type: "video class",
    subject: "music",
    project: "Fingerstyle Masterclass",
    description: "A 15-minute high-definition video lesson explaining the fundamental thumb-index-middle-ring fingerpicking patterns on open nylon strings.",
    author: "David Miller",
    authorEmail: "david.m@university.edu",
    date: "May 15, 2026",
    fileSize: "24.5 MB",
    downloads: 41
  },
  {
    id: "res-5",
    title: "Newtonian Mechanics & Air Resistance Equations",
    type: "pdf",
    subject: "physics",
    project: "Ballistics Simulator",
    description: "Comprehensive class notes containing differential equations describing air resistance, terminal velocity, and drag coefficients.",
    author: "Aisha Rahman",
    authorEmail: "aisha.r@university.edu",
    date: "May 12, 2026",
    fileSize: "2.1 MB",
    downloads: 27
  }
];

export function WorkspacePage({ onBackToLanding, currentUser, onUpdateUser }: WorkspacePageProps) {
  // Load resources from Firestore in real-time!
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);

  useEffect(() => {
    const qCol = collection(db, "resources");
    const unsubscribe = onSnapshot(qCol, (snap) => {
      const dbResources: Resource[] = [];
      snap.forEach((doc) => {
        dbResources.push(doc.data() as Resource);
      });
      if (dbResources.length > 0) {
        // Sort newest documents first
        dbResources.sort((a, b) => b.id.localeCompare(a.id));
        setResources(dbResources);
      } else {
        // Empty Firestore project: seed standard academic notes
        INITIAL_RESOURCES.forEach(async (initRes) => {
          try {
            await setDoc(doc(db, "resources", initRes.id), initRes);
          } catch (e) {
            console.error("Error seeding initial resource: ", e);
          }
        });
        setResources(INITIAL_RESOURCES);
      }
    }, (error) => {
      console.error("Firestore resources snapshot error, using memory fallback: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Filters state
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Post resource state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<Resource["type"]>("notes");
  const [newSubject, setNewSubject] = useState<Resource["subject"]>("coding");
  const [newProject, setNewProject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFileSize, setNewFileSize] = useState("1.2 MB");
  const [formError, setFormError] = useState("");

  // Categories lists
  const typesList = [
    { value: "all", label: "All Formats" },
    { value: "notes", label: "Draft Notes" },
    { value: "pdf", label: "PDF Documents" },
    { value: "class notes", label: "Class Notes" },
    { value: "video class", label: "Video Classes" }
  ];

  const subjectsList = [
    { value: "all", label: "All Subjects" },
    { value: "coding", label: "Coding & Dev" },
    { value: "music", label: "Music & Art" },
    { value: "math", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "languages", label: "Languages" },
    { value: "other", label: "Other" }
  ];

  // Filtered resources
  const filteredResources = resources.filter(res => {
    const typeMatch = selectedType === "all" || res.type === selectedType;
    const subjectMatch = selectedSubject === "all" || res.subject === selectedSubject;
    const queryMatch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       res.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       res.author.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && subjectMatch && queryMatch;
  });

  // Handle download simulation
  const handleDownloadSimulation = async (item: Resource) => {
    // Increment download counter
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, downloads: r.downloads + 1 } : r));
    
    // Increment in Firestore database as well if server-synced
    try {
      const docRef = doc(db, "resources", item.id);
      await updateDoc(docRef, {
        downloads: item.downloads + 1
      });
    } catch (e) {
      console.error("Error committing downloaded stats to firestore: ", e);
    }
    
    alert(`Success! Simulated high-speed connection established. Downloaded "${item.title}" successfully into cache.`);
  };

  // Submit new resource
  const handlePostResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!newProject.trim()) {
      setFormError("Project reference is required.");
      return;
    }
    if (!newDescription.trim()) {
      setFormError("Detailed description is required.");
      return;
    }

    const createdResource: Resource = {
      id: `res-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      subject: newSubject,
      project: newProject.trim(),
      description: newDescription.trim(),
      author: currentUser?.name || "Student Swapper",
      authorEmail: currentUser?.email || "student@university.edu",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      fileSize: newFileSize.trim(),
      downloads: 0
    };

    // Commit instantly as a permanent record to Firestore
    try {
      await setDoc(doc(db, "resources", createdResource.id), createdResource);
    } catch (e) {
      console.error("Error saving new shared file to Firestore: ", e);
    }

    setResources([createdResource, ...resources]);
    
    // Reset form & state
    setNewTitle("");
    setNewProject("");
    setNewDescription("");
    setNewFileSize("1.5 MB");
    setShowAddModal(false);

    alert("Resource shared successfully! You contributed to the communal knowledge base!");
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Breadcrumb section */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Public Homepage
          </button>

          <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full font-mono font-bold">
            ⚡ Peer Resource Vault ({resources.length} files)
          </span>
        </div>

        {/* Header Block with Premium Aesthetics */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4">
            <BookMarked className="w-80 h-80" />
          </div>

          <div className="relative max-w-2xl text-left space-y-4">
            <span className="bg-indigo-505 bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/20 inline-block">
              Knowledge Commons
            </span>
            <h1 className="text-3xl md:text-4xl font-black font-heading leading-tight tracking-tight">
              Shared Study Workspace
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              Explore user-uploaded notes, PDF textbooks, class recordings, and reference materials. Share your own resource attachments below to earn appreciation from peer learners!
            </p>
            
            <div className="pt-2">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Upload New Note/File
              </button>
            </div>
          </div>
        </div>

        {/* Sorting, Filtering & Search Controls Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search notes, subjects, projects or contributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs py-3.5 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Total count display */}
            <p className="text-xs text-slate-500 font-medium shrink-0">
              Showing <span className="font-bold text-indigo-750">{filteredResources.length}</span> resources matching scope
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
            
            {/* Filter 1: Format Type Drop-downs */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" /> Format:
              </span>
              <div className="flex flex-wrap gap-1">
                {typesList.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      selectedType === type.value 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:block text-slate-200">|</div>

            {/* Filter 2: Subject Drop-downs */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Folder className="w-3 h-3 text-slate-400" /> Subject:
              </span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-550"
              >
                {subjectsList.map((subj) => (
                  <option key={subj.value} value={subj.value}>
                    {subj.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Resources Grid listing */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((res) => (
              <motion.div
                key={res.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-56 text-left relative overflow-hidden group"
              >
                <div>
                  {/* Badge & Meta Row */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      res.type === "pdf" ? "bg-red-50 text-red-600 border border-red-100" :
                      res.type === "video class" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      res.type === "class notes" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {res.type}
                    </span>
                    <span className="text-[10px] text-slate-405 font-mono text-slate-450">{res.fileSize}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-1">
                    {res.title}
                  </h3>

                  {/* Project name & Subject */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 mb-2">
                    <span className="bg-indigo-50 px-1.5 py-0.5 rounded capitalize">{res.subject}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 truncate" title={res.project}>{res.project}</span>
                  </div>

                  {/* Author bio row */}
                  <p className="text-slate-500 text-[11px] leading-tight line-clamp-2 mb-3">
                    {res.description}
                  </p>
                </div>

                {/* Footer Contributors Panel */}
                <div className="border-t border-slate-50 pt-3.5 flex items-center justify-between mt-auto">
                  
                  {/* Author details */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 truncate leading-none">{res.author}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-0.5">{res.date}</p>
                    </div>
                  </div>

                  {/* Direct simulated download button */}
                  <button
                    onClick={() => handleDownloadSimulation(res)}
                    className="flex items-center gap-1 text-[10px] bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 font-bold px-2.5 py-1.5 rounded-lg border border-slate-100 hover:border-indigo-600 transition-all cursor-pointer"
                    title={`View and Download. Downloads Count: ${res.downloads}`}
                  >
                    {res.type === "video class" ? <Video className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                    <span>{res.type === "video class" ? "Video" : "Get File"}</span>
                    <span className="opacity-60">({res.downloads})</span>
                  </button>

                </div>

              </motion.div>
            ))}
          </AnimatePresence>

          {filteredResources.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
              <Folder className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No resources matched</h3>
              <p className="text-xs text-slate-450 max-w-sm mx-auto">
                Try clearing your search query or picking alternative format tags to explore peer uploads on other subjects.
              </p>
              <button 
                onClick={() => { setSelectedType("all"); setSelectedSubject("all"); setSearchQuery(""); }}
                className="text-xs font-bold text-indigo-600 underline"
              >
                Reset Filter Settings
              </button>
            </div>
          )}
        </div>

        {/* UPLOAD FORM DIALOG COMPONENT */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                {/* Close modal */}
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 p-1.5 h-8 w-8 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-400 hover:text-slate-750 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>

                <div className="space-y-1 mb-6 text-left">
                  <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest inline-block">
                    Contribute note
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">Post New Resource</h3>
                  <p className="text-xs text-slate-500">
                    Publish materials, assignments, audio or notes for immediate reciprocal downloads.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold mb-4 text-left">
                    {formError}
                  </div>
                )}

                <form onSubmit={handlePostResourceSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Resource Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Advanced Limits and Continuity Cheat Sheet"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Resource Format</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full text-xs font-bold text-slate-705 bg-slate-50 border border-slate-200 px-3 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      >
                        <option value="notes">Draft Notes</option>
                        <option value="pdf">PDF Document</option>
                        <option value="class notes">Class Notes</option>
                        <option value="video class">Video Class</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Subject</label>
                      <select
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value as any)}
                        className="w-full text-xs font-bold text-slate-705 bg-slate-50 border border-slate-200 px-3 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      >
                        <option value="coding">Coding & Dev</option>
                        <option value="music">Music & Art</option>
                        <option value="math">Mathematics</option>
                        <option value="physics">Physics</option>
                        <option value="languages">Languages</option>
                        <option value="other">Other Subjects</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Project Name Reference</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Term Projects, Final Exams Prep"
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Estimated File Size</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1.2 MB or 22.0 MB"
                        value={newFileSize}
                        onChange={(e) => setNewFileSize(e.target.value)}
                        className="w-full text-xs font-mono font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Summarized Description</label>
                    <textarea 
                      placeholder="Briefly review what knowledge concepts or video topics are contained in this resource to aid peer search engines."
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 text-center font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Discard Draft
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 text-center font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-xs py-3.5 rounded-xl text-center cursor-pointer transition-colors"
                    >
                      Submit To Commons
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
