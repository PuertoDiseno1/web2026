"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface ServiceSliderProps {
  images: string[];
  alt: string;
}

export default function ServiceSlider({ images, alt }: ServiceSliderProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (!images.length) return <div style={{ aspectRatio: "4/3", background: "#eee" }} />;

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "4/3",
        overflow: "hidden",
        background: "#ddd",
      }}
    >
      {images.map((src, i) => (
        <div
          key={src}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
        </div>
      ))}

      {total > 1 && (
        <>
          {/* Dots */}
          <div
            style={{
              position: "absolute",
              bottom: "0.75rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              zIndex: 2,
            }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === current ? "#cbfd00" : "rgba(255,255,255,0.5)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
