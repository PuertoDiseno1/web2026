import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Puerto Diseño | Estrategia, Branding y Diseño",
  description: "Desarrollamos marcas sólidas a través de procesos rigurosos y equipos especializados. Estrategia de marca, branding y diseño industrial.",
  keywords: "diseño, branding, estrategia de marca, diseño industrial, agencia de diseño, Chile, Santiago",
  openGraph: {
    title: "Puerto Diseño",
    description: "Desarrollamos marcas sólidas a través de procesos rigurosos y equipos especializados.",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
