import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "svg", "mp4", "webm", "mov"];

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB

export async function POST(req: Request) {
  console.log("[upload] POST received");

  let session;
  try {
    session = await auth();
  } catch (e) {
    console.error("[upload] auth() threw:", e);
    return NextResponse.json({ error: "Auth error" }, { status: 500 });
  }

  console.log("[upload] session:", session ? `user=${session.user?.email}` : "null");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    console.error("[upload] formData() threw:", e);
    return NextResponse.json({ error: "Error leyendo el formulario" }, { status: 400 });
  }

  const file = form.get("file") as File | null;
  console.log("[upload] file:", file ? `name=${file.name} size=${file.size} type=${file.type}` : "null");

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.size > MAX_SIZE) {
    console.warn("[upload] file too large:", file.size);
    return NextResponse.json({ error: "El archivo supera el límite de 3 MB" }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    console.warn("[upload] extension not allowed:", ext);
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    console.log("[upload] uploading to R2:", filename);
    const url = await uploadToR2(buffer, filename, contentType);
    console.log("[upload] success:", url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload] R2 upload error:", err);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
