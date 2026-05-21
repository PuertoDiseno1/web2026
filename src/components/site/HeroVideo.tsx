"use client";

import { useEffect, useRef } from "react";

export default function HeroVideo({ muxId }: { muxId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = `https://stream.mux.com/${muxId}.m3u8`;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari — native HLS
      video.src = src;
      video.play().catch(() => {});
    } else {
      // Chrome, Firefox, Edge — use hls.js
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        const hls = new Hls({ startLevel: -1, autoStartLoad: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      });
    }
  }, [muxId]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
    >
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
          opacity: 1,
        }}
      />
    </div>
  );
}
