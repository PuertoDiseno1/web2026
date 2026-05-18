"use client";
import { useState } from "react";

interface Client {
  id: string;
  order: number;
  name: string;
  logo: string | null;
  published: boolean;
}

export default function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  async function addClient() {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, order: clients.length + 1 }),
    });
    if (res.ok) {
      const c = await res.json();
      setClients([...clients, c]);
      setNewName("");
    }
    setSaving(false);
  }

  async function removeClient(id: string) {
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients(clients.filter((c) => c.id !== id));
  }

  async function toggleClient(c: Client) {
    const res = await fetch(`/api/clients/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, published: !c.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setClients(clients.map((cl) => (cl.id === updated.id ? updated : cl)));
    }
  }

  return (
    <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Clientes</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {clients.map((c) => (
          <span
            key={c.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              background: c.published ? "#f0f0f0" : "#fce4ec",
              color: c.published ? "#333" : "#c62828",
              cursor: "pointer",
              border: "1px solid transparent",
            }}
            onClick={() => toggleClient(c)}
            title="Clic para mostrar/ocultar"
          >
            {c.name}
            <button
              onClick={(e) => { e.stopPropagation(); removeClient(c.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "0.8rem", padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addClient(); } }}
          placeholder="Nombre del cliente"
          style={{ flex: 1, padding: "0.65rem 0.9rem", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit", color: "#111" }}
        />
        <button
          onClick={addClient}
          disabled={saving}
          style={{ padding: "0.65rem 1.25rem", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          Agregar
        </button>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.75rem" }}>Haz clic en un cliente para mostrarlo/ocultarlo del sitio.</p>
    </div>
  );
}
