"use client";

import { type ReactElement, useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Loader2,
  Briefcase,
  User,
  StickyNote,
  Plus,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

type Tab = "messages" | "notes";

export default function AdminMessagesPage(): ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const threadParam = searchParams?.get("thread") ?? null;
  const [activeTab, setActiveTab] = useState<Tab>(threadParam ? "messages" : "messages");
  const [activeThread, setActiveThread] = useState<string | null>(threadParam);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notes state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteClientEmail, setNoteClientEmail] = useState("");
  const [noteClientName, setNoteClientName] = useState("");
  const [noteProjectId, setNoteProjectId] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const convexIsAdmin = useQuery(api.auth.isAdmin);

  // Messages queries
  const threads = useQuery(api.messages.getAllThreads);
  const messages = useQuery(
    api.messages.getThreadMessages,
    activeThread ? { threadId: activeThread } : "skip"
  );
  const sendReply = useMutation(api.messages.sendAdminReply);
  const markRead = useMutation(api.messages.markThreadRead);

  // Notes queries
  const notes = useQuery(api.adminNotes.getAllNotes, convexIsAdmin === true ? {} : "skip");
  const addNote = useMutation(api.adminNotes.addNote);
  const deleteNote = useMutation(api.adminNotes.deleteNote);

  // Projects for note tagging
  const allProjects = useQuery(api.projects.getAllProjects);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark thread as read when opened
  useEffect(() => {
    if (activeThread) {
      markRead({ threadId: activeThread, readBy: "admin" });
    }
  }, [activeThread, markRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setIsSending(true);
    try {
      await sendReply({ threadId: activeThread, message: newMessage.trim() });
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setIsAddingNote(true);
    try {
      await addNote({
        content: noteContent.trim(),
        clientEmail: noteClientEmail || undefined,
        clientName: noteClientName || undefined,
        projectId: noteProjectId ? (noteProjectId as Id<"projects">) : undefined,
      });
      setNoteContent("");
      setNoteClientEmail("");
      setNoteClientName("");
      setNoteProjectId("");
      setShowAddNote(false);
    } finally {
      setIsAddingNote(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getThreadLabel = (thread: {
    threadId: string;
    projectName?: string;
    userName: string;
  }) => {
    if (thread.projectName) return `${thread.userName} - ${thread.projectName}`;
    return thread.userName;
  };

  // ---- TAB HEADER (shared) ----
  const tabHeader = (
    <div className="flex items-center gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
      <button
        onClick={() => { setActiveTab("messages"); setActiveThread(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === "messages"
            ? "bg-white text-zinc-900"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        Client Messages
      </button>
      <button
        onClick={() => { setActiveTab("notes"); setActiveThread(null); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === "notes"
            ? "bg-white text-zinc-900"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <StickyNote className="w-4 h-4" />
        Internal Notes
      </button>
    </div>
  );

  // ---- CHAT VIEW (messages tab, thread selected) ----
  if (activeTab === "messages" && activeThread) {
    const activeThreadData = threads?.find(
      (t) => t.threadId === activeThread
    );

    return (
      <div>
        {tabHeader}
        <div className="flex h-[calc(100vh-200px)]">
          {/* Thread list - desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:w-80 lg:border-r lg:border-white/10 lg:bg-white/5 lg:rounded-l-xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads?.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => setActiveThread(thread.threadId)}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    activeThread === thread.threadId ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {getThreadLabel(thread)}
                    </span>
                    {thread.unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {thread.lastMessage}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(thread.lastMessageAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat view */}
          <div className="flex-1 flex flex-col bg-white/5 lg:rounded-r-xl rounded-xl lg:rounded-l-none">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button
                onClick={() => setActiveThread(null)}
                className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">
                  {activeThreadData ? getThreadLabel(activeThreadData) : "Thread"}
                </h3>
                <p className="text-xs text-gray-500">{activeThreadData?.userEmail}</p>
              </div>
              {activeThreadData && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      newProject: "true",
                      name: activeThreadData.userName,
                      email: activeThreadData.userEmail || "",
                    });
                    router.push(`/admin/projects?${params.toString()}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-xs font-medium"
                  title="Convert this conversation to a project"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Convert to Project
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages?.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "admin"
                        ? "bg-white text-zinc-900"
                        : "bg-white/10 text-zinc-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "admin" ? "text-zinc-500" : "text-gray-500"}`}>
                      {msg.sender === "admin" ? "You" : msg.userName} - {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 text-sm"
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- MESSAGES LIST VIEW ----
  if (activeTab === "messages") {
    return (
      <div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl lg:text-2xl font-semibold mb-1">Messages</h1>
          <p className="text-gray-400 text-sm">View and reply to client messages, or leave internal notes for your team.</p>
        </motion.div>

        {tabHeader}

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {!threads ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-500" />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              <p className="text-gray-400 font-medium mb-1">No messages yet</p>
              <p className="text-gray-500 text-sm">Client messages will appear here.</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.threadId}
                onClick={() => setActiveThread(thread.threadId)}
                className="w-full text-left p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    thread.projectName ? "bg-purple-500/10 text-purple-400" : "bg-white/10 text-gray-400"
                  }`}
                >
                  {thread.projectName ? <Briefcase className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate">{getThreadLabel(thread)}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(thread.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{thread.lastMessage}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {thread.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ---- INTERNAL NOTES TAB ----
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-1">Messages</h1>
        <p className="text-gray-400 text-sm">View and reply to client messages, or leave internal notes for your team.</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Threads", value: threads?.length ?? 0, color: "text-brand-light" },
          { label: "Unread", value: threads?.filter((t: { unreadByAdmin?: boolean }) => t.unreadByAdmin).length ?? 0, color: "text-yellow-400" },
          { label: "Notes", value: notes?.length ?? 0, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="glass-elevated rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {tabHeader}

      {/* Add Note Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddNote(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-900 hover:bg-zinc-200 font-medium rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">New Internal Note</h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Client name (optional)</label>
              <input
                type="text"
                value={noteClientName}
                onChange={(e) => setNoteClientName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Client email (optional)</label>
              <input
                type="email"
                value={noteClientEmail}
                onChange={(e) => setNoteClientEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {allProjects && allProjects.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Tag a project (optional)</label>
              <select
                value={noteProjectId}
                onChange={(e) => setNoteProjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="">No project</option>
                {allProjects.map((p) => (
                  <option key={String(p._id)} value={String(p._id)}>
                    {p.name} - {p.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">Note</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
              placeholder="Write your note here..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddNote}
              disabled={isAddingNote || !noteContent.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-900 hover:bg-zinc-200 font-medium rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Note
            </button>
            <button
              onClick={() => {
                setShowAddNote(false);
                setNoteContent("");
                setNoteClientEmail("");
                setNoteClientName("");
                setNoteProjectId("");
              }}
              className="px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Notes List */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {!notes ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-500" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <StickyNote className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 font-medium mb-1">No internal notes yet</p>
            <p className="text-gray-500 text-sm">Add notes about clients or projects for your team.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="p-4 border-b border-white/5 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                      {note.authorName}
                    </span>
                    {note.clientName && (
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {note.clientName}
                      </span>
                    )}
                    {note.clientEmail && !note.clientName && (
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {note.clientEmail}
                      </span>
                    )}
                    {note.projectName && (
                      <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {note.projectName}
                      </span>
                    )}
                  </div>
                  {/* Content */}
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatTime(note.createdAt)}</p>
                </div>
                <button
                  onClick={() => deleteNote({ noteId: note._id })}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
