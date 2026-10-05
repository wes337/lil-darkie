"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./icon";

const TABS = [
  { href: "/admin/landing", label: "Landing", icon: "house" },
  { href: "/admin/navigation", label: "Navigation", icon: "sitemap" },
  { href: "/admin/socials", label: "Socials", icon: "share" },
  { href: "/admin/pages", label: "Pages", icon: "page" },
  { href: "/admin/posts", label: "Posts", icon: "newspaper" },
  { href: "/admin/media", label: "Media", icon: "pictures" },
  { href: "/admin/site", label: "Settings", icon: "cog" },
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
        {open ? <Icon name="cross" grey /> : "☰"}
      </button>
      {/* Picking anything in the list closes it. */}
      <div className="admin-menu" onClick={() => setOpen(false)}>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={pathname.startsWith(tab.href) ? "page" : undefined}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        ))}
        <span className="spacer" />
        <hr />
        <a href="/" target="_blank">
          <Icon name="world_go" />
          View site
        </a>
        <Link href="/admin/password" aria-current={pathname === "/admin/password" ? "page" : undefined}>
          <Icon name="key" />
          Password
        </Link>
        <button type="button" onClick={logOut}>
          <Icon name="door_out" />
          Log out
        </button>
      </div>
    </nav>
  );
}
