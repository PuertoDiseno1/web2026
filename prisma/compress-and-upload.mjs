/**
 * compress-and-upload.mjs
 * 1. Comprime imágenes con sips (max 1400px, quality 75)
 * 2. Comprime videos con ffmpeg (CRF 28, escala a 1280px)
 * 3. Actualiza la DB con las rutas de galería por proyecto
 */
import { execSync, spawnSync } from "child_process";
import { readdirSync, statSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const BASE = "/Users/jaimegomez/Desktop/Kimsa/webs/puerto-diseno/public/proyectos";
const adapter = new PrismaPg({ connectionString: "postgresql://puerto:puerto123@localhost:5438/puerto_diseno" });
const prisma = new PrismaClient({ adapter });

// Mapeo: nombre de carpeta → título en DB
const MAP = [
  { folder: "1. FRUTAS DE CHILE",            title: "Frutas de Chile" },
  { folder: "2. CCHC",                        title: "CChC" },
  { folder: "3. BCI SEGUROS",                 title: "BCI Seguros" },
  { folder: "4. LA FETE_TICUL ",              title: "La Fête - Ticul" },
  { folder: "5. LA FETE_FIESTA DE VIDA ",     title: "La Fête - Fiesta Vida" },
  { folder: "6. HOTEL TERMAS DE CHILLAN ",    title: "Hotel Termas de Chillán" },
  { folder: "7. CONFUTURO",                   title: "Confuturo" },
  { folder: "8. DEPOCARGO",                   title: "Depocargo" },
  { folder: "9. EBM_REPORTE ",               title: "Reporte EBM" },
  { folder: "10. WOC",                        title: "WOC Stand" },
  { folder: "11. FDC_REPORTE ",              title: "Reporte FDC" },
  { folder: "12. 724",                        title: "724" },
  { folder: "13. ANGUS",                      title: "Angus" },
  { folder: "14. HOGAR DE CRISTO",            title: "Hogar de Cristo" },
  { folder: "15. OZMO",                       title: "Ozmo" },
  { folder: "16. ACCION SOLIDARIA",           title: "Acción Solidaria" },
  { folder: "17. VITAFOODS",                  title: "Vitafoods" },
  { folder: "18. LIBRILLO PRESIDENTES_FDC",   title: "FDC - Candidatos Presidenciales" },
  { folder: "19. MILAB",                      title: "Milab" },
];

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXTS = [".mp4", ".mov"];

function isImage(f) { return IMAGE_EXTS.includes(path.extname(f).toLowerCase()); }
function isVideo(f) { return VIDEO_EXTS.includes(path.extname(f).toLowerCase()); }

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => {
      try { return statSync(path.join(dir, f)).isFile(); } catch { return false; }
    })
    .sort();
}

function compressImage(filepath) {
  const sizeBefore = statSync(filepath).size;
  // sips: resampling to max 1400px on longest side, format jpeg quality 75
  const ext = path.extname(filepath).toLowerCase();
  if (ext === ".webp") {
    // sips can't re-encode webp, skip
    return sizeBefore;
  }
  try {
    execSync(
      `sips -Z 1400 --setProperty formatOptions 75 "${filepath}" --out "${filepath}"`,
      { stdio: "pipe" }
    );
  } catch(e) {
    console.log(`  ⚠ sips error on ${path.basename(filepath)}: ${e.message}`);
  }
  const sizeAfter = statSync(filepath).size;
  return { before: sizeBefore, after: sizeAfter };
}

function compressVideo(filepath) {
  const sizeBefore = statSync(filepath).size;
  const dir = path.dirname(filepath);
  const base = path.basename(filepath, path.extname(filepath));
  const out = path.join(dir, `${base}_compressed.mp4`);
  if (existsSync(out)) {
    console.log(`  ⏭ Ya existe comprimido: ${path.basename(out)}`);
    return { before: sizeBefore, after: statSync(out).size, outPath: out };
  }
  try {
    const result = spawnSync("ffmpeg", [
      "-i", filepath,
      "-vf", "scale='min(1280,iw)':-2",
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "fast",
      "-c:a", "aac",
      "-b:a", "96k",
      "-movflags", "+faststart",
      "-y", out
    ], { stdio: "pipe", timeout: 120000 });
    if (result.status !== 0) {
      console.log(`  ⚠ ffmpeg error: ${result.stderr?.toString().slice(-200)}`);
      return { before: sizeBefore, after: sizeBefore, outPath: filepath };
    }
  } catch(e) {
    console.log(`  ⚠ ffmpeg exception: ${e.message}`);
    return { before: sizeBefore, after: sizeBefore, outPath: filepath };
  }
  const sizeAfter = statSync(out).size;
  return { before: sizeBefore, after: sizeAfter, outPath: out };
}

