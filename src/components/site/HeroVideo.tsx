"use client";

import { useEffect, useRef } from "react";

function VideoLayer({ muxId, className }: { muxId: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = `https://stream.mux.com/${muxId}.m3u8`;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        const hls = new Hls({
          startLevel: -1,
          autoStartLoad: true,
          capLevelToPlayerSize: false,
          maxBufferLength: 60,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          hls.currentLevel = data.levels.length - 1;
          video.play().catch(() => {});
        });
      });
    }
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
