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
    // @ts-expect-error mux-video is a custom element
    <mux-video
      ref={ref}
      playback-id={playbackId}
      autoplay
      muted
      loop
      playsinline
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        margin: 0,
        padding: 0,
        ...style,
      }}
    />
  );
}
