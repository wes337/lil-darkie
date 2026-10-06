/* eslint-disable @next/next/no-page-custom-font */
import type { ReactNode } from "react";
import type { Metadata } from "next";
import TopBar from "@/components/top-bar";
import Nav from "@/components/nav";
import GoogleAnalytics from "@/components/google-analytics";
import { getSite, siteIcons } from "@/lib/cms/content";
import { fontFaces, fontFamily, resolveTheme } from "@/lib/cms/render";
import "@/styles/globals.scss";

const METADATA: Metadata = {
  // Preview deploys serve share images from their own URL; production isn't guaranteed to have them yet.
  metadataBase: new URL(
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.lildarkie.com",
  ),
  title: "Lil Darkie",
  description: "The Official Lil Darkie Website",
  openGraph: {
    title: "Lil Darkie",
    description: "The Official Lil Darkie Website",
    type: "website",
    images: [
      {
        url: "/images/social/lil-darkie-red-logo.png",
        width: 1200,
        height: 630,
        alt: "Lil Darkie red logo on a black background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lil Darkie",
    description: "The Official Lil Darkie Website",
    images: ["/images/social/lil-darkie-red-logo.png"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return { ...METADATA, icons: await siteIcons() };
}

// The public site: the game, the sampler and every CMS page. The nav and top
// bar are drawn from the editable site record, and the site theme's font is
// set on the body so everything outside a CMS page follows it too.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const site = await getSite();
  const faces = fontFaces(site.fonts);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {faces && <style dangerouslySetInnerHTML={{ __html: faces }} />}
      </head>
      <body style={{ fontFamily: fontFamily(resolveTheme(site.theme).font) }}>
        <TopBar logo={site.logo} />
        {children}
        <Nav site={site} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
