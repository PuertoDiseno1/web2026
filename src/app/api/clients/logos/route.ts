import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2, uploadToR2 } from "@/lib/r2";

const BUCKET = process.env.R2_BUCKET ?? "puerto1";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev";
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
};

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "clientes/" }));
  const urls = (res.Contents ?? [])
    .map((o) => o.Key!)
    .filter((k) => ALLOWED_EXT.has(k.split(".").pop()?.toLowerCase() ?? ""))
    .map((k) => `${R2_PUBLIC_URL}/${k}`);

  return NextResponse.json(urls);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url requerida" }, { status: 400 });
  }

  // Extract the object key robustly, even if R2_PUBLIC_URL differs from the
  // host embedded in the stored URL (custom domain vs pub-*.r2.dev).
  let key = url.replace(`${R2_PUBLIC_URL}/`, "");
  if (key === url) {
    const idx = url.indexOf("clientes/");
    if (idx !== -1) key = url.slice(idx);
  }
  if (!key.startsWith("clientes/")) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.error("R2 delete failed:", err);
    return NextResponse.json(
      { error: `No se pudo eliminar: ${(err as Error).name ?? "error"}` },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Tipo no permitido" }, { status: 400 });
  }

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const key = `clientes/${safeName}`;
  const bytes = await file.arrayBuffer();

  try {
    const url = await uploadToR2(Buffer.from(bytes), key, CONTENT_TYPES[ext] ?? "image/png");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("R2 upload failed:", err);
    return NextResponse.json(
      { error: `No se pudo subir: ${(err as Error).name ?? "error"}` },
      { status: 502 }
    );
  }
}
