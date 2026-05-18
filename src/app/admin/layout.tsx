import AdminNav from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin | Puerto Diseño",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'Outfit', sans-serif", color: "#111" }}>
      <AdminNav />
      <main style={{ flex: 1, padding: "2.5rem", maxWidth: "calc(100vw - 260px)" }}>
        {children}
      </main>
    </div>
  );
}
