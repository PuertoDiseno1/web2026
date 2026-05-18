import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function EditarPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/blog" style={{ fontSize: "0.8rem", color: "#666" }}>← Blog</Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Editar nota</h1>
      </div>
      <PostForm post={{ ...post, excerpt: post.excerpt ?? "", coverImage: post.coverImage ?? undefined }} />
    </>
  );
}
