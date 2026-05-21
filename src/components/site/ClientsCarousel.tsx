"use client";

import Image from "next/image";

interface ClientsCarouselProps {
  logos: string[];
}

export default function ClientsCarousel({ logos }: ClientsCarouselProps) {
  if (!logos.length) return null;

  // Duplicate for seamless loop
  const track = [...logos, ...logos];

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to right, #f3f2f4, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to left, #f3f2f4, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div
        className="carousel-track"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          width: "max-content",
        }}
      >
        {track.map((logo, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 2.5rem",
              height: 100,
              borderRight: "1px solid #e0e0e0",
              flexShrink: 0,
            }}
          >
            <Image
              src={`/clientes/${logo}`}
              alt={logo.replace(/\.[^.]+$/, "")}
              width={150}
              height={65}
              style={{
                objectFit: "contain",
                filter: "grayscale(100%)",
                opacity: 0.7,
                transition: "filter 0.3s, opacity 0.3s",
                maxHeight: 65,
                width: "auto",
              }}
              className="carousel-logo"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          animation: marquee ${logos.length * 2.5}s linear infinite;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
        .carousel-logo:hover {
          filter: grayscale(0%) !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
