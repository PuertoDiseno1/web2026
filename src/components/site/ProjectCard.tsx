import Link from "next/link";
import Image from "next/image";

interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categories: string;
  coverImage: string | null;
  coverVideo?: string | null;
}

export default function ProjectCard({ project }: { project: Project }) {
  const cats = project.categories.split("\n").filter(Boolean);
  const isGif = !!project.coverImage && project.coverImage.toLowerCase().endsWith(".gif");

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      style={{
        display: "block",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "4px",
        overflow: "hidden",
        transition: "border-color 0.25s",
        background: "rgba(255,255,255,0.01)",
      }}
      className="project-card"
    >
      {/* Cover: video > gif > image */}
      <div style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
        {project.coverVideo ? (
          <video
            src={`https://stream.mux.com/${project.coverVideo}/high.mp4`}
            autoPlay
            muted
            loop
            playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
            className="project-img"
          />
        ) : isGif ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImage!}
            alt={project.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
            className="project-img"
          />
        ) : project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            style={{ objectFit: "cover", transition: "transform 0.5s" }}
            className="project-img"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(245,245,240,0.2)", letterSpacing: "0.08em" }}>SIN IMAGEN</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {cats.map((c) => (
            <span
              key={c}
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#c8f25a",
                fontWeight: 600,
              }}
            >
              {c}
            </span>
          ))}
        </div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>
          {project.title}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "rgba(245,245,240,0.5)" }}>{project.subtitle}</p>
      </div>

      <style>{`
        .project-card:hover { border-color: rgba(200,242,90,0.3) !important; }
        .project-card:hover .project-img { transform: scale(1.04) !important; }
      `}</style>
    </Link>
  );
}
