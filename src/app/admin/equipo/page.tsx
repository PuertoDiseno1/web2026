import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamManager from "@/components/admin/TeamManager";

async function getTeam() {
  return prisma.teamMember.findMany({ orderBy: { order: "asc" } });
}

export default async function AdminEquipo() {
  const team = await getTeam();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Equipo</h1>
          <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>{team.length} miembros</p>
        </div>
      </div>
      <TeamManager initialTeam={team} />
    </>
  );
}
