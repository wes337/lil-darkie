import Landing from "@/components/landing";
import { getSite } from "@/lib/cms/content";

export default async function Home() {
  return <Landing site={await getSite()} />;
}
