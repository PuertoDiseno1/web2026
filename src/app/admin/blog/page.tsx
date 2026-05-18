export const dynamic = 'force-dynamic';
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminBlog() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Blog</h1>
          <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>{posts.length} notas</p>
        </div>
        <Link
          href="/admin/blog/nuevo"
          style={{
            padding: "0.7rem 1.5rem",
            background: "#0a0a0a",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          + Nueva nota
        </Link>
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", overflow: "hidden" }}>
        {posts.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#aaa", fontSize: "0.875rem" }}>
            No hay notas aún. Haz clic en &ldquo;+ Nueva nota&rdquo; para crear la primera.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e8e8e8", background: "#f9f9f9" }}>
                <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Título</th>
                <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Categoría</th>
                <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Fecha</th>
                <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>Estado</th>
                <th style={{ padding: "0.75rem 1.25rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < posts.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0a0a0a" }}>{p.title}</p>
                    {p.excerpt && <p style={{ fontSize: "0.78rem", color: "#999", marginTop: "0.15rem" }}>{p.excerpt.slice(0, 60)}{p.excerpt.length > 60 ? "…" : ""}</p>}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    {p.categories ? (
                      <span style={{ fontSize: "0.75rem", color: "#555", background: "#f0f0f0", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>
                        {p.categories.split(",")[0].trim()}
                      </span>
                    ) : <span style={{ color: "#ccc", fontSize: "0.75rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.8rem", color: "#888" }}>
                    {new Date(p.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
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
                      {p.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <Link
                      href={`/admin/blog/${p.id}`}
                      style={{ fontSize: "0.8rem", color: "#0a0a0a", padding: "0.4rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontWeight: 600 }}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
