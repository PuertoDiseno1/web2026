"use client";

import { useEffect, useRef, useState } from "react";

function VideoLayer({ muxId, className }: { muxId: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Wait until 3 s of content have decoded so HLS has had time to ramp to
    // high quality before revealing the video (avoids pixelated first frames).
    let revealed = false;
    const reveal = () => {
      if (!revealed) { revealed = true; setLoading(false); }
    };

    // Safety fallback: reveal after 8 s regardless
    const fallback = setTimeout(reveal, 8000);

    const src = `https://stream.mux.com/${muxId}.m3u8`;

    let onTimeUpdate: (() => void) | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS — no quality control, reveal after 2s of playback
      onTimeUpdate = () => {
        if (video.currentTime >= 2) {
          video.removeEventListener("timeupdate", onTimeUpdate!);
          reveal();
        }
      };
      video.addEventListener("timeupdate", onTimeUpdate);
      video.src = src;
      video.play().catch(() => {});
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        const hls = new Hls({
          startLevel: 999, // clamps to highest available level
          autoStartLoad: true,
          capLevelToPlayerSize: false,
          maxBufferLength: 60,
          abrEwmaDefaultEstimate: 10_000_000, // assume 10 Mbps so ABR starts high
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          hls.currentLevel = data.levels.length - 1;
          video.play().catch(() => {});
        });
        // Reveal as soon as the first fragment at the highest level finishes loading
        hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
          if (data.frag.level === hls.currentLevel) {
            reveal();
          }
        });
      });
    }

    return () => {
      if (onTimeUpdate) video.removeEventListener("timeupdate", onTimeUpdate);
      clearTimeout(fallback);
    };
  }, [muxId]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "177.78vh",
          minWidth: "100%",
          height: "56.25vw",
          minHeight: "100%",
          transform: "translate(-50%, -50%)",
          objectFit: "cover",
        }}
      />
      {loading && (
        <div style={{
          position: "absolute", inset: 0,
          background: "#04081c",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.6s",
        }}>
          <style>{`
            @keyframes pd-bar {
              0%, 100% { transform: scaleY(0.35); opacity: 0.4; }
              50%       { transform: scaleY(1);    opacity: 1; }
            }
          `}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[0, 0.15, 0.3].map((delay, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: 28,
                  borderRadius: 2,
                  background: "#1442f0",
                  transformOrigin: "center",
                  animation: `pd-bar 1.1s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HeroVideo({ muxId, muxIdMobile }: { muxId: string; muxIdMobile?: string | null }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {/* Desktop — oculto en móvil */}
      <VideoLayer muxId={muxId} className="hero-video-desktop" />

      {/* Móvil — solo si se configuró, oculto en desktop */}
      {muxIdMobile && (
        <VideoLayer muxId={muxIdMobile} className="hero-video-mobile" />
      )}
    </div>
  );
}
