"use client";

import { useEffect, useRef, useState } from "react";

interface MuxVideoProps {
  playbackId: string;
  style?: React.CSSProperties;
}

export default function MuxVideo({ playbackId, style }: MuxVideoProps) {
  const ref = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@mux/mux-video");
  }, []);

  useEffect(() => {
    const el = ref.current as HTMLVideoElement | null;
    if (!el) return;
    const onPlaying = () => setTimeout(() => setLoading(false), 2000);
    el.addEventListener("playing", onPlaying);
    return () => el.removeEventListener("playing", onPlaying);
  }, []);

  return (
    <div className="mux-video-wrap" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* @ts-expect-error mux-video is a custom element */}
      <mux-video
        ref={ref}
        playback-id={playbackId}
        autoplay
        muted
        loop
        playsinline
        style={{
          display: "block",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          ...style,
        }}
      />
      {loading && (
        <div style={{
          position: "absolute", inset: 0,
          background: "#04081c",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.4s",
        }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid rgba(255,255,255,0.2)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "hero-spin 0.8s linear infinite",
          }} />
        </div>
      )}
    </div>
  );
}
