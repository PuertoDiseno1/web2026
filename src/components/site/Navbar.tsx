"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
];

const CUT = "polygon(10px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 10px)";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isProjectsList = pathname === "/proyectos";
  const onLight = isProjectsList && !scrolled;
  const logoColor = onLight ? "#1442f0" : "#f5f5f0";
  const linkColor = onLight ? "#1442f0" : "#f5f5f0";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2.5rem",
          transition: "background 0.3s",
          background: open ? "transparent" : scrolled ? "#0042e1" : "transparent",
          backdropFilter: "none",
          borderBottom: "none",
        }}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          style={{ position: "relative", zIndex: 201, display: "flex", alignItems: "center" }}
        >
          <Image
            src={(!open && onLight) ? "/logo-blue.png" : "/logo-header.png"}
            alt="Puerto Diseño"
            width={120}
            height={53}
            style={{ width: 120, height: "auto" }}
            priority
          />
        </Link>

        {/* Desktop links — hidden on mobile */}
        {!isHome && (
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: active ? 600 : 400,
                    padding: "0.4rem 0.9rem",
                    clipPath: active ? CUT : "none",
                    color: active ? "#00285f" : linkColor,
                    background: active ? "#cbfd00" : "transparent",
                    transition: "background 0.2s",
                    letterSpacing: "0.01em",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Hamburger: home → always visible | other pages → mobile only via CSS */}
        {isHome ? (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            style={{
              display: "flex", background: "none", border: "none", cursor: "pointer",
              flexDirection: "column", justifyContent: "center", alignItems: "center",
              gap: "5px", width: "36px", height: "36px", padding: "4px",
              position: "relative", zIndex: 201,
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "#f5f5f0", borderRadius: "2px", transform: open ? "translateY(7px) rotate(45deg)" : "none", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#f5f5f0", borderRadius: "2px", opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#f5f5f0", borderRadius: "2px", transform: open ? "translateY(-7px) rotate(-45deg)" : "none", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }} />
          </button>
        ) : (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="nav-hamburger-mobile-only"
            style={{
              background: "none", border: "none", cursor: "pointer",
              flexDirection: "column", justifyContent: "center", alignItems: "center",
              gap: "5px", width: "36px", height: "36px", padding: "4px",
              position: "relative", zIndex: 201,
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: onLight ? "#1442f0" : "#f5f5f0", borderRadius: "2px", transform: open ? "translateY(7px) rotate(45deg)" : "none", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: onLight ? "#1442f0" : "#f5f5f0", borderRadius: "2px", opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: onLight ? "#1442f0" : "#f5f5f0", borderRadius: "2px", transform: open ? "translateY(-7px) rotate(-45deg)" : "none", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }} />
          </button>
        )}
      </nav>

      {/* Fullscreen overlay — all pages */}
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(20, 66, 240, 0.72)", zIndex: 199,
          backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column", width: "min(520px, 80vw)" }}>
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: "clamp(2.2rem, 5.5vw, 3.25rem)", fontWeight: 300,
                letterSpacing: "-0.02em", lineHeight: 1.15,
                color: pathname === l.href ? "#c8f25a" : "#f5f5f0",
                borderBottom: "1px solid rgba(245,245,240,0.35)",
                padding: "0.6rem 0",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.4s ${i * 0.07}s, transform 0.4s ${i * 0.07}s cubic-bezier(0.4,0,0.2,1)`,
              }}
            >
              {l.label}
              <span style={{ fontSize: "1.4rem", opacity: 0.7 }}>↗</span>
            </Link>
          ))}
        </nav>
        <div style={{
          position: "absolute", bottom: "2rem", left: "2.5rem", right: "2.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          opacity: open ? 0.5 : 0, transition: "opacity 0.4s 0.28s",
        }}>
          <span style={{ fontSize: "0.75rem", color: "#f5f5f0" }}>Puerto Diseño © 2026</span>
          <span style={{ fontSize: "0.75rem", color: "#f5f5f0" }}>Santiago, Chile</span>
        </div>
      </div>
    </>
  );
}
