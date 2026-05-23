export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { encodePath } from "@/lib/images";

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

  // Extraer Mux Playback ID desde URL completa o ID directo
  function extractMuxId(val: string): string {
    const match = val.match(/player\.mux\.com\/([^?#/]+)/);
    return match ? match[1] : val.trim();
  }

  // Build video embed URL → iframe src
  function getEmbedSrc(url: string): string | null {
    if (!url) return null;
    // Mux player URL o Playback ID puro
    if (url.includes("player.mux.com") || /^[A-Za-z0-9]+$/.test(url.trim())) {
      const id = extractMuxId(url);
      return `https://player.mux.com/${id}?autoplay=true&muted=true&loop=true`;
    }
    // YouTube
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}`;
    // Vimeo
    const vi = url.match(/vimeo\.com\/(\d+)/);
    if (vi) return `https://player.vimeo.com/video/${vi[1]}?autoplay=1&muted=1&loop=1`;
    return null; // direct video URL
  }

  // Usar videoEmbed primero, luego coverVideo como fallback para el hero
  const rawVideoUrl = project.videoEmbed?.trim() || project.coverVideo?.trim() || null;
  const videoUrl = rawVideoUrl;
  const embedSrc = videoUrl ? getEmbedSrc(videoUrl) : null;
  const isMux = !!(videoUrl && (videoUrl.includes("player.mux.com") || /^[A-Za-z0-9]+$/.test(videoUrl)));
  const isDirectVideo = videoUrl && !embedSrc && !isMux;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* HERO — video tiene prioridad sobre imagen */}
      {videoUrl ? (
        <div style={{ width: "100%", aspectRatio: "16/7", position: "relative", overflow: "hidden", background: "#000" }}>
          {embedSrc ? (
            /* Mux/YouTube/Vimeo iframe — recortar ~62px abajo para ocultar controles Mux */
            <div style={{ position: "absolute", inset: 0, bottom: isMux ? "-62px" : 0, overflow: "hidden" }}>
              <iframe
                src={embedSrc}
                allow="autoplay; fullscreen; picture-in-picture; muted"
                style={{ position: "absolute", inset: 0, width: "100%", height: isMux ? "calc(100% + 62px)" : "100%", border: "none" }}
              />
            </div>
          ) : (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      ) : project.coverImage && (
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodePath(img)}
                  alt={`${project.title} ${i + 1}`}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  loading="lazy"
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
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", color: "#1442f0", fontWeight: 500, textDecoration: "none" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1442f0" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </span>
            <span style={{ display: "flex", alignItems: "center" }}>Anterior</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/proyectos/${next.slug}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", color: "#1442f0", fontWeight: 500, textDecoration: "none" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>Siguiente</span>
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1442f0" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
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
