"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SERVICES = [
  { id: "estrategia", label: "Estrategia de marca" },
  { id: "branding", label: "Branding" },
  { id: "industrial", label: "Diseño Industrial" },
];

const R2 = "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev";
const DEFAULT_IMAGES: Record<string, [string, string, string]> = {
  estrategia: [`${R2}/servicios/Estrategia/img1.jpg`, `${R2}/servicios/Estrategia/img2.jpg`, `${R2}/servicios/Estrategia/img3.jpg`],
  branding: [`${R2}/servicios/Grafico/img1.jpg`, `${R2}/servicios/Grafico/img2.jpg`, `${R2}/servicios/Grafico/img3.jpg`],
  industrial: [`${R2}/servicios/Industrial/img1.jpg`, `${R2}/servicios/Industrial/img2.jpg`, `${R2}/servicios/Industrial/img3.jpg`],
};

const DEFAULT_TEXT: Record<string, { title: string; desc: string; items: string }> = {
  estrategia: {
    title: "Estrategia\nde marca",
    desc: "Construimos marcos estratégicos claros que orientan decisiones y aseguran coherencia en el tiempo. Analizamos contexto, negocio y competencia para establecer posicionamiento, propuesta de valor y lineamientos de marca.",
    items: "Arquitectura de Marca\nConsultoría de marca\nNaming\nPosicionamiento y propuesta de valor\nWorkshop\nEstrategia de diseño",
  },
  branding: {
    title: "Branding",
    desc: "Convertimos la estrategia en sistemas de identidad visual y verbal claros, consistentes y diferenciadores. Diseñamos marcas que se reconocen, se entienden y se recuerdan.",
    items: "Identidad visual\nDiseño para comunicaciones\nDiseño editorial\nDiseño digital\nPackaging\nBrandbook",
  },
  industrial: {
    title: "Diseño\nindustrial",
    desc: "Entendemos el diseño de espacios y señalética como motor de experiencia y negocio. A través de procesos estructurados, convertimos la estrategia en espacios coherentes, funcionales y centrados en el usuario, asegurando consistencia, viabilidad y una experiencia integral.",
    items: "Environmental Design\nInstalaciones efímeras\nStand\nImplementaciones\nSistema de Señalética\nArquitectura interior",
  },
};

type ServiceText = { title: string; desc: string; items: string };

type ContentState = {
  heroImage: string;
  estrategiaImages: [string, string, string];
  brandingImages: [string, string, string];
  industrialImages: [string, string, string];
  estrategiaText: ServiceText;
  brandingText: ServiceText;
  industrialText: ServiceText;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "#333",
};

