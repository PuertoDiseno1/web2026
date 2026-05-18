"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Post {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categories: string;
  published: boolean;
}

const defaultPost: Post = {
  slug: "", title: "", excerpt: "", content: "", coverImage: "", categories: "", published: false,
};

export default function PostForm({ post }: { post?: Partial<Post> }) {
  const router = useRouter();
  const [data, setData] = useState<Post>({ ...defaultPost, ...post });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [msg, setMsg] = useState("");

  const isEdit = !!post?.id;

  function update(key: keyof Post, value: unknown) {
    setData((d) => ({ ...d, [key]: value }));
    if (key === "title" && !isEdit) {
      const slug = (value as string)
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setData((d) => ({ ...d, slug }));
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json.url) update("coverImage", json.url);
    setUploadingCover(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/posts/${post!.id}` : "/api/posts";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMsg("Guardado correctamente.");
      if (!isEdit) router.push("/admin/blog");
    } else {
      setMsg("Error al guardar.");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar esta nota? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${post!.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/blog");
    else { setMsg("Error al eliminar."); setDeleting(false); }
  }

  const inputStyle = {
    width: "100%", padding: "0.65rem 0.9rem", border: "1px solid #e0e0e0",
    borderRadius: "6px", fontSize: "0.875rem", outline: "none",
    fontFamily: "inherit", color: "#111", background: "#fff",
  };
  const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: "0.4rem" } as const;
  const fieldStyle = { marginBottom: "1.25rem" };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>

        {/* Main */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Título *</label>
            <input style={inputStyle} value={data.title} onChange={(e) => update("title", e.target.value)} required />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={data.slug} onChange={(e) => update("slug", e.target.value)} required />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Extracto (resumen corto)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
              value={data.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Contenido *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 360, resize: "vertical", lineHeight: 1.7 }}
              value={data.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Escribe el contenido de la nota aquí..."
              required
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Actions */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem" }}>Publicación</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={data.published} onChange={(e) => update("published", e.target.checked)} />
                Publicado
              </label>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Categorías (separadas por coma)</label>
              <input
                style={inputStyle}
                value={data.categories}
                onChange={(e) => update("categories", e.target.value)}
                placeholder="Branding, Diseño"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ width: "100%", padding: "0.7rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit" }}
            >
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear nota"}
            </button>
            {msg && <p style={{ fontSize: "0.8rem", marginTop: "0.75rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32" }}>{msg}</p>}
          </div>

          {/* Cover image */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem" }}>Imagen de portada</h3>
            {data.coverImage && (
              <div style={{ aspectRatio: "16/9", position: "relative", marginBottom: "0.75rem", borderRadius: "4px", overflow: "hidden" }}>
                <Image src={data.coverImage} alt="Cover" fill style={{ objectFit: "cover" }} />
              </div>
            )}
            <input
              style={{ ...inputStyle, fontSize: "0.78rem", marginBottom: "0.5rem" }}
              type="text"
              value={data.coverImage}
              onChange={(e) => update("coverImage", e.target.value)}
              placeholder="URL de imagen"
            />
            <label style={{ display: "block", padding: "0.5rem 0.75rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
              {uploadingCover ? "Subiendo…" : "Subir imagen"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
            </label>
          </div>

          {/* Delete */}
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ width: "100%", padding: "0.65rem", background: "transparent", color: "#c62828", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              {deleting ? "Eliminando…" : "Eliminar nota"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
