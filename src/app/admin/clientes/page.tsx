import { readdirSync, existsSync } from "fs";
import path from "path";
import LogosManager from "@/components/admin/LogosManager";

function getLogos(): string[] {
  const dir = path.join(process.cwd(), "public", "clientes");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) =>
    /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(f)
  );
}

export default function AdminClientes() {
  const logos = getLogos();

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
