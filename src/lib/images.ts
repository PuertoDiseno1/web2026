/**
 * URL-encodes a local image path, preserving slashes.
 * Needed for paths with spaces, tildes, or accented characters (e.g. public/proyectos/).
 */
export function encodePath(src: string | null | undefined): string {
  if (!src) return "";
  // External URLs: return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  // Encode each segment individually, keep slashes
  return src.split("/").map((seg) => encodeURIComponent(seg)).join("/");
}
