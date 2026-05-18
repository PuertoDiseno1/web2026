"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊡" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "◈" },
  { href: "/admin/blog", label: "Blog", icon: "✦" },
  { href: "/admin/servicios", label: "Servicios", icon: "◧" },
  { href: "/admin/nosotros", label: "Nosotros", icon: "◑" },
  { href: "/admin/clientes", label: "Clientes", icon: "◐" },
  { href: "/admin/equipo", label: "Equipo", icon: "◎" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "◈" },
  { href: "/admin/configuracion", label: "Configuración", icon: "◉" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "auto",
      }}
    >
      <div style={{ marginBottom: "3rem" }}>
        <Image src="/logo-footer.png" alt="Puerto Diseño" width={130} height={56} style={{ width: "auto", height: 36, maxWidth: 130, display: "block" }} />
        <p style={{ fontSize: "0.75rem", color: "rgba(245,245,240,0.35)", marginTop: "0.5rem" }}>Admin</p>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 0.75rem",
                borderRadius: "6px",
                marginBottom: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#c8f25a" : "rgba(245,245,240,0.55)",
                background: active ? "rgba(200,242,90,0.08)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
        <Link
          href="/"
          target="_blank"
          style={{ display: "block", fontSize: "0.8rem", color: "rgba(245,245,240,0.4)", marginBottom: "0.75rem" }}
        >
          Ver sitio →
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(245,245,240,0.4)",
            fontSize: "0.8rem",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "inherit",
            width: "100%",
            textAlign: "left",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
