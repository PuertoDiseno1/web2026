"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function NosotrosAdmin() {
  const [heroImage, setHeroImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/page-content/nosotros")
      .then((r) => r.json())
      .then((d) => { if (d.heroImage) setHeroImage(d.heroImage); });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json.url) setHeroImage(json.url);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/page-content/nosotros", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroImage }),
    });
    setMsg(res.ok ? "Guardado correctamente." : "Error al guardar.");
    setSaving(false);
  }

  const inputStyle = {
    width: "100%", padding: "0.65rem 0.9rem", border: "1px solid #e0e0e0",
    borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit",
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Página Nosotros</h1>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>Edita el hero de la página Nosotros</p>
      </div>

      <div style={{ maxWidth: 640, background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", padding: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Imagen de fondo del hero</h2>

        {heroImage && (
          <div style={{ position: "relative", aspectRatio: "16/6", marginBottom: "1rem", borderRadius: "4px", overflow: "hidden", background: "#f0f0f0" }}>
            <Image src={heroImage} alt="Hero nosotros" fill style={{ objectFit: "cover" }} />
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: "0.4rem" }}>URL de imagen</label>
          <input style={inputStyle} value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://... o /uploads/..." />
        </div>

        <label style={{ display: "block", padding: "0.6rem 1rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.85rem", color: "#666", marginBottom: "1.5rem" }}>
          {uploading ? "Subiendo…" : "Subir imagen desde tu equipo"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "0.7rem 1.5rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit" }}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {msg && <p style={{ fontSize: "0.8rem", marginTop: "0.75rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32" }}>{msg}</p>}
      </div>
    </>
  );
}
