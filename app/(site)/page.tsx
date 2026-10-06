import type { Viewport } from "next";
import Landing from "@/components/landing";
import { getSite } from "@/lib/cms/content";

// Black behind the phone's status bar, matching the landing background.
export const viewport: Viewport = { themeColor: "#000000" };

export default async function Home() {
  return <Landing site={await getSite()} />;
}
