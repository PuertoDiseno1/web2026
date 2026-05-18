export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getProject(slug: string) {
  try {
    return await prisma.project.findUnique({ where: { slug } });
  } catch { return null; }
}

async function getPrevNext(order: number) {
  try {
    const [prev, next] = await Promise.all([
      prisma.project.findFirst({
        where: { published: true, order: { lt: order } },
        orderBy: { order: "desc" },
        select: { slug: true, title: true },
      }),
      prisma.project.findFirst({
        where: { published: true, order: { gt: order } },
        orderBy: { order: "asc" },
        select: { slug: true, title: true },
      }),
    ]);
    return { prev, next };
  } catch { return { prev: null, next: null }; }
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({ select: { slug: true } });
    return projects.map((p) => ({ slug: p.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const p = await getProject(slug);
    if (!p) return {};
    return { title: `${p.title} | Puerto Diseño`, description: p.subtitle };
  } catch { return {}; }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { prev, next } = await getPrevNext(project.order);
  const images = JSON.parse(project.images || "[]") as string[];
  const services = project.services.split("\n").filter(Boolean);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* HERO — imagen a full ancho */}
      {project.coverImage && (
        <div style={{ width: "100%", aspectRatio: "16/7", position: "relative", overflow: "hidden" }}>
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
        </div>
      )}

      {/* INFO — título + servicios | descripción */}
      <section style={{ padding: "4rem 2.5rem 3rem" }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "5rem", alignItems: "start" }}
          className="project-info-layout"
        >
          {/* Izquierda: título + servicios */}
          <div>
            <h1
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 5rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "#1442f0",
                marginBottom: "1.75rem",
              }}
            >
              {project.title}
            </h1>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {services.map((sv) => (
                <li key={sv} style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.25rem)", color: "#1442f0", fontWeight: 500, marginBottom: "0.35rem" }}>
                  {sv}
                </li>
              ))}
            </ul>
          </div>

          {/* Derecha: subtítulo + descripción */}
          <div>
            {project.subtitle && (
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 3.5rem)",
                  fontWeight: 300,
                  color: "#1442f0",
                  letterSpacing: "-0.03em",
                  marginBottom: "1.75rem",
                  lineHeight: 1.15,
                }}
              >
                {project.subtitle}
              </h2>
            )}
            {project.description.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.125rem)", color: "#444", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      {project.videoEmbed && (
        <section style={{ padding: "0 2.5rem 3rem" }}>
          <div
            style={{ maxWidth: 1200, margin: "0 auto", borderRadius: "6px", overflow: "hidden" }}
            dangerouslySetInnerHTML={{ __html: project.videoEmbed }}
          />
        </section>
      )}

      {/* GALERÍA */}
      {images.length > 0 && (
        <section style={{ padding: "0 2.5rem 5rem" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              columnCount: 2,
              columnGap: "0.75rem",
            }}
            className="project-gallery"
          >
            {images.map((img, i) => (
              <div key={i} style={{ breakInside: "avoid", marginBottom: "0.75rem", overflow: "hidden", borderRadius: "2px" }}>
                <Image
                  src={img}
                  alt={`${project.title} ${i + 1}`}
                  width={800}
                  height={800}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  sizes="(max-width: 768px) 50vw, 600px"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NAVEGACIÓN anterior / siguiente */}
      <nav
        style={{
          borderTop: "1px solid #e8e8e8",
          padding: "2rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {prev ? (
          <Link
            href={`/proyectos/${prev.slug}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#1442f0", fontWeight: 500, textDecoration: "none" }}
          >
            <span style={{ fontSize: "1.1rem" }}>‹</span> Anterior
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/proyectos/${next.slug}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#1442f0", fontWeight: 500, textDecoration: "none" }}
          >
            Siguiente <span style={{ fontSize: "1.1rem" }}>›</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .project-info-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 550px) {
          .project-gallery { column-count: 1 !important; }
        }
      `}</style>
    </div>
  );
}
