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
  Laptop,
  X
} from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { CurrentUser } from "./AuthPage";
import { Resource } from "../types";

interface WorkspacePageProps {
  onBackToLanding: () => void;
  currentUser: CurrentUser | null;
  onUpdateUser: (user: CurrentUser) => void;
}

const INITIAL_RESOURCES: Resource[] = [];

export function WorkspacePage({ onBackToLanding, currentUser, onUpdateUser }: WorkspacePageProps) {
  // Load resources from Firestore in real-time!
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);

  useEffect(() => {
    // One time cleanup of mock data
    const mockIds = ["res-1", "res-2", "res-3", "res-4", "res-5"];
    import("firebase/firestore").then(({ deleteDoc, doc }) => {
      mockIds.forEach(id => {
        deleteDoc(doc(db, "resources", id)).catch(() => {});
      });
    });

    const qCol = collection(db, "resources");
    const unsubscribe = onSnapshot(qCol, (snap) => {
      const dbResources: Resource[] = [];
      snap.forEach((doc) => {
        dbResources.push(doc.data() as Resource);
      });
      
      // Sort newest documents first
      dbResources.sort((a, b) => b.id.localeCompare(a.id));
      setResources(dbResources);
    }, (error) => {
      console.error("Firestore resources snapshot error, using memory fallback: ", error);
    });

    return () => unsubscribe();
  }, [db]);

  // Filters state
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Post resource state
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [confirmStage, setConfirmStage] = useState<number>(0);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<Resource["type"]>("notes");
  const [newSubject, setNewSubject] = useState<Resource["subject"]>("coding");
  const [newProject, setNewProject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFileSize, setNewFileSize] = useState("0 KB");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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
    
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    } else {
      alert(`Downloading "${item.title}"...`);
    }
  };

  // Submit new resource
  const executeDeleteResource = async () => {
    if (!resourceToDelete) return;
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "resources", resourceToDelete));
      setResourceToDelete(null);
      setConfirmStage(0);
    } catch (e) {
      console.error(e);
      alert("Failed to delete.");
    }
  };

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

    if (editingResource) {
      try {
        await updateDoc(doc(db, "resources", editingResource.id), {
          title: newTitle.trim(),
          type: newType,
          subject: newSubject,
          project: newProject.trim(),
          description: newDescription.trim(),
          fileUrl: newFileUrl || editingResource.fileUrl,
          fileSize: newFileSize !== "0 KB" ? newFileSize.trim() : editingResource.fileSize
        });
      } catch (e) {
        console.error(e);
        setFormError("Failed to update resource.");
        return;
      }
    } else {
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
        downloads: 0,
        fileUrl: newFileUrl
      };

      try {
        await setDoc(doc(db, "resources", createdResource.id), createdResource);
        alert("Resource shared successfully! You contributed to the communal knowledge base!");
      } catch (e) {
        console.error("Error saving new shared file to Firestore: ", e);
      }
    }

    // Reset form & state
    setNewTitle("");
    setNewProject("");
    setNewDescription("");
    setNewFileSize("0 KB");
    setNewFileUrl("");
    setEditingResource(null);
    setShowAddModal(false);
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


        </div>

        {/* Header Block with Cleaner Aesthetics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative max-w-2xl text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-black font-heading text-slate-900 tracking-tight">
              Shared Study Workspace
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Explore user-uploaded notes, PDF textbooks, class recordings, and reference materials. Share your own resource attachments below to earn appreciation from peer learners!
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-end">
            <button 
              onClick={() => {
                setEditingResource(null);
                setNewTitle("");
                setNewType("notes");
                setNewSubject("coding");
                setNewProject("");
                setNewDescription("");
                setNewFileUrl("");
                setNewFileSize("0 KB");
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Resource
            </button>
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
                <div className="border-t border-slate-50 pt-3 flex items-center justify-between mt-auto">
                  
                  {/* Author details */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <User className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 truncate leading-none">{res.author}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-0.5">{res.date}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {res.fileUrl && (
                      <button
                        onClick={() => setPreviewResource(res)}
                        className="flex items-center gap-1 text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 font-bold px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors cursor-pointer"
                        title="Preview File"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    )}
                    
                    {currentUser?.email === res.authorEmail && (
                      <>
                        <button
                          onClick={() => {
                            setEditingResource(res);
                            setNewTitle(res.title);
                            setNewType(res.type as any);
                            setNewSubject(res.subject as any);
                            setNewProject(res.project);
                            setNewDescription(res.description);
                            setShowAddModal(true);
                          }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setResourceToDelete(res.id);
                            setConfirmStage(1);
                          }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDownloadSimulation(res)}
                      className="flex items-center gap-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      title={`Download. Count: ${res.downloads}`}
                    >
                      {res.type === "video class" ? <Video className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      <span>{res.type === "video class" ? "Video" : "Get"}</span>
                    </button>
                  </div>
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
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Resource File</label>
                      <input 
                        type="file" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsUploading(true);
                              const sizeStr = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
                              setNewFileSize(sizeStr);
                              
                              // Fallback Object URL
                              try {
                                setNewFileUrl(URL.createObjectURL(file));
                              } catch(e) {/* ignore */}

                              const fileRef = ref(storage, `resources/${file.name}_${Date.now()}`);
                              const snap = await uploadBytes(fileRef, file);
                              const dl = await getDownloadURL(snap.ref);
                              setNewFileUrl(dl);
                            } catch (err) {
                              console.error("Resource upload failed:", err);
                              // Base64 fallback if storage fails
                              const reader = new FileReader();
                              reader.onload = (re) => {
                                if (re.target?.result) setNewFileUrl(re.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
                        disabled={isUploading}
                      />
                      {isUploading && <p className="text-[10px] text-indigo-600 font-bold">Uploading file...</p>}
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

        {/* PREVIEW DIALOG COMPONENT */}
        <AnimatePresence>
          {previewResource && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]"
              >
                <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      {previewResource.type === "video class" ? <Video className="w-5 h-5 text-indigo-600" /> : <BookOpen className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{previewResource.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">Uploaded by {previewResource.author}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewResource(null)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-100/50 p-4 overflow-hidden flex flex-col">
                  {previewResource.fileUrl ? (
                    <iframe 
                      src={previewResource.fileUrl} 
                      className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-sm"
                      title={previewResource.title}
                      allow="autoplay"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Folder className="w-16 h-16 mb-4 opacity-50" />
                      <p>No preview available.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRM Modal */}
        <AnimatePresence>
          {confirmStage > 0 && resourceToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-5 border border-slate-100"
              >
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <X className="w-6 h-6" />
                </div>
                
                {confirmStage === 1 ? (
                  <>
                    <h3 className="text-lg font-bold text-slate-800 font-heading">Delete Resource?</h3>
                    <p className="text-sm text-slate-500">Are you sure you want to remove this uploaded resource?</p>
                    <div className="flex items-center gap-3 justify-center pt-2">
                      <button 
                        onClick={() => { setConfirmStage(0); setResourceToDelete(null); }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setConfirmStage(2)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Yes, Delete It
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-red-600 font-heading">Final Verification</h3>
                    <p className="text-sm text-slate-600 font-semibold underline decoration-red-200 decoration-2">Are you absolutely sure?</p>
                    <p className="text-xs text-slate-500">This cannot be undone.</p>
                    <div className="flex items-center gap-3 justify-center pt-2">
                      <button 
                        onClick={() => { setConfirmStage(0); setResourceToDelete(null); }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        No, Keep It
                      </button>
                      <button 
                        onClick={executeDeleteResource}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all border border-red-500"
                      >
                        Confirm Deletion
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
