"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/admin/landing", label: "Landing" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/socials", label: "Socials" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/site", label: "Settings" },
];

// The bar across the top of every admin screen: one tab per section.
export default function Shell() {
  const pathname = usePathname();
  const router = useRouter();

  async function logOut() {
    await fetch("/api/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <nav className="admin-tabs">
      <strong>Lil Darkie admin</strong>
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={pathname.startsWith(tab.href) ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
      <span className="spacer" />
      <a href="/" target="_blank">
        View site
      </a>
      <button type="button" onClick={logOut}>
        Log out
      </button>
    </nav>
  );
}