export default function ServiciosAdmin() {
  const [content, setContent] = useState<ContentState>({
    heroImage: "/servicios/Banner_AdobeStock_436930998.jpeg",
    estrategiaImages: DEFAULT_IMAGES.estrategia,
    brandingImages: DEFAULT_IMAGES.branding,
    industrialImages: DEFAULT_IMAGES.industrial,
    estrategiaText: DEFAULT_TEXT.estrategia,
    brandingText: DEFAULT_TEXT.branding,
    industrialText: DEFAULT_TEXT.industrial,
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/page-content/servicios")
      .then((r) => r.json())
      .then((d) => {
        setContent((prev) => ({
          heroImage: d.heroImage || prev.heroImage,
          estrategiaImages: d.estrategiaImages || prev.estrategiaImages,
          brandingImages: d.brandingImages || prev.brandingImages,
          industrialImages: d.industrialImages || prev.industrialImages,
          estrategiaText: d.estrategiaText || prev.estrategiaText,
          brandingText: d.brandingText || prev.brandingText,
          industrialText: d.industrialText || prev.industrialText,
        }));
      });
  }, []);

  async function uploadFile(file: File, key: string) {
    setUploading(key);
    setMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      setUploading(null);
      if (!json.url) setMsg(`Error al subir: ${json.error ?? "respuesta inesperada"}`);
      return json.url as string | undefined;
    } catch {
      setUploading(null);
      setMsg("Error de red al subir el archivo.");
      return undefined;
    }
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const url = await uploadFile(file, "hero");
    if (url) {
      setContent((prev) => {
        const updated = { ...prev, heroImage: url };
        saveContent(updated);
        return updated;
      });
    }
  }

  async function handleServiceImageUpload(
    serviceId: string,
    idx: 0 | 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const key = `${serviceId}_${idx}`;
    const url = await uploadFile(file, key);
    if (!url) return;
    const field = `${serviceId}Images` as keyof ContentState;
    setContent((prev) => {
      const imgs = [...(prev[field] as [string, string, string])] as [string, string, string];
      imgs[idx] = url;
      const updated = { ...prev, [field]: imgs };
      saveContent(updated);
      return updated;
    });
  }

  function updateText(serviceId: string, key: keyof ServiceText, value: string) {
    const field = `${serviceId}Text` as keyof ContentState;
    setContent((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as ServiceText), [key]: value },
    }));
  }

  async function saveContent(updated: ContentState) {
    const res = await fetch("/api/page-content/servicios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) setMsg("Error al guardar.");
    return res.ok;
  }

  async function handleSave() {
    setSaving(true);
    setMsg("");
    const ok = await saveContent(content);
    setMsg(ok ? "Guardado correctamente." : "Error al guardar.");
    setSaving(false);
  }

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Página Servicios</h1>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
          Edita el hero, textos e imágenes de cada servicio
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 900 }}>

        {/* HERO */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", padding: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Imagen Hero</h2>
          {content.heroImage && (
            <div style={{ position: "relative", aspectRatio: "16/6", marginBottom: "1rem", borderRadius: "4px", overflow: "hidden", background: "#f0f0f0" }}>
              <Image src={content.heroImage} alt="Hero servicios" fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>URL</label>
            <input
              style={inputStyle}
              value={content.heroImage}
              onChange={(e) => setContent((prev) => ({ ...prev, heroImage: e.target.value }))}
              placeholder="/servicios/..."
            />
          </div>
          <label style={{ display: "block", padding: "0.6rem 1rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.85rem", color: "#666" }}>
            {uploading === "hero" ? "Subiendo…" : "Subir imagen desde tu equipo"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleHeroUpload} />
          </label>
        </div>

        {/* SERVICES */}
        {SERVICES.map((sv) => {
          const imgField = `${sv.id}Images` as keyof ContentState;
          const imgs = content[imgField] as [string, string, string];
          const txt = content[`${sv.id}Text` as keyof ContentState] as ServiceText;

          return (
            <div key={sv.id} style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", padding: "2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem", borderLeft: "3px solid #1442f0", paddingLeft: "0.75rem" }}>
                {sv.label}
              </h2>

              {/* Text fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>Título (usa \n para salto de línea)</label>
                  <input
                    style={inputStyle}
                    value={txt.title}
                    onChange={(e) => updateText(sv.id, "title", e.target.value)}
                    placeholder="Título del servicio"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Items (uno por línea)</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
                    value={txt.items}
                    onChange={(e) => updateText(sv.id, "items", e.target.value)}
                    placeholder="Item 1&#10;Item 2&#10;Item 3"
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                  value={txt.desc}
                  onChange={(e) => updateText(sv.id, "desc", e.target.value)}
                />
              </div>

              {/* Image fields */}
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#333", marginBottom: "0.75rem" }}>Imágenes del slider</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                {([0, 1, 2] as const).map((idx) => (
                  <div key={idx}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.5rem" }}>
                      Imagen {idx + 1}
                    </p>
                    {imgs[idx] && (
                      <div style={{ position: "relative", aspectRatio: "4/3", marginBottom: "0.5rem", borderRadius: "4px", overflow: "hidden", background: "#f0f0f0" }}>
                        <Image src={imgs[idx]} alt={`${sv.label} ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                      </div>
                    )}
                    <input
                      style={{ ...inputStyle, marginBottom: "0.4rem" }}
                      value={imgs[idx]}
                      onChange={(e) => {
                        setContent((prev) => {
                          const arr = [...(prev[imgField] as [string, string, string])] as [string, string, string];
                          arr[idx] = e.target.value;
                          return { ...prev, [imgField]: arr };
                        });
                      }}
                      placeholder="/servicios/..."
                    />
                    <label style={{ display: "block", padding: "0.4rem 0.75rem", border: "1px dashed #ccc", borderRadius: "4px", textAlign: "center", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
                      {uploading === `${sv.id}_${idx}` ? "Subiendo…" : "Subir"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleServiceImageUpload(sv.id, idx, e)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* SAVE */}
        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 2rem",
              background: "#0a0a0a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Guardando…" : "Guardar todos los cambios"}
          </button>
          {msg && (
            <p style={{ fontSize: "0.8rem", marginTop: "0.75rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32" }}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

