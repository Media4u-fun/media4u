"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";

interface NewsletterEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function NewsletterEditor({ content, onChange }: NewsletterEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-cyan-400 hover:text-cyan-300 underline",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Insert image at current cursor position
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const addLink = () => {
    if (!editor) return;

    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-dark-card">
      {/* Toolbar */}
      <div className="border-b border-white/10 p-2 flex flex-wrap gap-1 bg-dark-bg/50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("bold")
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          Bold
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("italic")
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          Italic
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          H1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          H3
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("bulletList")
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          Bullet List
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("orderedList")
              ? "bg-cyan-500/20 text-cyan-400"
              : "hover:bg-white/5 text-gray-300"
          }`}
          type="button"
        >
          Numbered List
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/5 text-gray-300 transition-colors disabled:opacity-50"
          disabled={uploading}
          type="button"
        >
          {uploading ? "Uploading..." : "Image"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {editor.isActive("link") ? (
          <button
            onClick={removeLink}
            className="px-3 py-1.5 rounded text-sm font-medium bg-cyan-500/20 text-cyan-400 transition-colors"
            type="button"
          >
            Remove Link
          </button>
        ) : (
          <button
            onClick={addLink}
            className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/5 text-gray-300 transition-colors"
            type="button"
          >
            Add Link
          </button>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
