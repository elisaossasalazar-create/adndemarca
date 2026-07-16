"use client";

import { useState, useRef } from "react";
import { Star } from "@/components/star";

interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  week_number: number;
  post_type: "reto" | "libre";
  content: string;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  comments: CommunityComment[];
}

interface Props {
  initialPosts: CommunityPost[];
  currentUserId: string;
  currentWeek: number;
  isAdmin: boolean;
}

export default function CommunityTab({ initialPosts, currentUserId, currentWeek, isAdmin }: Props) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);

  function handlePostCreated(post: CommunityPost) {
    setPosts((ps) => [{ ...post, comments: [] }, ...ps]);
  }

  function handleCommentAdded(postId: string, comment: CommunityComment) {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      )
    );
  }

  function handlePostDeleted(postId: string) {
    setPosts((ps) => ps.filter((p) => p.id !== postId));
  }

  const retoPosts = posts.filter((p) => p.post_type === "reto");
  const librePosts = posts.filter((p) => p.post_type === "libre");

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-8">
      {/* Section 1: Reto de la semana */}
      <Section
        title={`Reto de la semana · Semana ${currentWeek}`}
        placeholder="¿Qué descubriste esta semana sobre tu marca?"
        postType="reto"
        posts={retoPosts}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        emptyMessage="sé la primera en compartir tu reto ✨"
        onPostCreated={handlePostCreated}
        onCommentAdded={handleCommentAdded}
        onPostDeleted={handlePostDeleted}
      />

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* Section 2: Comparte lo que quieras */}
      <Section
        title="Comparte lo que quieras"
        placeholder="Comparte algo que te inspire, una reflexión, un recurso…"
        postType="libre"
        posts={librePosts}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        emptyMessage="aún no hay publicaciones libres · sé la primera ✨"
        onPostCreated={handlePostCreated}
        onCommentAdded={handleCommentAdded}
        onPostDeleted={handlePostDeleted}
      />
    </div>
  );
}

function Section({
  title,
  placeholder,
  postType,
  posts,
  currentUserId,
  isAdmin,
  emptyMessage,
  onPostCreated,
  onCommentAdded,
  onPostDeleted,
}: {
  title: string;
  placeholder: string;
  postType: "reto" | "libre";
  posts: CommunityPost[];
  currentUserId: string;
  isAdmin: boolean;
  emptyMessage: string;
  onPostCreated: (post: CommunityPost) => void;
  onCommentAdded: (postId: string, comment: CommunityComment) => void;
  onPostDeleted: (postId: string) => void;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) {
      setError("Escribe algo o adjunta un archivo.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("content", text);
    formData.append("post_type", postType);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/community", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo publicar.");
        return;
      }
      onPostCreated(data.post as CommunityPost);
      setText("");
      removeFile();
    } catch {
      setError("Error al publicar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Form */}
      <div className="rounded-2xl border border-neutral-100 p-4 flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {title}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#FF63A6] transition-colors resize-none"
          />

          {filePreview && (
            <div className="relative">
              <img src={filePreview} alt="preview" className="rounded-xl max-h-48 object-cover w-full" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {file && !filePreview && (
            <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
              <span className="text-xs text-neutral-500">📎</span>
              <span className="text-xs text-neutral-700 truncate flex-1">{file.name}</span>
              <button
                type="button"
                onClick={removeFile}
                className="text-neutral-400 hover:text-neutral-600 text-xs ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors"
            >
              + foto / video / archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <span className="text-xs text-neutral-300 ml-auto">{text.length}/1000</span>

            <button
              type="submit"
              disabled={submitting || (!text.trim() && !file)}
              className="rounded-full px-5 py-1.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--brand-pink)" }}
            >
              {submitting ? "publicando…" : "publicar"}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="py-8 text-center">
          <Star size={18} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm text-neutral-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isMe={post.user_id === currentUserId}
              isAdmin={isAdmin}
              onCommentAdded={(comment) => onCommentAdded(post.id, comment)}
              onDeleted={() => onPostDeleted(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  isMe,
  isAdmin,
  onCommentAdded,
  onDeleted,
}: {
  post: CommunityPost;
  isMe: boolean;
  isAdmin: boolean;
  onCommentAdded: (comment: CommunityComment) => void;
  onDeleted: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta publicación y sus comentarios?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/community/${post.id}`, { method: "DELETE" });
      if (res.ok) onDeleted();
    } catch {
      // silently ignore
    } finally {
      setDeleting(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo comentar.");
        return;
      }
      onCommentAdded(data.comment);
      setCommentText("");
    } catch {
      setError("Error al comentar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const fileUrl = post.file_name ? `/api/files/${post.file_name}` : null;
  const isImage = post.file_type?.startsWith("image/");
  const isVideo = post.file_type?.startsWith("video/");
  const isPdf = post.file_type === "application/pdf";
  const commentCount = post.comments.length;

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: isMe ? "var(--brand-pink)" : "#f0f0f0" }}
    >
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold lowercase text-neutral-900">{post.user_name}</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide mt-0.5">
            semana {post.week_number} · {formatDate(post.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMe && (
            <span
              className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
              style={{ backgroundColor: "var(--brand-pink)", color: "white" }}
            >
              tú
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Eliminar publicación"
              className="text-[10px] text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-40 px-1"
            >
              {deleting ? "…" : "✕ eliminar"}
            </button>
          )}
        </div>
      </div>

      {post.content && (
        <p className="px-4 pb-3 text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {fileUrl && isImage && (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img src={fileUrl} alt="adjunto" className="w-full max-h-96 object-cover cursor-pointer" />
        </a>
      )}
      {fileUrl && isVideo && (
        <video src={fileUrl} controls playsInline className="w-full max-h-80 bg-black" preload="metadata" />
      )}
      {fileUrl && isPdf && (
        <div className="px-4 pb-3">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <span>📄</span>
            <span>Ver PDF</span>
          </a>
        </div>
      )}

      <div className="border-t border-neutral-100 px-4 py-2.5">
        <button
          onClick={() => setShowComments((s) => !s)}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          {commentCount > 0
            ? `${commentCount} comentario${commentCount !== 1 ? "s" : ""}`
            : "sin comentarios"}{" "}
          · <span style={{ color: "var(--brand-pink)" }}>comentar {showComments ? "▲" : "▼"}</span>
        </button>
      </div>

      {showComments && (
        <div className="border-t border-neutral-100 bg-neutral-50/50">
          {post.comments.map((c) => (
            <div key={c.id} className="px-4 py-2.5 border-b border-neutral-100 last:border-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xs font-bold text-neutral-800 lowercase">{c.user_name}</span>
                <span className="text-[10px] text-neutral-400">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">{c.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="px-4 py-3 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="escribe un comentario…"
              maxLength={500}
              className="flex-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs outline-none focus:border-[#FF63A6] transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40 flex-shrink-0"
              style={{ backgroundColor: "var(--brand-pink)" }}
            >
              {submitting ? "…" : "enviar"}
            </button>
          </form>
          {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00Z");
    return d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
