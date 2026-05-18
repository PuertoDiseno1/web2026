"use client";
import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const errorMsg = await loginAction(email, password);
      if (errorMsg) {
        setError(errorMsg);
        setLoading(false);
      }
      // Si no hay error, el server action hace redirect automático a /admin
    } catch {
      setError("Error al conectar con el servidor.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f0",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>Puerto Diseño</h1>
          <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.5rem" }}>Panel de administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "2.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: "0.5rem" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "0.9rem",
                outline: "none",
                fontFamily: "inherit",
                color: "#111",
                transition: "border-color 0.2s",
              }}
              placeholder="admin@puertodiseno.cl"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#333", marginBottom: "0.5rem" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "0.9rem",
                outline: "none",
                fontFamily: "inherit",
                color: "#111",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ padding: "0.75rem 1rem", background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: "6px", fontSize: "0.85rem", color: "#c62828", marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: loading ? "#ccc" : "#0a0a0a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
