"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: string;
  suffix?: string;
  label: string;
}

function parseValue(val: string): { prefix: string; number: number } {
  const match = val.match(/^([+\-]?)(\d+)$/);
  if (match) return { prefix: match[1], number: parseInt(match[2], 10) };
  return { prefix: "", number: 0 };
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function AnimatedNumber({ value, suffix }: { value: string; suffix?: string }) {
  const { prefix, number: target } = parseValue(value);
  const [current, setCurrent] = useState(target); // inicia con valor final para SSR
  const containerRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function runAnimation() {
      const duration = 1800;
      const startTime = performance.now();
      if (raf.current) cancelAnimationFrame(raf.current);

      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setCurrent(Math.round(easeOutExpo(progress) * target));
        if (progress < 1) raf.current = requestAnimationFrame(tick);
      }

      setCurrent(0);
      raf.current = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runAnimation();
          intervalRef.current = setInterval(runAnimation, 4000);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target]);

  return (
    <div
      ref={containerRef}
      style={{
        fontSize: "clamp(2.5rem, 6.25vw, 6.25rem)",
        fontWeight: 900,
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "-0.04em",
        flexShrink: 0,
        fontVariantNumeric: "tabular-nums",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
      }}
    >
      {/* Spacer invisible con el valor final para reservar ancho fijo */}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span aria-hidden style={{ visibility: "hidden", whiteSpace: "nowrap", userSelect: "none" }}>
          {prefix}{target}
        </span>
        <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap" }}>
          {prefix}{current}
        </span>
      </span>
      {suffix && (
        <span style={{ fontSize: "0.37em", fontWeight: 900, verticalAlign: "middle", marginLeft: "0.3em", letterSpacing: "0.08em" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

export default function StatsCounter({ stats }: { stats: Stat[] }) {
  return (
    <>
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stats-cell {
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.2) !important;
            padding: 1.5rem 0 !important;
            flex-direction: row !important;
            align-items: center !important;
            text-align: left !important;
            gap: 1.5rem;
          }
          .stats-cell:first-child {
            border-top: none !important;
            padding-top: 0.5rem !important;
          }
          .stats-divider { display: none !important; }
          .stats-label { flex: 1; font-size: 1rem !important; }
          .stats-number { min-width: 6rem; }
        }
      `}</style>
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="stats-cell"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "2rem 2rem",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.2)" : "none",
            }}
          >
            <div className="stats-number">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="stats-divider" style={{
              width: "2.5rem",
              height: "1px",
              background: "#c8f25a",
              margin: "1rem auto",
              opacity: 0.7,
            }} />
            <p className="stats-label" style={{
              fontSize: "clamp(0.85rem, 1.3vw, 1.625rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.5,
            }}>
              {stat.label.split("\n").map((line, j) => (
                <span key={j} style={{ display: "block" }}>{line}</span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
