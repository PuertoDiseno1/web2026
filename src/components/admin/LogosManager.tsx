"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function LogosManager({ initialLogos }: { initialLogos: string[] }) {
  const [logos, setLogos] = useState(initialLogos);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/clients/logos", { method: "POST", body: form });
      if (res.ok) {
        const { filename } = await res.json();
        setLogos((prev) => [...prev, filename]);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(filename: string) {
    if (!confirm(`¿Eliminar ${filename}?`)) return;
    setDeleting(filename);
    await fetch("/api/clients/logos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    setLogos((prev) => prev.filter((f) => f !== filename));
    setDeleting(null);
  }

  return (
    <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>Logos de clientes</h2>
          <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.2rem" }}>{logos.length} logos</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: "0.6rem 1.25rem",
            background: "#0a0a0a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: uploading ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {uploading ? "Subiendo…" : "+ Agregar logos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </div>

      {logos.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "#aaa",
            fontSize: "0.875rem",
            background: "#fafafa",
            borderRadius: "6px",
            border: "2px dashed #e8e8e8",
          }}
        >
          No hay logos aún. Haz clic en &ldquo;+ Agregar logos&rdquo; para subir.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          {logos.map((filename) => (
            <div
              key={filename}
              style={{
                position: "relative",
                background: "#f9f9f9",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                overflow: "hidden",
                aspectRatio: "3/2",
              }}
            >
              <Image
                src={`/clientes/${filename}`}
                alt={filename}
                fill
                style={{ objectFit: "contain", padding: "12px" }}
                sizes="160px"
              />
              <button
                onClick={() => handleDelete(filename)}
                disabled={deleting === filename}
                title="Eliminar"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 22,
                  height: 22,
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit",
                }}
              >
                ×
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.55)",
                  padding: "0.2rem 0.4rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.8)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
