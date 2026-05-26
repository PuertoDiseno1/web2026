"use client";

import { useEffect, useRef } from "react";

interface MuxVideoProps {
  playbackId: string;
  style?: React.CSSProperties;
}

export default function MuxVideo({ playbackId, style }: MuxVideoProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    import("@mux/mux-video");
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
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
    </div>
  );
}
