// Rewrites external image URLs through images.weserv.nl, a free image proxy/CDN
// that resizes and re-encodes images to modern formats (WebP) on the fly.
// This reduces payload size for external provider images without needing our
// own image pipeline/storage. Local/relative URLs and data URIs are left untouched.
export function optimizeImage(url, { width, quality = 75 } = {}) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("data:") || url.startsWith("/")) return url;

  try {
    const isHttps = url.startsWith("https://");
    // weserv.nl expects the source URL without the protocol
    const bare = url.replace(/^https?:\/\//, "");
    const params = new URLSearchParams({
      url: bare,
      output: "webp",
      q: String(quality),
    });
    if (width) params.set("w", String(width));
    return `https://images.weserv.nl/?${params.toString()}${isHttps ? "" : "&il"}`;
  } catch {
    return url;
  }
}
