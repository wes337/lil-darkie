import type { ReactNode } from "react";
import Link from "next/link";

// A link from the site record. Paths on this site navigate in place; anything
// else is an outside URL and gets a plain anchor.
export default function SiteLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return href.startsWith("/") ? (
    <Link href={href}>{children}</Link>
  ) : (
    <a href={href}>{children}</a>
  );
}
