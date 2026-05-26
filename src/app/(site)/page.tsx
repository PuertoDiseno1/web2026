export const dynamic = 'force-dynamic';
import Link from "next/link";
import Image from "next/image";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import ClientsCarousel from "@/components/site/ClientsCarousel";
import HeroVideo from "@/components/site/HeroVideo";
import ProjectsRotator from "@/components/site/ProjectsRotator";
import StatsCounter from "@/components/site/StatsCounter";

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev";

async function getLogosFromR2(): Promise<string[]> {
  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const res = await client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET ?? "puerto1",
      Prefix: "clientes/",
    }));
    return (res.Contents ?? [])
      .map((o) => o.Key!)
      .filter((k) => /\.(png|jpg|jpeg|svg|webp)$/i.test(k))
      .map((k) => `${R2_PUBLIC_URL}/${k}`);
  } catch {
    return [];
  }
}

async function getData() {
  try {
    const [projects, settings, logos] = await Promise.all([
      prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      prisma.siteSettings.findMany(),
      getLogosFromR2(),
    ]);
    const s = Object.fromEntries(settings.map((r) => [r.key, r.value]));
    const featured = projects.find((p) => p.featured) ?? projects[0] ?? null;
    return { projects, s, logos, featured };
  } catch {
    return { projects: [], s: {} as Record<string, string>, logos: [], featured: null };
  }
}

