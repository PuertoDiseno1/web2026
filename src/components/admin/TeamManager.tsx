"use client";
import { useState } from "react";
import Image from "next/image";

interface Member {
  id: string;
  order: number;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  published: boolean;
}

export default function TeamManager({ initialTeam }: { initialTeam: Member[] }) {
  const [team, setTeam] = useState<Member[]>(initialTeam);
  const [editing, setEditing] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const emptyMember: Omit<Member, "id"> = {
    order: team.length + 1, name: "", role: "", bio: "", photo: "", linkedin: "", published: true,
  };

  function startEdit(m: Member | null) {
    setEditing(m ?? ({ id: "new", ...emptyMember } as Member));
    setMsg("");
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json.url && editing) setEditing({ ...editing, photo: json.url });
    setUploading(false);
  }

  async function saveMember() {
    if (!editing) return;
    setSaving(true);
    setMsg("");

    const isNew = editing.id === "new";
    const url = isNew ? "/api/team" : `/api/team/${editing.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    if (res.ok) {
      const updated = await res.json();
      if (isNew) {
        setTeam([...team, updated]);
      } else {
        setTeam(team.map((m) => (m.id === updated.id ? updated : m)));
      }
      setMsg("Guardado.");
      setTimeout(() => { setEditing(null); setMsg(""); }, 800);
    } else {
      setMsg("Error al guardar.");
    }
    setSaving(false);
  }

  async function deleteMember(id: string) {
    if (!confirm("¿Eliminar este miembro del equipo?")) return;
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
    if (res.ok) setTeam(team.filter((m) => m.id !== id));
  }

  const inputStyle = { width: "100%", padding: "0.6rem 0.85rem", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit", color: "#111" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 380px" : "1fr", gap: "2rem", alignItems: "start" }}>
      {/* List */}
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 700 }}>Miembros</h2>
          <button
            onClick={() => startEdit(null)}
            style={{ padding: "0.5rem 1rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            + Agregar
          </button>
        </div>
        {team.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "#f0f0f0", position: "relative", flexShrink: 0 }}>
              {m.photo ? (
                <Image src={m.photo} alt={m.name} fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", color: "#bbb" }}>
                  {m.name[0]}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.name}</p>
              <p style={{ fontSize: "0.8rem", color: "#888" }}>{m.role}</p>
            </div>
            <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: m.published ? "#e8f5e9" : "#fce4ec", color: m.published ? "#2e7d32" : "#c62828" }}>
              {m.published ? "Visible" : "Oculto"}
            </span>
            <button
              onClick={() => startEdit(m)}
              style={{ padding: "0.4rem 0.75rem", border: "1px solid #e0e0e0", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit", background: "transparent" }}
            >
              Editar
            </button>
            <button
              onClick={() => deleteMember(m.id)}
              style={{ padding: "0.4rem 0.75rem", border: "1px solid #ffcdd2", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit", background: "transparent", color: "#c62828" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Edit panel */}
      {editing && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8", position: "sticky", top: "2rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            {editing.id === "new" ? "Nuevo miembro" : `Editar: ${editing.name}`}
          </h3>

          {/* Photo */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.4rem" }}>Foto</label>
            {editing.photo && (
              <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", position: "relative", marginBottom: "0.5rem" }}>
                <Image src={editing.photo} alt="foto" fill style={{ objectFit: "cover" }} />
              </div>
            )}
            <label style={{ display: "block", padding: "0.5rem 0.75rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
              {uploading ? "Subiendo..." : "Subir foto"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
            </label>
            <input style={{ ...inputStyle, marginTop: "0.5rem" }} value={editing.photo ?? ""} onChange={(e) => setEditing({ ...editing, photo: e.target.value })} placeholder="O pega URL de imagen" />
          </div>

          {[
            { key: "name", label: "Nombre", type: "text" },
            { key: "role", label: "Cargo", type: "text" },
            { key: "linkedin", label: "LinkedIn URL", type: "url" },
          ].map(({ key, label, type }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.4rem" }}>{label}</label>
              <input
                type={type}
                style={inputStyle}
                value={((editing as unknown) as Record<string, string>)[key] ?? ""}
                onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
              />
            </div>
          ))}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.4rem" }}>Bio (opcional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={editing.bio ?? ""}
              onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.4rem" }}>Orden</label>
            <input type="number" style={inputStyle} value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Visible en el sitio
          </label>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={saveMember}
              disabled={saving}
              style={{ flex: 1, padding: "0.7rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => { setEditing(null); setMsg(""); }}
              style={{ padding: "0.7rem 1rem", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit", background: "transparent" }}
            >
              Cancelar
            </button>
          </div>

          {msg && <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32", textAlign: "center" }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}
