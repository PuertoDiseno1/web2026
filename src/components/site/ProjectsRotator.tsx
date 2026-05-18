"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type Project = {
  id: string | number;
  slug: string;
  title: string;
  categories: string | null;
  images: string | null;
};

// Each slot has a "current" shown layer and an "incoming" layer fading in on top
type SlotState = {
  current: Project;
  incoming: Project | null; // null = no transition in progress
  phase: "idle" | "entering"; // entering = incoming layer is fading in
};

function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

const COL_CONFIG = [
  { heights: [350, 265, 265], bgs: ["#c0303b", "#1a3f8f", "#ede5df"] },
  { heights: [265, 263, 350], bgs: ["#c3c3c3", "#8a8a74", "#181c20"] },
  { heights: [350, 265, 265], bgs: ["#cbe800", "#04afbb", "#e0c8dc"] },
];

const LIGHT_BG = new Set(["#cbe800", "#ede5df", "#c3c3c3", "#e0c8dc"]);
const COL_INDICES = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];

// Stagger delays per slot index so rotations feel organic, not synchronised
const SLOT_STAGGER_MS = [0, 600, 1400, 300, 1100, 700, 1800, 200, 900];
// Base interval between rotation cycles
const BASE_INTERVAL_MS = 3800;
// Crossfade duration
const CROSSFADE_MS = 900;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ProjectsRotator({ projects }: { projects: Project[] }) {
  const [slots, setSlots] = useState<SlotState[]>([]);
  const slotsRef = useRef<SlotState[]>([]);
  const projectsRef = useRef(projects);

  // Init 9 random slots
  useEffect(() => {
    const shuffled = shuffle(projectsRef.current);
    const initial: SlotState[] = shuffled.slice(0, 9).map((p) => ({
      current: p,
      incoming: null,
      phase: "idle",
    }));
    slotsRef.current = initial;
    setSlots([...initial]);
  }, []);

  const rotateSlot = useCallback((slotIdx: number) => {
    const current = slotsRef.current;
    if (!current[slotIdx]) return;

    // Find a project not currently visible (include incoming slots too)
    const visibleIds = new Set(
      slotsRef.current.flatMap((s) =>
        s.incoming ? [s.current.id, s.incoming.id] : [s.current.id]
      )
    );
    const pool = shuffle(projectsRef.current.filter((p) => !visibleIds.has(p.id)));
    const next = pool[0];
    if (!next) return;

    // Phase 1: set incoming + start entering
    const updated = current.map((slot, i) =>
      i === slotIdx ? { ...slot, incoming: next, phase: "entering" as const } : slot
    );
    slotsRef.current = updated;
    setSlots([...updated]);

    // Phase 2: after crossfade, promote incoming → current
    setTimeout(() => {
      const after = slotsRef.current;
      const finalised = after.map((slot, i) =>
        i === slotIdx && slot.incoming
          ? { current: slot.incoming, incoming: null, phase: "idle" as const }
          : slot
      );
      slotsRef.current = finalised;
      setSlots([...finalised]);
    }, CROSSFADE_MS + 80);
  }, []);

  // Staggered rotation loop — one interval, each slot fires at its own offset
  useEffect(() => {
    if (slots.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    function scheduleSlot(slotIdx: number) {
      const delay = SLOT_STAGGER_MS[slotIdx] ?? 0;
      const t = setTimeout(() => {
        rotateSlot(slotIdx);
        // Schedule next cycle for this slot with slight random jitter
        const jitter = Math.random() * 800 - 400;
        const next = setTimeout(() => scheduleSlot(slotIdx), BASE_INTERVAL_MS + jitter);
        timers.push(next);
      }, delay);
      timers.push(t);
    }

    // Rotate 1-3 slots per "wave" — pick random subset
    const activeSlots = shuffle(Array.from({ length: 9 }, (_, i) => i)).slice(0, 7);
    activeSlots.forEach((slotIdx) => scheduleSlot(slotIdx));

    return () => timers.forEach(clearTimeout);
  }, [slots.length, rotateSlot]);

  if (slots.length === 0) return null;

  return (
    <>
      <style>{`
        .mosaic-cell { position: relative; overflow: hidden; display: block; flex-shrink: 0; }
        .mosaic-cell:hover .mosaic-img-layer { transform: scale(1.06); }
        .mosaic-cell:hover .mosaic-overlay { background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 55%, transparent 100%) !important; }
        .mosaic-cell:hover .mosaic-title { letter-spacing: 0.01em; }
        .mosaic-img-layer {
          position: absolute; inset: 0;
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .mosaic-crossfade-enter {
          position: absolute; inset: 0; z-index: 2;
          opacity: 0;
          transition: opacity ${CROSSFADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mosaic-crossfade-enter.is-entering { opacity: 1; }
        .mosaic-crossfade-enter .mosaic-img-layer { transform: scale(1.08); transition: transform ${CROSSFADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .mosaic-crossfade-enter.is-entering .mosaic-img-layer { transform: scale(1); }
        .mosaic-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0.85rem;
          transition: background 0.4s ease;
          z-index: 3;
        }
        .mosaic-cat {
          font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 0.25rem; line-height: 1.2;
          opacity: 0; transform: translateY(4px);
          transition: opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
        }
        .mosaic-title {
          font-size: 0.78rem; font-weight: 700; line-height: 1.25;
          transition: letter-spacing 0.35s ease;
        }
        .mosaic-cell:hover .mosaic-cat { opacity: 1 !important; transform: translateY(0) !important; }
        /* Mobile: mantener 3 columnas con proporciones, escalar ~50% */
        @media (max-width: 640px) {
          .mosaic-cell-lg { height: 175px !important; }
          .mosaic-cell-sm { height: 133px !important; }
          .mosaic-title { font-size: 0.62rem !important; }
          .mosaic-cat { display: none; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .mosaic-cell-lg { height: 240px !important; }
          .mosaic-cell-sm { height: 182px !important; }
        }
      `}</style>

      <div style={{ display: "flex", gap: "4px" }}>
        {COL_INDICES.map((colSlots, ci) => (
          <div key={ci} className={`mosaic-col mosaic-col-${ci}`} style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            {colSlots.map((slotIdx, ri) => {
              const slot = slots[slotIdx];
              if (!slot) return null;
              const { current, incoming, phase } = slot;
              const h = COL_CONFIG[ci].heights[ri];
              const bg = COL_CONFIG[ci].bgs[ri];
              const isLight = LIGHT_BG.has(bg);

              const renderLayer = (p: Project, extra?: React.CSSProperties) => {
                const imgs = parseImages(p.images);
                return (
                  <div style={{ position: "absolute", inset: 0, ...extra }}>
                    {imgs[0] && (
                      <div className="mosaic-img-layer">
                        <Image src={imgs[0]} alt={p.title} fill style={{ objectFit: "cover" }} sizes="33vw" />
                      </div>
                    )}
                  </div>
                );
              };

              const currentImgs = parseImages(current.images);
              const hasImg = currentImgs.length > 0;

              return (
                <Link
                  key={slotIdx}
                  href={`/proyectos/${current.slug}`}
                  className={`mosaic-cell ${h >= 300 ? "mosaic-cell-lg" : "mosaic-cell-sm"}`}
                  style={{ height: h, background: bg }}
                >
                  {/* Current layer (bottom) */}
                  {renderLayer(current)}

                  {/* Incoming crossfade layer (top) */}
                  {incoming && (
                    <div
                      className={`mosaic-crossfade-enter${phase === "entering" ? " is-entering" : ""}`}
                      style={{ background: bg }}
                    >
                      {renderLayer(incoming)}
                    </div>
                  )}

                  {/* Text overlay — always on top, href points to current */}
                  <div
                    className="mosaic-overlay"
                    style={{
                      background: hasImg
                        ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)"
                        : "none",
                    }}
                  >
                    <p
                      className="mosaic-cat"
                      style={{
                        color: hasImg ? "rgba(255,255,255,0.8)" : isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {current.categories?.split("\n")[0]}
                    </p>
                    <h3
                      className="mosaic-title"
                      style={{ color: hasImg ? "#fff" : isLight ? "#111" : "#fff" }}
                    >
                      {current.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
