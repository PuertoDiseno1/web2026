"use client";
import { useState } from "react";

const fields = [
  { key: "hero_video", label: "Video hero HOME (URL Mux — ej: https://player.mux.com/XXXXX)", type: "full" },
  { key: "hero_title", label: "Frase hero (HOME)", type: "textarea" },
  { key: "stats_brands", label: "Estadística: marcas (+70)", type: "text" },
  { key: "stats_years", label: "Estadística: años (+25)", type: "text" },
  { key: "stats_sqm", label: "Estadística: m² (+900.000)", type: "text" },
  { key: "address", label: "Dirección", type: "text" },
  { key: "email", label: "Email de contacto", type: "email" },
  { key: "linkedin", label: "LinkedIn URL", type: "url" },
  { key: "instagram", label: "Instagram URL", type: "url" },
  { key: "whatsapp", label: "WhatsApp (número con código de país)", type: "text" },
];

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      setMsg("Configuración guardada correctamente.");
    } else {
      setMsg("Error al guardar.");
    }
    setSaving(false);
  }

  const inputStyle = { width: "100%", padding: "0.65rem 0.9rem", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit", color: "#111" };

  return (
    <form onSubmit={handleSave} style={{ background: "#fff", padding: "2rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Configuración general</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {fields.map(({ key, label, type }) => (
          <div key={key} style={{ gridColumn: type === "textarea" || type === "full" ? "1 / -1" : "auto" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: "0.4rem" }}>{label}</label>
            {type === "textarea" ? (
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                value={settings[key] ?? ""}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
            ) : (
              <input
                type="text"
                style={inputStyle}
                value={settings[key] ?? ""}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "0.75rem 1.75rem", background: saving ? "#ccc" : "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
        {msg && <p style={{ fontSize: "0.85rem", color: msg.includes("Error") ? "#c62828" : "#2e7d32" }}>{msg}</p>}
      </div>
    </form>
  );
}
