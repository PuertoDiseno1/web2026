import Link from "next/link";
import PostForm from "@/components/admin/PostForm";

export default function NuevoPost() {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/blog" style={{ fontSize: "0.8rem", color: "#666" }}>← Blog</Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Nueva nota</h1>
      </div>
      <PostForm />
    </>
  );
}
