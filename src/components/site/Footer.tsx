import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getSettings() {
  const rows = await prisma.siteSettings.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export default async function Footer() {
  const s = await getSettings();

  return (
    <footer id="site-footer" style={{ background: "#00285f", padding: "3.5rem 2.5rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Top row */}
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "4rem", alignItems: "start", marginBottom: "3rem" }}>

          {/* Logo */}
          <div>
            <Image
              src="/logo-footer1.png"
              alt="Puerto Diseño"
              width={180}
              height={87}
              style={{ width: "auto", height: "auto", maxWidth: 180 }}
            />
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[["Nosotros", "/nosotros"], ["Servicios", "/servicios"], ["Proyectos", "/proyectos"], ["Blog", "/blog"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.625rem)", fontWeight: 300, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                {label}
              </Link>
            ))}
          </div>


        </div>

        {/* Bottom row */}
        <div className="footer-bottom" style={{ paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>

          {/* Address */}
          <div className="footer-address" style={{ fontSize: "clamp(0.85rem, 0.9vw, 1.1875rem)", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            <span style={{ display: "block" }}>+562 2570 1400</span>
            {(s.address ?? "Av. del Valle Nte. 945,\nHuechuraba. Santiago, Chile").split("\n").map((line, i) => (
              <span key={i} style={{ display: "block" }}>{line}</span>
            ))}
          </div>

          {/* Social icons + copyright */}
          <div className="footer-social" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {s.linkedin && (
                <a href={s.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <svg width="18" height="18" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="72" height="72" rx="12" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path d="M23.5 50V28.5H17V50H23.5ZM20.25 25.75C22.4 25.75 24 24.1 24 22 24 19.9 22.4 18.25 20.25 18.25 18.1 18.25 16.5 19.9 16.5 22 16.5 24.1 18.1 25.75 20.25 25.75ZM56 50H49.5V38.7C49.5 35.5 48.2 33.5 45.5 33.5 43.5 33.5 42.3 34.8 41.7 36.1 41.5 36.6 41.5 37.3 41.5 38V50H35S35.1 30 35 28.5H41.5V31.5C42.4 30.1 43.9 28 47.4 28 51.7 28 56 31 56 38.2V50Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} style={{ color: "rgba(255,255,255,0.6)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              )}
            </div>
            <p style={{ fontSize: "clamp(0.7rem, 0.9vw, 1.1875rem)", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}>
              © Todos los derechos reservados
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
