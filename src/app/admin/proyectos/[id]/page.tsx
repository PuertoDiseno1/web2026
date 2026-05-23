export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/admin/ProjectForm";

async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

export default async function EditarProyecto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/proyectos" style={{ fontSize: "0.85rem", color: "#666" }}>← Proyectos</Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Editar: {project.title}</h1>
      </div>
      <ProjectForm
        project={{
          ...project,
          videoEmbed: project.videoEmbed ?? "",
          coverImage: project.coverImage ?? "",
          homeImage: project.homeImage ?? "",
          coverVideo: project.coverVideo ?? undefined,
        }}
      />
    </>
  );
}
