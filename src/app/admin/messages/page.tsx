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
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";

export default function AdminMessagesPage(): ReactElement {
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");
  const [activeThread, setActiveThread] = useState<string | null>(
    threadParam
  );
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads = useQuery(api.messages.getAllThreads);
  const messages = useQuery(
    api.messages.getThreadMessages,
    activeThread ? { threadId: activeThread } : "skip"
  );

  const sendReply = useMutation(api.messages.sendAdminReply);
  const markRead = useMutation(api.messages.markThreadRead);

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
      await sendReply({
        threadId: activeThread,
        message: newMessage.trim(),
      });
      setNewMessage("");
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
    userName: string;
  }) => {
    if (thread.projectName) return `${thread.userName} - ${thread.projectName}`;
    return thread.userName;
  };

  // Chat view when thread is selected
  if (activeThread) {
    const activeThreadData = threads?.find(
      (t) => t.threadId === activeThread
    );

    return (
      <div className="flex h-[calc(100vh-120px)]">
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
          {/* Chat header */}
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
            <div>
              <h3 className="text-sm font-semibold text-white">
                {activeThreadData
                  ? getThreadLabel(activeThreadData)
                  : "Thread"}
              </h3>
              <p className="text-xs text-gray-500">
                {activeThreadData?.userEmail}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.sender === "admin" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === "admin"
                      ? "bg-white text-zinc-900"
                      : "bg-white/10 text-zinc-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "admin"
                        ? "text-zinc-500"
                        : "text-gray-500"
                    }`}
                  >
                    {msg.sender === "admin" ? "You" : msg.userName} -{" "}
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
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
    );
  }

  // Thread list view (default)
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl lg:text-2xl font-semibold mb-1">Messages</h1>
        <p className="text-gray-400 text-sm">
          View and reply to client messages.
        </p>
      </motion.div>

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
            <p className="text-gray-500 text-sm">
              Client messages will appear here.
            </p>
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
                  thread.projectName
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-white/10 text-gray-400"
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
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(thread.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
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
