import LogosManager from "@/components/admin/LogosManager";
import { listClientLogos } from "@/lib/r2";

// Always read fresh from R2 (never prerender at build time — that would both
// bake in a stale logo list and make the build hang if R2 is slow/misconfigured).
export const dynamic = "force-dynamic";

export default async function AdminClientes() {
  const logos = await listClientLogos();

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Clientes</h1>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
          Gestiona los logos que aparecen en el carrusel del sitio
        </p>
      </div>

      <LogosManager initialLogos={logos} />
    </>
  );
}
