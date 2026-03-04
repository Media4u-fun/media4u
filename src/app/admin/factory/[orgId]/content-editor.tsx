"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Save, Loader2, Check, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp,
} from "lucide-react";

// Section definitions with their editable fields
const SECTIONS = [
  {
    key: "hero",
    label: "Hero Section",
    fields: [
      { name: "headline", label: "Headline", type: "text" },
      { name: "subheadline", label: "Subheadline", type: "textarea" },
      { name: "ctaPrimary", label: "Primary CTA", type: "text" },
      { name: "ctaSecondary", label: "Secondary CTA", type: "text" },
    ],
  },
  {
    key: "business",
    label: "Business Info",
    fields: [
      { name: "name", label: "Business Name", type: "text" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "address", label: "Address", type: "text" },
    ],
  },
  {
    key: "about",
    label: "About Section",
    fields: [
      { name: "story", label: "Our Story", type: "textarea" },
      { name: "mission", label: "Mission Statement", type: "textarea" },
    ],
  },
  {
    key: "contact",
    label: "Contact Info",
    fields: [
      { name: "phone", label: "Phone Number", type: "text" },
      { name: "email", label: "Email Address", type: "text" },
      { name: "address", label: "Service Area", type: "text" },
      { name: "hours", label: "Business Hours", type: "text" },
      { name: "ctaHeadline", label: "CTA Headline", type: "text" },
      { name: "ctaSubtext", label: "CTA Subtext", type: "textarea" },
    ],
  },
  {
    key: "quoteForm",
    label: "Quote Form",
    fields: [
      { name: "headline", label: "Form Headline", type: "text" },
      { name: "subheadline", label: "Form Subheadline", type: "text" },
      { name: "buttonText", label: "Submit Button Text", type: "text" },
    ],
  },
];

