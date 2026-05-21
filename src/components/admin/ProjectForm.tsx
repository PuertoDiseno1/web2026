"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MuxVideo from "@/components/site/MuxVideo";

interface Project {
  id?: string;
  order: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  services: string;
  categories: string;
  videoEmbed: string;
  coverImage: string;
  coverVideo: string;
  images: string;
  featured: boolean;
  published: boolean;
}

const defaultProject: Project = {
  order: 0, slug: "", title: "", subtitle: "", description: "",
  services: "", categories: "", videoEmbed: "", coverImage: "", coverVideo: "", images: "[]",
  featured: false, published: true,
};

export default function ProjectForm({ project }: { project?: Partial<Project> }) {
  const router = useRouter();
  const [data, setData] = useState<Project>({ ...defaultProject, ...project });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const isEdit = !!project?.id;

  function update(key: keyof Project, value: unknown) {
    setData((d) => ({ ...d, [key]: value }));
    if (key === "title" && !isEdit) {
      const slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setData((d) => ({ ...d, slug }));
    }
  }

  async function uploadFile(file: File, onDone: (url: string) => void) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json.url) onDone(json.url);
  }

  function syncCoverToImages(url: string) {
    setData((d) => {
      const imgs = JSON.parse(d.images || "[]") as string[];
      // Replace first image (portada) with the new cover, keep the rest
      const updated = url ? [url, ...imgs.filter((_, i) => i > 0)] : imgs;
      return { ...d, coverImage: url, images: JSON.stringify(updated) };
    });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    await uploadFile(file, (url) => { syncCoverToImages(url); setUploadingCover(false); });
  }

  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImages(true);
    const current = JSON.parse(data.images || "[]") as string[];
    const urls: string[] = [...current];
    for (const file of files) {
      await uploadFile(file, (url) => urls.push(url));
    }
    update("images", JSON.stringify(urls));
    setUploadingImages(false);
  }

  function removeImage(index: number) {
    const imgs = JSON.parse(data.images || "[]") as string[];
    imgs.splice(index, 1);
    update("images", JSON.stringify(imgs));
  }

  function moveImage(from: number, to: number) {
    const imgs = JSON.parse(data.images || "[]") as string[];
    const [item] = imgs.splice(from, 1);
    imgs.splice(to, 0, item);
    update("images", JSON.stringify(imgs));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/projects/${project!.id}` : "/api/projects";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setMsg("Guardado correctamente.");
      if (!isEdit) router.push("/admin/proyectos");
    } else {
      setMsg("Error al guardar.");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const res = await fetch(`/api/projects/${project!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/proyectos");
    } else {
      setMsg("Error al eliminar.");
      setDeleting(false);
    }
  }

  const images = JSON.parse(data.images || "[]") as string[];

  const inputStyle = {
    width: "100%", padding: "0.65rem 0.9rem", border: "1px solid #e0e0e0",
    borderRadius: "6px", fontSize: "0.875rem", outline: "none",
    fontFamily: "inherit", color: "#111", background: "#fff",
  };
  const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: "0.4rem" };
  const fieldStyle = { marginBottom: "1.25rem" };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
        {/* Main */}
        <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Título *</label>
              <input style={inputStyle} value={data.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Slug *</label>
              <input style={inputStyle} value={data.slug} onChange={(e) => update("slug", e.target.value)} required />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Subtítulo</label>
            <input style={inputStyle} value={data.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Descripción (separar párrafos con línea en blanco)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 200, resize: "vertical", lineHeight: 1.6 }}
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Servicios (uno por línea)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                value={data.services}
                onChange={(e) => update("services", e.target.value)}
                placeholder="Branding&#10;Estrategia de Marca"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Categorías (una por línea)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                value={data.categories}
                onChange={(e) => update("categories", e.target.value)}
                placeholder="Branding&#10;Diseño industrial"
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>URL de video (hero del proyecto)</label>
            <input
              style={inputStyle}
              type="url"
              value={data.videoEmbed}
              onChange={(e) => update("videoEmbed", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
            />
            <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.35rem" }}>Pega la URL del video. Se mostrará como hero en la parte superior del proyecto.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Publish settings */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", color: "#0a0a0a" }}>Publicación</h3>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={data.published} onChange={(e) => update("published", e.target.checked)} />
                Publicado
              </label>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                <input type="checkbox" checked={data.featured} onChange={(e) => update("featured", e.target.checked)} />
                Destacado
              </label>
            </div>
            <div>
              <label style={labelStyle}>Orden</label>
              <input
                type="number"
                style={inputStyle}
                value={data.order}
                onChange={(e) => update("order", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Cover image */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", color: "#0a0a0a" }}>Imagen portada</h3>
            {data.coverImage && (
              <div style={{ aspectRatio: "4/3", position: "relative", marginBottom: "0.75rem", borderRadius: "4px", overflow: "hidden" }}>
                {data.coverImage.toLowerCase().endsWith(".gif") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Image src={data.coverImage} alt="Cover" fill style={{ objectFit: "cover" }} />
                )}
              </div>
            )}
            <input
              style={{ fontSize: "0.8rem", width: "100%", padding: "0.4rem 0.6rem", border: "1px solid #e0e0e0", borderRadius: "4px", marginBottom: "0.25rem" }}
              type="text"
              value={data.coverImage}
              onChange={(e) => syncCoverToImages(e.target.value)}
              placeholder="URL de imagen o GIF"
            />
            <label style={{ display: "block", marginTop: "0.5rem", padding: "0.5rem 0.75rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
              {uploadingCover ? "Subiendo..." : "Subir imagen / GIF"}
              <input type="file" accept="image/*,.gif" style={{ display: "none" }} onChange={handleCoverUpload} />
            </label>
          </div>

          {/* Cover video */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0a0a0a" }}>Portada de video</h3>
            <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.75rem" }}>Pega el Playback ID de Mux. Tiene prioridad sobre la imagen.</p>
            {data.coverVideo && (() => {
              const muxMatch = data.coverVideo.match(/player\.mux\.com\/([^?#/]+)/);
              const muxId = muxMatch ? muxMatch[1] : data.coverVideo.trim();
              return (
                <div style={{ aspectRatio: "4/3", borderRadius: "4px", overflow: "hidden", marginBottom: "0.75rem", position: "relative" }}>
                  <MuxVideo playbackId={muxId} />
                </div>
              );
            })()}
            <input
              style={{ fontSize: "0.8rem", width: "100%", padding: "0.4rem 0.6rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}
              type="text"
              value={data.coverVideo}
              onChange={(e) => update("coverVideo", e.target.value.trim())}
              placeholder="ej: abc123xyz (Playback ID de Mux)"
            />
          </div>

          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0a0a0a" }}>Galería de imágenes</h3>
            <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.75rem" }}>Arrastra para reordenar. La primera imagen es la portada.</p>
            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {images.map((img, i) => (
                  <div
                    key={img + i}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                    onDrop={(e) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== i) moveImage(dragIndex, i); setDragIndex(null); setDragOverIndex(null); }}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                    style={{
                      position: "relative",
                      cursor: "grab",
                      opacity: dragIndex === i ? 0.4 : 1,
                      outline: dragOverIndex === i && dragIndex !== i ? "2px solid #0042e1" : "none",
                      borderRadius: "4px",
                      transition: "opacity 0.15s",
                    }}
                  >
                    <div style={{ aspectRatio: "1", position: "relative", borderRadius: "4px", overflow: "hidden" }}>
                      <Image src={img} alt={`img-${i}`} fill style={{ objectFit: "cover" }} />
                    </div>
                    {i === 0 && (
                      <span style={{ position: "absolute", bottom: 4, left: 4, background: "#0042e1", color: "#fff", fontSize: "0.55rem", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", letterSpacing: "0.03em" }}>PORTADA</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: "block", padding: "0.5rem 0.75rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
              {uploadingImages ? "Subiendo..." : "Agregar imágenes"}
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImagesUpload} />
            </label>
          </div>

          {/* Actions */}
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "0.85rem", background: saving ? "#ccc" : "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear proyecto"}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: "0.85rem", background: deleting ? "#fce4ec" : "transparent", color: "#c62828", border: "1px solid #ffcdd2", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              {deleting ? "Eliminando..." : "Eliminar proyecto"}
            </button>
          )}

          {msg && (
            <p style={{ fontSize: "0.85rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32", padding: "0.75rem", background: msg.includes("Error") ? "#fff0f0" : "#e8f5e9", borderRadius: "4px", textAlign: "center" }}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
