/**
 * URL-encodes a local image path, preserving slashes.
 * Needed for paths with spaces, tildes, or accented characters (e.g. public/proyectos/).
 */
export function encodePath(src: string | null | undefined): string {
  if (!src) return "";
  // External URLs: return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  // Normalize to NFC (macOS stores paths as NFD, Linux uses NFC) then encode each segment
  return src.split("/").map((seg) => encodeURIComponent(seg.normalize("NFC"))).join("/");
}
