import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const client = new S3Client({
  region: "auto",
  endpoint: "https://a839e0a6d842668b40ff0f13aa6d2e72.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "f4b795a7e04195960b9c32ed9a9b99fe",
    secretAccessKey: "0bd5d565145a9ddb77c846aa79a43a833f38edaf044b578af6a69cbbfef3cb64",
  },
});
const BUCKET = "puerto1";
const IMAGE_EXTS = /\.(jpg|jpeg|png|webp)$/i;
const MAX_W = 1920;
const QUALITY = 78;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function compressKey(key) {
  const ext = key.split(".").pop().toLowerCase();
  const get = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const original = await streamToBuffer(get.Body);
  const originalKB = Math.round(original.length / 1024);

  let compressed, contentType;
  if (ext === "png") {
    compressed = await sharp(original).resize({ width: MAX_W, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: QUALITY }).toBuffer();
    contentType = "image/png";
  } else {
    compressed = await sharp(original).resize({ width: MAX_W, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    contentType = "image/jpeg";
  }

  const compressedKB = Math.round(compressed.length / 1024);
  const saving = Math.round((1 - compressedKB / originalKB) * 100);

  if (compressed.length >= original.length) {
    return { key, originalKB, compressedKB, saving: 0, skipped: true };
  }

  await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: compressed, ContentType: contentType }));
  return { key, originalKB, compressedKB, saving };
}

// Listar todas las imágenes (excluir videos)
let keys = [], token;
do {
  const res = await client.send(new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }));
  for (const o of res.Contents || []) {
    if (IMAGE_EXTS.test(o.Key) && !o.Key.endsWith(".DS_Store")) keys.push(o.Key);
  }
  token = res.NextContinuationToken;
} while (token);

console.log(`Procesando ${keys.length} imágenes...\n`);

let totalSavedKB = 0, done = 0;
for (const key of keys) {
  try {
    const r = await compressKey(key);
    totalSavedKB += (r.originalKB - r.compressedKB);
    done++;
    const label = r.skipped ? "skip" : `-${r.saving}%`;
    process.stdout.write(`\r[${done}/${keys.length}] ${label} | ahorrado: ${Math.round(totalSavedKB/1024)}MB   `);
  } catch (e) {
    process.stdout.write(`\r[${done}/${keys.length}] ERROR ${key.split("/").pop().slice(0,20)}: ${e.message.slice(0,40)}\n`);
  }
}

console.log(`\n\nListo. Ahorro total: ${Math.round(totalSavedKB/1024)} MB`);
