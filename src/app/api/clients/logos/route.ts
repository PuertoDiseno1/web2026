import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readdirSync, unlinkSync, existsSync, writeFileSync } from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "public", "clientes");
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const files = existsSync(DIR)
    ? readdirSync(DIR).filter((f) => ALLOWED_EXT.has(f.split(".").pop()?.toLowerCase() ?? ""))
    : [];

  return NextResponse.json(files);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename } = await req.json();
  if (!filename || typeof filename !== "string") {
    return NextResponse.json({ error: "filename requerido" }, { status: 400 });
  }

  // Prevent path traversal
  const base = path.basename(filename);
  const filePath = path.join(DIR, base);
  if (!filePath.startsWith(DIR)) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  if (existsSync(filePath)) unlinkSync(filePath);
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
  const dest = path.join(DIR, safeName);

  const bytes = await file.arrayBuffer();
  writeFileSync(dest, Buffer.from(bytes));

  return NextResponse.json({ filename: safeName });
}
