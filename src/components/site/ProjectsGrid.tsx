"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MuxVideo from "./MuxVideo";
import { encodePath } from "@/lib/images";

interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categories: string;
  coverImage: string | null;
  coverVideo?: string | null;
}

function getMuxPlaybackId(val: string): string {
  const match = val.match(/player\.mux\.com\/([^?#/]+)/);
  return match ? match[1] : val.trim();
}

const CATS = [
  "Todos",
  "Diseño editorial",
  "Packaging",
  "Diseño industrial",
  "Branding",
  "Estrategia de marca",
];

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("Todos");

  const filtered =
    active === "Todos"
      ? projects
      : projects.filter((p) =>
          p.categories.split("\n").some((c) => c.trim().toLowerCase() === active.toLowerCase())
        );

  return (
    <>
      {/* FILTER BAR */}
      <div
        style={{
          paddingTop: "7rem",
          paddingBottom: "1rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderBottom: "1px solid #e8e8e8",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
          {CATS.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "clamp(0.7rem, 1vw, 1.1rem)",
                fontWeight: active === cat ? 600 : 300,
                color: active === cat ? "#111" : "#888",
                padding: "0.25rem 0",
                transition: "color 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              {cat}
            </button>
          )).reduce<React.ReactNode[]>((acc, el, i) => {
            if (i === 0) return [el];
            return [
              ...acc,
              <span key={`sep-${i}`} style={{ color: "#ccc", margin: "0 0.75rem", fontSize: "clamp(0.7rem, 1vw, 1.1rem)" }}>|</span>,
              el,
            ];
          }, [])}
        </div>
      </div>

      {/* MASONRY GRID */}
      {(() => {
        const cols: typeof filtered[] = [[], [], []];
        filtered.forEach((p, i) => cols[i % 3].push(p));
        return (
          <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }} className="projects-masonry">
            {cols.map((col, ci) => (
              <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                {col.map((p, pi) => {
                  const isLast = pi === col.length - 1;
                  return (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.slug}`}
                    style={{ display: "block", position: "relative", overflow: "hidden", ...(isLast ? { flex: 1 } : {}) }}
                    className="project-tile"
                  >
                    <div style={{ position: "relative", width: "100%", height: isLast ? "100%" : "auto" }}>
                      {/* Imagen base siempre visible */}
                      {p.coverImage && (
                        p.coverImage.toLowerCase().endsWith(".gif") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={encodePath(p.coverImage)} alt={p.title} style={{ width: "100%", height: isLast ? "100%" : "auto", objectFit: "cover", display: "block", minHeight: isLast ? "200px" : undefined }} />
                        ) : (
                          <Image src={encodePath(p.coverImage)} alt={p.title} width={600} height={600} sizes="(max-width: 768px) 100vw, 33vw" style={{ width: "100%", height: isLast ? "100%" : "auto", objectFit: isLast ? "cover" : undefined, display: "block", minHeight: isLast ? "200px" : undefined }} />
                        )
                      )}
                      {!p.coverImage && (
                        <div style={{ aspectRatio: isLast ? undefined : "1/1", height: isLast ? "100%" : undefined, background: "#e8e8e8", minHeight: isLast ? "200px" : undefined }} />
                      )}
                      {/* Video Mux con HLS nativo — funciona en todos los browsers */}
                      {p.coverVideo && (
                        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden" }}>
                          <MuxVideo playbackId={getMuxPlaybackId(p.coverVideo)} />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="project-tile-overlay">
                        <div className="project-tile-text">
                          <p className="project-tile-category">{p.categories.split("\n")[0].trim()}</p>
                          <p className="project-tile-title">{p.title}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}

      <style>{`
        .projects-masonry {
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .projects-masonry { flex-wrap: wrap; }
          .projects-masonry > div { flex: 1 1 45%; }
        }
        @media (max-width: 550px) {
          .projects-masonry > div { flex: 1 1 100%; }
        }
        .project-tile-overlay {
          position: absolute;
          inset: 0;
          background: #cbfd00;
          opacity: 0;
          display: flex;
          align-items: flex-end;
          padding: 1.5rem;
          transition: opacity 0.35s ease;
        }
        .project-tile:hover .project-tile-overlay {
          opacity: 1;
        }
        .project-tile-text {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s;
        }
        .project-tile:hover .project-tile-text {
          opacity: 1;
          transform: translateY(0);
        }
        .project-tile-category {
          color: rgba(0,66,225,0.7);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
        }
        .project-tile-title {
          color: #0042e1;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin: 0;
        }
      `}</style>
    </>
  );
}
