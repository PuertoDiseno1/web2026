export const dynamic = 'force-dynamic';
import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import ClientsCarousel from "@/components/site/ClientsCarousel";
import HeroVideo from "@/components/site/HeroVideo";
import ProjectsRotator from "@/components/site/ProjectsRotator";
import StatsCounter from "@/components/site/StatsCounter";

async function getData() {
  try {
    const [projects, settings] = await Promise.all([
      prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      prisma.siteSettings.findMany(),
    ]);
    const s = Object.fromEntries(settings.map((r) => [r.key, r.value]));
    const featured = projects.find((p) => p.featured) ?? projects[0] ?? null;

    const clientesDir = path.join(process.cwd(), "public", "clientes");
    const logos = fs.readdirSync(clientesDir).filter((f) =>
      /\.(png|jpg|jpeg|svg|webp)$/i.test(f)
    );

    return { projects, s, logos, featured };
  } catch {
    const clientesDir = path.join(process.cwd(), "public", "clientes");
    let logos: string[] = [];
    try { logos = fs.readdirSync(clientesDir).filter((f) => /\.(png|jpg|jpeg|svg|webp)$/i.test(f)); } catch {}
    return { projects: [], s: {} as Record<string, string>, logos, featured: null };
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
          minHeight: "100vh",
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

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: muxId
              ? "linear-gradient(to top, #04081c 25%, rgba(4,8,28,0.25) 100%)"
              : featuredImages[0]
              ? "linear-gradient(to top, #04081c 30%, rgba(4,8,28,0.3) 100%)"
              : "linear-gradient(135deg, #04081c 0%, #08143a 50%, #04081c 100%)",
            zIndex: 1,
          }}
        />

        {/* Hero content — intentionally empty */}
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="sp spv" style={{ background: "#fff", padding: "6rem 2.5rem 5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3.2vw, 3rem)",
              fontWeight: 300,
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
                background: "linear-gradient(150deg, transparent 9%, #c8f25a 9%)",
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
              borderTop: "1px solid #e0e0e0",
              // responsive via .home-services-grid
            }}
          >
            {[
              {
                num: "01",
                title: "Estrategia de marca",
                desc: "Definimos dirección, foco y criterio clave para construir marcas coherentes y sostenibles en el tiempo.",
              },
              {
                num: "02",
                title: "Branding",
                desc: "Transformamos la estrategia en identidades claras, consistentes y memorables en todos los puntos de contacto.",
              },
              {
                num: "03",
                title: "Diseño industrial",
                desc: "Diseñamos espacios y experiencias coherentes que conectan, marcan, espacios y personas.",
              },
            ].map((sv, i, arr) => (
              <div
                key={sv.num}
                style={{
                  padding: "2.5rem 2rem 2.5rem 0",
                  paddingRight: i < arr.length - 1 ? "2.5rem" : "0",
                  borderRight: i < arr.length - 1 ? "1px solid #e0e0e0" : "none",
                  marginLeft: i > 0 ? "2.5rem" : "0",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.85rem" }}>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1442f0",
                      letterSpacing: "0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {sv.num} |
                  </span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 1.8vw, 2rem)",
                      fontWeight: 100,
                      color: "#111",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                      margin: 0,
                    }}
                  >
                    {sv.title}
                  </h2>
                </div>
                <p style={{ fontSize: "clamp(0.85rem, 1vw, 1rem)", fontWeight: 300, color: "#666", lineHeight: 1.6 }}>
                  {sv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS GRID ═══ */}
      <section className="sp" style={{ background: "#fff", padding: "0 2.5rem 4rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ProjectsRotator projects={projects} />

          <div style={{ textAlign: "center", padding: "10px 0 8px", marginTop: "4px" }}>
            <Link
              href="/proyectos"
              className="btn-proyectos"
              style={{
                display: "inline-block",
                background: "#c8f25a",
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
      <section className="sp spv" style={{ background: "#1442f0", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3.5vw, 4.1875rem)",
              fontWeight: 100,
              color: "#c8f25a",
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
                style={{
                  padding: "2.5rem",
                  borderLeft: "3px solid #1442f0",
                }}
              >
                <h3
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
                        background: "linear-gradient(150deg, transparent 9%, #c8f25a 9%)",
                        color: "#1442f0",
                        padding: "0 0.15em",
                        borderRadius: 0,
                        fontStyle: "normal",
                        display: "inline-block",
                      }}
                    >
                      {item.highlight}
                    </mark>
                  </span>
                </h3>
                <p style={{ fontSize: "clamp(0.85rem, 1.3vw, 1.625rem)", fontWeight: 300, color: "#555", lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLIENTS CAROUSEL ═══ */}
      {logos.length > 0 && (
        <section
          style={{
            background: "#fff",
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
