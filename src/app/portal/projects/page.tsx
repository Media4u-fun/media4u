"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useState, useRef, useCallback } from "react";
import { Search, ExternalLink, Calendar, Package, Lock, Globe, Palette, Glasses, Rocket, ArrowRight, Plus, ChevronLeft, ClipboardList, MessageSquare, FileText, Upload, Download, Send } from "lucide-react";
import Link from "next/link";
import { ProjectWizard } from "../../start-project/project-wizard";
import { IntakeForm } from "./IntakeForm";
import { CustomDealPanel } from "./CustomDealPanel";

type ProjectStatus = "new" | "planning" | "design" | "development" | "review" | "completed" | "launched";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  planning: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  design: "bg-brand-dark/10 text-pink-400 border border-brand-dark/20",
  development: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  review: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  launched: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
};

const statusLabels: Record<ProjectStatus, string> = {
  new: "New",
  planning: "Planning",
  design: "Design",
  development: "Development",
  review: "Review",
  completed: "Completed",
  launched: "Launched",
};

const SERVICES = [
  { icon: Globe, label: "Websites" },
  { icon: Palette, label: "Branding" },
  { icon: Glasses, label: "VR" },
  { icon: Rocket, label: "Bundles" },
];

function BuildYourProject({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:p-10 max-w-lg w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.label}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">{service.label}</span>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Start Your Project
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          Websites, branding, VR experiences, or bundles - our project wizard walks you through it step by step.
        </p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Custom deal project view - intake form + invoice/subscription panel
function CustomDealView({ project }: { project: Doc<"projects"> }) {
  const [intakeSubmitted, setIntakeSubmitted] = useState(!!project.intakeSubmittedAt);
  const [view, setView] = useState<"status" | "edit-intake">("status");

  if (!intakeSubmitted || view === "edit-intake") {
    return (
      <div>
        {intakeSubmitted && (
          <button
            onClick={() => setView("status")}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Project Status
          </button>
        )}
        <IntakeForm
          project={project}
          onSubmitted={() => {
            setIntakeSubmitted(true);
            setView("status");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Project header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white mb-0.5">{project.projectType}</h2>
              {project.company && <p className="text-sm text-gray-400">{project.company}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status as ProjectStatus] ?? statusColors.new}`}>
                  {statusLabels[project.status as ProjectStatus] ?? project.status}
                </span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  Intake submitted
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setView("edit-intake")}
            className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Update intake info
          </button>
        </div>
      </div>

      {/* Invoice + Subscription panels */}
      <CustomDealPanel project={project} />

      {/* Notes + Files */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <ProjectNotesSection projectId={project._id} />
        <ProjectFilesSection projectId={project._id} />
      </div>
    </div>
  );
}

export default function ClientProjectsPage() {
  const projects = useQuery(api.projects.getMyProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);

  // Separate custom deal projects from standard projects
  const customDealProjects = projects?.filter((p) => p.isCustomDeal) ?? [];
  const standardProjects = projects?.filter((p) => !p.isCustomDeal) ?? [];

  const filtered = standardProjects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.projectType.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query)
    );
  });

  const hasStandardProjects = standardProjects.length > 0;
  const hasCustomDeal = customDealProjects.length > 0;
  const hasAnyProjects = projects && projects.length > 0;

  // If the client has a custom deal project and no standard projects yet,
  // show the custom deal flow instead of the build options
  if (projects !== undefined && hasCustomDeal && !showWizard) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-xl lg:text-2xl font-semibold mb-2">My Projects</h1>
          <p className="text-gray-400">View and track your projects</p>
        </motion.div>

        {/* Custom deal projects */}
        <div className="space-y-8">
          {customDealProjects.map((project) => (
            <CustomDealView key={project._id} project={project} />
          ))}
        </div>

        {/* Standard projects below if they also have some */}
        {hasStandardProjects && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Other Projects</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {standardProjects.map((project) => (
                <StandardProjectCard key={project._id} project={project} onSelect={() => setSelectedProjectId(project._id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show detail view for selected standard project
  const selectedProject = selectedProjectId
    ? projects?.find((p) => p._id === selectedProjectId)
    : null;

  if (selectedProject && !selectedProject.isCustomDeal) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-xl lg:text-2xl font-semibold mb-2">My Projects</h1>
          <p className="text-gray-400">View and track your projects</p>
        </motion.div>
        <ProjectDetailView
          project={selectedProject}
          onBack={() => setSelectedProjectId(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          {showWizard ? (
            <>
              <button
                onClick={() => setShowWizard(false)}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Projects
              </button>
              <h1 className="text-xl lg:text-2xl font-semibold mb-2">Start a Project</h1>
              <p className="text-gray-400">Fill out the steps below and we will follow up within 1-2 business days.</p>
            </>
          ) : (
            <>
              <h1 className="text-xl lg:text-2xl font-semibold mb-2">My Projects</h1>
              <p className="text-gray-400">View and track your website projects</p>
            </>
          )}
        </div>
        {hasAnyProjects && !showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 text-gray-300 hover:text-white hover:border-zinc-800 hover:bg-zinc-800 transition-all text-sm font-medium w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </motion.div>

      {/* Inline wizard */}
      {showWizard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProjectWizard />
        </motion.div>
      )}

      {/* Show build options when no projects and not in wizard */}
      {!showWizard && projects !== undefined && !hasAnyProjects && (
        <BuildYourProject onStart={() => setShowWizard(true)} />
      )}

      {/* Show projects grid when they have standard projects and not in wizard */}
      {hasStandardProjects && !showWizard && (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.length > 0 ? (
              filtered.map((project) => (
                <StandardProjectCard key={project._id} project={project} onSelect={() => setSelectedProjectId(project._id)} />
              ))
            ) : (
              <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">No projects match your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Project Notes Section ──────────────────────────────────────────────────
function ProjectNotesSection({ projectId }: { projectId: Id<"projects"> }) {
  const notes = useQuery(api.projects.getProjectNotesForClient, { projectId });
  const addNote = useMutation(api.projects.addProjectNoteClient);
  const [newNote, setNewNote] = useState("");
  const [sending, setSending] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSending(true);
    try {
      await addNote({ projectId, note: newNote.trim() });
      setNewNote("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-zinc-400" />
        Project Notes
      </h3>

      {/* Add note input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          placeholder="Add a note..."
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 text-sm"
        />
        <button
          onClick={handleAddNote}
          disabled={sending || !newNote.trim()}
          className="px-3 py-2 rounded-lg bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notes === undefined ? (
          <p className="text-sm text-zinc-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-500">No notes yet. Add one above to communicate with your project team.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className={`p-3 rounded-lg border text-sm ${
                note.createdByRole === "client"
                  ? "bg-zinc-800/50 border-zinc-700"
                  : "bg-blue-500/5 border-blue-500/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  note.createdByRole === "client" ? "text-zinc-400" : "text-blue-400"
                }`}>
                  {note.createdBy ?? "Team"}
                  {note.createdByRole === "admin" && " (Media4U)"}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-zinc-200 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Project Files Section ──────────────────────────────────────────────────
function ProjectFilesSection({ projectId }: { projectId: Id<"projects"> }) {
  const files = useQuery(api.projectFiles.getProjectFilesForClient, { projectId });
  const generateUploadUrl = useMutation(api.projectFiles.generateUploadUrlClient);
  const saveFileMetadata = useMutation(api.projectFiles.saveFileMetadataClient);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        await saveFileMetadata({
          projectId,
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [generateUploadUrl, saveFileMetadata, projectId]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-zinc-400" />
        Files & Documents
      </h3>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
          dragOver ? "border-white/40 bg-zinc-800/50" : "border-zinc-700 hover:border-zinc-600"
        }`}
      >
        <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
        <p className="text-sm text-zinc-400">
          {uploading ? "Uploading..." : "Drop files here or click to upload"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* File list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {files === undefined ? (
          <p className="text-sm text-zinc-500">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-zinc-500">No files yet. Upload documents, images, or assets above.</p>
        ) : (
          files.map((file) => (
            <div
              key={file._id}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm text-zinc-200 truncate">{file.fileName}</p>
                <p className="text-xs text-zinc-500">
                  {formatFileSize(file.fileSize)} - uploaded by {file.uploadedByName} - {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              {file.url && (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Project Detail View (shows notes + files) ──────────────────────────────
function ProjectDetailView({ project, onBack }: { project: Doc<"projects">; onBack: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Projects
      </button>

      {/* Project header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{project.projectType}</h2>
            {project.company && <p className="text-sm text-gray-400">{project.company}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status as ProjectStatus] ?? statusColors.new}`}>
                {statusLabels[project.status as ProjectStatus] ?? project.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Live Site
              </a>
            )}
            <Link
              href={`/portal/projects/${project._id}/vault`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm"
            >
              <Lock className="w-4 h-4" />
              Vault
            </Link>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-4">{project.description}</p>
        <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-gray-500">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Notes + Files grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ProjectNotesSection projectId={project._id} />
        <ProjectFilesSection projectId={project._id} />
      </div>
    </div>
  );
}

function StandardProjectCard({ project, onSelect }: { project: Doc<"projects">; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 transition-colors cursor-pointer hover:border-zinc-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{project.projectType}</h3>
          {project.company && (
            <p className="text-sm text-gray-400">{project.company}</p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            statusColors[project.status as ProjectStatus]
          }`}
        >
          {statusLabels[project.status as ProjectStatus]}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-zinc-800">
        {project.budget && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{project.budget}</span>
          </div>
        )}
        {project.timeline && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{project.timeline}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium justify-center"
          >
            <ExternalLink className="w-4 h-4" />
            Live Site
          </a>
        )}
        <Link
          href={`/portal/projects/${project._id}/vault`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium justify-center ${!project.liveUrl ? "sm:col-span-2" : ""}`}
        >
          <Lock className="w-4 h-4" />
          Setup Vault
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-gray-500">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}
