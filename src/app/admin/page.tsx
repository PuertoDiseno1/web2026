export const dynamic = 'force-dynamic';
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [projects, team, clients] = await Promise.all([
    prisma.project.count(),
    prisma.teamMember.count(),
    prisma.client.count(),
  ]);
  return { projects, team, clients };
}

const cards = [
  { href: "/admin/proyectos", label: "Proyectos", desc: "Gestiona el portafolio de proyectos", color: "#c8f25a" },
  { href: "/admin/equipo", label: "Equipo", desc: "Administra los miembros del equipo", color: "#f2e25a" },
  { href: "/admin/hero", label: "Hero Slides", desc: "Modifica el slider hero de cada página", color: "#5af2c8" },
  { href: "/admin/configuracion", label: "Configuración", desc: "Ajustes generales del sitio", color: "#f25a8e" },
];

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#666" }}>Bienvenido al panel de administración de Puerto Diseño.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        {[
          { label: "Proyectos", value: stats.projects },
          { label: "Miembros del equipo", value: stats.team },
          { label: "Clientes", value: stats.clients },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <p style={{ fontSize: "2rem", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em" }}>{s.value}</p>
            <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#444" }}>Acciones rápidas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            style={{
              display: "block",
              background: "#fff",
              padding: "1.75rem",
              borderRadius: "8px",
              border: "1px solid #e8e8e8",
              transition: "box-shadow 0.2s",
            }}
            className="admin-card"
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "#0a0a0a" }}>{c.label}</h3>
            <p style={{ fontSize: "0.8rem", color: "#888" }}>{c.desc}</p>
          </Link>
        ))}
      </div>

      <style>{`.admin-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }`}</style>
    </>
  );
}
