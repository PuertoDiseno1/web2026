export const dynamic = 'force-dynamic';
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

function firstImage(raw: unknown): string | null {
  if (!raw) return null;
  try { const arr = JSON.parse(raw as string); return arr[0] ?? null; } catch { return null; }
}

async function getProjects() {
  return prisma.project.findMany({ orderBy: { order: "asc" } });
}

export default async function AdminProyectos() {
  const projects = await getProjects();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Proyectos</h1>
          <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>{projects.length} proyectos en total</p>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          style={{
            padding: "0.7rem 1.5rem",
            background: "#0a0a0a",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          + Nuevo proyecto
        </Link>
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e8e8", background: "#f9f9f9" }}>
              <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Orden</th>
              <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Portada</th>
              <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Proyecto</th>
              <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Categoría</th>
              <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Estado</th>
              <th style={{ padding: "0.75rem 1.25rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", color: "#999" }}>{p.order}</td>
                <td style={{ padding: "0.75rem 1.25rem" }}>
                  {(() => {
                    const img = firstImage(p.images);
                    return img ? (
                      <div style={{ position: "relative", width: 64, height: 44, borderRadius: 4, overflow: "hidden", background: "#f0f0f0", flexShrink: 0 }}>
                        <Image src={img} alt={p.title} fill style={{ objectFit: "cover" }} sizes="64px" />
                      </div>
                    ) : (
                      <div style={{ width: 64, height: 44, borderRadius: 4, background: "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: "#c62828", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>Sin<br/>imagen</span>
                      </div>
                    );
                  })()}
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0a0a0a" }}>{p.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.15rem" }}>{p.subtitle}</p>
                  </div>
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#555", background: "#f0f0f0", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>
                    {p.categories.split("\n")[0]}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "4px",
                    background: p.published ? "#e8f5e9" : "#fce4ec",
                    color: p.published ? "#2e7d32" : "#c62828",
                    fontWeight: 600,
                  }}>
                    {p.published ? "Publicado" : "Oculto"}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <Link href={`/proyectos/${p.slug}`} target="_blank" style={{ fontSize: "0.8rem", color: "#888", padding: "0.4rem 0.75rem", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
                      Ver
                    </Link>
                    <Link href={`/admin/proyectos/${p.id}`} style={{ fontSize: "0.8rem", color: "#0a0a0a", padding: "0.4rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontWeight: 600 }}>
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
