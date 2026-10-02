import { previewAccess } from "./lib/preview-access.mjs";

export function proxy(request) {
  return previewAccess(request, {
    password: process.env.PREVIEW_PASSWORD,
    environment: process.env.VERCEL_ENV,
  });
}

// Include public files and Next.js requests so direct asset URLs are gated too.
export const config = { matcher: "/:path*" };
