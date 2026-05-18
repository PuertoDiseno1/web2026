import HeroManager from "@/components/admin/HeroManager";
import { prisma } from "@/lib/prisma";

async function getSlides() {
  return prisma.heroSlide.findMany({ orderBy: [{ page: "asc" }, { order: "asc" }] });
}

export default async function AdminHero() {
  const slides = await getSlides();

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Hero Slides</h1>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>Gestiona el banner hero de cada página del sitio</p>
      </div>
      <HeroManager initialSlides={slides} />
    </>
  );
}
