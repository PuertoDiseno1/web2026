import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NuevoProyecto() {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/proyectos" style={{ fontSize: "0.85rem", color: "#666" }}>← Proyectos</Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Nuevo proyecto</h1>
      </div>
      <ProjectForm />
    </>
  );
}
