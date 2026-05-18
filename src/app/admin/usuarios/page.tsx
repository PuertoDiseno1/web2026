"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
  color: "#111",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: "0.4rem",
  color: "#333",
};

const emptyForm = { name: "", email: "", password: "", role: "admin" };

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(user: User) {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setMsg(null);
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
    setMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const body = editId
      ? { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }
      : form;

    const res = await fetch(editId ? `/api/users/${editId}` : "/api/users", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg({ text: editId ? "Usuario actualizado." : "Usuario creado correctamente.", ok: true });
      cancelEdit();
      load();
    } else {
      setMsg({ text: data.error || "Error al guardar.", ok: false });
    }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setMsg({ text: "Usuario eliminado.", ok: true });
      load();
    } else {
      setMsg({ text: data.error || "Error al eliminar.", ok: false });
    }
  }

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Usuarios</h1>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
          Gestiona quién puede acceder al panel de administración
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}>

        {/* Users list */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e8e8e8", background: "#fafafa" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0a0a0a" }}>Usuarios activos ({users.length})</p>
          </div>
          {users.length === 0 ? (
            <p style={{ padding: "2rem", fontSize: "0.875rem", color: "#888", textAlign: "center" }}>No hay usuarios</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                  {["Nombre", "Email", "Rol", "Creado", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#555" }}>{u.email}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{
                        fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem",
                        borderRadius: "999px", background: u.role === "admin" ? "#e8f0ff" : "#f0fdf4",
                        color: u.role === "admin" ? "#1442f0" : "#15803d",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#888", fontSize: "0.8rem" }}>
                      {new Date(u.createdAt).toLocaleDateString("es-CL")}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => startEdit(u)}
                          style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", border: "1px solid #e0e0e0", borderRadius: "4px", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", border: "1px solid #ffcdd2", borderRadius: "4px", background: "#fff", color: "#c62828", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", padding: "1.5rem", position: "sticky", top: "1.5rem" }}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "1.25rem", color: "#0a0a0a" }}>
            {editId ? "Editar usuario" : "Nuevo usuario"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Nombre *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="Juan Pérez"
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                placeholder="juan@puertodiseno.cl"
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>{editId ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}</label>
              <input
                style={inputStyle}
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={!editId}
                placeholder={editId ? "••••••••" : "Mínimo 8 caracteres"}
                minLength={editId && !form.password ? undefined : 8}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Rol</label>
              <select
                style={{ ...inputStyle }}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            {msg && (
              <p style={{ fontSize: "0.8rem", marginBottom: "1rem", padding: "0.6rem 0.9rem", borderRadius: "4px", background: msg.ok ? "#e8f5e9" : "#fff0f0", color: msg.ok ? "#2e7d32" : "#c62828" }}>
                {msg.text}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, padding: "0.75rem", background: saving ? "#ccc" : "#0a0a0a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit" }}
              >
                {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear usuario"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{ padding: "0.75rem 1rem", background: "transparent", color: "#555", border: "1px solid #e0e0e0", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
