import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Puerto Diseño | Estrategia, Branding y Diseño",
  description: "Desarrollamos marcas sólidas a través de procesos rigurosos y equipos especializados. Estrategia de marca, branding y diseño industrial.",
  keywords: "diseño, branding, estrategia de marca, diseño industrial, agencia de diseño, Chile, Santiago",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
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
