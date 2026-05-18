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
    <footer style={{ background: "#0d1a4a", padding: "3.5rem 2.5rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Top row */}
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "4rem", alignItems: "start", marginBottom: "3rem" }}>

          {/* Logo */}
          <div>
            <Image
              src="/logo-footer.png"
              alt="Puerto Diseño"
              width={140}
              height={60}
              style={{ width: "auto", height: "auto", maxWidth: 140 }}
            />
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[["Nosotros", "/nosotros"], ["Servicios", "/servicios"], ["Proyectos", "/proyectos"], ["Blog", "/blog"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: "clamp(0.85rem, 1.2vw, 1.625rem)", fontWeight: 100, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                {label}
              </Link>
            ))}
          </div>

          {/* CTA Hablemos */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a
              href={`https://wa.me/${(s.whatsapp ?? "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#c8f25a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* WhatsApp icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#0d1a4a">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <span style={{ fontSize: "clamp(0.85rem, 1.2vw, 1.625rem)", fontWeight: 100, color: "#fff" }}>Hablemos!</span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>

          {/* Address */}
          <p className="footer-address" style={{ fontSize: "clamp(0.75rem, 0.9vw, 1.1875rem)", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            {(s.address ?? "Av. del Valle Nte. 945,\nHuechuraba  Santiago, Chile").split("\n").map((line, i) => (
              <span key={i} style={{ display: "block" }}>{line}</span>
            ))}
          </p>

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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
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
