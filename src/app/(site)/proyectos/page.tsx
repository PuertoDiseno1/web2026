export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import ProjectsGrid from "@/components/site/ProjectsGrid";

async function getProjects() {
  try {
    return await prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  } catch { return []; }
}

export const metadata = {
  title: "Proyectos | Puerto Diseño",
  description: "Más de 70 marcas creadas. Conoce nuestro portafolio de proyectos de branding, estrategia y diseño industrial.",
};

export default async function ProyectosPage() {
  const projects = await getProjects();
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <ProjectsGrid projects={projects} />
    </div>
  );
}
