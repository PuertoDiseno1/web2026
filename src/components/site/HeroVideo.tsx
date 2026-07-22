"use client";

import { useEffect, useRef, useState } from "react";

function VideoLayer({ muxId, className }: { muxId: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // `ready` = video is confirmed at high quality and safe to cross-fade in.
  const [ready, setReady] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  // Crisp still frame Mux generates for this playback ID. Shown until the video
  // has ramped to full quality, so the pixelated HLS start is never visible.
  const posterUrl = `https://image.mux.com/${muxId}/thumbnail.webp?width=1920&time=0`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let revealed = false;
    const reveal = () => {
      if (!revealed) { revealed = true; setReady(true); }
    };

    // Safety fallback: reveal after 10 s regardless
    const fallback = setTimeout(reveal, 10000);

    const src = `https://stream.mux.com/${muxId}.m3u8`;

    let onTimeUpdate: (() => void) | null = null;
    let hls: import("hls.js").default | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS — no quality control. Wait a bit longer (4 s of
      // playback) so its own ABR has time to climb before we reveal.
      onTimeUpdate = () => {
        if (video.currentTime >= 4) {
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
        hls = new Hls({
          startLevel: 999, // start at the highest level the player size allows
          autoStartLoad: true,
          // Cap quality to the actual rendered size: a hero this size looks
          // identical at 1080p as at 4K, but 4K loads far slower and can stall.
          capLevelToPlayerSize: true,
          maxBufferLength: 60,
          abrEwmaDefaultEstimate: 10_000_000, // assume 10 Mbps so ABR starts high
        });
        let topFrags = 0;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          // Lock to the sharpest level allowed for this screen (no ABR dips,
          // so text never degrades mid-playback), but not wastefully above it.
          const capped = hls!.maxAutoLevel;
          hls!.currentLevel = capped >= 0 ? capped : data.levels.length - 1;
          video.play().catch(() => {});
        });
        // Reveal only once two full-quality fragments at the top level have
        // loaded AND enough is buffered ahead — so what first appears on screen
        // is already sharp and playback won't immediately stall.
        hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
          if (data.frag.level !== hls!.currentLevel) return;
          topFrags += 1;
          const buffered =
            video.buffered.length > 0
              ? video.buffered.end(video.buffered.length - 1) - video.currentTime
              : 0;
          if (topFrags >= 2 && buffered >= 3) reveal();
        });
      });
    }

    return () => {
      if (onTimeUpdate) video.removeEventListener("timeupdate", onTimeUpdate);
      clearTimeout(fallback);
      hls?.destroy();
    };
  }, [muxId]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#04081c" }}>
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

      {/* Crisp poster — covers the video until it's at full quality, then fades out */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt=""
        aria-hidden
        onLoad={() => setPosterLoaded(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready ? 0 : posterLoaded ? 1 : 0,
          transition: "opacity 0.7s ease",
          pointerEvents: "none",
        }}
      />

      {/* Loader bars — only until the crisp poster is on screen */}
      {!posterLoaded && !ready && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
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
