/* eslint-disable @next/next/no-page-custom-font */
import type { ReactNode } from "react";
import { Martian_Mono } from "next/font/google";
import Spotify from "@/components/spotify";
import TopBar from "@/components/top-bar";
import Nav from "@/components/nav";
import Epilepsy from "@/components/epilepsy";
import Backdrop from "@/components/backdrop";
import GoogleAnalytics from "@/components/google-analytics";
import { getSite } from "@/lib/cms/content";
import "@/styles/globals.scss";

const martianMono = Martian_Mono({ subsets: ["latin"] });

export const metadata = {
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

// The public site: the game, the sampler and every CMS page. The nav and top
// bar are drawn from the editable site record.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const site = await getSite();

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
      </head>
      <body className={martianMono.className}>
        <Epilepsy />
        <Spotify />
        <TopBar site={site} />
        {children}
        <Nav site={site} />
        <Backdrop />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
