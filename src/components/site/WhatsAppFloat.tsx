import { prisma } from "@/lib/prisma";
import WhatsAppFloatClient from "./WhatsAppFloatClient";

async function getWhatsApp() {
  const row = await prisma.siteSettings.findUnique({ where: { key: "whatsapp" } });
  return (row?.value ?? "").replace(/\D/g, "");
}

export default async function WhatsAppFloat() {
  const number = await getWhatsApp();
  if (!number) return null;

  return <WhatsAppFloatClient number={number} />;
}
