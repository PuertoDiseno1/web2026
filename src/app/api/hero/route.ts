import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: _id, ...data } = await req.json();
  const slide = await prisma.heroSlide.create({ data });
  return NextResponse.json(slide);
}
