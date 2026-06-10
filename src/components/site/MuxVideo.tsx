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

    // mux-video renders an internal <video> in its shadow DOM with object-fit: contain.
    // We need to override it to cover so the video fills without black bars.
    const applyObjectFitCover = () => {
      const shadow = (el as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot;
      if (shadow) {
        const internalVideo = shadow.querySelector("video");
        if (internalVideo) {
          internalVideo.style.objectFit = "cover";
          internalVideo.style.width = "100%";
          internalVideo.style.height = "100%";
        }
      }
    };

    // Try immediately and also after a short delay (shadow DOM may not be ready instantly)
    applyObjectFitCover();
    const t = setTimeout(applyObjectFitCover, 300);

    return () => {
      el.removeEventListener("playing", onPlaying);
      clearTimeout(t);
    };
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
          top: "50%",
          left: "50%",
          width: "177.78vh",
          minWidth: "100%",
          height: "56.25vw",
          minHeight: "100%",
          transform: "translate(-50%, -50%)",
          objectFit: "cover",
          margin: 0,
          padding: 0,
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
