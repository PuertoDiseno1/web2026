"use client";
import { useState } from "react";

interface Slide {
  id: string;
  page: string;
  order: number;
  title: string | null;
  subtitle: string | null;
  image: string | null;
  video: string | null;
  cta: string | null;
  ctaLink: string | null;
  published: boolean;
}

const PAGES = ["home", "nosotros", "servicios", "proyectos"];

export default function HeroManager({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  const empty: Omit<Slide, "id"> = {
    page: activeTab, order: 0, title: "", subtitle: "", image: "", video: "", cta: "", ctaLink: "", published: true,
  };

  function startEdit(s: Slide | null) {
    setEditing(s ?? ({ id: "new", ...empty, page: activeTab } as Slide));
    setMsg("");
  }

  async function saveSlide() {
    if (!editing) return;
    setSaving(true);
    setMsg("");

    const isNew = editing.id === "new";
    const res = await fetch(isNew ? "/api/hero" : `/api/hero/${editing.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    if (res.ok) {
      const updated = await res.json();
      if (isNew) setSlides([...slides, updated]);
      else setSlides(slides.map((s) => (s.id === updated.id ? updated : s)));
      setMsg("Guardado.");
      setTimeout(() => { setEditing(null); setMsg(""); }, 800);
    } else {
      setMsg("Error al guardar.");
    }
    setSaving(false);
  }

  async function deleteSlide(id: string) {
    if (!confirm("¿Eliminar este slide?")) return;
    const res = await fetch(`/api/hero/${id}`, { method: "DELETE" });
    if (res.ok) setSlides(slides.filter((s) => s.id !== id));
  }

  const pageSlides = slides.filter((s) => s.page === activeTab);
  const inputStyle = { width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit", color: "#111" };

  return (
    <div>
      {/* Page tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => { setActiveTab(p); setEditing(null); }}
            style={{
              padding: "0.5rem 1.25rem",
              border: "1px solid",
              borderColor: activeTab === p ? "#0a0a0a" : "#e0e0e0",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: activeTab === p ? 700 : 400,
              background: activeTab === p ? "#0a0a0a" : "transparent",
              color: activeTab === p ? "#fff" : "#555",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 380px" : "1fr", gap: "2rem", alignItems: "start" }}>
        {/* List */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700 }}>Slides en "{activeTab}"</h2>
            <button
              onClick={() => startEdit(null)}
              style={{ padding: "0.5rem 1rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              + Agregar slide
            </button>
          </div>
          {pageSlides.length === 0 && (
            <p style={{ padding: "2rem 1.5rem", color: "#999", fontSize: "0.875rem" }}>No hay slides para esta página. Agrega uno.</p>
          )}
          {pageSlides.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.title || "(Sin título)"}</p>
                {s.subtitle && <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.15rem" }}>{s.subtitle.slice(0, 60)}...</p>}
              </div>
              <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: s.published ? "#e8f5e9" : "#fce4ec", color: s.published ? "#2e7d32" : "#c62828" }}>
                {s.published ? "Visible" : "Oculto"}
              </span>
              <button onClick={() => startEdit(s)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #e0e0e0", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit", background: "transparent" }}>Editar</button>
              <button onClick={() => deleteSlide(s.id)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #ffcdd2", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit", background: "transparent", color: "#c62828" }}>×</button>
            </div>
          ))}
        </div>

        {/* Edit panel */}
        {editing && (
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8", position: "sticky", top: "2rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {editing.id === "new" ? "Nuevo slide" : "Editar slide"}
            </h3>

            {[
              { key: "title", label: "Título" },
              { key: "subtitle", label: "Subtítulo" },
              { key: "image", label: "Imagen URL" },
              { key: "video", label: "Video URL" },
              { key: "cta", label: "Texto del botón CTA" },
              { key: "ctaLink", label: "Link del CTA" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.4rem" }}>{label}</label>
                <input
                  style={inputStyle}
                  value={((editing as unknown) as Record<string, string>)[key] ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                />
              </div>
            ))}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.4rem" }}>Orden</label>
              <input type="number" style={inputStyle} value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
              <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              Visible
            </label>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={saveSlide} disabled={saving} style={{ flex: 1, padding: "0.7rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => { setEditing(null); setMsg(""); }} style={{ padding: "0.7rem 1rem", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit", background: "transparent" }}>
                Cancelar
              </button>
            </div>

            {msg && <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32", textAlign: "center" }}>{msg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