function toPublicPath(absolutePath) {
  // /public/proyectos/... → /proyectos/...
  const idx = absolutePath.indexOf("/public/");
  return absolutePath.slice(idx + "/public".length);
}

function formatMB(bytes) { return (bytes / 1024 / 1024).toFixed(1) + "MB"; }

async function main() {
  let totalBefore = 0, totalAfter = 0;

  for (const { folder, title } of MAP) {
    const projectDir = path.join(BASE, folder);
    if (!existsSync(projectDir)) {
      console.log(`⚠ Carpeta no encontrada: ${folder}`);
      continue;
    }
    console.log(`\n📁 ${title} (${folder})`);

    // Buscar carpeta de fotos (FOTOS, FOTO, fotos...)
    const allDirs = readdirSync(projectDir).filter(d => {
      try { return statSync(path.join(projectDir, d)).isDirectory(); } catch { return false; }
    });
    const fotosDir = allDirs.find(d => d.toUpperCase().startsWith("FOT"));
    if (!fotosDir) {
      console.log("  ⚠ No se encontró carpeta FOTOS");
      continue;
    }

    const fotosDirFull = path.join(projectDir, fotosDir);

    // ¿Tiene subcarpeta WEBP?
    const subDirs = readdirSync(fotosDirFull).filter(d => {
      try { return statSync(path.join(fotosDirFull, d)).isDirectory(); } catch { return false; }
    });
    const webpSubDir = subDirs.find(d => d.toUpperCase().includes("WEBP"));

    let galleryFiles = [];

    if (webpSubDir) {
      // Usar los WEBP ya optimizados (solo reportar, no recomprimir)
      const webpDir = path.join(fotosDirFull, webpSubDir);
      const files = listFiles(webpDir).filter(isImage);
      console.log(`  ✓ Usando WEBP (${files.length} archivos pre-optimizados)`);
      galleryFiles = files.map(f => toPublicPath(path.join(webpDir, f)));
    } else {
      // Comprimir imágenes en FOTOS
      const files = listFiles(fotosDirFull).filter(isImage);
      console.log(`  🗜 Comprimiendo ${files.length} imágenes...`);
      for (const f of files) {
        const fp = path.join(fotosDirFull, f);
        const r = compressImage(fp);
        if (r && r.before) {
          totalBefore += r.before;
          totalAfter += r.after;
          const pct = Math.round((1 - r.after / r.before) * 100);
          console.log(`    ${f}: ${formatMB(r.before)} → ${formatMB(r.after)} (-${pct}%)`);
        }
        galleryFiles.push(toPublicPath(fp));
      }
    }

    // Comprimir videos en ANIMACIÓN
    const animDir = allDirs.find(d => d.toUpperCase().includes("ANIM"));
    if (animDir) {
      const animDirFull = path.join(projectDir, animDir);
      // buscar recursivamente (hasta 2 niveles)
      const findVideos = (dir) => {
        const results = [];
        try {
          readdirSync(dir).forEach(f => {
            const fp = path.join(dir, f);
            try {
              if (statSync(fp).isFile() && isVideo(f)) results.push(fp);
              else if (statSync(fp).isDirectory()) results.push(...findVideos(fp));
            } catch {}
          });
        } catch {}
        return results;
      };
      const videoFiles = findVideos(animDirFull);
      if (videoFiles.length) {
        console.log(`  🎬 Comprimiendo ${videoFiles.length} video(s)...`);
        for (const vp of videoFiles) {
          const r = compressVideo(vp);
          const pct = Math.round((1 - r.after / r.before) * 100);
          console.log(`    ${path.basename(vp)}: ${formatMB(r.before)} → ${formatMB(r.after)} (-${pct}%)`);
          totalBefore += r.before;
          totalAfter += r.after;
        }
      }
    }

    // Actualizar DB
    if (galleryFiles.length > 0) {
      const project = await prisma.project.findFirst({ where: { title } });
      if (!project) {
        console.log(`  ⚠ Proyecto "${title}" no encontrado en DB`);
        continue;
      }
      // Mantener coverImage como primera imagen si no está ya en la galería
      const cover = project.coverImage;
      const withCover = cover && !galleryFiles.includes(cover)
        ? [cover, ...galleryFiles]
        : galleryFiles;

      await prisma.project.update({
        where: { id: project.id },
        data: { images: JSON.stringify(withCover) },
      });
      console.log(`  ✅ DB actualizada: ${withCover.length} imágenes`);
    }
  }

  console.log(`\n✅ Compresión total: ${formatMB(totalBefore)} → ${formatMB(totalAfter)} (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
