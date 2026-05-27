export const dynamic = 'force-dynamic';
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ServiceSlider from "@/components/site/ServiceSlider";

export const metadata = {
  title: "Servicios | Puerto Diseño",
  description: "Impulsamos la transformación con estrategia, estructura y creatividad. Estrategia de marca, branding y diseño industrial.",
};

const defaultServices = [
  {
    id: "estrategia",
    title: "Estrategia\nde marca",
    desc: "Construimos marcos estratégicos claros que orientan decisiones y aseguran coherencia en el tiempo. Analizamos contexto, negocio y competencia para establecer posicionamiento, propuesta de valor y lineamientos de marca.",
    items: [
      "Arquitectura de Marca",
      "Consultoría de marca",
      "Naming",
      "Posicionamiento y propuesta de valor",
      "Workshop",
      "Estrategia de diseño",
    ],
    defaultImages: [
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Estrategia/img1.jpg",
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Estrategia/img2.jpg",
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Estrategia/img3.jpg",
    ],
    imageRight: true,
  },
  {
    id: "branding",
    title: "Branding",
    desc: "Convertimos la estrategia en sistemas de identidad visual y verbal claros, consistentes y diferenciadores. Diseñamos marcas que se reconocen, se entienden y se recuerdan.",
    items: [
      "Identidad visual",
      "Diseño para comunicaciones",
      "Diseño editorial",
      "Diseño digital",
      "Packaging",
      "Brandbook",
    ],
    defaultImages: [
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Grafico/img1.jpg",
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Grafico/img2.jpg",
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Grafico/img3.jpg",
    ],
    imageRight: false,
  },
  {
    id: "industrial",
    title: "Diseño\nindustrial",
    desc: "Entendemos el diseño de espacios y señalética como motor de experiencia y negocio. A través de procesos estructurados, convertimos la estrategia en espacios coherentes, funcionales y centrados en el usuario, asegurando consistencia, viabilidad y una experiencia integral.",
    items: [
      "Environmental Design",
      "Instalaciones efímeras",
      "Stand",
      "Implementaciones",
      "Sistema de Señalética",
      "Arquitectura interior",
    ],
    defaultImages: [
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Industrial/img1.jpg",
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Industrial/img2.jpg",
      "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev/servicios/Industrial/img3.jpg",
    ],
    imageRight: true,
  },
];

async function getPageContent() {
  try {
    const record = await prisma.pageContent.findUnique({ where: { page: "servicios" } });
    if (!record) return {};
    try { return JSON.parse(record.content); } catch { return {}; }
  } catch { return {}; }
}

export default async function ServiciosPage() {
  const content = await getPageContent();
  const heroImage: string = content.heroImage || "/servicios/Banner_AdobeStock_436930998.jpeg";

  return (
    <div style={{ background: "#fff", color: "#111" }}>

      {/* HERO */}
      <section style={{ position: "relative", height: "55vh", minHeight: 320, overflow: "hidden" }}>
        <Image src={heroImage} alt="Servicios" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} priority />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.45)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6.25rem)", fontWeight: 100, color: "#fff", letterSpacing: "-0.02em" }}>
            Servicios
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
          Impulsamos la transformación con<br />
          estrategia, estructura y <strong style={{ fontWeight: 600 }}>creatividad</strong>.
        </p>
      </section>

      {/* SERVICES */}
      {defaultServices.map((sv, i) => {
        const images: string[] = (content[sv.id + "Images"] as string[]) || sv.defaultImages;
        const txt = content[sv.id + "Text"] as { title?: string; desc?: string; items?: string } | undefined;
        const title = txt?.title ?? sv.title;
        const desc = txt?.desc ?? sv.desc;
        const items = txt?.items ? txt.items.split("\n").filter(Boolean) : sv.items;

        const sliderEl = (
          <div>
            <ServiceSlider images={images} alt={sv.title.replace("\n", " ")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.15rem 1rem", marginTop: "1.5rem" }}>
              {items.map((item) => (
                <p key={item} style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.95rem)", fontWeight: 300, display: "flex", alignItems: "center", gap: "0.35rem", margin: 0, borderBottom: "1px solid #0042e1", paddingBottom: "0.4rem", paddingTop: "0.4rem" }}>
                  <span style={{ color: "#1442f0", fontWeight: 600, flexShrink: 0, fontSize: "0.8rem" }}>›</span>
                  <span style={{ color: "#1442f0" }}>{item}</span>
                </p>
              ))}
            </div>
          </div>
        );

        const textEl = (
          <div style={{ padding: "1rem 0" }}>
            <h2 style={{
              fontSize: "clamp(1.4rem, 3.5vw, 4.1875rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: "1.25rem",
              borderLeft: "3px solid #1442f0",
              paddingLeft: "1rem",
              whiteSpace: "pre-line",
            }}>
              {title}
            </h2>
            <p style={{ fontSize: "clamp(0.8rem, 1.1vw, 1.35rem)", fontWeight: 300, color: "#555", lineHeight: 1.7, maxWidth: "40ch" }}>
              {desc}
            </p>
          </div>
        );

        return (
          <section
            key={sv.id}
            id={sv.id}
            className={`sp service-section${!sv.imageRight ? " image-left" : ""}`}
            style={{
              padding: "4rem 2.5rem",
              borderBottom: i < defaultServices.length - 1 ? "1px solid #eee" : "none",
              maxWidth: 1100,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            <div className="service-text">{textEl}</div>
            <div className="service-image">{sliderEl}</div>
          </section>
        );
      })}

      <style>{`
        @media (min-width: 769px) {
          .image-left .service-image { order: -1; }
        }
        @media (max-width: 768px) {
          .service-section { grid-template-columns: 1fr !important; gap: 2rem !important; padding-top: 3rem !important; padding-bottom: 3rem !important; }
          .service-text { order: 1; }
          .service-image { order: 2; }
        }
      `}</style>
    </div>
  );
}
