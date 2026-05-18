import SettingsForm from "@/components/admin/SettingsForm";
import { prisma } from "@/lib/prisma";

async function getData() {
  const settings = await prisma.siteSettings.findMany();
  return { settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) };
}

export default async function AdminConfiguracion() {
  const { settings } = await getData();

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Configuración</h1>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>Ajustes generales del sitio web</p>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        <SettingsForm initialSettings={settings} />
      </div>
    </>
  );
}