// ---- Services List Editor ----
function ServicesEditor({
  orgId,
  allContent,
}: {
  orgId: Id<"clientOrgs">;
  allContent: Record<string, unknown>;
}) {
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse services from content or start with defaults
  const raw = allContent?.services as { items?: Array<{ title: string; description: string }> } | undefined;
  const [items, setItems] = useState<Array<{ title: string; description: string }>>(
    raw?.items || [
      { title: "Weekly Cleaning", description: "Regular pool maintenance and cleaning" },
    ]
  );

  const updateItem = (idx: number, field: "title" | "description", value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const addItem = () => setItems([...items, { title: "", description: "" }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent({
        orgId,
        sectionKey: "services",
        content: JSON.stringify({ items }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection
      label="Services"
      onSave={handleSave}
      saving={saving}
      saved={saved}
    >
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex flex-col gap-1 pt-1">
              <button onClick={() => moveItem(idx, -1)} className="text-gray-600 hover:text-gray-400" disabled={idx === 0}>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <GripVertical className="w-3.5 h-3.5 text-gray-700" />
              <button onClick={() => moveItem(idx, 1)} className="text-gray-600 hover:text-gray-400" disabled={idx === items.length - 1}>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                placeholder="Service name"
                className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Service description"
                rows={2}
                className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>
            <button onClick={() => removeItem(idx)} className="text-gray-600 hover:text-red-400 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 text-xs transition-all w-full justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </button>
      </div>
    </CollapsibleSection>
  );
}

// ---- FAQ List Editor ----
function FAQEditor({
  orgId,
  allContent,
}: {
  orgId: Id<"clientOrgs">;
  allContent: Record<string, unknown>;
}) {
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const raw = allContent?.faq as { items?: Array<{ question: string; answer: string }> } | undefined;
  const [items, setItems] = useState<Array<{ question: string; answer: string }>>(
    raw?.items || [{ question: "", answer: "" }]
  );

  const updateItem = (idx: number, field: "question" | "answer", value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const addItem = () => setItems([...items, { question: "", answer: "" }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent({
        orgId,
        sectionKey: "faq",
        content: JSON.stringify({ items: items.filter((i) => i.question.trim()) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection label="FAQ" onSave={handleSave} saving={saving} saved={saved}>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(idx, "question", e.target.value)}
                placeholder="Question"
                className="flex-1 px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button onClick={() => removeItem(idx)} className="text-gray-600 hover:text-red-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(idx, "answer", e.target.value)}
              placeholder="Answer"
              rows={2}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 text-xs transition-all w-full justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          Add FAQ
        </button>
      </div>
    </CollapsibleSection>
  );
}

// ---- Process Steps Editor ----
function ProcessEditor({
  orgId,
  allContent,
}: {
  orgId: Id<"clientOrgs">;
  allContent: Record<string, unknown>;
}) {
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const raw = allContent?.process as { items?: Array<{ title: string; description: string }> } | undefined;
  const [items, setItems] = useState<Array<{ title: string; description: string }>>(
    raw?.items || [
      { title: "Inspect", description: "We assess your needs" },
      { title: "Plan", description: "Custom plan tailored to you" },
      { title: "Service", description: "Our team executes the plan" },
      { title: "Maintain", description: "Ongoing care and monitoring" },
    ]
  );

  const updateItem = (idx: number, field: "title" | "description", value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent({
        orgId,
        sectionKey: "process",
        content: JSON.stringify({ items }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection label="Process Steps" onSave={handleSave} saving={saving} saved={saved}>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-xs font-bold text-cyan-400 w-6 text-center">{idx + 1}</span>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                placeholder="Step title"
                className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Step description"
                className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ---- Gallery Manager ----
function GalleryManager({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const items = useQuery(api.factory.listGalleryItems, { orgId });
  const addItem = useMutation(api.factory.addGalleryItem);
  const deleteItem = useMutation(api.factory.deleteGalleryItem);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await addItem({
        orgId,
        title: newTitle.trim(),
        category: newCategory.trim() || "general",
        imageUrl: newUrl.trim() || undefined,
      });
      setNewTitle("");
      setNewCategory("");
      setNewUrl("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <CollapsibleSection label="Gallery" saving={false} saved={false}>
      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : "IMG"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
            <button
              onClick={() => deleteItem({ itemId: item._id })}
              className="text-gray-600 hover:text-red-400 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="p-3 rounded-lg border border-dashed border-white/10 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category"
              className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add Image
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}

// ---- Blog Manager ----
function BlogManager({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const posts = useQuery(api.factory.listBlogPosts, { orgId });
  const createPost = useMutation(api.factory.createBlogPost);
  const deletePost = useMutation(api.factory.deleteBlogPost);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await createPost({
        orgId,
        title: newTitle.trim(),
        slug: newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        excerpt: newExcerpt.trim(),
        content: newContent.trim(),
        category: "general",
        published: true,
      });
      setNewTitle("");
      setNewExcerpt("");
      setNewContent("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <CollapsibleSection label="Blog Posts" saving={false} saved={false}>
      <div className="space-y-3">
        {posts?.map((post) => (
          <div key={post._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{post.title}</p>
              <p className="text-xs text-gray-500">
                {post.published ? "Published" : "Draft"} - {post.category}
                {post.publishedAt && ` - ${new Date(post.publishedAt).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={() => deletePost({ postId: post._id })}
              className="text-gray-600 hover:text-red-400 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="p-3 rounded-lg border border-dashed border-white/10 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Post title"
            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={newExcerpt}
            onChange={(e) => setNewExcerpt(e.target.value)}
            placeholder="Short excerpt"
            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Post content"
            rows={3}
            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add Post
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}

// ---- Reviews Manager ----
function ReviewsManager({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const reviews = useQuery(api.factory.listReviews, { orgId });
  const moderate = useMutation(api.factory.moderateReview);

  return (
    <CollapsibleSection label="Reviews" saving={false} saved={false}>
      <div className="space-y-2">
        {!reviews?.length && (
          <p className="text-xs text-gray-500 py-4 text-center">No reviews submitted yet</p>
        )}
        {reviews?.map((review) => (
          <div key={review._id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-white font-medium">{review.name}</span>
                <span className="text-yellow-400 text-xs">{"*".repeat(review.rating)}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  review.approved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {review.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <p className="text-xs text-gray-400">{review.text}</p>
            </div>
            {!review.approved && (
              <button
                onClick={() => moderate({ reviewId: review._id, approved: true })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-medium hover:bg-green-500/30 transition-all flex-shrink-0"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ---- Bookings Manager ----
function BookingsManager({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const bookings = useQuery(api.factory.listBookings, { orgId });
  const updateStatus = useMutation(api.factory.updateBookingStatus);

  return (
    <CollapsibleSection label="Bookings" saving={false} saved={false}>
      <div className="space-y-2">
        {!bookings?.length && (
          <p className="text-xs text-gray-500 py-4 text-center">No bookings yet</p>
        )}
        {bookings?.map((booking) => (
          <div key={booking._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-white font-medium">{booking.customerName}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                  booking.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {booking.service} - {booking.date} at {booking.time}
              </p>
              <p className="text-xs text-gray-500">{booking.customerEmail} - {booking.customerPhone}</p>
            </div>
            {booking.status === "pending" && (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => updateStatus({ bookingId: booking._id, status: "confirmed" })}
                  className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-medium hover:bg-green-500/30 transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() => updateStatus({ bookingId: booking._id, status: "cancelled" })}
                  className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-medium hover:bg-red-500/30 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ---- Collapsible Section Wrapper ----
function CollapsibleSection({
  label,
  children,
  onSave,
  saving,
  saved,
}: {
  label: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-white">{label}</span>
        <div className="flex items-center gap-2">
          {onSave && open && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                saved
                  ? "bg-green-500/20 text-green-400"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
              }`}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saved ? "Saved" : "Save"}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ---- Simple Section Editor (key-value fields) ----
function SimpleSectionEditor({
  orgId,
  sectionKey,
  label,
  fields,
  allContent,
}: {
  orgId: Id<"clientOrgs">;
  sectionKey: string;
  label: string;
  fields: Array<{ name: string; label: string; type: string }>;
  allContent: Record<string, unknown>;
}) {
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const sectionData = allContent?.[sectionKey] as Record<string, string> | undefined;

  const getValue = (fieldName: string) => edits[fieldName] ?? sectionData?.[fieldName] ?? "";
  const setValue = (fieldName: string, value: string) =>
    setEdits((prev) => ({ ...prev, [fieldName]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = sectionData ?? {};
      const updated = { ...existing, ...edits };
      await updateContent({ orgId, sectionKey, content: JSON.stringify(updated) });
      setEdits({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollapsibleSection label={label} onSave={handleSave} saving={saving} saved={saved}>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                value={getValue(field.name)}
                onChange={(e) => setValue(field.name, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            ) : (
              <input
                type="text"
                value={getValue(field.name)}
                onChange={(e) => setValue(field.name, e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ---- Main Content Editor ----
export function ContentEditor({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const allContent = useQuery(api.factory.getAllTemplateContent, { orgId });

  if (allContent === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Edit content for each section. Changes save per section. Expand a section to edit it.
      </p>

      {/* Simple key-value sections */}
      {SECTIONS.map((section) => (
        <SimpleSectionEditor
          key={section.key}
          orgId={orgId}
          sectionKey={section.key}
          label={section.label}
          fields={section.fields}
          allContent={allContent as Record<string, unknown>}
        />
      ))}

      {/* List editors */}
      <ServicesEditor orgId={orgId} allContent={allContent as Record<string, unknown>} />
      <FAQEditor orgId={orgId} allContent={allContent as Record<string, unknown>} />
      <ProcessEditor orgId={orgId} allContent={allContent as Record<string, unknown>} />

      {/* Module managers */}
      <GalleryManager orgId={orgId} />
      <BlogManager orgId={orgId} />
      <ReviewsManager orgId={orgId} />
      <BookingsManager orgId={orgId} />
    </div>
  );
}