function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default async function HomePage() {
  const { projects, s, logos, featured } = await getData();
  const featuredImages = parseImages(featured?.images as string);
  const heroVideo = s.hero_video ?? null;
  // Extract Mux playback ID from URL like https://player.mux.com/XXXXX
  const muxId = heroVideo ? heroVideo.replace(/^https?:\/\/player\.mux\.com\//, "").split("?")[0] : null;

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section
        style={{
          minHeight: "70vh",
          background: "#04081c",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Background video (Mux HLS) */}
        {muxId && <HeroVideo muxId={muxId} />}

        {/* Background image if no video */}
        {!muxId && featuredImages[0] && (
          <Image
            src={featuredImages[0]}
            alt={featured?.title ?? ""}
            fill
            priority
            style={{ objectFit: "cover", opacity: 0.45 }}
          />
        )}



        {/* Hero content — intentionally empty */}
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="sp home-services-section" style={{ background: "#fff", padding: "4rem 2.5rem 4rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1
            className="home-services-h1"
            style={{
              fontSize: "clamp(1.5rem, 3.2vw, 3rem)",
              fontWeight: 400,
              color: "#1442f0",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              maxWidth: "none",
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            Desarrollamos marcas sólidas a través de procesos rigurosos y equipos{" "}
            <mark
              style={{
                background: "linear-gradient(150deg, transparent 9%, #cbfd00 9%)",
                color: "#1442f0",
                padding: "0 0.15em",
                borderRadius: 0,
                fontStyle: "normal",
                display: "inline",
              }}
            >
              especializados.
            </mark>
          </h1>

          <div
            className="home-services-grid"
            style={{
              borderTop: "none",
              // responsive via .home-services-grid
            }}
          >
            {[
              {
                num: "01",
                title: "Estrategia de\nmarca",
                desc: "Definimos dirección, foco y criterio clave para construir marcas coherentes y sostenibles en el tiempo.",
              },
              {
                num: "02",
                title: "Branding",
                desc: "Transformamos la estrategia en identidades claras, consistentes y memorables en todos los puntos de contacto.",
              },
              {
                num: "03",
                title: "Diseño\nindustrial",
                desc: "Diseñamos espacios y experiencias coherentes que conectan, marcan, espacios y personas.",
              },
            ].map((sv, i, arr) => (
              <div
                key={sv.num}
                style={{
                  padding: "2.5rem 2rem 2.5rem 0",
                  paddingRight: i < arr.length - 1 ? "2.5rem" : "0",
                  borderRight: "none",
                  marginLeft: i > 0 ? "2.5rem" : "0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0 0.6rem", alignItems: "stretch", flex: 1 }}>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1442f0",
                      letterSpacing: "0.02em",
                      flexShrink: 0,
                      paddingTop: "0.1em",
                    }}
                  >
                    {sv.num} |
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <h2
                      style={{
                        fontSize: "clamp(1.5rem, 2.2vw, 2.5rem)",
                        fontWeight: 300,
                        color: "#111",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                        margin: "0 0 0.85rem",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {sv.title}
                    </h2>
                    <p style={{ fontSize: "clamp(0.85rem, 1vw, 1rem)", fontWeight: 300, color: "#111", lineHeight: 1.6, margin: "0 0 1.25rem", flex: 1 }}>
                      {sv.desc}
                    </p>
                    <Link href="/servicios" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "clamp(0.8rem, 0.95vw, 0.95rem)", fontWeight: 400, color: "#1442f0", textDecoration: "none", letterSpacing: "0.01em" }}>
                      Ver más
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1442f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS GRID ═══ */}
      <section className="sp home-projects-section" style={{ background: "#fff", padding: "0 2.5rem 4rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ProjectsRotator projects={projects} />

          <div style={{ textAlign: "center", padding: "10px 0 8px", marginTop: "4px" }}>
            <Link
              href="/proyectos"
              className="btn-proyectos"
              style={{
                display: "inline-block",
                background: "#cbfd00",
                padding: "12px 36px",
                borderRadius: 0,
                fontSize: "clamp(1rem, 1.5vw, 2.375rem)",
                fontWeight: 600,
                color: "#1442f0",
                letterSpacing: "-0.01em",
                clipPath: "polygon(14px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 14px)",
              }}
            >
              Ver más proyectos
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="sp spv" style={{ background: "radial-gradient(circle at 95% 5%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 20%, transparent 40%), #1442f0", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3.5vw, 4.1875rem)",
              fontWeight: 300,
              color: "#cbfd00",
              textAlign: "center",
              letterSpacing: "-0.02em",
              marginBottom: "3rem",
            }}
          >
            Trayectoria que genera impacto
          </h2>
          <StatsCounter stats={[
            { value: s.stats_brands ?? "+70", label: "Marcas creadas\ny desarrolladas" },
            { value: s.stats_years ?? "+25", label: "años de experiencia\nen estrategia y\ndiseño" },
            { value: s.stats_sqm ?? "+900", suffix: "mil", label: "m² de diseño e\nimplementación\nen espacios reales" },
          ]} />
        </div>
      </section>

      <section className="sp spv" style={{ background: "#fff", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3.2vw, 3rem)",
              fontWeight: 300,
              color: "#1442f0",
              letterSpacing: "-0.02em",
              marginBottom: "3.5rem",
              textAlign: "center",
            }}
          >
            Por qué <strong style={{ fontWeight: 600 }}>nosotros</strong>
          </h1>

          <div className="home-why-grid">
            {[
              {
                line1: "Entendemos",
                line2: "antes de",
                highlight: "crear",
                desc: "Las marcas sólidas nacen de entender con claridad qué decir, a quién hablarle y cómo diferenciarse.",
              },
              {
                line1: "Diseñamos",
                line2: "para",
                highlight: "impactar",
                desc: "Creamos marcas que pasan de ser correctas a memorables.",
              },
              {
                line1: "Cuidamos",
                line2: "cada",
                highlight: "detalle",
                desc: "Porque es lo que transforma una buena experiencia en una que realmente se siente distinta.",
              },
            ].map((item, i) => (
              <div
                key={item.highlight}
                style={{ padding: "2.5rem" }}
              >
                <div className="why-inner" style={{ borderLeft: "1px solid #1442f0", paddingLeft: "1.5rem" }}>
                <h3
                  className="home-why-title"
                  style={{
                    fontSize: "clamp(1.2rem, 2.2vw, 2.9375rem)",
                    fontWeight: 300,
                    color: "#1442f0",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.25,
                    marginBottom: "1.25rem",
                  }}
                >
                  <span style={{ display: "block" }}>{item.line1}</span>
                  <span style={{ display: "block" }}>
                    {item.line2}{" "}
                    <mark
                      style={{
                        background: "linear-gradient(150deg, transparent 9%, #cbfd00 9%)",
                        color: "#1442f0",
                        padding: "0 0.15em",
                        borderRadius: 0,
                        fontStyle: "normal",
                        display: "inline",
                      }}
                    >
                      {item.highlight}
                    </mark>
                  </span>
                </h3>
                <p className="home-why-desc" style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.625rem)", fontWeight: 300, color: "#111", lineHeight: 1.6 }}>
                  {item.desc}
                </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLIENTS CAROUSEL ═══ */}
      {logos.length > 0 && (
        <section
          style={{
            background: "#f3f2f4",
            borderTop: "1px solid #e0e0e0",
            padding: "0",
          }}
        >
          <ClientsCarousel logos={logos} />
        </section>
      )}

      <style>{`
        .btn-proyectos:hover { background: #0a0a0a !important; color: #fff !important; }
      `}</style>
    </>
  );
}
