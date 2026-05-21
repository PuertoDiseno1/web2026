export const dynamic = 'force-dynamic';
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getData() {
  try {
    const [team, pageContent] = await Promise.all([
      prisma.teamMember.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      prisma.pageContent.findUnique({ where: { page: "nosotros" } }),
    ]);
    const content = pageContent?.content ? JSON.parse(pageContent.content) : {};
    return { team, content };
  } catch { return { team: [], content: {} }; }
}

export const metadata = {
  title: "Nosotros | Puerto Diseño",
  description: "Diseñamos marcas con visión, criterio y profundidad. Conoce nuestro equipo y metodología.",
};

export default async function NosotrosPage() {
  const { team, content } = await getData();
  const heroImage: string = content.heroImage || "";

  return (
    <div style={{ background: "#fff", color: "#111" }}>

      {/* HERO — imagen full width con overlay */}
      <section style={{ position: "relative", height: "55vh", minHeight: 320, overflow: "hidden" }}>
        {heroImage ? (
          <Image src={heroImage} alt="Nosotros" fill style={{ objectFit: "cover", objectPosition: "center" }} priority />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#1a2a5e" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.45)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6.25rem)", fontWeight: 100, color: "#fff", letterSpacing: "-0.02em" }}>
            Nosotros
          </h1>
        </div>
      </section>

      {/* TAGLINE */}
      <section style={{ padding: "5rem 2.5rem", textAlign: "center", borderBottom: "1px solid #eee" }}>
        <p style={{
          fontSize: "clamp(1.8rem, 4.5vw, 4.875rem)",
          fontWeight: 300,
          color: "#1442f0",
          maxWidth: "32ch",
          margin: "0 auto",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}>
          Diseñamos marcas con visión,<br />
          criterio y <strong style={{ fontWeight: 600 }}>profundidad</strong>.
        </p>
      </section>

      {/* CÓMO TRABAJAMOS */}
      <section className="sp spv" style={{ padding: "5rem 2.5rem", background: "#f5f5f3", borderBottom: "1px solid #eee" }}>
        <div className="como-trabajamos-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4.5vw, 4.875rem)", fontWeight: 300, color: "#1442f0", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            ¿Cómo<br />trabajamos?
          </h2>
          <p style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.75rem)", fontWeight: 300, color: "#444", lineHeight: 1.7 }}>
            Partimos siempre desde la estrategia: entendemos el negocio, el contexto y a las personas para las que diseñamos.
            Trabajamos con metodologías rigurosas y procesos claros que aseguran consistencia, foco y resultados.
          </p>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="sp spv" style={{ padding: "5rem 2.5rem 7rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.id}>
                <div style={{ aspectRatio: "4/4", position: "relative", overflow: "hidden", marginBottom: "0.9rem", background: "#ddd" }} className="team-card">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      style={{ objectFit: "cover", objectPosition: "center", filter: "grayscale(100%)" }}
                      className="team-photo"
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "#ccc" }} />
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.8125rem)", fontWeight: 700, letterSpacing: "-0.01em", color: "#1442f0", marginBottom: "0.2rem" }}>
                      {member.name}
                    </p>
                    <p style={{ fontSize: "clamp(0.8rem, 1vw, 1.05rem)", fontWeight: 300, color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.role}</p>
                  </div>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginTop: "2px" }}
                      aria-label="LinkedIn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <path d="M8 11v5M8 8v.01M12 16v-5M12 11a3 3 0 0 1 6 0v5" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .team-photo {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .team-card:hover .team-photo {
          transform: scale(1.07);
        }
      `}</style>

    </div>
  );
}
