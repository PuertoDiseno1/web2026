// @ts-check
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = bcrypt.hashSync("admin2024", 10);
  await prisma.user.upsert({
    where: { email: "admin@puertodiseno.cl" },
    update: {},
    create: { id: "admin-1", email: "admin@puertodiseno.cl", password: hash, name: "Administrador", role: "admin" },
  });

  const team = [
    [1, "Veronica Rivas", "Directora", "https://cl.linkedin.com/in/ver%C3%B3nica-rivas-silva-75166093"],
    [2, "Javiera Maturana", "Brand Planner Senior", "https://cl.linkedin.com/in/javiera-maturana-valenzuela-50637449"],
    [3, "Marco Mellado", "Director Area - Diseno Industrial", "https://cl.linkedin.com/in/marco-mellado-ortiz-4799b664"],
    [4, "Josefina Alvarez", "Directora Area - Diseno Grafico", "https://cl.linkedin.com/in/josefina-alvarez-perell%C3%B3-04b8331a7"],
    [5, "Natalia Gutierrez", "Directora de Arte - Area Grafica", "https://cl.linkedin.com/in/na-gutierrez-serrano"],
    [6, "Sebastian Barraza", "Director de Arte - Area Industrial", "https://cl.linkedin.com/in/sebastian-barraza-277264219"],
  ];
  for (const [order, name, role, linkedin] of team) {
    await prisma.teamMember.upsert({
      where: { id: "team-" + order },
      update: {},
      create: { id: "team-" + order, order: Number(order), name, role, linkedin, published: true },
    });
  }

  const projects = [
    [1, "depocargo", "Depocargo", "Resguardamos tu carga de principio a fin", "Depocargo, especialista en almacenamiento de carga aerea en el aeropuerto de Santiago.", "Senaletica\nBranding Oficinas", "Diseno industrial", "", true, "/portadas-home/4--DEPOCARGO.jpg"],
    [2, "hotel-termas-chillan", "Hotel Termas de Chillan", "La reinvencion de un icono", "El historico Hotel Termas Chillan enfrentaba el desafio de renovarse integralmente sin perder su caracter iconico.", "Consultoria\nEstrategia de Marca\nBranding", "Estrategia de marca\nBranding", "", true, "/portadas-home/5-HTCH.png"],
    [3, "hogar-de-cristo", "Hogar de Cristo", "Luchando por la justicia social", "Hogar de Cristo, una fundacion de alto reconocimiento a nivel nacional, estaba perdiendo relevancia como marca.", "Estrategia de diseno\nBranding", "Branding", "", true, "/portadas-home/6--HDC.jpg"],
    [4, "milab", "Milab", "Elegir con Tranquilidad", "Milab, Laboratorio Farmaceutico con productos iconicos como Geniol, tenia una identidad fragmentada en su linea de packaging OTC.", "Packaging\nEstrategia Diseno", "Branding\nPackaging", "", true, "/portadas-home/9--MILAB.jpg"],
    [5, "bci-seguros", "BCI Seguros", "Naturaleza y equipo: un mismo ecosistema", "Para BCI Seguros desarrollamos un espacio de trabajo concebido como un ecosistema colaborativo.", "Senaletica\nBranding Oficinas", "Diseno industrial", "", true, "/portadas-home/15-BCI-SEGUROS.jpg"],
    [6, "confuturo", "Confuturo", "El hormiguero como super organizacion", "Tras la transformacion de Corpvida en Confuturo, desarrollamos un sistema de comunicacion interior.", "Senaletica\nBranding Oficinas\nTaller Design Thinking", "Diseno industrial", "", false, "/portadas-home/7- CONFUTURO.png"],
    [7, "ozmo", "Ozmo", "Conocimiento compartido", "Octano se encontraba en un proceso de fusion con Global Services. Asi nace Ozmo.", "Consultoria\nEstrategia de Marca\nNaming\nBranding", "Estrategia de marca\nBranding", "", false, "/portadas-home/8--OZMO.jpg"],
    [8, "woc-stand", "WOC Stand", "Chile se proyecta al mundo", "Acompanamos a Wines of Chile en ProWein Dusseldorf con el desafio de traducir la identidad del pais en una experiencia espacial.", "Diseno Stand\nSupervision Implementacion", "Diseno industrial", "", false, "/portadas-home/10-WOC.jpg"],
    [9, "accion-solidaria", "Accion Solidaria", "Conectamos por la misma causa", "A partir de la nueva arquitectura de marca trabajada para Hogar de Cristo, se desarrollo la nueva identidad visual para Accion Solidaria.", "Branding", "Branding", "", false, "/portadas-home/13---ACCION-SOLIDARIA.jpg"],
  ];
  for (const [order, slug, title, subtitle, description, services, categories, videoEmbed, featured, coverImage] of projects) {
    await prisma.project.upsert({
      where: { slug },
      update: { coverImage },
      create: {
        id: "proj-" + order, order: Number(order), slug, title, subtitle,
        description, services, categories, videoEmbed, images: "[]",
        coverImage, featured: Boolean(featured), published: true,
      },
    });
  }

  const settings = [
    ["hero_title", "Desarrollamos marcas solidas a traves de procesos rigurosos y equipos especializados."],
    ["stats_brands", "+70"], ["stats_years", "+25"], ["stats_sqm", "+900.000"],
    ["address", "Av. del Valle Nte. 945 OF. 5612, Huechuraba, Santiago-Chile"],
    ["email", "contacto@puertodiseno.cl"],
    ["linkedin", "https://www.linkedin.com/company/puerto-dise%C3%B1o/"],
    ["instagram", "https://www.instagram.com/puertodiseno_chile/"],
    ["whatsapp", ""],
  ];
  for (const [key, value] of settings) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: {},
      create: { id: "setting-" + key, key, value },
    });
  }

  const clients = [
    "La Fete", "FEMSA Salud", "Hogar de Cristo", "BCI", "Banco Estado",
    "Frutas de Chile", "Milab", "MEDS", "ABI Abogados", "BCI Seguros",
  ];
  for (let i = 0; i < clients.length; i++) {
    await prisma.client.upsert({
      where: { id: "client-" + (i + 1) },
      update: {},
      create: { id: "client-" + (i + 1), order: i + 1, name: clients[i], published: true },
    });
  }

  console.log("✅ Seed completado con exito");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
