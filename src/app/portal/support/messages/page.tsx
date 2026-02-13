"use client";

import { type ReactElement, useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Send,
  Plus,
  MessageCircle,
  Loader2,
  Briefcase,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/components/AuthContext";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function ClientMessagesPage(): ReactElement {
  const { user } = useAuth();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadMessage, setNewThreadMessage] = useState("");
  const [newThreadProject, setNewThreadProject] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads = useQuery(
    api.messages.getClientThreads,
    user?.id ? { userId: user.id } : "skip"
  );
  const messages = useQuery(
    api.messages.getThreadMessages,
    activeThread ? { threadId: activeThread } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markThreadRead);

  // Get client projects for thread creation
  const projects = useQuery(api.projects.getMyProjects) as
    | Array<{ _id: Id<"projects">; name: string }>
    | undefined;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark thread as read when opened
  useEffect(() => {
    if (activeThread) {
      markRead({ threadId: activeThread, readBy: "client" });
    }
  }, [activeThread, markRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThread || !user?.id) return;

    setIsSending(true);
    try {
      const thread = threads?.find((t) => t.threadId === activeThread);
      await sendMessage({
        threadId: activeThread,
        projectId: thread?.projectId as Id<"projects"> | undefined,
        message: newMessage.trim(),
      });
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleNewThread = async () => {
    if (!newThreadMessage.trim() || !user?.id) return;

    setIsSending(true);
    try {
      const projectId = newThreadProject || undefined;
      const threadId = projectId
        ? `project_${projectId}_${user.id}`
        : `general_${user.id}_${Date.now()}`;

      await sendMessage({
        threadId,
        projectId: projectId as Id<"projects"> | undefined,
        message: newThreadMessage.trim(),
      });
      setNewThreadMessage("");
      setNewThreadProject("");
      setShowNewThread(false);
      setActiveThread(threadId);
    } finally {
      setIsSending(false);
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
  }) => {
    if (thread.projectName) return thread.projectName;
    if (thread.threadId.startsWith("general_")) return "General";
    return "Message";
  };

  // Mobile: show chat view when thread is active
  if (activeThread) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] lg:h-auto">
        {/* Mobile back button + Desktop split layout */}
        <div className="flex h-full">
          {/* Thread list - desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:w-80 lg:border-r lg:border-zinc-800 lg:bg-zinc-900 lg:rounded-l-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Messages</h2>
              <button
                onClick={() => setShowNewThread(true)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads?.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => setActiveThread(thread.threadId)}
                  className={`w-full text-left p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors ${
                    activeThread === thread.threadId ? "bg-zinc-800" : ""
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
                  <p className="text-xs text-zinc-400 truncate">
                    {thread.lastMessage}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatTime(thread.lastMessageAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat view */}
          <div className="flex-1 flex flex-col bg-zinc-900 lg:rounded-r-xl rounded-xl lg:rounded-l-none">
            {/* Chat header */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <button
                onClick={() => setActiveThread(null)}
                className="lg:hidden p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {getThreadLabel(
                    threads?.find((t) => t.threadId === activeThread) || {
                      threadId: activeThread,
                    }
                  )}
                </h3>
                <p className="text-xs text-zinc-500">
                  {threads?.find((t) => t.threadId === activeThread)?.projectName
                    ? "Project thread"
                    : "General support"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages?.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.sender === "client" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "client"
                        ? "bg-white text-zinc-900"
                        : "bg-zinc-800 text-zinc-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === "client"
                          ? "text-zinc-500"
                          : "text-zinc-500"
                      }`}
                    >
                      {msg.sender === "admin" ? "Media4U" : "You"} -{" "}
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-zinc-800">
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
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 text-sm"
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Thread list view (default / mobile)
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold mb-1">Messages</h1>
          <p className="text-gray-400 text-sm">
            Chat with our team about your projects or general questions.
          </p>
        </div>
        <button
          onClick={() => setShowNewThread(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-900 hover:bg-zinc-200 font-medium rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Message</span>
        </button>
      </motion.div>

      {/* New Thread Modal */}
      {showNewThread && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">
            Start a New Conversation
          </h3>

          {projects && projects.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2">
                About a project? (optional)
              </label>
              <select
                value={newThreadProject}
                onChange={(e) => setNewThreadProject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
              >
                <option value="">General Question</option>
                {projects.map((p) => (
                  <option key={String(p._id)} value={String(p._id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-zinc-400 mb-2">
              Your message
            </label>
            <textarea
              value={newThreadMessage}
              onChange={(e) => setNewThreadMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
              placeholder="What can we help you with?"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNewThread}
              disabled={isSending || !newThreadMessage.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-900 hover:bg-zinc-200 font-medium rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
            <button
              onClick={() => {
                setShowNewThread(false);
                setNewThreadMessage("");
                setNewThreadProject("");
              }}
              className="px-4 py-2.5 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Thread List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {!threads ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
            <p className="text-zinc-500 text-sm">Loading...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="text-zinc-400 font-medium mb-1">No messages yet</p>
            <p className="text-zinc-500 text-sm">
              Start a conversation to get help with your project.
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.threadId}
              onClick={() => setActiveThread(thread.threadId)}
              className="w-full text-left p-4 border-b border-zinc-800/50 last:border-b-0 hover:bg-zinc-800/50 transition-colors flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  thread.projectName
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {thread.projectName ? (
                  <Briefcase className="w-5 h-5" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white truncate">
                    {getThreadLabel(thread)}
                  </span>
                  <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                    {formatTime(thread.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  {thread.lastMessage}
                </p>
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
