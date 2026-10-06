import type { ReactNode } from "react";
import Link from "next/link";

// A link from the site record. Paths on this site navigate in place; anything
// else is an outside URL and gets a plain anchor. `newTab` opens either kind
// in a new tab.
export default function SiteLink({
  href,
  newTab = false,
  children,
}: {
  href: string;
  newTab?: boolean;
  children: ReactNode;
}) {
  const target = newTab ? { target: "_blank", rel: "noreferrer" } : {};
  return href.startsWith("/") ? (
    <Link href={href} {...target}>{children}</Link>
  ) : (
    <a href={href} {...target}>{children}</a>
  );
}
