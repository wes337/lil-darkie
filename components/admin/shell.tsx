"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Confirm } from "./dialog";
import Icon from "./icon";

const TABS = [
  { href: "/admin/landing", label: "Landing", icon: "house" },
  { href: "/admin/navigation", label: "Navigation", icon: "sitemap" },
  { href: "/admin/socials", label: "Socials", icon: "users_3" },
  { href: "/admin/pages", label: "Pages", icon: "page" },
  { href: "/admin/posts", label: "Posts", icon: "newspaper" },
  { href: "/admin/media", label: "Media", icon: "pictures" },
  { href: "/admin/site", label: "Settings", icon: "cog" },
];

// The bar across the top of every admin screen: one tab per section. On a
// phone the tabs sit behind a menu button and open as a full-screen list.
// On a small desktop the three links on the right show only their icons, so
// each also carries its name as a tooltip.
// Document links let the browser warn about unsaved edits, including history navigation.
export default function Shell() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
          <a
            key={tab.href}
            href={tab.href}
            aria-current={pathname.startsWith(tab.href) ? "page" : undefined}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </a>
        ))}
        <span className="spacer" />
        <hr />
        <a href="/" target="_blank" title="View site">
          <Icon name="world_go" />
          <span className="label">View site</span>
        </a>
        <a
          href="/admin/password"
          title="Password"
          aria-current={pathname === "/admin/password" ? "page" : undefined}
        >
          <Icon name="key" />
          <span className="label">Password</span>
        </a>
        <button type="button" title="Log out" onClick={() => setLoggingOut(true)}>
          <Icon name="door_out" />
          <span className="label">Log out</span>
        </button>
      </div>
      {loggingOut && (
        <Confirm title="Log out" onYes={logOut} onNo={() => setLoggingOut(false)}>
          Are you sure you want to log out? Any unsaved changes will be lost.
        </Confirm>
      )}
    </nav>
  );
}
