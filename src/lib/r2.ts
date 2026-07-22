import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.R2_BUCKET ?? "puerto1";
const publicUrl = process.env.R2_PUBLIC_URL ?? "https://pub-2e6a857a712c4a7bbf3c196da351c63c.r2.dev";

const LOGO_EXT = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

// Fail fast instead of hanging: if R2 is slow/misconfigured, a build or request
// should error in seconds, not stall on the SDK's default long retries/timeouts.
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
  maxAttempts: 2,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 3000,
    requestTimeout: 8000,
  }),
});

export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${publicUrl}/${filename}`;
}

/** List client logo URLs from the R2 `clientes/` prefix. Never throws. */
export async function listClientLogos(): Promise<string[]> {
  try {
    const res = await r2.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: "clientes/" })
    );
    return (res.Contents ?? [])
      .map((o) => o.Key!)
      .filter((k) => LOGO_EXT.test(k))
      .map((k) => `${publicUrl}/${k}`);
  } catch (err) {
    console.error("R2 listClientLogos failed:", err);
    return [];
  }
}
