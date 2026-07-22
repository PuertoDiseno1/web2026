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

    // Safety fallback: reveal after 12 s regardless
    const fallback = setTimeout(reveal, 12000);

    const src = `https://stream.mux.com/${muxId}.m3u8`;
    let hls: import("hls.js").default | null = null;
    let targetH = 0; // decoded height we consider "full quality"

    // Reveal only once the frame actually being decoded has reached full
    // quality and enough is buffered — until then the crisp poster covers the
    // pixelated HLS ramp, so the low-quality start is never seen.
    let bestH = 0;
    let lastImprove = performance.now();
    const check = () => {
      const h = video.videoHeight;
      if (h > bestH) { bestH = h; lastImprove = performance.now(); }
      const buffered =
        video.buffered.length > 0
          ? video.buffered.end(video.buffered.length - 1) - video.currentTime
          : 0;
      if (buffered < 1.5 || video.currentTime < 1) return;
      if (targetH > 0) {
        // hls.js path: we know the top rendition — reveal only when it's decoding.
        if (video.videoHeight >= targetH * 0.9) reveal();
      } else {
        // Native fallback: no level info — reveal once quality has plateaued.
        if (bestH > 0 && performance.now() - lastImprove > 2500) reveal();
      }
    };
    video.addEventListener("resize", check);   // fires whenever decoded res changes
    video.addEventListener("timeupdate", check);
    video.addEventListener("progress", check);
    const poll = setInterval(check, 500);

    // Prefer hls.js whenever the browser supports it (Media Source Extensions):
    // it lets us pin the highest rendition. Native HLS (many WebKit browsers)
    // often stays stuck on a low, pixelated level with no way to force quality,
    // so we only fall back to it on iOS Safari where hls.js is unavailable.
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        hls = new Hls({
          autoStartLoad: false, // pin the top rendition before any fragment loads
          capLevelToPlayerSize: false,
          maxBufferLength: 60,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          const top = data.levels.length - 1;
          targetH = data.levels[top]?.height ?? 0;
          hls!.startLevel = top;   // first fragment loaded is the highest
          hls!.currentLevel = top; // lock there (no ABR dips)
          hls!.startLoad();
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // iOS Safari native HLS — best effort with the plateau gate above.
        video.src = src;
        video.play().catch(() => {});
      }
    });

    return () => {
      clearTimeout(fallback);
      clearInterval(poll);
      video.removeEventListener("resize", check);
      video.removeEventListener("timeupdate", check);
      video.removeEventListener("progress", check);
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
          // Stay hidden until the video is confirmed at full quality, so the
          // pixelated first frames of the HLS ramp are never shown.
          opacity: ready ? 1 : 0,
          transition: "opacity 0.7s ease",
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
