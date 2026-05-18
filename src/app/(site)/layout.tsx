import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import PageTransition from "@/components/site/PageTransition";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
