"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Stage = "rest" | "closing" | "opening";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayed, setDisplayed] = useState(children);
  const [stage, setStage] = useState<Stage>("rest");
  const [revealKey, setRevealKey] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const nextRef = useRef(children);
  const firstRender = useRef(true);

  useEffect(() => { nextRef.current = children; });

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }

    setStage("closing");

    // Panels meet at center → swap content + flash logo
    const t1 = setTimeout(() => {
      setDisplayed(nextRef.current);
      setShowLogo(true);
    }, 460);

    // Hide logo → panels open
    const t2 = setTimeout(() => {
      setShowLogo(false);
      setStage("opening");
      setRevealKey((k) => k + 1);
    }, 700);

    // Rest
    const t3 = setTimeout(() => {
      setStage("rest");
    }, 1180);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  const getTransform = (pos: "top" | "bottom") => {
    if (stage === "closing") return "translateY(0)";
    return pos === "top" ? "translateY(-101%)" : "translateY(101%)";
  };

  const getTransition = () => {
    if (stage === "rest") return "none";
    if (stage === "closing") return "transform 0.46s cubic-bezier(0.76, 0, 0.24, 1)";
    return "transform 0.44s cubic-bezier(0.76, 0, 0.24, 1)";
  };

  const panelBase: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    height: "50.5%",
    zIndex: 9999,
    background: "#0a0a0a",
    transition: getTransition(),
  };

  return (
    <>
      <div
        key={revealKey}
        style={{
          animation: revealKey > 0 ? "page-enter 0.6s cubic-bezier(0.22,1,0.36,1) both" : "none",
        }}
      >
        {displayed}
      </div>

      {/* Top curtain */}
      <div aria-hidden style={{ ...panelBase, top: 0, transform: getTransform("top") }} />

      {/* Bottom curtain */}
      <div aria-hidden style={{ ...panelBase, bottom: 0, transform: getTransform("bottom") }} />

      {/* Center seam accent line */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: "50%",
          height: "2px",
          background: "#1442f0",
          zIndex: 10000,
          transform: `scaleX(${showLogo ? 1 : 0})`,
          transformOrigin: "left center",
          transition: showLogo ? "transform 0.22s cubic-bezier(0.22,1,0.36,1)" : "transform 0.15s ease",
        }}
      />

      {/* Logo flash */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: showLogo ? 1 : 0,
          transition: "opacity 0.18s ease",
        }}
      >
        <img
          src="/logo-footer.png"
          alt="Puerto Diseño"
          style={{ height: 36, width: "auto" }}
        />
      </div>
    </>
  );
}
