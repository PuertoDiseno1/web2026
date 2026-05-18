import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const record = await prisma.pageContent.findUnique({ where: { page } });
  if (!record) return NextResponse.json({});
  try {
    return NextResponse.json(JSON.parse(record.content));
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ page: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { page } = await params;
  const data = await req.json();
  // Merge with existing content
  const existing = await prisma.pageContent.findUnique({ where: { page } });
  const currentContent = existing ? JSON.parse(existing.content || "{}") : {};
  const merged = { ...currentContent, ...data };
  const record = await prisma.pageContent.upsert({
    where: { page },
    create: { page, content: JSON.stringify(merged) },
    update: { content: JSON.stringify(merged) },
  });
  return NextResponse.json(JSON.parse(record.content));
}
