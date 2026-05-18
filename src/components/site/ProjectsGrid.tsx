"use client";

import { useState } from "react";
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

const CATS = [
  "Todos",
  "Identidad visual",
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
                fontSize: "clamp(0.8rem, 3vw, 1.875rem)",
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
              <span key={`sep-${i}`} style={{ color: "#ccc", margin: "0 0.75rem", fontSize: "clamp(0.8rem, 3vw, 1.875rem)" }}>|</span>,
              el,
            ];
          }, [])}
        </div>
      </div>

      {/* MASONRY GRID */}
      <div
        style={{
          padding: "0",
          columnCount: 3,
          columnGap: 0,
        }}
        className="projects-masonry"
      >
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/proyectos/${p.slug}`}
            style={{ display: "block", breakInside: "avoid", position: "relative", overflow: "hidden" }}
            className="project-tile"
          >
            <div style={{ position: "relative", width: "100%" }}>
              {p.coverImage ? (
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  width={600}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : (
                <div style={{ aspectRatio: "1/1", background: "#e8e8e8" }} />
              )}
              {/* Hover overlay */}
              <div className="project-tile-overlay">
                <p className="project-tile-title">{p.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .projects-masonry {
          column-count: 3;
        }
        @media (max-width: 900px) {
          .projects-masonry { column-count: 2; }
        }
        @media (max-width: 550px) {
          .projects-masonry { column-count: 1; }
        }
        .project-tile-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10,10,10,0);
          display: flex;
          align-items: flex-end;
          padding: 1.25rem;
          transition: background 0.3s;
        }
        .project-tile:hover .project-tile-overlay {
          background: rgba(10,10,10,0.55);
        }
        .project-tile-title {
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s, transform 0.3s;
          margin: 0;
        }
        .project-tile:hover .project-tile-title {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
