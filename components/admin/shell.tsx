"use client";
import { useState } from "react";
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

// The bar across the top of every admin screen: one tab per section. On a
// phone the tabs sit behind a menu button and open as a full-screen list.
export default function Shell() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logOut() {
    await fetch("/api/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <nav className="admin-tabs" data-open={open}>
      <strong>Lil Darkie admin</strong>
      <button
        type="button"
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>
      {/* Picking anything in the list closes it. */}
      <div className="admin-menu" onClick={() => setOpen(false)}>
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
        <hr />
        <a href="/" target="_blank">
          View site
        </a>
        <Link href="/admin/password" aria-current={pathname === "/admin/password" ? "page" : undefined}>
          Password
        </Link>
        <button type="button" onClick={logOut}>
          Log out
        </button>
      </div>
    </nav>
  );
}
