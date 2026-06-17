import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import LogosManager from "@/components/admin/LogosManager";

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev";
const BUCKET = process.env.R2_BUCKET ?? "puerto1";

async function getLogos(): Promise<string[]> {
  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const res = await client.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "clientes/" }));
    return (res.Contents ?? [])
      .map((o) => o.Key!)
      .filter((k) => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(k))
      .map((k) => `${R2_PUBLIC_URL}/${k}`);
  } catch {
    return [];
  }
}

export default async function AdminClientes() {
  const logos = await getLogos();

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
